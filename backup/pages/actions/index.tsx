import { useEffect } from 'react';

import { FusePage } from '~components/layouts/page';
import { useCurrentState } from '~hooks/memo/current_state';
import { usePopupActions } from '~hooks/store/session';
import { match_popup_action, type PopupAction } from '~types/actions';
import type { WindowType } from '~types/pages';
import { CurrentState } from '~types/state';

import ApproveEvmSendTransactionActionPage from './approve/evm/send-transaction';
import ApproveEvmSignMessageActionPage from './approve/evm/sign-message';
import ApproveIcActionPage from './approve/ic';
import ConnectActionPage from './connect';

function ActionsPage({ wt }: { wt: WindowType }) {
    const current_state = useCurrentState();

    const [popup_actions, { deletePopupAction }] = usePopupActions();
    useEffect(() => {
        if (popup_actions && popup_actions.length === 0 && wt === 'notification') {
            console.error('do close notification window when popup actions is empty ');
            window.close();
        }
    }, [popup_actions, wt]);

    return (
        <FusePage current_state={current_state} states={CurrentState.ACTION} replace={true}>
            {0 < popup_actions.length && (
                <SingleActionPage action={popup_actions[0]} deletePopupAction={deletePopupAction} />
            )}
        </FusePage>
    );
}

export default ActionsPage;

const SingleActionPage = ({
    action,
    deletePopupAction,
}: {
    action: PopupAction;
    deletePopupAction: (action: PopupAction) => Promise<void>;
}) => {
    return (
        <div className="h-full w-full">
            {match_popup_action(action, {
                connect: (connect) => (
                    <ConnectActionPage action={action} connect={connect} deletePopupAction={deletePopupAction} />
                ),
                approve_ic: (approve_ic) => (
                    <ApproveIcActionPage
                        action={action}
                        approve_ic={approve_ic}
                        deletePopupAction={deletePopupAction}
                    />
                ),
                approve_evm_send_transaction: (approve_evm_send_transaction) => (
                    <ApproveEvmSendTransactionActionPage
                        action={action}
                        approveEvmSendTransactionAction={approve_evm_send_transaction}
                        deletePopupAction={deletePopupAction}
                    />
                ),
                approve_evm_sign_message: (approve_evm_sign_message) => (
                    <ApproveEvmSignMessageActionPage
                        action={action}
                        approveEvmSignMessageAction={approve_evm_sign_message}
                        deletePopupAction={deletePopupAction}
                    />
                ),
            })}
        </div>
    );
};
