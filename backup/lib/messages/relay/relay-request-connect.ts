import type { RequestBody, ResponseBody } from '~background/messages/relay-request-connect';
import { RELAY_MESSAGE_REQUEST_CONNECT } from '~lib/messages';
import { relay_message_with_timeout } from '~lib/utils/timeout';

export const relay_message_request_connect = async (args: RequestBody, timeout?: number): Promise<boolean> => {
    const body: RequestBody = args;

    const result = await relay_message_with_timeout<RequestBody, ResponseBody>(
        RELAY_MESSAGE_REQUEST_CONNECT,
        body,
        timeout ?? 20000,
    );

    if (!result) throw new Error(`can not get result from message: ${RELAY_MESSAGE_REQUEST_CONNECT}`);

    if (result.err !== undefined) throw new Error(result.err);

    return result.ok;
};
