import type { RequestBody, ResponseBody } from '~background/messages/direct-handle-identity';
import { $bgsw_get_key_rings, $bgsw_set_key_rings } from '~background/store/secure/key_rings';
import { $bgsw_get_password } from '~background/store/session/password';
import type { ExtractOkType } from '~lib/messages';

type ExtractSwitchIdentity<T> = T extends { switch_identity: infer U } ? U : never;

type SwitchIdentityRequestBody = ExtractSwitchIdentity<RequestBody>;
type SwitchIdentityResponseBody = ExtractSwitchIdentity<ExtractOkType<ResponseBody>>;

export const $bgsw_switch_identity = async (id: SwitchIdentityRequestBody): Promise<SwitchIdentityResponseBody> => {
    const password = await $bgsw_get_password();
    if (!password) return false;

    const key_rings = await $bgsw_get_key_rings();
    if (!key_rings) return undefined;

    const identity = key_rings?.keys.find((i) => i.id === id);
    if (!identity) return undefined; // can not find account

    if (identity.id === key_rings.current) return true;

    await $bgsw_set_key_rings({
        mnemonic: key_rings.mnemonic,
        current: key_rings.current,
        keys: [...key_rings.keys],
    });

    return true;
};
