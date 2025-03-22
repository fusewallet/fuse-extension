import type { PlasmoMessaging } from '@plasmohq/messaging';

import { __get_unlocked, __set_unlocked } from '~background/session/unlocked';
import type { MessageResult } from '~lib/messages';

export type RequestBody = { set: { unlocked: string; password: string } } | { get: { unlocked: string } };
export type ResponseBody = MessageResult<string, string>;

const handler: PlasmoMessaging.MessageHandler<RequestBody, ResponseBody> = async (req, res) => {
    if (!req.body) throw new Error(`can not find request body from direct-unlocked message`);

    if ('set' in req.body) {
        const { unlocked, password } = req.body.set;
        __set_unlocked(unlocked, password);
        return res.send({ ok: 'ok' });
    }

    if ('get' in req.body) {
        const { unlocked } = req.body.get;
        const password = __get_unlocked(unlocked);
        return res.send({ ok: password });
    }

    throw new Error(`wrong request body from direct-unlocked message`);
};

export default handler;
