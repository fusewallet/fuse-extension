import type { RequestBody, ResponseBody } from '~background/messages/direct/handle-password';
import { $bgsw_get_chain_networks } from '~background/store/secure/chain_networks';
import { $bgsw_current_chain_network } from '~background/store/secure/current/current_chain_networks';
import { $bgsw_get_key_rings } from '~background/store/secure/key_rings';
import { $bgsw_set_password } from '~background/store/session/password';
import { $bgsw_set_password_alive } from '~background/store/session/password_alive';
import type { ExtractOkType } from '~lib/messages';

type ExtractUnlock<T> = T extends { unlock: infer U } ? U : never;

type UnlockRequestBody = ExtractUnlock<RequestBody>;
type UnlockResponseBody = ExtractUnlock<ExtractOkType<ResponseBody>>;

export const $bgsw_unlock = async (password: UnlockRequestBody): Promise<UnlockResponseBody> => {
    await $bgsw_set_password_alive(Date.now());
    await $bgsw_set_password(password, async () => {
        // init something
        await $bgsw_get_chain_networks();
        const key_rings = await $bgsw_get_key_rings();
        if (key_rings) {
            await Promise.all([$bgsw_current_chain_network(key_rings.current).get()]);
        }
    });
    return true;
};
