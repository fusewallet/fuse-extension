import type { RequestBody, ResponseBody } from '~background/messages/direct-handle-identity';
import { $bgsw_get_key_rings } from '~background/store/secure/key_rings';
import { $bgsw_get_password } from '~background/store/session/password';
import { is_same_combined_identity_key } from '~lib/identity/address';
import type { ExtractOkType } from '~lib/messages';

type ExtractIsKeyExist<T> = T extends { is_key_exist: infer U } ? U : never;

type IsKeyExistRequestBody = ExtractIsKeyExist<RequestBody>;
type IsKeyExistResponseBody = ExtractIsKeyExist<ExtractOkType<ResponseBody>>;

export const $bgsw_is_key_exist = async (key: IsKeyExistRequestBody): Promise<IsKeyExistResponseBody> => {
    const password = await $bgsw_get_password();
    if (!password) return false;

    const key_rings = await $bgsw_get_key_rings();
    if (!key_rings) return false;

    return !!key_rings.keys.find((identity) => is_same_combined_identity_key(identity.key, key));
};
