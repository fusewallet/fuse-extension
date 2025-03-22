import { useCallback, useEffect, useState } from 'react';

import type { StorageWatchCallback } from '@plasmohq/storage';
import type { SecureStorage } from '@plasmohq/storage/secure';

import { revoke_current_session_connected_app } from '~hooks/store/session';
import { same } from '~lib/utils/same';
import { match_chain, type Chain } from '~types/chain';
import {
    DEFAULT_CURRENT_CONNECTED_APPS,
    update_connected_app,
    type ConnectedApp,
    type ConnectedApps,
    type CurrentConnectedApps,
} from '~types/connect';
import type { ChainNetworkKey, CurrentIdentityNetwork, IdentityNetwork } from '~types/network';

import { LOCAL_SECURE_KEY_CURRENT_CONNECTED_APPS } from '../../keys';

// ! always try to use this value to avoid BLINK
const DEFAULT_VALUE: CurrentConnectedApps = DEFAULT_CURRENT_CONNECTED_APPS;
let cached_current_connected_apps: CurrentConnectedApps = DEFAULT_VALUE;

// current connected apps ->  // * local secure
export const useCurrentConnectedAppsInner = (
    storage: SecureStorage | undefined,
    current_identity_network: CurrentIdentityNetwork | undefined,
): [
    CurrentConnectedApps,
    (value: CurrentConnectedApps) => Promise<void>,
    {
        current_identity_network: CurrentIdentityNetwork | undefined;
        pushOrUpdateConnectedApp: (chain: Chain, app: ConnectedApp) => Promise<void>;
        removeConnectedApp: (chain: Chain, app: ConnectedApp) => Promise<void>;
        removeAllConnectedApps: (chain: Chain) => Promise<void>;
    },
] => {
    const [current_connected_apps, setCurrentConnectedApps] =
        useState<CurrentConnectedApps>(cached_current_connected_apps); // use cached value to init

    // watch this key, cloud notice other hook of this
    useEffect(() => {
        if (!storage || !current_identity_network) return;
        if (!current_connected_apps) return; // ! MUST CHECK THEN UPDATE

        const handle_chain_network = (key: ChainNetworkKey): (() => void) => {
            const callback: StorageWatchCallback = (d) => {
                const connected_apps = d.newValue ?? DEFAULT_VALUE;
                if (!same(current_connected_apps[key], connected_apps)) {
                    setCurrentConnectedApps({ ...current_connected_apps, [key]: connected_apps });
                }
            };
            const _key = current_identity_network[key]
                ? LOCAL_SECURE_KEY_CURRENT_CONNECTED_APPS(current_identity_network[key])
                : undefined;
            if (_key) storage.watch({ [_key]: callback });
            return () => {
                if (_key) storage.unwatch({ [_key]: callback });
            };
        };

        const ic = handle_chain_network('ic');
        const ethereum = handle_chain_network('ethereum');
        const ethereum_test_sepolia = handle_chain_network('ethereum_test_sepolia');
        const polygon = handle_chain_network('polygon');
        const polygon_test_amoy = handle_chain_network('polygon_test_amoy');
        const bsc = handle_chain_network('bsc');
        const bsc_test = handle_chain_network('bsc_test');

        return () => {
            ic();
            ethereum();
            ethereum_test_sepolia();
            polygon();
            polygon_test_amoy();
            bsc();
            bsc_test();
        };
    }, [storage, current_identity_network, current_connected_apps]);

    // init on this hook
    useEffect(() => {
        if (!storage || !current_identity_network)
            return setCurrentConnectedApps((cached_current_connected_apps = DEFAULT_VALUE));
        if (!current_connected_apps) return; // ! MUST CHECK THEN UPDATE

        get_current_connected_apps(storage, current_identity_network).then((next_current_connected_apps) => {
            const new_current_connected_apps = { ...current_connected_apps, ...next_current_connected_apps };
            if (!same(new_current_connected_apps, current_connected_apps)) {
                cached_current_connected_apps = new_current_connected_apps;
                setCurrentConnectedApps(cached_current_connected_apps); // ! MUST CHECK THEN UPDATE
            }
        });
    }, [storage, current_identity_network, current_connected_apps]);

    // update on this hook
    const updateCurrentConnectedApps = useCallback(
        async (connected_apps: CurrentConnectedApps) => {
            if (!storage || !current_identity_network) return;
            if (!current_connected_apps) return; // ! MUST CHECK THEN UPDATE

            let changed = false;

            // check ic
            if (!same(current_connected_apps.ic, connected_apps.ic) && current_identity_network.ic) {
                const key_ic = LOCAL_SECURE_KEY_CURRENT_CONNECTED_APPS(current_identity_network.ic);
                await storage.set(key_ic, connected_apps.ic);
                changed = true;
            }

            if (changed) {
                cached_current_connected_apps = connected_apps;
                setCurrentConnectedApps(connected_apps);
            }
        },
        [storage, current_identity_network, current_connected_apps],
    );

    // update single
    const pushOrUpdateConnectedApp = useCallback(
        async (chain: Chain, app: ConnectedApp) => {
            if (!storage || !current_identity_network) return;
            if (!current_connected_apps) return;

            const new_current_connected_apps = await push_or_update_connected_app(
                chain,
                app,
                storage,
                current_identity_network,
                current_connected_apps,
            );
            if (!same(new_current_connected_apps, current_connected_apps)) {
                updateCurrentConnectedApps(new_current_connected_apps);
            }
        },
        [storage, current_identity_network, current_connected_apps, updateCurrentConnectedApps],
    );
    // remove single
    const removeConnectedApp = useCallback(
        async (chain: Chain, app: ConnectedApp) => {
            if (!storage || !current_identity_network) return;
            if (!current_connected_apps) return;

            const new_current_connected_apps = await remove_connected_app(
                chain,
                app,
                storage,
                current_identity_network,
                current_connected_apps,
            );
            if (new_current_connected_apps && !same(new_current_connected_apps, current_connected_apps)) {
                await updateCurrentConnectedApps(new_current_connected_apps);
            }
        },
        [storage, current_identity_network, current_connected_apps, updateCurrentConnectedApps],
    );
    // remove all
    const removeAllConnectedApps = useCallback(
        async (chain: Chain) => {
            if (!storage || !current_identity_network) return;
            if (!current_connected_apps) return;

            const new_current_connected_apps = await remove_all_connected_app(
                chain,
                storage,
                current_identity_network,
                current_connected_apps,
            );
            if (new_current_connected_apps && !same(new_current_connected_apps, current_connected_apps)) {
                await updateCurrentConnectedApps(new_current_connected_apps);
            }
        },
        [storage, current_identity_network, current_connected_apps, updateCurrentConnectedApps],
    );

    return [
        current_connected_apps,
        updateCurrentConnectedApps,
        {
            current_identity_network,
            pushOrUpdateConnectedApp,
            removeConnectedApp,
            removeAllConnectedApps,
        },
    ];
};

