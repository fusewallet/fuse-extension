import type { ApproveEvmSendTransactionAction } from './approve/evm/send-transaction';
import type { ApproveEvmSignMessageAction } from './approve/evm/sign-message';
import type { ApproveIcAction } from './approve/ic';
import type { ConnectAction } from './connect';

export type PopupAction =
    | { connect: ConnectAction }
    | { approve_ic: ApproveIcAction }
    | { approve_evm_send_transaction: ApproveEvmSendTransactionAction }
    | { approve_evm_sign_message: ApproveEvmSignMessageAction };

export type PopupActions = PopupAction[];

export const match_popup_action = <T>(
    self: PopupAction,
    {
        connect,
        approve_ic,
        approve_evm_send_transaction,
        approve_evm_sign_message,
    }: {
        connect: (connect: ConnectAction) => T;
        approve_ic: (approve_ic: ApproveIcAction) => T;
        approve_evm_send_transaction: (approve_evm_send_transaction: ApproveEvmSendTransactionAction) => T;
        approve_evm_sign_message: (approve_evm_sign_message: ApproveEvmSignMessageAction) => T;
    },
): T => {
    if ('connect' in self) return connect(self.connect);
    if ('approve_ic' in self) return approve_ic(self.approve_ic);
    if ('approve_evm_send_transaction' in self) return approve_evm_send_transaction(self.approve_evm_send_transaction);
    if ('approve_evm_sign_message' in self) return approve_evm_sign_message(self.approve_evm_sign_message);
    throw new Error(`Unknown popup action: ${Object.keys(self)[0]}`);
};

export const match_popup_action_async = <T>(
    self: PopupAction,
    {
        connect,
        approve_ic,
        approve_evm_send_transaction,
    }: {
        connect: (connect: ConnectAction) => Promise<T>;
        approve_ic: (approve_ic: ApproveIcAction) => Promise<T>;
        approve_evm_send_transaction: (approve_evm_send_transaction: ApproveEvmSendTransactionAction) => Promise<T>;
    },
): Promise<T> => {
    if ('connect' in self) return connect(self.connect);
    if ('approve_ic' in self) return approve_ic(self.approve_ic);
    if ('approve_evm_send_transaction' in self) return approve_evm_send_transaction(self.approve_evm_send_transaction);
    throw new Error(`Unknown popup action: ${Object.keys(self)[0]}`);
};

export const get_popup_action_id = (self: PopupAction): string => {
    return match_popup_action(self, {
        connect: (connect: ConnectAction) => `connect:${connect.message_id}`,
        approve_ic: (approve_ic: ApproveIcAction) => `approve_id#${approve_ic.id}`,
        approve_evm_send_transaction: (approve_evm_send_transaction: ApproveEvmSendTransactionAction) =>
            `approve_evm_send_transaction:${approve_evm_send_transaction.id}`,
        approve_evm_sign_message: (approve_evm_sign_message: ApproveEvmSignMessageAction) =>
            `approve_evm_sign_message:${approve_evm_sign_message.id}`,
    });
};

export const is_same_popup_action = (a: PopupAction, b: PopupAction): boolean => {
    return get_popup_action_id(a) === get_popup_action_id(b);
};
