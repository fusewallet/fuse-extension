import type { RequestBody, ResponseBody } from '~background/messages/relay-ping';
import { RELAY_MESSAGE_PING } from '~lib/messages';
import { relay_message_with_timeout } from '~lib/utils/timeout';

export const relay_message_ping = async (nothing: string): Promise<string | undefined> => {
    const body: RequestBody = { nothing };

    const result = await relay_message_with_timeout<RequestBody, ResponseBody>(RELAY_MESSAGE_PING, body);

    if (!result) throw new Error(`can not get result from message: ${RELAY_MESSAGE_PING}`);

    if (result.err !== undefined) throw new Error(result.err);

    return result.ok;
};
