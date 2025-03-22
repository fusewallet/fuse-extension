import { useCallback, useEffect, useMemo, useState } from 'react';
import { v4 as uuid } from 'uuid';

import { inner_get_identity_address } from '~lib/address';
import { verify_password } from '~lib/password';
import { random_account_icon } from '~lib/utils/account_icon';
import { same } from '~lib/utils/same';
import { resort_list, type ResortFunction } from '~lib/utils/sort';
import {
    is_same_combined_identity_key,
    match_combined_identity_key,
    type CombinedIdentityKey,
    type CombinedShowIdentityKey,
    type IdentityId,
    type IdentityKey,
    type KeyRings,
    type ShowIdentityKey,
} from '~types/identity';

export const useIdentityKeysCountBy = (key_rings: KeyRings | undefined): number => {
    const count = useMemo(() => key_rings?.keys.length ?? 0, [key_rings]);
    return count;
};

export const useIdentityKeysBy = (
    password_hashed: string,
    key_rings: KeyRings | undefined,
    setKeyRings: (value: KeyRings) => Promise<void>,
): {
    current_identity: IdentityId | undefined;
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
    resortIdentityKeys: ResortFunction;
} => {
    const current_identity = useMemo(() => key_rings?.current, [key_rings]);

    // !React state update on a component that hasn't mounted
    // const identity_list = useMemo<ShowIdentityKey[] | undefined>(() => {
    //     if (!key_rings) return undefined;
    //     return key_rings.keys.map(show_identity_key);
    // }, [key_rings]);
    const [identity_list, setIdentityList] = useState<ShowIdentityKey[] | undefined>();
    useEffect(() => {
        const new_identity_list = (() => {
            if (!key_rings) return undefined;
            return key_rings.keys.map((key) => inner_show_identity_key(key_rings, key));
        })();
        if (!same(new_identity_list, identity_list)) setIdentityList(new_identity_list);
    }, [key_rings, identity_list]);

    const main_mnemonic_identity = useMemo(() => {
        if (!key_rings) return undefined;
        if (!key_rings.mnemonic) return undefined;

        return key_rings.keys.find((key) =>
            match_combined_identity_key(key.key, {
                mnemonic: (m) => m.mnemonic === key_rings.mnemonic && m.subaccount === 0,
                private_key: () => false,
            }),
        )?.id;
    }, [key_rings]);

    // query
    const showMnemonic = useCallback(
        async (
            id: IdentityId,
            password: string,
        ): Promise<{ mnemonic: string; subaccount: number } | boolean | undefined> => {
            const checked = await verify_password(password_hashed, password);
            if (!checked) return false;
            if (!key_rings) return undefined;
            const identity = key_rings.keys.find((i) => i.id === id);
            if (!identity) return undefined;
            return match_combined_identity_key(identity.key, {
                mnemonic: (m) => ({ mnemonic: m.mnemonic, subaccount: m.subaccount }),
                private_key: () => undefined,
            });
        },
        [key_rings, password_hashed],
    );
    const showPrivateKey = useCallback(
        async (id: IdentityId, password: string): Promise<string | boolean | undefined> => {
            const checked = await verify_password(password_hashed, password);
            if (!checked) return false;
            if (!key_rings) return undefined;
            const identity = key_rings.keys.find((i) => i.id === id);
            if (!identity) return undefined;
            return match_combined_identity_key(identity.key, {
                mnemonic: () => undefined,
                private_key: (pk) => pk.private_key,
            });
        },
        [key_rings, password_hashed],
    );
    const isKeyExist = useCallback(
        async (key: CombinedIdentityKey): Promise<boolean> => {
            if (!key_rings) return false;
            return !!key_rings.keys.find((identity) => is_same_combined_identity_key(identity.key, key));
        },
        [key_rings],
    );

    // delete
    const deleteIdentity = useCallback(
        async (id: IdentityId, password: string): Promise<boolean | undefined> => {
            const checked = await verify_password(password_hashed, password);
            if (!checked) return false;
            if (!key_rings) return undefined;
            if (key_rings.current === id) return false; // can not delete current identity
            const identity = key_rings?.keys.find((i) => i.id === id);
            if (!identity) return undefined; // can not find account
            if (
                key_rings.mnemonic &&
                match_combined_identity_key(identity.key, {
                    mnemonic: (m) => m.mnemonic === key_rings.mnemonic && m.subaccount === 0, // main mnemonic
                    private_key: () => false,
                })
            ) {
                return undefined; // can not delete main account
            }
            const new_keys = key_rings.keys.filter((i) => i.id !== id);
            await setKeyRings({ mnemonic: key_rings.mnemonic, current: key_rings.current, keys: new_keys });
            return true;
        },
        [password_hashed, key_rings, setKeyRings],
    );

    // push
    const pushIdentity = useCallback(
        async (key: CombinedIdentityKey): Promise<boolean | undefined> => {
            if (!key_rings) return undefined;

            if (key_rings.keys.find((identity) => is_same_combined_identity_key(identity.key, key))) {
                return false; // already exist
            }

            const id = uuid();
            const now = Date.now();
            const new_keys: IdentityKey[] = [
                ...key_rings.keys,
                {
                    id,
                    created: now,
                    updated: now,
                    name: `Account #${key_rings.keys.length + 1}`,
                    icon: random_account_icon(),
                    key,
                    address: inner_get_identity_address(key),
                },
            ];
            await setKeyRings({
                mnemonic: key_rings.mnemonic,
                current: id, // ? change to current ?
                keys: new_keys,
            });
            return true;
        },
        [key_rings, setKeyRings],
    );
    const pushIdentityByMainMnemonic = useCallback(async (): Promise<boolean | undefined> => {
        if (!key_rings) return undefined;
        if (!key_rings.mnemonic) return undefined;

        let max_subaccount = 0;
        for (const key of key_rings.keys) {
            match_combined_identity_key(key.key, {
                mnemonic: (m) => {
                    if (!same(m.mnemonic, key_rings.mnemonic)) return;
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
                mnemonic: key_rings.mnemonic,
                subaccount: max_subaccount + 1,
            },
        };

        return await pushIdentity(key);
    }, [key_rings, pushIdentity]);

    // update
    const updateIdentity = useCallback(
        async (id: IdentityId, name: string, icon: string): Promise<boolean | undefined> => {
            name = name.trim();
            icon = icon.trim();
            if (32 < name.length) return false;
            if (256 < icon.length) return false;

            if (!key_rings) return undefined;
            const identity = key_rings?.keys.find((i) => i.id === id);
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
                await setKeyRings({
                    mnemonic: key_rings.mnemonic,
                    current: key_rings.current,
                    keys: [...key_rings.keys],
                });
            }

            return true;
        },
        [key_rings, setKeyRings],
    );

    // switch
    const switchIdentity = useCallback(
        async (id: IdentityId): Promise<boolean | undefined> => {
            if (!key_rings) return undefined;
            const identity = key_rings.keys.find((i) => i.id === id);
            if (!identity) return undefined; // can not find account
            if (identity.id === key_rings.current) return true;

            await setKeyRings({
                mnemonic: key_rings.mnemonic,
                current: identity.id,
                keys: [...key_rings.keys],
            });

            return true;
        },
        [key_rings, setKeyRings],
    );

    // resort
    const resortIdentityKeys = useCallback(
        async (source_index: number, destination_index: number | undefined) => {
            if (!key_rings) return undefined;

            const next = resort_list(key_rings.keys, source_index, destination_index);
            if (typeof next === 'boolean') return next;

            await setKeyRings({ ...key_rings, keys: next });

            return true;
        },
        [key_rings, setKeyRings],
    );

    return {
        current_identity,
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
    };
};

export const inner_show_identity_key = (key_rings: KeyRings, identity_key: IdentityKey): ShowIdentityKey => ({
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
        key_rings.keys.length > 1 &&
        key_rings.current !== identity_key.id &&
        match_combined_identity_key(identity_key.key, {
            mnemonic: (m) => m.mnemonic !== key_rings.mnemonic || m.subaccount !== 0, // not main mnemonic
            private_key: () => true,
        }),
});
