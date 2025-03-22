import type { RequestBody, ResponseBody } from '~background/messages/ping';
import { MESSAGE_PING } from '~lib/messages';
import { message_with_timeout } from '~lib/utils/timeout';

export const message_ping = async (nothing: string): Promise<string | undefined> => {
    const body: RequestBody = { nothing };

    const result = await message_with_timeout<RequestBody, ResponseBody>(MESSAGE_PING, body);

    if (!result) throw new Error(`can not get result from message: ${MESSAGE_PING}`);

    if (result.err !== undefined) throw new Error(result.err);

    return result.ok;
};
