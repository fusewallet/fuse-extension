import type { RequestBody, ResponseBody } from '~background/messages/direct-unlocked';
import { DIRECT_MESSAGE_UNLOCKED } from '~lib/messages';
import { message_with_timeout } from '~lib/utils/timeout';

export const direct_message_unlocked = async (unlocked: string, password?: string): Promise<string> => {
    const body: RequestBody = password === undefined ? { get: { unlocked } } : { set: { unlocked, password } };

    const result = await message_with_timeout<RequestBody, ResponseBody>(DIRECT_MESSAGE_UNLOCKED, body);

    if (!result) throw new Error(`can not get result from message: ${DIRECT_MESSAGE_UNLOCKED}`);

    if (result.err !== undefined) throw new Error(result.err);

    return result.ok;
};
