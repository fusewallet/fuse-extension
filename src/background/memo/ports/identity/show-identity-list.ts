import type { ResponseBody } from '~background/ports/direct/show-identity-list';
import { $bgsw_get_key_rings } from '~background/store/secure/key_rings';
import { $bgsw_get_password } from '~background/store/session/password';
import {
    match_combined_identity_key,
    type CombinedShowIdentityKey,
    type IdentityKey,
    type KeyRings,
    type ShowIdentityKey,
} from '~types/identity';

export const $bgsw_show_identity_list = async (): Promise<ResponseBody | undefined> => {
    const password = await $bgsw_get_password();
    if (!password) return undefined;

    const key_rings = await $bgsw_get_key_rings();
    if (!key_rings) return undefined;

    const identity_list = key_rings.keys.map((key) => inner_show_identity_key(key_rings, key));
    const main_mnemonic_identity = key_rings.keys.find((key) =>
        match_combined_identity_key(key.key, {
            mnemonic: (m) => m.mnemonic === key_rings.mnemonic && m.subaccount === 0,
            private_key: () => false,
        }),
    )?.id;

    return { current_identity: key_rings.current, identity_list, main_mnemonic_identity };
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
