import type { RequestBody, ResponseBody } from '~background/messages/direct-handle-identity';
import { $bgsw_set_key_rings } from '~background/store/secure/key_rings';
import { $bgsw_set_password } from '~background/store/session/password';
import { $bgsw_set_password_alive } from '~background/store/session/password_alive';
import type { ExtractOkType } from '~lib/messages';
import { __get_local_storage } from '~lib/storage';
import { LOCAL_KEY_INITIALIZED } from '~lib/storage/keys';

type ExtractRestoreIdentity<T> = T extends { restore_identity: infer U } ? U : never;

type RestoreIdentityRequestBody = ExtractRestoreIdentity<RequestBody>;
type RestoreIdentityResponseBody = ExtractRestoreIdentity<ExtractOkType<ResponseBody>>;

export const $bgsw_restore_identity = async ({
    password,
    key_rings,
    initialized,
}: RestoreIdentityRequestBody): Promise<RestoreIdentityResponseBody> => {
    await $bgsw_set_password(password);
    await $bgsw_set_key_rings(key_rings);
    await $bgsw_set_password_alive(Date.now());
    await __get_local_storage().setItem(LOCAL_KEY_INITIALIZED, initialized);
    return true;
};
