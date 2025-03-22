import type { RequestBody, ResponseBody } from '~background/messages/relay-ic-proxy-agent';
import { RELAY_MESSAGE_IC_PROXY_AGENT } from '~lib/messages';
import { relay_message_with_timeout } from '~lib/utils/timeout';

export const relay_message_ic_proxy_agent = async (args: RequestBody, timeout?: number): Promise<ResponseBody> => {
    const body: RequestBody = args;

    const result = await relay_message_with_timeout<RequestBody, ResponseBody>(
        RELAY_MESSAGE_IC_PROXY_AGENT,
        body,
        timeout ?? 600000,
    );

    if (result === undefined) throw new Error(`can not get result from message: ${RELAY_MESSAGE_IC_PROXY_AGENT}`);

    return result;
};
