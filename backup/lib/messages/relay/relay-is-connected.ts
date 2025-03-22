import type { RequestBody, ResponseBody } from '~background/messages/relay-is-connected';
import { RELAY_MESSAGE_IS_CONNECTED } from '~lib/messages';
import { relay_message_with_timeout } from '~lib/utils/timeout';

export const relay_message_is_connected = async (args: RequestBody, timeout?: number): Promise<boolean> => {
    const body: RequestBody = args;

    const result = await relay_message_with_timeout<RequestBody, ResponseBody>(
        RELAY_MESSAGE_IS_CONNECTED,
        body,
        timeout ?? 20000,
    );

    if (!result) throw new Error(`can not get result from message: ${RELAY_MESSAGE_IS_CONNECTED}`);

    if (result.err !== undefined) throw new Error(result.err);

    return result.ok;
};
