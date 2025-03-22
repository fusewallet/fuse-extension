import type { RequestBody, ResponseBody } from '~background/messages/direct-manage-identity';
import { $bgsw_get_key_rings, $bgsw_set_key_rings } from '~background/store/secure/key_rings';
import { $bgsw_get_password } from '~background/store/session/password';
import { same } from '~lib/utils/same';

type ExtractUpdateIdentity<T> = T extends { update_identity: infer U } ? U : never;
type ExtractOkType<T> = T extends { ok: infer U } ? U : never;

type UpdateIdentityRequestBody = ExtractUpdateIdentity<RequestBody>;
type UpdateIdentityResponseBody = ExtractUpdateIdentity<ExtractOkType<ResponseBody>>;

export const $bgsw_update_identity = async ({
    id,
    name,
    icon,
}: UpdateIdentityRequestBody): Promise<UpdateIdentityResponseBody> => {
    name = name.trim();
    icon = icon.trim();
    if (32 < name.length) return false;
    if (256 < icon.length) return false;

    const password = await $bgsw_get_password();
    if (!password) return false;

    const key_rings = await $bgsw_get_key_rings(password);
    if (!key_rings) return undefined;

    const identity = key_rings?.keys.find((i) => i.id === id);
    if (!identity) return undefined; // can not find account

    let changed = false;
    if (!same(identity.name, name)) {
        identity.name = name;
        changed = true;
    }
    if (!same(identity.icon, icon)) {
        identity.icon = icon;
        changed = true;
    }

    if (changed) {
        identity.updated = Date.now();
        await $bgsw_set_key_rings(password, {
            mnemonic: key_rings.mnemonic,
            current: key_rings.current,
            keys: [...key_rings.keys],
        });
    }

    return true;
};
