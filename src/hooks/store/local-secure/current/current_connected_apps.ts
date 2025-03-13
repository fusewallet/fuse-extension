import { useCallback, useEffect, useState } from 'react';

import type { StorageWatchCallback } from '@plasmohq/storage';
import type { SecureStorage } from '@plasmohq/storage/secure';

import { revoke_current_session_connected_app } from '~hooks/store/session';
import { same } from '~lib/utils/same';
import { match_chain, match_chain_async, type Chain } from '~types/chain';
import {
    DEFAULT_CURRENT_CONNECTED_APPS,
    update_connected_app,
    type ConnectedApp,
    type ConnectedApps,
    type CurrentConnectedApps,
} from '~types/connect';
import type { CurrentIdentityNetwork } from '~types/network';

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

        const current_ic_connected_apps_callback: StorageWatchCallback = (d) => {
            const current_ic_connected_apps = d.newValue ?? DEFAULT_VALUE;
            if (!same(current_connected_apps.ic, current_ic_connected_apps)) {
                setCurrentConnectedApps({ ...current_connected_apps, ic: current_ic_connected_apps });
            }
        };
        const key_ic = current_identity_network.ic
            ? LOCAL_SECURE_KEY_CURRENT_CONNECTED_APPS(current_identity_network.ic)
            : undefined;
        if (key_ic) storage.watch({ [key_ic]: current_ic_connected_apps_callback });
        return () => {
            if (key_ic) storage.unwatch({ [key_ic]: current_ic_connected_apps_callback });
        };
    }, [storage, current_identity_network, current_connected_apps]);

    // init on this hook
    useEffect(() => {
        if (!storage || !current_identity_network)
            return setCurrentConnectedApps((cached_current_connected_apps = DEFAULT_VALUE));
        if (!current_connected_apps) return; // ! MUST CHECK THEN UPDATE

        const key_ic = current_identity_network.ic
            ? LOCAL_SECURE_KEY_CURRENT_CONNECTED_APPS(current_identity_network.ic)
            : undefined;
        (async () => {
            let data_ic = key_ic ? await storage.get<ConnectedApps>(key_ic) : [];
            if (data_ic === undefined) data_ic = [];
            const new_current_connected_apps = { ...cached_current_connected_apps, ic: data_ic };
            if (!same(new_current_connected_apps, current_connected_apps)) {
                cached_current_connected_apps = new_current_connected_apps;
                setCurrentConnectedApps(cached_current_connected_apps); // ! MUST CHECK THEN UPDATE
            }
        })();
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

const push_or_update_connected_app = async (
    chain: Chain,
    app: ConnectedApp,
    storage: SecureStorage,
    current_identity_network: CurrentIdentityNetwork,
    current_connected_apps: CurrentConnectedApps,
): Promise<CurrentConnectedApps> => {
    // find apps
    const apps = [
        ...match_chain(chain, {
            ic: () => current_connected_apps.ic,
            evm: () => current_connected_apps.evm,
        }),
    ];
    const a = apps.find((a) => a.origin === app.origin);
    if (a !== undefined) update_connected_app(a, app);
    else apps.push(app);

    return await match_chain_async(chain, {
        ic: async () => {
            if (!current_identity_network.ic) return current_connected_apps;
            const key_ic = LOCAL_SECURE_KEY_CURRENT_CONNECTED_APPS(current_identity_network.ic);
            await storage.set(key_ic, apps);
            const new_current_connected_apps: CurrentConnectedApps = { ...current_connected_apps, ic: apps };
            return new_current_connected_apps;
        },
        evm: async () => {
            if (!current_identity_network.evm) return current_connected_apps;
            const key_evm = LOCAL_SECURE_KEY_CURRENT_CONNECTED_APPS(current_identity_network.evm);
            await storage.set(key_evm, apps);
            const new_current_connected_apps: CurrentConnectedApps = { ...current_connected_apps, evm: apps };
            return new_current_connected_apps;
        },
    });
};

const remove_connected_app = async (
    chain: Chain,
    app: ConnectedApp,
    storage: SecureStorage,
    current_identity_network: CurrentIdentityNetwork,
    current_connected_apps: CurrentConnectedApps,
): Promise<CurrentConnectedApps | undefined> => {
    // find apps
    let apps = [
        ...match_chain(chain, {
            ic: () => current_connected_apps.ic,
            evm: () => current_connected_apps.evm,
        }),
    ];
    const a = apps.find((a) => a.origin === app.origin);
    if (!a) return undefined;

    // also remove temp access maybe exist this time
    await revoke_current_session_connected_app(chain, current_identity_network, app.origin);

    apps = apps.filter((a) => a.origin !== app.origin);

    return await match_chain_async(chain, {
        ic: async () => {
            if (!current_identity_network.ic) return current_connected_apps;
            const key_ic = LOCAL_SECURE_KEY_CURRENT_CONNECTED_APPS(current_identity_network.ic);
            await storage.set(key_ic, apps);
            const new_current_connected_apps: CurrentConnectedApps = { ...current_connected_apps, ic: apps };
            return new_current_connected_apps;
        },
        evm: async () => {
            if (!current_identity_network.evm) return current_connected_apps;
            const key_evm = LOCAL_SECURE_KEY_CURRENT_CONNECTED_APPS(current_identity_network.evm);
            await storage.set(key_evm, apps);
            const new_current_connected_apps: CurrentConnectedApps = { ...current_connected_apps, evm: apps };
            return new_current_connected_apps;
        },
    });
};

const remove_all_connected_app = async (
    chain: Chain,
    storage: SecureStorage,
    current_identity_network: CurrentIdentityNetwork,
    current_connected_apps: CurrentConnectedApps,
): Promise<CurrentConnectedApps | undefined> => {
    // find apps
    let apps = [
        ...match_chain(chain, {
            ic: () => current_connected_apps.ic,
            evm: () => current_connected_apps.evm,
        }),
    ];
    if (apps.length === 0) return undefined;

    // also remove temp access maybe exist this time
    await Promise.all(
        apps.map((app) => revoke_current_session_connected_app(chain, current_identity_network, app.origin)),
    );

    apps = [];

    return await match_chain_async(chain, {
        ic: async () => {
            if (!current_identity_network.ic) return current_connected_apps;
            const key_ic = LOCAL_SECURE_KEY_CURRENT_CONNECTED_APPS(current_identity_network.ic);
            await storage.set(key_ic, apps);
            const new_current_connected_apps: CurrentConnectedApps = { ...current_connected_apps, ic: apps };
            return new_current_connected_apps;
        },
        evm: async () => {
            if (!current_identity_network.evm) return current_connected_apps;
            const key_evm = LOCAL_SECURE_KEY_CURRENT_CONNECTED_APPS(current_identity_network.evm);
            await storage.set(key_evm, apps);
            const new_current_connected_apps: CurrentConnectedApps = { ...current_connected_apps, evm: apps };
            return new_current_connected_apps;
        },
    });
};
