import { useCallback } from 'react';
import { createWalletClient as createEvmWalletClient, http, type PrivateKeyAccount } from 'viem';
import { privateKeyToAccount as evmPrivateKeyToAccount } from 'viem/accounts';

import { SecureStorage } from '@plasmohq/storage/secure';

import { get_viem_chain_by_chain, useEvmChainNetworkByChain } from '~hooks/evm/viem';
import { get_address_by_mnemonic_and_metadata } from '~lib/mnemonic';
import { check_password, hash_password, verify_password } from '~lib/password';
import type { ApprovedState } from '~types/actions/approve';
import { match_chain, type Chain, type EvmChain } from '~types/chain';
import { type ConnectedApps, type CurrentConnectedApps } from '~types/connect';
import type { CurrentInfo } from '~types/current';
import { match_combined_identity_key, type IdentityAddress, type IdentityKey, type KeyRings } from '~types/identity';
import {
    DEFAULT_CURRENT_CHAIN_NETWORK,
    get_default_rpc,
    match_identity_network,
    type CurrentChainNetwork,
    type CurrentIdentityNetwork,
    type IdentityNetwork,
} from '~types/network';

import { agent_refresh_unique_identity } from '../agent';
import { identity_network_callback } from '../common';
import {
    LOCAL_SECURE_KEY_APPROVED,
    LOCAL_SECURE_KEY_CURRENT_CHAIN_NETWORK,
    LOCAL_SECURE_KEY_CURRENT_CONNECTED_APPS,
    LOCAL_SECURE_KEY_KEY_RINGS,
    SESSION_KEY_UNLOCKED,
} from '../keys';
import { setPasswordHashedDirectly, usePasswordHashed } from '../local';
import {
    __get_actual_password,
    __get_password,
    __get_session_storage,
    refreshUnlockedDirectly,
    useUnlocked,
} from '../session';
import { useMarkedAddressesInner2 } from './address/marked_address';
import { useRecentAddressesInner2 } from './address/recent_address';
import { useChainNetworksInner } from './chain_networks';
import { useCurrentChainNetworkInner } from './current/current_chain_network';
import { get_current_connected_apps, useCurrentConnectedAppsInner } from './current/current_connected_apps';
import { useKeyRingsInner } from './key_rings';
import { get_current_identity_network, useCurrentIdentityBy } from './memo/current';
import { useIdentityKeysBy, useIdentityKeysCountBy } from './memo/identity';
import { useShowNetworksInner, useShowNetworksInner2 } from './show_networks';
import { useSecureStorageInner } from './storage';

// ! Important data and do NEVER export
const LOCAL_SECURE_STORAGE = () => new SecureStorage({ area: 'local' }); // local secure
const SESSION_STORAGE = __get_session_storage();

// ############### LOCAL SECURE ###############

const useSecureStorageBy = (unlocked: string) => useSecureStorageInner(unlocked, LOCAL_SECURE_STORAGE);

export const useChangePassword = () => {
    const [password_hashed] = usePasswordHashed();
    const changePassword = useCallback(
        async (old_password: string, new_password: string): Promise<boolean | undefined> => {
            const checked = await verify_password(password_hashed, old_password);
            if (!checked) return false;
            if (!check_password(new_password)) return false;

            const new_password_hashed = await hash_password(new_password);

            const old_storage = LOCAL_SECURE_STORAGE();
            const { actual_password: old_actual_password } = await __get_actual_password(old_password);
            await old_storage.setPassword(old_actual_password);
            const new_storage = LOCAL_SECURE_STORAGE();
            const { unlocked, actual_password: new_actual_password } = await __get_actual_password(new_password);
            await new_storage.setPassword(new_actual_password);

            // console.error('before migrate');
            // console.error('old storage', await old_storage.getAll());
            // console.error('new storage', await new_storage.getAll());

            // await old_storage.migrate(new_storage); // ! failed
            const keys = Object.keys(await old_storage.getAll()); // get all keys
            const data = await old_storage.getMany(keys); // get all data
            await new_storage.setMany(data); // set new data
            await old_storage.removeMany(keys); // remove old data

            await setPasswordHashedDirectly(new_password_hashed);
            await refreshUnlockedDirectly(unlocked);
            return true;
        },
        [password_hashed],
    );
    return changePassword;
};

export const useCurrentChainNetwork = () => {
    const [unlocked] = useUnlocked();
    const storage = useSecureStorageBy(unlocked);
    const [key_rings] = useKeyRingsInner(storage);
    const [current_chain_network] = useCurrentChainNetworkInner(storage, key_rings?.current);
    return current_chain_network;
};

export const useCurrentConnectedApps = () => {
    const [unlocked] = useUnlocked();
    const storage = useSecureStorageBy(unlocked);
    const { current_identity_network } = useCurrentIdentity();
    return useCurrentConnectedAppsInner(storage, current_identity_network);
};

export const useCurrentIdentity = () => {
    const [unlocked] = useUnlocked();
    const storage = useSecureStorageBy(unlocked);
    const [key_rings] = useKeyRingsInner(storage);
    const [current_chain_network] = useCurrentChainNetworkInner(storage, key_rings?.current);
    return useCurrentIdentityBy(key_rings, current_chain_network);
};