const __get_apps = (chain: Chain, current_connected_apps: CurrentConnectedApps) => {
    const apps = [
        ...match_chain(chain, {
            ic: () => current_connected_apps.ic,
            ethereum: () => current_connected_apps.ethereum,
            ethereum_test_sepolia: () => current_connected_apps.ethereum_test_sepolia,
            polygon: () => current_connected_apps.polygon,
            polygon_test_amoy: () => current_connected_apps.polygon_test_amoy,
            bsc: () => current_connected_apps.bsc,
            bsc_test: () => current_connected_apps.bsc_test,
        }),
    ];
    return apps;
};
const __get_new_current_connected_apps = async (
    chain: Chain,
    storage: SecureStorage,
    current_identity_network: CurrentIdentityNetwork,
    current_connected_apps: CurrentConnectedApps,
    apps: ConnectedApps,
): Promise<CurrentConnectedApps> => {
    const handle_identity_network = (
        identity_network: IdentityNetwork | undefined,
        key: ChainNetworkKey,
    ): [string | undefined, CurrentConnectedApps] => {
        if (!identity_network) return [undefined, current_connected_apps];
        return [LOCAL_SECURE_KEY_CURRENT_CONNECTED_APPS(identity_network), { ...current_connected_apps, [key]: apps }];
    };
    const [key, new_current_connected_apps] = match_chain(chain, {
        ic: () => handle_identity_network(current_identity_network.ic, 'ic'),
        ethereum: () => handle_identity_network(current_identity_network.ethereum, 'ethereum'),
        ethereum_test_sepolia: () =>
            handle_identity_network(current_identity_network.ethereum_test_sepolia, 'ethereum_test_sepolia'),
        polygon: () => handle_identity_network(current_identity_network.polygon, 'polygon'),
        polygon_test_amoy: () =>
            handle_identity_network(current_identity_network.polygon_test_amoy, 'polygon_test_amoy'),
        bsc: () => handle_identity_network(current_identity_network.bsc, 'bsc'),
        bsc_test: () => handle_identity_network(current_identity_network.bsc_test, 'bsc_test'),
    });
    if (key !== undefined) await storage.set(key, apps);
    return new_current_connected_apps;
};

