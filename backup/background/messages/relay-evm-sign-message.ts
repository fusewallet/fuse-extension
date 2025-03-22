import { hexToNumber } from 'viem';

import type { PlasmoMessaging } from '@plasmohq/messaging';

import { __inner_get_password } from '~background/session/unlocked';
import { get_chain_by_chain_id } from '~hooks/evm/viem';
import { delete_local_action_result, get_local_action_result, is_current_initial } from '~hooks/store/local';
import { get_current_info } from '~hooks/store/local-secure';
import { delete_popup_action, push_popup_action } from '~hooks/store/session';
import type { MessageResult } from '~lib/messages';
import { get_current_notification, open_notification } from '~lib/notification';
import type { PopupAction } from '~types/actions';
import type { ApproveEvmSignMessageAction, EvmSignMessagePayload } from '~types/actions/approve/evm/sign-message';
import type { CurrentWindow } from '~types/window';

export interface RequestBody {
    message_id: string;
    popup?: boolean;
    window?: CurrentWindow;
    timeout: number;
    origin: string;
    chainId: `0x${string}`;
    payload: EvmSignMessagePayload;
}

export type ResponseBody = MessageResult<string, string>; // Returns signature on success, error message on failure

const handler: PlasmoMessaging.MessageHandler<RequestBody, ResponseBody> = async (req, res) => {
    if (!req.body) return res.send({ err: 'request body is undefined' });
    const body: RequestBody = req.body;
    const message_id = body.message_id;
    const current_window = req.body.window;

    // Check if wallet is initialized
    const initial = await is_current_initial();
    if (!initial) {
        await chrome.runtime.openOptionsPage();
        return res.send({ err: `The wallet has not been initialized` });
    }

    let action: PopupAction | undefined = undefined;
    let popup = false; // Only show popup once

    try {
        // Check current state
        const current_info = await get_current_info(__inner_get_password);
        if (!current_info) {
            return res.send({ err: 'Wallet is locked or not initialized' });
        }
        const chain = get_chain_by_chain_id(hexToNumber(body.chainId));
        if (!chain) {
            return res.send({ err: 'Invalid chain id' });
        }
        // Create sign message action
        const signMessageAction: ApproveEvmSignMessageAction = {
            type: 'approve_evm_sign_message',
            id: message_id,
            chain,
            origin: body.origin,
            payload: body.payload,
        };
        action = { approve_evm_sign_message: signMessageAction };
        await push_popup_action(action);

        // Wait for user response
        const response = await new Promise<ResponseBody>((resolve) => {
            const got_response = (response: ResponseBody, interval_id: NodeJS.Timeout) => {
                clearInterval(interval_id);
                resolve(response);
            };

            const startTime = Date.now();
            const interval_id = setInterval(() => {
                (async () => {
                    // Check for timeout
                    const now = Date.now();
                    if (now - startTime > body.timeout) {
                        return got_response({ err: 'timeout' }, interval_id);
                    }
                    const result = await get_local_action_result<string, string>(message_id);
                    if (result) {
                        await delete_local_action_result(message_id);
                        return got_response(result, interval_id);
                    }
                    // If window is not open and hasn't been shown yet, open it
                    const window = await get_current_notification(false);
                    if (window === undefined && !popup) {
                        popup = true;
                        await open_notification(current_window);
                    }
                })();
            }, 67);
        });

        return res.send(response);
    } catch (e) {
        return res.send({ err: `${e}` });
    } finally {
        if (action) {
            await delete_popup_action(action);
        }
    }
};

export default handler;
