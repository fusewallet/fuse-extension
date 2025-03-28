import type { PlasmoMessaging } from '@plasmohq/messaging';

import { $bgsw_lock } from '~background/memo/messages/password/lock';
import { $bgsw_unlock } from '~background/memo/messages/password/unlock';
import type { MessageResult } from '~lib/messages';

export type RequestBody =
    | { unlock: string } // unlock
    | { lock: string }; // lock
export type ResponseBody = MessageResult<
    | { unlock: boolean } // unlock
    | { lock: boolean }, // lock
    string
>;

const handler: PlasmoMessaging.MessageHandler<RequestBody, ResponseBody> = async (req, res) => {
    if (req.body === undefined) throw new Error(`can not find request body from direct/handle-identity message`);

    if ('unlock' in req.body) {
        return res.send({ ok: { unlock: await $bgsw_unlock(req.body.unlock) } });
    }

    if ('lock' in req.body) {
        return res.send({ ok: { lock: await $bgsw_lock(req.body.lock) } });
    }

    throw new Error(`can not find action: ${Object.keys(req.body)[0]} for direct/handle-identity message`);
};

export default handler;
