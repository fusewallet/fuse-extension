import type { RequestBody, ResponseBody } from '~background/messages/relay-evm-send-transaction';
import { RELAY_MESSAGE_EVM_SEND_TRANSACTION } from '~lib/messages';
import { relay_message_with_timeout } from '~lib/utils/timeout';

export const relay_message_evm_send_transaction = async (args: RequestBody, timeout?: number): Promise<string> => {
    const body: RequestBody = args;

    const result = await relay_message_with_timeout<RequestBody, ResponseBody>(
        RELAY_MESSAGE_EVM_SEND_TRANSACTION,
        body,
        timeout ?? 20000,
    );

    if (!result) throw new Error(`can not get result from message: ${RELAY_MESSAGE_EVM_SEND_TRANSACTION}`);

    if (result.err !== undefined) throw new Error(result.err);

    return result.ok;
};
