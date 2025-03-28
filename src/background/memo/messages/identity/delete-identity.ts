import type { RequestBody, ResponseBody } from '~background/messages/direct/handle-identity';
import { $bgsw_get_key_rings, $bgsw_set_key_rings } from '~background/store/secure/key_rings';
import { $bgsw_get_password } from '~background/store/session/password';
import type { ExtractOkType } from '~lib/messages';
import { match_combined_identity_key } from '~types/identity';

type ExtractDeleteIdentity<T> = T extends { delete_identity: infer U } ? U : never;

type DeleteIdentityRequestBody = ExtractDeleteIdentity<RequestBody>;
type DeleteIdentityResponseBody = ExtractDeleteIdentity<ExtractOkType<ResponseBody>>;

export const $bgsw_delete_identity = async ({
    password,
    id,
}: DeleteIdentityRequestBody): Promise<DeleteIdentityResponseBody> => {
    const _password = await $bgsw_get_password();
    if (_password !== password) return false;

    const key_rings = await $bgsw_get_key_rings();
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

    await $bgsw_set_key_rings({ mnemonic: key_rings.mnemonic, current: key_rings.current, keys: new_keys });

    return true;
};