export const useEvmWalletClientCreator = (chain: EvmChain) => {
    const [unlocked] = useUnlocked();
    const storage = useSecureStorageBy(unlocked);
    const [key_rings] = useKeyRingsInner(storage);
    const network = useEvmChainNetworkByChain(chain);
    const { current_identity_network } = useCurrentIdentity();
    const rpc = network.rpc === 'mainnet' ? get_default_rpc(chain) : network.rpc;
    const create_wallet_client = useCallback(() => {
        if (!key_rings) return undefined;
        const current = key_rings.keys.find((i) => i.id === key_rings.current);
        if (!current) return undefined;
        if (!current_identity_network) return undefined;
        return match_combined_identity_key(current.key, {
            mnemonic: (mnemonic) => {
                const [, { ethereum, ethereum_test_sepolia, polygon, polygon_test_amoy, bsc, bsc_test }] =
                    get_address_by_mnemonic_and_metadata(mnemonic.mnemonic);
                const identity_network = match_chain<IdentityNetwork | undefined>(chain, {
                    ic: () => {
                        throw new Error('IC chain is not supported');
                    },
                    ethereum: () => current_identity_network.ethereum,
                    ethereum_test_sepolia: () => current_identity_network.ethereum_test_sepolia,
                    polygon: () => current_identity_network.polygon,
                    polygon_test_amoy: () => current_identity_network.polygon_test_amoy,
                    bsc: () => current_identity_network.bsc,
                    bsc_test: () => current_identity_network.bsc_test,
                });
                if (!identity_network) return undefined;
                const account = match_identity_network<PrivateKeyAccount | undefined>(identity_network, {
                    ic: () => {
                        throw new Error('IC chain is not supported');
                    },
                    ethereum: () => {
                        const private_key = ethereum?.privateKey;
                        if (!private_key) return undefined;
                        return evmPrivateKeyToAccount(private_key);
                    },
                    ethereum_test_sepolia: () => {
                        const private_key = ethereum_test_sepolia?.privateKey;
                        if (!private_key) return undefined;
                        return evmPrivateKeyToAccount(private_key);
                    },
                    polygon: () => {
                        const private_key = polygon?.privateKey;
                        if (!private_key) return undefined;
                        return evmPrivateKeyToAccount(private_key);
                    },
                    polygon_test_amoy: () => {
                        const private_key = polygon_test_amoy?.privateKey;
                        if (!private_key) return undefined;
                        return evmPrivateKeyToAccount(private_key);
                    },
                    bsc: () => {
                        const private_key = bsc?.privateKey;
                        if (!private_key) return undefined;
                        return evmPrivateKeyToAccount(private_key);
                    },
                    bsc_test: () => {
                        const private_key = bsc_test?.privateKey;
                        if (!private_key) return undefined;
                        return evmPrivateKeyToAccount(private_key);
                    },
                });
                if (!account) return undefined;
                return createEvmWalletClient({
                    account,
                    chain: get_viem_chain_by_chain(chain),
                    transport: http(rpc),
                });
            },
            private_key: () => {
                throw new Error(`Unimplemented identity type: private_key`);
            },
        });
    }, [chain, current_identity_network, key_rings, rpc]);
    return create_wallet_client;
};

export const useIdentityKeysCount = () => {
    const [unlocked] = useUnlocked();
    const storage = useSecureStorageBy(unlocked);
    const [key_rings] = useKeyRingsInner(storage);
    return useIdentityKeysCountBy(key_rings);
};
export const useIdentityKeys = () => {
    const [password_hashed] = usePasswordHashed();
    const [unlocked] = useUnlocked();
    const storage = useSecureStorageBy(unlocked);
    const [key_rings, setKeyRings] = useKeyRingsInner(storage);
    return useIdentityKeysBy(password_hashed, key_rings, setKeyRings);
};

export const useRecentAddresses = () => {
    const [unlocked] = useUnlocked();
    const storage = useSecureStorageBy(unlocked);
    return useRecentAddressesInner2(storage);
};
export const useMarkedAddresses = () => {
    const [unlocked] = useUnlocked();
    const storage = useSecureStorageBy(unlocked);
    return useMarkedAddressesInner2(storage);
};

export const useCurrentShowNetworks = () => {
    const [unlocked] = useUnlocked();
    const storage = useSecureStorageBy(unlocked);
    return useShowNetworksInner(storage);
};

export const useShowNetworks = () => {
    const [unlocked] = useUnlocked();
    const storage = useSecureStorageBy(unlocked);
    return useShowNetworksInner2(storage);
};

export const useAllChainNetworks = () => {
    const [unlocked] = useUnlocked();
    const storage = useSecureStorageBy(unlocked);
    return useChainNetworksInner(storage);
};
// ================ set directly by storage ================

// ############### LOCAL SECURE ###############

export const setKeyRingsDirectly = async (actual_password: string, key_rings: KeyRings) => {
    const storage = LOCAL_SECURE_STORAGE();
    await storage.setPassword(actual_password); // set password before any action

    await storage.set(LOCAL_SECURE_KEY_KEY_RINGS, key_rings);
};

