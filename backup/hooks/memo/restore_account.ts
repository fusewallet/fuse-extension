import { useCallback } from 'react';
import { v4 as uuid } from 'uuid';

import { setPasswordHashedDirectly } from '~hooks/store/local';
import { setKeyRingsDirectly } from '~hooks/store/local-secure';
import { __get_actual_password, refreshUnlockedDirectly } from '~hooks/store/session';
import { inner_get_identity_address } from '~lib/address';
import { validate_mnemonic } from '~lib/mnemonic';
import { check_password, hash_password } from '~lib/password';
import type { CombinedIdentityKey, KeyRings } from '~types/identity';
import { CurrentState } from '~types/state';

export const useRestoreAccount = (
    current_state: CurrentState,
): {
    restoreAccountByMnemonic: (password: string, mnemonic: string) => Promise<boolean | undefined>;
} => {
    // set password and mnemonic when initial
    const restoreAccountByMnemonic = useCallback(
        async (password: string, mnemonic: string) => {
            if (current_state !== CurrentState.INITIAL && current_state !== CurrentState.LOCKED) return undefined;

            if (!check_password(password)) return false;
            if (!validate_mnemonic(mnemonic)) return false;

            const { password_hashed, key_rings } = await new_account_by_mnemonic(password, mnemonic);

            const { unlocked, actual_password } = await __get_actual_password(password); // ! wrapped password
            await setKeyRingsDirectly(actual_password, key_rings);
            await setPasswordHashedDirectly(password_hashed);
            await refreshUnlockedDirectly(unlocked);

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
    key_rings: KeyRings;
}> => {
    const password_hashed = await hash_password(password);
    const current = uuid();
    const created = Date.now();
    const name = `Account #1`;

    const key: CombinedIdentityKey = { mnemonic: { type: 'mnemonic', mnemonic, subaccount: 0 } };

    const key_rings: KeyRings = {
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
            },
        ],
        current,
    };
    return { password_hashed, key_rings };
};
