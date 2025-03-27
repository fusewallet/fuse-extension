import type { RequestBody, ResponseBody } from '~background/messages/direct-handle-identity';
import { $bgsw_get_key_rings } from '~background/store/secure/key_rings';
import { $bgsw_get_password } from '~background/store/session/password';
import type { ExtractOkType } from '~lib/messages';
import { same } from '~lib/utils/same';
import { match_combined_identity_key, type CombinedIdentityKey } from '~types/identity';

import { $bgsw_push_identity } from './push-identity';

type ExtractPushIdentityByMainMnemonic<T> = T extends { push_identity_by_main_mnemonic: infer U } ? U : never;

type PushIdentityByMainMnemonicRequestBody = ExtractPushIdentityByMainMnemonic<RequestBody>;
type PushIdentityByMainMnemonicResponseBody = ExtractPushIdentityByMainMnemonic<ExtractOkType<ResponseBody>>;

export const $bgsw_push_identity_by_main_mnemonic = async (
    count: PushIdentityByMainMnemonicRequestBody,
): Promise<PushIdentityByMainMnemonicResponseBody> => {
    const password = await $bgsw_get_password();
    if (!password) return false;

    const key_rings = await $bgsw_get_key_rings();
    if (!key_rings) return undefined;

    if (!key_rings.mnemonic) return undefined;

    for (let i = 0; i < count; i++) {
        let max_subaccount = 0;
        for (const key of key_rings.keys) {
            match_combined_identity_key(key.key, {
                mnemonic: (m) => {
                    if (!same(m.mnemonic, key_rings.mnemonic)) return;
                    if (max_subaccount < m.subaccount) max_subaccount = m.subaccount;
                },
                private_key: () => {
                    /* do nothing */
                },
            });
        }

        const key: CombinedIdentityKey = {
            mnemonic: {
                type: 'mnemonic',
                mnemonic: key_rings.mnemonic,
                subaccount: max_subaccount + 1,
            },
        };

        await $bgsw_push_identity(key);
    }

    return true;
};
