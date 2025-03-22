import type { RequestBody, ResponseBody } from '~background/messages/relay-evm-get-balance';
import { RELAY_MESSAGE_EVM_GET_BALANCE } from '~lib/messages';
import { relay_message_with_timeout } from '~lib/utils/timeout';

export const relay_message_evm_get_balance = async (args: RequestBody, timeout?: number): Promise<string> => {
    const body: RequestBody = args;

    const result = await relay_message_with_timeout<RequestBody, ResponseBody>(
        RELAY_MESSAGE_EVM_GET_BALANCE,
        body,
        timeout ?? 20000,
    );

    if (!result) throw new Error(`can not get result from message: ${RELAY_MESSAGE_EVM_GET_BALANCE}`);

    if (result.err !== undefined) throw new Error(result.err);

    return result.ok;
};
