import { useCallback } from 'react';
import { v4 as uuid } from 'uuid';

import { inner_get_identity_address } from '~lib/identity/address';
import { validate_mnemonic } from '~lib/identity/mnemonic';
import { check_password } from '~lib/identity/password';
import { direct_message_handle_identity_restore_identity } from '~lib/messages/direct/direct-handle-identity';
import type { CombinedIdentityKey, KeyRings } from '~types/identity';
import { CurrentState } from '~types/state';

export const useRestoreIdentity = (
    current_state: CurrentState,
): {
    restoreIdentityByMnemonic: (password: string, mnemonic: string) => Promise<boolean | undefined>;
} => {
    // set password and mnemonic when initial
    const restoreIdentityByMnemonic = useCallback(
        async (password: string, mnemonic: string) => {
            if (current_state !== CurrentState.INITIAL && current_state !== CurrentState.LOCKED) return undefined;

            if (!check_password(password)) return false;
            if (!validate_mnemonic(mnemonic)) return false;

            const key_rings = await new_key_rings_by_mnemonic(mnemonic);

            if (!(await direct_message_handle_identity_restore_identity(password, key_rings))) return false;

            return true;
        },
        [current_state],
    );

    return {
        restoreIdentityByMnemonic,
    };
};

const new_key_rings_by_mnemonic = async (mnemonic: string): Promise<KeyRings> => {
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
    return key_rings;
};
