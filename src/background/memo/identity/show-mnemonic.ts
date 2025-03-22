import type { RequestBody, ResponseBody } from '~background/messages/direct-manage-identity';
import { $bgsw_get_key_rings } from '~background/store/secure/key_rings';
import { $bgsw_get_password } from '~background/store/session/password';
import { match_combined_identity_key } from '~types/identity';

type ExtractShowMnemonic<T> = T extends { show_mnemonic: infer U } ? U : never;
type ExtractOkType<T> = T extends { ok: infer U } ? U : never;

type ShowMnemonicRequestBody = ExtractShowMnemonic<RequestBody>;
type ShowMnemonicResponseBody = ExtractShowMnemonic<ExtractOkType<ResponseBody>>;

export const $bgsw_show_mnemonic = async ({
    password,
    id,
}: ShowMnemonicRequestBody): Promise<ShowMnemonicResponseBody> => {
    const _password = await $bgsw_get_password();
    if (_password !== password) return false;

    const key_rings = await $bgsw_get_key_rings(password);
    if (!key_rings) return undefined;

    const identity = key_rings.keys.find((i) => i.id === id);
    if (!identity) return undefined;

    return match_combined_identity_key(identity.key, {
        mnemonic: (m) => ({ mnemonic: m.mnemonic, subaccount: m.subaccount }),
        private_key: () => undefined,
    });
};
