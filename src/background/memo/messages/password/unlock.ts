import type { RequestBody, ResponseBody } from '~background/messages/direct-handle-password';
import { $bgsw_set_password } from '~background/store/session/password';
import { $bgsw_set_password_alive } from '~background/store/session/password_alive';
import type { ExtractOkType } from '~lib/messages';

type ExtractUnlock<T> = T extends { unlock: infer U } ? U : never;

type UnlockRequestBody = ExtractUnlock<RequestBody>;
type UnlockResponseBody = ExtractUnlock<ExtractOkType<ResponseBody>>;

export const $bgsw_unlock = async (password: UnlockRequestBody): Promise<UnlockResponseBody> => {
    await $bgsw_set_password_alive(Date.now());
    await $bgsw_set_password(password);
    return true;
};
