import { useCallback } from 'react';
import { v4 as uuid } from 'uuid';

import { setPasswordHashedDirectly } from '~hooks/store/local';
import { setPrivateKeysDirectly } from '~hooks/store/local-secure';
import { inner_get_identity_address } from '~hooks/store/local-secure/memo/identity';
import { refreshPasswordDirectly } from '~hooks/store/session';
import { validate_mnemonic } from '~lib/mnemonic';
import { check_password, hash_password } from '~lib/password';
import type { CombinedIdentityKey, PrivateKeys } from '~types/identity';
import { CHAIN_IC_MAINNET } from '~types/network';
import { CurrentState } from '~types/state';

export const useRestoreAccount = (
    current_state: CurrentState,
): {
    restoreAccountByMnemonic: (password: string, mnemonic: string) => Promise<boolean | undefined>;
} => {
    // set password and mnemonic when initial
    const restoreAccountByMnemonic = useCallback(
        async (password: string, mnemonic: string) => {
            // TODO remove on prod
            console.debug(
                `🚀 ~ restore account by mnemonic ~ :`,
                'password ->',
                password,
                'mnemonic ->',
                mnemonic,
                current_state,
            );

            if (current_state !== CurrentState.INITIAL && current_state !== CurrentState.LOCKED) return undefined;

            if (!check_password(password)) return false;
            if (!validate_mnemonic(mnemonic)) return false;

            const { password_hashed, private_keys } = await new_account_by_mnemonic(password, mnemonic);

            await setPrivateKeysDirectly(password, private_keys);
            await setPasswordHashedDirectly(password_hashed);
            await refreshPasswordDirectly(password);

            return true;
        },
        [current_state],
    );

    return {
        restoreAccountByMnemonic,
    };
};

const new_account_by_mnemonic = async (
    password: string,
    mnemonic: string,
): Promise<{
    password_hashed: string;
    private_keys: PrivateKeys;
}> => {
    const password_hashed = await hash_password(password);
    const current = uuid();
    const created = Date.now();
    const name = `Account #1`;

    const key: CombinedIdentityKey = { mnemonic: { type: 'mnemonic', mnemonic, subaccount: 0 } };

    const private_keys: PrivateKeys = {
        mnemonic,
        keys: [
            {
                id: current,
                created,
                updated: created,
                name,
                icon: '😀',
                key,
                address: inner_get_identity_address(key),
                current_chain_network: CHAIN_IC_MAINNET,
            },
        ],
        current,
    };
    return { password_hashed, private_keys };
};
