import type { PlasmoMessaging } from '@plasmohq/messaging';

import { __inner_get_password } from '~background/session/unlocked';
import { get_current_identity_address, get_current_info } from '~hooks/store/local-secure';
import type { MessageResult } from '~lib/messages';
import type { IdentityAddress } from '~types/identity';
import type { CurrentWindow } from '~types/window';

export interface RequestBody {
    message_id: string;
    window?: CurrentWindow;
    timeout: number;
}
export type ResponseBody = MessageResult<IdentityAddress | undefined, string>;

const handler: PlasmoMessaging.MessageHandler<RequestBody, ResponseBody> = async (req, res) => {
    if (!req.body) return res.send({ err: 'request body is undefined' });
    // const body: RequestBody = req.body;
    // const message_id = body.message_id;
    // const current_window = req.body.window;

    const current_info = await get_current_info(__inner_get_password);
    if (!current_info) return res.send({ err: `disconnected` });

    const address = await get_current_identity_address(__inner_get_password);

    return res.send({ ok: address });
};

export default handler;