const push_or_update_connected_app = async (
    chain: Chain,
    app: ConnectedApp,
    storage: SecureStorage,
    current_identity_network: CurrentIdentityNetwork,
    current_connected_apps: CurrentConnectedApps,
): Promise<CurrentConnectedApps> => {
    const apps = __get_apps(chain, current_connected_apps); // find apps
    const a = apps.find((a) => a.origin === app.origin);
    if (a !== undefined) update_connected_app(a, app);
    else apps.push(app);
    return await __get_new_current_connected_apps(
        chain,
        storage,
        current_identity_network,
        current_connected_apps,
        apps,
    );
};
const remove_connected_app = async (
    chain: Chain,
    app: ConnectedApp,
    storage: SecureStorage,
    current_identity_network: CurrentIdentityNetwork,
    current_connected_apps: CurrentConnectedApps,
): Promise<CurrentConnectedApps | undefined> => {
    let apps = __get_apps(chain, current_connected_apps); // find apps
    const a = apps.find((a) => a.origin === app.origin);
    if (!a) return undefined;

    // also remove temp access maybe exist this time
    await revoke_current_session_connected_app(chain, current_identity_network, app.origin);

    apps = apps.filter((a) => a.origin !== app.origin);

    return await __get_new_current_connected_apps(
        chain,
        storage,
        current_identity_network,
        current_connected_apps,
        apps,
    );
};
const remove_all_connected_app = async (
    chain: Chain,
    storage: SecureStorage,
    current_identity_network: CurrentIdentityNetwork,
    current_connected_apps: CurrentConnectedApps,
): Promise<CurrentConnectedApps | undefined> => {
    let apps = __get_apps(chain, current_connected_apps); // find apps
    if (apps.length === 0) return undefined;

    // also remove temp access maybe exist this time
    await Promise.all(
        apps.map((app) => revoke_current_session_connected_app(chain, current_identity_network, app.origin)),
    );

    apps = [];

    return await __get_new_current_connected_apps(
        chain,
        storage,
        current_identity_network,
        current_connected_apps,
        apps,
    );
};

export const get_current_connected_apps = async (
    storage: SecureStorage,
    current_identity_network: CurrentIdentityNetwork,
): Promise<CurrentConnectedApps> => {
    const get_connected_apps = async (key: ChainNetworkKey) => {
        const _key = current_identity_network[key]
            ? LOCAL_SECURE_KEY_CURRENT_CONNECTED_APPS(current_identity_network[key])
            : undefined;
        let data = _key ? await storage.get<ConnectedApps>(_key) : [];
        if (data === undefined) data = [];
        return data;
    };

    const current_connected_apps: CurrentConnectedApps = await Promise.all([
        get_connected_apps('ic'),
        get_connected_apps('ethereum'),
        get_connected_apps('ethereum_test_sepolia'),
        get_connected_apps('polygon'),
        get_connected_apps('polygon_test_amoy'),
        get_connected_apps('bsc'),
        get_connected_apps('bsc_test'),
    ]).then(([ic, ethereum, ethereum_test_sepolia, polygon, polygon_test_amoy, bsc, bsc_test]) => {
        const new_current_connected_apps = {
            ic,
            ethereum,
            ethereum_test_sepolia,
            polygon,
            polygon_test_amoy,
            bsc,
            bsc_test,
        };
        return new_current_connected_apps;
    });

    return current_connected_apps;
};
