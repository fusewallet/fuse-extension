import { useCallback, useMemo } from 'react';

import { SecureStorage } from '@plasmohq/storage/secure';

import { check_password, hash_password, verify_password } from '~lib/password';
import type { ApprovedState } from '~types/actions/approve';
import { match_chain, type Chain } from '~types/chain';
import { type ConnectedApps, type CurrentConnectedApps } from '~types/connect';
import type { CurrentInfo } from '~types/current';
import { type IdentityAddress, type IdentityKey, type PrivateKeys } from '~types/identity';
import {
    type ChainEvmNetwork,
    type ChainIcNetwork,
    type ChainNetwork,
    type CurrentIdentityNetwork,
    type IdentityNetwork,
} from '~types/network';

import { agent_refresh_unique_identity, refresh_unique_evm_wallet_client } from '../agent';
import { identity_network_callback } from '../common';
import {
    LOCAL_SECURE_KEY_APPROVED,
    LOCAL_SECURE_KEY_CURRENT_CONNECTED_APPS,
    LOCAL_SECURE_KEY_PRIVATE_KEYS,
    SESSION_KEY_PASSWORD,
} from '../keys';
import { setPasswordHashedDirectly, usePasswordHashed } from '../local';
import { __get_session_storage, lockDirectly, refreshPasswordDirectly, usePassword } from '../session';
import { useMarkedAddressesInner2 } from './address/marked_address';
import { useRecentAddressesInner2 } from './address/recent_address';
import { useCurrentConnectedAppsInner } from './current/current_connected_apps';
import { useCurrentIdentityBy } from './memo/current';
import { useIdentityKeysBy, useIdentityKeysCountBy } from './memo/identity';
import { usePrivateKeysInner } from './private_keys';
import { useSecureStorageInner } from './storage';

// ! Important data and do NEVER export
const LOCAL_SECURE_STORAGE = () => new SecureStorage({ area: 'local' }); // local secure
const SESSION_STORAGE = __get_session_storage();

// ############### LOCAL SECURE ###############

const useSecureStorageBy = (password: string) => useSecureStorageInner(password, LOCAL_SECURE_STORAGE);

export const useChangePassword = () => {
    const [password_hashed] = usePasswordHashed();
    const changePassword = useCallback(
        async (old_password: string, new_password: string): Promise<boolean | undefined> => {
            const checked = await verify_password(password_hashed, old_password);
            if (!checked) return false;
            if (!check_password(new_password)) return false;

            const new_password_hashed = await hash_password(new_password);

            const old_storage = LOCAL_SECURE_STORAGE();
            await old_storage.setPassword(old_password);
            const new_storage = LOCAL_SECURE_STORAGE();
            await new_storage.setPassword(new_password);

            // console.error('before migrate');
            // console.error('old storage', await old_storage.getAll());
            // console.error('new storage', await new_storage.getAll());

            // await old_storage.migrate(new_storage); // ! failed
            const keys = Object.keys(await old_storage.getAll()); // get all keys
            const data = await old_storage.getMany(keys); // get all data
            await new_storage.setMany(data); // set new data
            await old_storage.removeMany(keys); // remove old data

            await setPasswordHashedDirectly(new_password_hashed);
            await refreshPasswordDirectly(new_password);
            await lockDirectly();
        },
        [password_hashed],
    );
    return changePassword;
};

export const useCurrentConnectedApps = () => {
    const [password] = usePassword();
    const storage = useSecureStorageBy(password);
    const [private_keys] = usePrivateKeysInner(storage);
    const current_identity_network: CurrentIdentityNetwork | undefined = useMemo(() => {
        if (!private_keys) return undefined;
        const current = private_keys.keys.find((i) => i.id === private_keys.current);
        if (!current) return undefined;
        return private_keys.current_identity_network;
    }, [private_keys]);
    return useCurrentConnectedAppsInner(storage, current_identity_network);
};

export const useCurrentIdentity = () => {
    const [password] = usePassword();
    const storage = useSecureStorageBy(password);
    const [private_keys] = usePrivateKeysInner(storage);
    return useCurrentIdentityBy(private_keys);
};

export const useIdentityKeysCount = () => {
    const [password] = usePassword();
    const storage = useSecureStorageBy(password);
    const [private_keys] = usePrivateKeysInner(storage);
    return useIdentityKeysCountBy(private_keys);
};
export const useIdentityKeys = () => {
    const [password_hashed] = usePasswordHashed();
    const [password] = usePassword();
    const storage = useSecureStorageBy(password);
    const [private_keys, setPrivateKeys] = usePrivateKeysInner(storage);
    return useIdentityKeysBy(password_hashed, private_keys, setPrivateKeys);
};

export const useRecentAddresses = () => {
    const [password] = usePassword();
    const storage = useSecureStorageBy(password);
    return useRecentAddressesInner2(storage);
};
export const useMarkedAddresses = () => {
    const [password] = usePassword();
    const storage = useSecureStorageBy(password);
    return useMarkedAddressesInner2(storage);
};
// ================ set directly by storage ================

// ############### LOCAL SECURE ###############

