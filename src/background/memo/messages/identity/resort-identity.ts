import type { RequestBody, ResponseBody } from '~background/messages/direct-handle-identity';
import { $bgsw_get_key_rings, $bgsw_set_key_rings } from '~background/store/secure/key_rings';
import { $bgsw_get_password } from '~background/store/session/password';
import type { ExtractOkType } from '~lib/messages';
import { resort_list } from '~lib/utils/sort';

type ExtractResortIdentity<T> = T extends { resort_identity: infer U } ? U : never;

type ResortIdentityRequestBody = ExtractResortIdentity<RequestBody>;
type ResortIdentityResponseBody = ExtractResortIdentity<ExtractOkType<ResponseBody>>;

export const $bgsw_resort_identity = async ({
    source_index,
    destination_index,
}: ResortIdentityRequestBody): Promise<ResortIdentityResponseBody> => {
    const password = await $bgsw_get_password();
    if (!password) return false;

    const key_rings = await $bgsw_get_key_rings(password);
    if (!key_rings) return undefined;

    const next = resort_list(key_rings.keys, source_index, destination_index);
    if (typeof next === 'boolean') return next;

    await $bgsw_set_key_rings(password, { ...key_rings, keys: next });

    return true;
};
