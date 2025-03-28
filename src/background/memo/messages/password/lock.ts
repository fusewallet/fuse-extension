import type { RequestBody, ResponseBody } from '~background/messages/direct/handle-password';
import { $bgsw_remove_password } from '~background/store/session/password';
import { $bgsw_set_password_alive } from '~background/store/session/password_alive';
import type { ExtractOkType } from '~lib/messages';

type ExtractLock<T> = T extends { lock: infer U } ? U : never;

type LockRequestBody = ExtractLock<RequestBody>;
type LockResponseBody = ExtractLock<ExtractOkType<ResponseBody>>;

export const $bgsw_lock = async (tips: LockRequestBody): Promise<LockResponseBody> => {
    console.error(`do lock`, tips);
    await $bgsw_remove_password();
    await $bgsw_set_password_alive(0);
    return true;
};
