import { useCallback, useEffect, useMemo, useState } from 'react';
import { v4 as uuid } from 'uuid';

import { get_address_by_mnemonic } from '~lib/mnemonic';
import { verify_password } from '~lib/password';
import { random_account_icon } from '~lib/utils/account_icon';
import { same } from '~lib/utils/same';
import { resort_list, type ResortFunction } from '~lib/utils/sort';
import { match_chain } from '~types/chain';
import {
    is_same_combined_identity_key,
    match_combined_identity_key,
    type CombinedIdentityKey,
    type CombinedShowIdentityKey,
    type IdentityId,
    type IdentityKey,
    type PrivateKeys,
    type ShowIdentityKey,
} from '~types/identity';
import { CHAIN_IC_MAINNET, type ChainNetwork } from '~types/network';

export const useIdentityKeysCountBy = (private_keys: PrivateKeys | undefined): number => {
    const count = useMemo(() => private_keys?.keys.length ?? 0, [private_keys]);
    return count;
};

export const useIdentityKeysBy = (
    password_hashed: string,
    private_keys: PrivateKeys | undefined,
    setPrivateKeys: (value: PrivateKeys) => Promise<void>,
): {
    current_identity: IdentityId | undefined;
    current_chain_network: ChainNetwork | undefined;
    identity_list: ShowIdentityKey[] | undefined;
    main_mnemonic_identity: string | undefined;
    showMnemonic: (
        id: IdentityId,
        password: string,
    ) => Promise<{ mnemonic: string; subaccount: number } | boolean | undefined>;
    showPrivateKey: (id: IdentityId, password: string) => Promise<string | boolean | undefined>;
    isKeyExist: (key: CombinedIdentityKey) => Promise<boolean>;
    deleteIdentity: (id: IdentityId, password: string) => Promise<boolean | undefined>;
    pushIdentity: (key: CombinedIdentityKey) => Promise<boolean | undefined>;
    pushIdentityByMainMnemonic: () => Promise<boolean | undefined>;
    updateIdentity: (id: IdentityId, name: string, icon: string) => Promise<boolean | undefined>;
    switchIdentity: (id: IdentityId) => Promise<boolean | undefined>;
    switchChainNetwork: (id: IdentityId, chain_network: ChainNetwork) => Promise<boolean | undefined>;
    resortIdentityKeys: ResortFunction;
} => {
    const current_identity = useMemo(() => private_keys?.current, [private_keys]);
    const current_chain_network = useMemo(
        () => private_keys?.keys.find((key) => key.id === private_keys?.current)?.current_chain_network,
        [private_keys],
    );
    // !React state update on a component that hasn't mounted
    // const identity_list = useMemo<ShowIdentityKey[] | undefined>(() => {
    //     if (!private_keys) return undefined;
    //     return private_keys.keys.map(show_identity_key);
    // }, [private_keys]);
    const [identity_list, setIdentityList] = useState<ShowIdentityKey[] | undefined>();
    useEffect(() => {
        const new_identity_list = (() => {
            if (!private_keys) return undefined;
            return private_keys.keys.map((key) => inner_show_identity_key(private_keys, key));
        })();
        if (!same(new_identity_list, identity_list)) setIdentityList(new_identity_list);
    }, [private_keys, identity_list]);

    const main_mnemonic_identity = useMemo(() => {
        if (!private_keys) return undefined;
        if (!private_keys.mnemonic) return undefined;

        return private_keys.keys.find((key) =>
            match_combined_identity_key(key.key, {
                mnemonic: (m) => m.mnemonic === private_keys.mnemonic && m.subaccount === 0,
                private_key: () => false,
            }),
        )?.id;
    }, [private_keys]);

    // query
    const showMnemonic = useCallback(
        async (
            id: IdentityId,
            password: string,
        ): Promise<{ mnemonic: string; subaccount: number } | boolean | undefined> => {
            const checked = await verify_password(password_hashed, password);
            if (!checked) return false;
            if (!private_keys) return undefined;
            const identity = private_keys.keys.find((i) => i.id === id);
            if (!identity) return undefined;
            return match_combined_identity_key(identity.key, {
                mnemonic: (m) => ({ mnemonic: m.mnemonic, subaccount: m.subaccount }),
                private_key: () => undefined,
            });
        },
        [private_keys, password_hashed],
    );
    const showPrivateKey = useCallback(
        async (id: IdentityId, password: string): Promise<string | boolean | undefined> => {
            const checked = await verify_password(password_hashed, password);
            if (!checked) return false;
            if (!private_keys) return undefined;
            const identity = private_keys.keys.find((i) => i.id === id);
            if (!identity) return undefined;
            return match_combined_identity_key(identity.key, {
                mnemonic: () => undefined,
                private_key: (pk) => pk.private_key,
            });
        },
        [private_keys, password_hashed],
    );
    const isKeyExist = useCallback(
        async (key: CombinedIdentityKey): Promise<boolean> => {
            if (!private_keys) return false;
            return !!private_keys.keys.find((identity) => is_same_combined_identity_key(identity.key, key));
        },
        [private_keys],
    );

    // delete
    const deleteIdentity = useCallback(
        async (id: IdentityId, password: string): Promise<boolean | undefined> => {
            const checked = await verify_password(password_hashed, password);
            if (!checked) return false;
            if (!private_keys) return undefined;
            if (private_keys.current === id) return false; // can not delete current identity
            const identity = private_keys?.keys.find((i) => i.id === id);
            if (!identity) return undefined; // can not find account
            if (
                private_keys.mnemonic &&
                match_combined_identity_key(identity.key, {
                    mnemonic: (m) => m.mnemonic === private_keys.mnemonic && m.subaccount === 0, // main mnemonic
                    private_key: () => false,
                })
            ) {
                return undefined; // can not delete main account
            }
            const new_keys = private_keys.keys.filter((i) => i.id !== id);
            await setPrivateKeys({
                mnemonic: private_keys.mnemonic,
                current: private_keys.current,
                current_identity_network: private_keys.current_identity_network,
                keys: new_keys,
            });
            return true;
        },
        [password_hashed, private_keys, setPrivateKeys],
    );

    // push
    const pushIdentity = useCallback(
        async (key: CombinedIdentityKey): Promise<boolean | undefined> => {
            if (!private_keys) return undefined;

            if (private_keys.keys.find((identity) => is_same_combined_identity_key(identity.key, key))) {
                return false; // already exist
            }

            const id = uuid();
            const now = Date.now();
            const new_keys: IdentityKey[] = [
                ...private_keys.keys,
                {
                    id,
                    created: now,
                    updated: now,
                    name: `Account #${private_keys.keys.length + 1}`,
                    icon: random_account_icon(),
                    key,
                    address: inner_get_identity_address(key),
                    current_chain_network: CHAIN_IC_MAINNET,
                },
            ];
            await setPrivateKeys({
                mnemonic: private_keys.mnemonic,
                current: id, // ? change to current ?
                current_identity_network: {
                    ...private_keys.current_identity_network,
                    ic: {
                        chain: 'ic',
                        network: CHAIN_IC_MAINNET,
                        owner: new_keys[new_keys.length - 1].address.ic.owner,
                    }, // ? default ic
                },
                keys: new_keys,
            });
            return true;
        },
        [private_keys, setPrivateKeys],
    );
    const pushIdentityByMainMnemonic = useCallback(async (): Promise<boolean | undefined> => {
        if (!private_keys) return undefined;
        if (!private_keys.mnemonic) return undefined;

        let max_subaccount = 0;
        for (const key of private_keys.keys) {
            match_combined_identity_key(key.key, {
                mnemonic: (m) => {
                    if (!same(m.mnemonic, private_keys.mnemonic)) return;
                    if (max_subaccount < m.subaccount) max_subaccount = m.subaccount;
                },
                private_key: () => {
                    /* do nothing */
                },
            });
        }

        const key: CombinedIdentityKey = {
            mnemonic: {
                type: 'mnemonic',
                mnemonic: private_keys.mnemonic,
                subaccount: max_subaccount + 1,
            },
        };

        return await pushIdentity(key);
    }, [private_keys, pushIdentity]);

    // update
    const updateIdentity = useCallback(
        async (id: IdentityId, name: string, icon: string): Promise<boolean | undefined> => {
            name = name.trim();
            icon = icon.trim();
            if (32 < name.length) return false;
            if (256 < icon.length) return false;

            if (!private_keys) return undefined;
            const identity = private_keys?.keys.find((i) => i.id === id);
            if (!identity) return undefined; // can not find account

            let changed = false;
            if (!same(identity.name, name)) {
                identity.name = name;
                changed = true;
            }
            if (!same(identity.icon, icon)) {
                identity.icon = icon;
                changed = true;
            }

            if (changed) {
                identity.updated = Date.now();
                await setPrivateKeys({
                    mnemonic: private_keys.mnemonic,
                    current: private_keys.current,
                    current_identity_network: private_keys.current_identity_network,
                    keys: [...private_keys.keys],
                });
            }

            return true;
        },
        [private_keys, setPrivateKeys],
    );

    // switch
    const switchIdentity = useCallback(
        async (id: IdentityId): Promise<boolean | undefined> => {
            if (!private_keys) return undefined;
            const identity = private_keys.keys.find((i) => i.id === id);
            if (!identity) return undefined; // can not find account
            if (!identity.current_chain_network) return undefined; // can not find current chain network
            if (identity.id === private_keys.current) return true;
            const chain = identity.current_chain_network.chain;
            await setPrivateKeys({
                mnemonic: private_keys.mnemonic,
                current: identity.id,
                keys: [...private_keys.keys],
                current_identity_network: {
                    ...private_keys.current_identity_network,
                    [chain]: {
                        chain,
                        network: identity.current_chain_network,
                        ...match_chain<{ owner: string } | { address: `0x${string}` }>(chain, {
                            ic: () => ({
                                owner: identity.address.ic.owner,
                            }),
                            evm: () => ({ address: identity.address.evm.address }),
                        }),
                    },
                },
            });

            return true;
        },
        [private_keys, setPrivateKeys],
    );

    // resort
    const resortIdentityKeys = useCallback(
        async (source_index: number, destination_index: number | undefined) => {
            if (!private_keys) return undefined;

            const next = resort_list(private_keys.keys, source_index, destination_index);
            if (typeof next === 'boolean') return next;

            await setPrivateKeys({ ...private_keys, keys: next });

            return true;
        },
        [private_keys, setPrivateKeys],
    );

    // switch chain network
    const switchChainNetwork = useCallback(
        async (id: IdentityId, chain_network: ChainNetwork): Promise<boolean | undefined> => {
            if (!private_keys) return undefined;
            const identity = private_keys.keys.find((i) => i.id === id);
            if (!identity) return undefined; // can not find account

            identity.current_chain_network = chain_network;
            const chain = chain_network.chain;
            await setPrivateKeys({
                ...private_keys,
                keys: [...private_keys.keys],
                current_identity_network: {
                    ...private_keys.current_identity_network,
                    [chain]: {
                        chain,
                        network: chain_network,
                        ...match_chain<{ owner: string } | { address: `0x${string}` }>(chain, {
                            ic: () => ({ owner: identity.address.ic.owner }),
                            evm: () => ({ address: identity.address.evm.address }),
                        }),
                    },
                },
            });
            return true;
        },
        [private_keys, setPrivateKeys],
    );

    return {
        current_identity,
        current_chain_network,
        identity_list,
        main_mnemonic_identity,
        showMnemonic,
        showPrivateKey,
        isKeyExist,
        deleteIdentity,
        pushIdentity,
        pushIdentityByMainMnemonic,
        updateIdentity,
        switchIdentity,
        resortIdentityKeys,
        switchChainNetwork,
    };
};

