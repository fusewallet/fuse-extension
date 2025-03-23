import type { RequestBody, ResponseBody } from '~background/messages/direct-handle-password';
import { DIRECT_MESSAGE_HANDLE_PASSWORD, type ExtractOkType } from '~lib/messages';
import { message_with_timeout } from '~lib/utils/timeout';

const direct_message_handle_password = async (body: RequestBody): Promise<ExtractOkType<ResponseBody>> => {
    const result = await message_with_timeout<RequestBody, ResponseBody>(DIRECT_MESSAGE_HANDLE_PASSWORD, body);

    if (!result) throw new Error(`can not get result from message: ${DIRECT_MESSAGE_HANDLE_PASSWORD}`);

    if (result.err !== undefined) throw new Error(result.err);

    return result.ok;
};

export const direct_message_handle_password_lock = async (tips: string): Promise<boolean> => {
    const result = await direct_message_handle_password({ lock: tips });
    if (!('lock' in result)) throw new Error(`can not get result from message: ${DIRECT_MESSAGE_HANDLE_PASSWORD}`);
    return result.lock;
};

export const direct_message_handle_password_unlock = async (password: string): Promise<boolean> => {
    const result = await direct_message_handle_password({ unlock: password });
    if (!('unlock' in result)) throw new Error(`can not get result from message: ${DIRECT_MESSAGE_HANDLE_PASSWORD}`);
    return result.unlock;
};
