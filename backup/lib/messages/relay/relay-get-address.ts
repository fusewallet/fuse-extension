import type { RequestBody, ResponseBody } from '~background/messages/relay-get-address';
import { RELAY_MESSAGE_GET_ADDRESS } from '~lib/messages';
import { relay_message_with_timeout } from '~lib/utils/timeout';
import type { IdentityAddress } from '~types/identity';

export const relay_message_get_address = async (
    args: RequestBody,
    timeout?: number,
): Promise<IdentityAddress | undefined> => {
    const body: RequestBody = args;

    const result = await relay_message_with_timeout<RequestBody, ResponseBody>(
        RELAY_MESSAGE_GET_ADDRESS,
        body,
        timeout ?? 20000,
    );

    if (!result) throw new Error(`can not get result from message: ${RELAY_MESSAGE_GET_ADDRESS}`);

    if (result.err !== undefined) throw new Error(result.err);

    return result.ok;
};
