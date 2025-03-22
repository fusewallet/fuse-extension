import { useCallback, useMemo } from 'react';

import type { SecureStorage } from '@plasmohq/storage/secure';

import { useSecureCachedStoreData0, type SecureDataMetadata0 } from '~hooks/meta/metadata-secure-0';
import { same } from '~lib/utils/same';
import { resort_list, type ResortFunction } from '~lib/utils/sort';
import type { Chain } from '~types/chain';

// import { useCurrentChainNetwork } from '.';
import { LOCAL_SECURE_KEY_CURRENT_SHOW_NETWORK } from '../keys';

interface DataType {
    chains: Chain[];
    showTestNetworks: boolean;
}
const get_key = (): string => LOCAL_SECURE_KEY_CURRENT_SHOW_NETWORK;
const get_default_value = (): DataType => {
    return { chains: ['ic', 'ethereum', 'polygon', 'bsc'], showTestNetworks: false };
};
let cached_value = get_default_value();
const get_cached_value = (): DataType => cached_value;
const set_cached_value = (value: DataType): DataType => (cached_value = value);
const meta: SecureDataMetadata0<DataType> = {
    get_key,
    get_default_value,
    get_cached_value,
    set_cached_value,
};

// marked addresses ->  // * local secure
export const useShowNetworksInner = (
    storage: SecureStorage | undefined,
): [DataType, (value: DataType) => Promise<void>] => useSecureCachedStoreData0(storage, meta);

export const useShowTestNetworksInner = (
    storage: SecureStorage | undefined,
): [DataType, (value: DataType) => Promise<void>] => useSecureCachedStoreData0(storage, meta);

export const useShowNetworksInner2 = (
    storage: SecureStorage | undefined,
): [
    { chains: Chain[]; showTestNetworks: boolean },
    {
        pushOrUpdateShowNetworks: (chain: Chain, isShow: boolean) => Promise<boolean | undefined>;
        // removeShowNetworks: (chain: Chain) => Promise<boolean | undefined>;
        resortShowNetworks: ResortFunction;
        setShowTestNetworks: (isShow: boolean) => void;
    },
    test_networks: Chain[],
] => {
    const [show_networks, setShowNetworks] = useShowNetworksInner(storage);
    // const main_networks = useMemo(() => (['ic', 'ethereum', 'polygon', 'bsc']), []);
    const test_networks = useMemo(() => ['ethereum-test-sepolia', 'polygon-test-amoy', 'bsc-test'] as Chain[], []);

    const setShowTestNetworks = useCallback(
        async (isShow: boolean) => {
            if (!storage || !show_networks) return;

            // const new_show_networks = isShow
            //     ? [...show_networks.chains, ...test_networks]
            //     : show_networks.chains.filter((a) => !test_networks.includes(a));

            await setShowNetworks({ chains: show_networks.chains, showTestNetworks: isShow });
        },
        [setShowNetworks, show_networks, storage],
    );

    // push or update
    const pushOrUpdateShowNetworks = useCallback(
        async (chain: Chain, isShow: boolean) => {
            if (!storage || !show_networks) return undefined;

            if (isShow) {
                const exist = show_networks.chains.find((a) => same(a, chain));
                if (exist) return true;
                const new_show_networks = [...show_networks.chains, chain];
                await setShowNetworks({ chains: new_show_networks, showTestNetworks: show_networks.showTestNetworks });
            } else {
                const exist = show_networks.chains.find((a) => same(a, chain));
                if (!exist) return false;
                const new_show_networks = show_networks.chains.filter((a) => !same(a, chain));
                await setShowNetworks({ chains: new_show_networks, showTestNetworks: show_networks.showTestNetworks });
            }
        },
        [storage, show_networks, setShowNetworks],
    );

    // resort
    const resortShowNetworks = useCallback(
        async (source_index: number, destination_index: number | undefined) => {
            if (!storage || !show_networks) return undefined;

            const next = resort_list(show_networks.chains, source_index, destination_index);
            if (typeof next === 'boolean') return next;

            await setShowNetworks({ chains: next, showTestNetworks: show_networks.showTestNetworks });

            return true;
        },
        [storage, show_networks, setShowNetworks],
    );

    return [show_networks, { pushOrUpdateShowNetworks, resortShowNetworks, setShowTestNetworks }, test_networks];
};