export const inner_show_identity_key = (private_keys: PrivateKeys, identity_key: IdentityKey): ShowIdentityKey => ({
    id: identity_key.id,
    created: identity_key.created,
    name: identity_key.name,
    icon: identity_key.icon,
    key: match_combined_identity_key<CombinedShowIdentityKey>(identity_key.key, {
        mnemonic: (mnemonic) => ({ type: 'mnemonic', subaccount: mnemonic.subaccount, parsed: mnemonic.parsed }),
        private_key: (private_key) => ({ type: 'private_key', chain: private_key.chain, parsed: private_key.parsed }),
    }),
    address: identity_key.address,

    deletable:
        private_keys.keys.length > 1 &&
        private_keys.current !== identity_key.id &&
        match_combined_identity_key(identity_key.key, {
            mnemonic: (m) => m.mnemonic !== private_keys.mnemonic || m.subaccount !== 0, // not main mnemonic
            private_key: () => true,
        }),
});

export const inner_get_identity_address = (key: CombinedIdentityKey) => {
    const current_address = match_combined_identity_key(key, {
        mnemonic: (mnemonic) => get_address_by_mnemonic(mnemonic.mnemonic, mnemonic.subaccount, mnemonic.parsed),
        private_key: () => {
            throw new Error(`Unimplemented identity type: private_key`);
        },
    });
    return current_address;
};
