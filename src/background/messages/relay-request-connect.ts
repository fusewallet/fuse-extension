import type { PlasmoMessaging } from '@plasmohq/messaging';

import { is_current_initial } from '~hooks/store/local';
import { get_current_info, set_current_connected_apps } from '~hooks/store/local-secure';
import {
    delete_current_session_connected_app_once,
    delete_popup_action,
    find_current_session_connected_app_once,
    find_current_session_connected_app_session,
    push_popup_action,
    reset_current_session_connected_app,
} from '~hooks/store/session';
import type { MessageResult } from '~lib/messages';
import { get_current_notification, open_notification } from '~lib/notification';
import type { PopupAction } from '~types/actions';
import type { ConnectAction } from '~types/actions/connect';
import { match_chain, type Chain } from '~types/chain';
import { match_connected_app_state_async } from '~types/connect';
import type { CurrentInfo } from '~types/current';
import type { CurrentWindow } from '~types/window';

export interface RequestBody {
    message_id: string;
    window?: CurrentWindow;
    timeout: number;
    popup?: boolean;
    chain: Chain;
    origin: string;
    title: string;
    favicon?: string;
}
export type ResponseBody = MessageResult<boolean, string>;

const handler: PlasmoMessaging.MessageHandler<RequestBody, ResponseBody> = async (req, res) => {
    if (!req.body) return res.send({ err: 'request body is undefined' });
    const body: RequestBody = req.body;
    const message_id = body.message_id;
    const current_window = req.body.window;

    const initial = await is_current_initial();
    if (!initial) {
        await chrome.runtime.openOptionsPage();
        return res.send({ err: `The wallet has not been initialized` });
    }

    let action: PopupAction | undefined = undefined;
    let current_info: CurrentInfo | undefined = undefined;
    let popup = false; // only popup once
    try {
        // check first
        current_info = await get_current_info();
        if (current_info !== undefined) {
            const connected = await find_connected(current_info, body);
            if (connected !== undefined) {
                await reset_current_session_connected_app(
                    body.chain,
                    current_info.current_identity_network,
                    body.origin,
                    connected,
                );
                return res.send({ ok: connected });
            }
        }
        if (!body.popup) return res.send({ ok: false }); // ! default do not popup

        // * insert action
        const connect_action: ConnectAction = {
            type: 'connect',
            message_id,
            chain: body.chain,
            origin: body.origin,
            title: body.title,
            favicon: body.favicon,
        };
        action = { connect: connect_action };
        await push_popup_action(action); // * push action

        const response = await new Promise<ResponseBody>((resolve) => {
            const got_response = (response: ResponseBody, interval_id: NodeJS.Timeout) => {
                clearInterval(interval_id);
                resolve(response);
            };
            const s = Date.now();
            const interval_id = setInterval(() => {
                (async () => {
                    // check timeout
                    const n = Date.now();
                    if (n - s > body.timeout) return got_response({ err: `timeout` }, interval_id);

                    const current_info = await get_current_info();
                    if (current_info !== undefined) {
                        const connected = await find_connected(current_info, body);
                        if (connected !== undefined) {
                            await reset_current_session_connected_app(
                                body.chain,
                                current_info.current_identity_network,
                                body.origin,
                                connected,
                            );
                            return got_response({ ok: connected }, interval_id);
                        }
                    }

                    const window = await get_current_notification(false); // do not focus window
                    if (window === undefined && !popup) {
                        popup = true; // * only open notification once
                        await open_notification(current_window);
                    }
                })();
            }, 67);
        });
        return res.send(response);
    } catch (e) {
        return res.send({ err: `${e}` });
    } finally {
        if (action) await delete_popup_action(action); // * delete action
        if (current_info !== undefined) {
            await delete_current_session_connected_app_once(
                body.chain,
                current_info.current_identity_network,
                body.origin,
                message_id,
            );
        }
    }
};

export default handler;

const find_connected = async (current_info: CurrentInfo, body: RequestBody): Promise<boolean | undefined> => {
    // console.error(`🚀 ~ const find_connected= ~ current_info:`, current_info);
    const apps = match_chain(body.chain, {
        ic: () => current_info.current_connected_apps.ic,
        evm: () => current_info.current_connected_apps.evm,
    });
    const app = apps.find((app) => app.origin === body.origin);
    if (app === undefined) return undefined;
    // update information
    if (app.title !== body.title || app.favicon !== body.favicon) {
        app.title = body.title;
        app.favicon = body.favicon;
        app.updated = Date.now();
        await set_current_connected_apps(body.chain, current_info.current_identity_network, apps);
    }

    return await match_connected_app_state_async(app.state, {
        denied: async () => false,
        ask_on_use: async () => {
            // query storage
            const stored = await find_current_session_connected_app_once(
                body.chain,
                current_info.current_identity_network,
                body.origin,
                body.message_id,
            );
            return stored;
        },
        granted: async () => true,
        denied_session: async () => {
            // query storage
            const stored = await find_current_session_connected_app_session(
                body.chain,
                current_info.current_identity_network,
                body.origin,
            );
            if (stored === false) return false;
            return undefined;
        },
        granted_session: async () => {
            // query storage
            const stored = await find_current_session_connected_app_session(
                body.chain,
                current_info.current_identity_network,
                body.origin,
            );
            if (stored === true) return true;
            return undefined;
        },
        denied_expired: async (expired) => {
            const now = Date.now();
            if (expired.created <= now && now < expired.created + expired.duration) return false;
            return undefined;
        },
        granted_expired: async (expired) => {
            const now = Date.now();
            if (expired.created <= now && now < expired.created + expired.duration) return true;
            return undefined;
        },
    });
};
