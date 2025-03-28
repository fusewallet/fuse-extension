import type { RequestBody, ResponseBody } from '~background/messages/direct/handle-identity';
import { $bgsw_get_key_rings } from '~background/store/secure/key_rings';
import { $bgsw_get_password } from '~background/store/session/password';
import type { ExtractOkType } from '~lib/messages';
import { match_combined_identity_key } from '~types/identity';

type ExtractShowPrivateKey<T> = T extends { show_private_key: infer U } ? U : never;

type ShowPrivateKeyRequestBody = ExtractShowPrivateKey<RequestBody>;
type ShowPrivateKeyResponseBody = ExtractShowPrivateKey<ExtractOkType<ResponseBody>>;

export const $bgsw_show_private_key = async ({
    password,
    id,
}: ShowPrivateKeyRequestBody): Promise<ShowPrivateKeyResponseBody> => {
    const _password = await $bgsw_get_password();
    if (_password !== password) return false;

    const key_rings = await $bgsw_get_key_rings();
    if (!key_rings) return undefined;

    const identity = key_rings.keys.find((i) => i.id === id);
    if (!identity) return undefined;

    return match_combined_identity_key(identity.key, {
        mnemonic: () => undefined,
        private_key: (pk) => pk.private_key,
    });
};
