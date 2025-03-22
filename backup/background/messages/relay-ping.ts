import type { PlasmoMessaging } from '@plasmohq/messaging';

import type { MessageResult } from '~lib/messages';

export interface RequestBody {
    nothing: string;
}
export type ResponseBody = MessageResult<string, string>;

const handler: PlasmoMessaging.MessageHandler<RequestBody, ResponseBody> = async (req, res) => {
    const message = `relay message from background SW: ${req.body?.nothing}`;

    res.send({ ok: message });
};

export default handler;
