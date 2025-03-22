import type { RequestBody, ResponseBody } from '~background/messages/relay-get-favicon';
import { RELAY_MESSAGE_GET_FAVICON } from '~lib/messages';
import { relay_message_with_timeout } from '~lib/utils/timeout';

export const relay_message_get_favicon = async (origin: string, timeout?: number): Promise<string> => {
    const body: RequestBody = { origin };

    const result = await relay_message_with_timeout<RequestBody, ResponseBody>(
        RELAY_MESSAGE_GET_FAVICON,
        body,
        timeout ?? 20000,
    );

    if (!result) throw new Error(`can not get result from message: ${RELAY_MESSAGE_GET_FAVICON}`);

    if (result.err !== undefined) throw new Error(result.err);

    return result.ok;
};