export const setPrivateKeysDirectly = async (password: string, private_keys: PrivateKeys) => {
    const storage = LOCAL_SECURE_STORAGE();
    await storage.setPassword(password); // set password before any action

    await storage.set(LOCAL_SECURE_KEY_PRIVATE_KEYS, private_keys);
};

const get_password_secure_storage = async () => {
    const password = await SESSION_STORAGE.get<string>(SESSION_KEY_PASSWORD);
    if (!password) return; // locked

    const storage = LOCAL_SECURE_STORAGE();
    await storage.setPassword(password); // set password before any action

    return storage;
};

// identity address
const _inner_get_current_address = async (): Promise<
    | {
          current_address: IdentityAddress;
          storage: SecureStorage;
          private_keys: PrivateKeys;
          current: IdentityKey;
          current_chain_network: ChainNetwork;
          current_identity_network: CurrentIdentityNetwork;
      }
    | undefined
> => {
    const storage = await get_password_secure_storage();
    if (!storage) return undefined; // get secure storage after password

    const private_keys = await storage.get<PrivateKeys>(LOCAL_SECURE_KEY_PRIVATE_KEYS);
    // const chain_networks = await LOCAL_SECURE_STORAGE.get<ChainNetworks>(KEY_CHAIN_NETWORKS);
    if (private_keys === undefined) throw new Error('no private keys');

    const current = private_keys.keys.find((i) => i.id === private_keys.current);
    if (!current) throw new Error('can not find current identity');

    const current_address = current.address;
    const current_chain_network = current.current_chain_network;
    const current_identity_network = private_keys.current_identity_network;
    return { current_address, storage, private_keys, current, current_chain_network, current_identity_network };
};
export const get_current_identity_address = async (): Promise<IdentityAddress | undefined> => {
    return (await _inner_get_current_address())?.current_address;
};

// current info
export const get_current_info = async (): Promise<CurrentInfo | undefined> => {
    const _r = await _inner_get_current_address();
    if (!_r) return undefined;

    const { storage, private_keys, current, current_chain_network, current_identity_network } = _r;

    // ! refresh ic identity or evm wallet client
    match_chain(current_chain_network.chain, {
        ic: () => {
            agent_refresh_unique_identity(current, current_chain_network as ChainIcNetwork); // * refresh ic identity
        },
        evm: () => {
            refresh_unique_evm_wallet_client(current, current_chain_network as ChainEvmNetwork); // * refresh evm wallet client
        },
    });

    const current_connected_apps: CurrentConnectedApps = {
        ic: current_identity_network
            ? ((await storage.get<ConnectedApps>(
                  LOCAL_SECURE_KEY_CURRENT_CONNECTED_APPS(current_identity_network.ic),
              )) ?? [])
            : [],
        evm: current_identity_network
            ? ((await storage.get<ConnectedApps>(
                  LOCAL_SECURE_KEY_CURRENT_CONNECTED_APPS(current_identity_network.evm),
              )) ?? [])
            : [],
    };

    return {
        current_identity: private_keys.current,
        current_chain_network,
        current_identity_network,
        current_connected_apps,
    };
};

// update connected apps
export const set_current_connected_apps = async (
    chain: Chain,
    current_identity_network: CurrentIdentityNetwork,
    apps: ConnectedApps,
): Promise<void> => {
    const storage = await get_password_secure_storage();
    if (!storage) return undefined; // get secure storage after password

    const identity_network = match_chain<IdentityNetwork | undefined>(chain, {
        ic: () => current_identity_network.ic,
        evm: () => current_identity_network.evm,
    });
    if (!identity_network) return;

    const key = LOCAL_SECURE_KEY_CURRENT_CONNECTED_APPS(identity_network);
    await storage.set(key, apps);
};

// marked granted/denied local
export const find_local_secure_approved = async (
    chain: Chain,
    current_identity_network: CurrentIdentityNetwork,
    origin: string,
    request_hash: string,
): Promise<ApprovedState | undefined> => {
    const storage = await get_password_secure_storage();
    if (!storage) return undefined; // get secure storage after password
    return identity_network_callback(chain, current_identity_network, undefined, async (identity_network) => {
        const key = LOCAL_SECURE_KEY_APPROVED(identity_network, origin, request_hash);
        return await storage.get<ApprovedState>(key);
    });
};
export const delete_local_secure_approved = async (
    chain: Chain,
    current_identity_network: CurrentIdentityNetwork,
    origin: string,
    request_hash: string,
): Promise<void> => {
    const storage = await get_password_secure_storage();
    if (!storage) return undefined; // get secure storage after password
    return identity_network_callback(chain, current_identity_network, undefined, async (identity_network) => {
        const key = LOCAL_SECURE_KEY_APPROVED(identity_network, origin, request_hash);
        await storage.remove(key);
    });
};
export const set_local_secure_approved = async (
    chain: Chain,
    current_identity_network: CurrentIdentityNetwork,
    origin: string,
    request_hash: string,
    state: ApprovedState,
): Promise<void> => {
    const storage = await get_password_secure_storage();
    if (!storage) return undefined; // get secure storage after password
    return identity_network_callback(chain, current_identity_network, undefined, async (identity_network) => {
        const key = LOCAL_SECURE_KEY_APPROVED(identity_network, origin, request_hash);
        await storage.set(key, state);
    });
};
