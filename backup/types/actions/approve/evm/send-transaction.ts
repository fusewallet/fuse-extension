import { sha256_hash } from '~lib/utils/hash';
import type { EvmChain } from '~types/chain';

export type EvmTransaction = {
    from: `0x${string}`;
    to: `0x${string}`;
    value?: string;
    data?: `0x${string}`;
    gas?: string;
    gasPrice?: string;
    nonce?: number;
};
export interface ApproveEvmSendTransactionAction {
    type: 'approve_evm_send_transaction';
    id: string;
    chain: EvmChain;
    origin: string; // window.location.origin
    transaction: EvmTransaction;
}

export const hash_approve_evm_send_transaction_action = async (
    self: ApproveEvmSendTransactionAction,
): Promise<string> =>
    sha256_hash(
        `${self.type}:${self.origin}:${self.transaction.to}:${self.transaction.from}:${self.transaction.value}:${self.transaction.data}:${self.transaction.gas}:${self.transaction.gasPrice}:${self.transaction.nonce}`,
    );
