import { v4 as uuid } from 'uuid';

import type { RequestBody, ResponseBody } from '~background/messages/direct-manage-identity';
import { $bgsw_get_key_rings, $bgsw_set_key_rings } from '~background/store/secure/key_rings';
import { $bgsw_get_password } from '~background/store/session/password';
import { inner_get_identity_address, is_same_combined_identity_key } from '~lib/identity/address';
import { random_account_icon } from '~lib/utils/account_icon';
import { type IdentityKey } from '~types/identity';

type ExtractPushIdentity<T> = T extends { push_identity: infer U } ? U : never;
type ExtractOkType<T> = T extends { ok: infer U } ? U : never;

type PushIdentityRequestBody = ExtractPushIdentity<RequestBody>;
type PushIdentityResponseBody = ExtractPushIdentity<ExtractOkType<ResponseBody>>;

export const $bgsw_push_identity = async (key: PushIdentityRequestBody): Promise<PushIdentityResponseBody> => {
    const password = await $bgsw_get_password();
    if (!password) return false;

    const key_rings = await $bgsw_get_key_rings(password);
    if (!key_rings) return undefined;

    if (key_rings.keys.find((identity) => is_same_combined_identity_key(identity.key, key))) {
        return false; // already exist
    }

    const id = uuid();
    const now = Date.now();
    const new_keys: IdentityKey[] = [
        ...key_rings.keys,
        {
            id,
            created: now,
            updated: now,
            name: `Account #${key_rings.keys.length + 1}`,
            icon: random_account_icon(),
            key,
            address: inner_get_identity_address(key),
        },
    ];

    await $bgsw_set_key_rings(password, { mnemonic: key_rings.mnemonic, current: key_rings.current, keys: new_keys });

    return true;
};