const get_unlocked_secure_storage = async (get_password?: (hash: string) => Promise<string>) => {
    const unlocked = await SESSION_STORAGE.get<string>(SESSION_KEY_UNLOCKED);
    if (!unlocked) return; // locked

    const storage = LOCAL_SECURE_STORAGE();
    await storage.setPassword(await (get_password ?? __get_password)(unlocked)); // set password before any action

    return storage;
};

// identity address
const _inner_get_current_address = async (
    get_password?: (hash: string) => Promise<string>,
): Promise<
    { current_address: IdentityAddress; storage: SecureStorage; key_rings: KeyRings; current: IdentityKey } | undefined
> => {
    const storage = await get_unlocked_secure_storage(get_password);
    if (!storage) return undefined; // get secure storage after password

    const key_rings = await storage.get<KeyRings>(LOCAL_SECURE_KEY_KEY_RINGS);
    // const chain_networks = await LOCAL_SECURE_STORAGE.get<ChainNetworks>(KEY_CHAIN_NETWORKS);
    if (key_rings === undefined) throw new Error('no private keys');

    const current = key_rings.keys.find((i) => i.id === key_rings.current);
    if (!current) throw new Error('can not find current identity');

    const current_address = current.address;

    return { current_address, storage, key_rings, current };
};
export const get_current_identity_address = async (
    get_password?: (hash: string) => Promise<string>,
): Promise<IdentityAddress | undefined> => {
    return (await _inner_get_current_address(get_password))?.current_address;
};

// current info
export const get_current_info = async (
    get_password?: (hash: string) => Promise<string>,
): Promise<CurrentInfo | undefined> => {
    const _r = await _inner_get_current_address(get_password);
    if (!_r) return undefined;

    const { current_address, storage, key_rings, current } = _r;

    const current_chain_network =
        (await storage.get<CurrentChainNetwork>(LOCAL_SECURE_KEY_CURRENT_CHAIN_NETWORK(key_rings.current))) ??
        DEFAULT_CURRENT_CHAIN_NETWORK;

    agent_refresh_unique_identity(current, current_chain_network); // * refresh identity

    const current_identity_network: CurrentIdentityNetwork = get_current_identity_network(
        current_address,
        current_chain_network,
    );

    const current_connected_apps: CurrentConnectedApps = await get_current_connected_apps(
        storage,
        current_identity_network,
    );
    console.debug('🚀 ~ current_connected_apps:', current_connected_apps);

    return {
        current_identity: key_rings.current,
        current_chain_network,
        current_identity_network,
        current_connected_apps,
    };
};

// update connected apps
// from relay
export const set_current_connected_apps = async (
    chain: Chain,
    current_identity_network: CurrentIdentityNetwork,
    apps: ConnectedApps,
    get_password?: (hash: string) => Promise<string>,
): Promise<void> => {
    const storage = await get_unlocked_secure_storage(get_password);
    if (!storage) return undefined; // get secure storage after password

    const identity_network = await identity_network_callback<IdentityNetwork | undefined>(
        chain,
        current_identity_network,
        undefined,
        async (s) => s,
    );
    if (!identity_network) return;

    const key = LOCAL_SECURE_KEY_CURRENT_CONNECTED_APPS(identity_network);
    await storage.set(key, apps);
};

// marked granted/denied local
// from relay
export const find_local_secure_approved = async (
    chain: Chain,
    current_identity_network: CurrentIdentityNetwork,
    origin: string,
    request_hash: string,
    get_password?: (hash: string) => Promise<string>,
): Promise<ApprovedState | undefined> => {
    const storage = await get_unlocked_secure_storage(get_password);
    if (!storage) return undefined; // get secure storage after password
    return identity_network_callback(chain, current_identity_network, undefined, async (identity_network) => {
        const key = LOCAL_SECURE_KEY_APPROVED(identity_network, origin, request_hash);
        return await storage.get<ApprovedState>(key);
    });
};
// no call
export const delete_local_secure_approved = async (
    chain: Chain,
    current_identity_network: CurrentIdentityNetwork,
    origin: string,
    request_hash: string,
): Promise<void> => {
    const storage = await get_unlocked_secure_storage();
    if (!storage) return undefined; // get secure storage after password
    return identity_network_callback(chain, current_identity_network, undefined, async (identity_network) => {
        const key = LOCAL_SECURE_KEY_APPROVED(identity_network, origin, request_hash);
        await storage.remove(key);
    });
};
// from action page
export const set_local_secure_approved = async (
    chain: Chain,
    current_identity_network: CurrentIdentityNetwork,
    origin: string,
    request_hash: string,
    state: ApprovedState,
): Promise<void> => {
    const storage = await get_unlocked_secure_storage();
    if (!storage) return undefined; // get secure storage after password
    return identity_network_callback(chain, current_identity_network, undefined, async (identity_network) => {
        const key = LOCAL_SECURE_KEY_APPROVED(identity_network, origin, request_hash);
        await storage.set(key, state);
    });
};
