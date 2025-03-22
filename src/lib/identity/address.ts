import { same } from '~lib/utils/same';
import { match_combined_identity_key, type CombinedIdentityKey } from '~types/identity';

import { get_address_by_mnemonic } from './mnemonic';

export const inner_get_identity_address = (key: CombinedIdentityKey) => {
    const current_address = match_combined_identity_key(key, {
        mnemonic: (mnemonic) => get_address_by_mnemonic(mnemonic.mnemonic, mnemonic.subaccount, mnemonic.parsed),
        private_key: () => {
            throw new Error(`Unimplemented identity type: private_key`);
        },
    });
    return current_address;
};

export const is_same_combined_identity_key = (a: CombinedIdentityKey, b: CombinedIdentityKey): boolean => {
    const a_address = inner_get_identity_address(a);
    const b_address = inner_get_identity_address(b);
    return same(a_address, b_address);
};
