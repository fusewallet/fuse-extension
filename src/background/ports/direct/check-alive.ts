import type { PlasmoMessaging } from '@plasmohq/messaging';

import { $bgsw_check_alive } from '~background/memo/ports/password/check-alive';

export type RequestBody = number;
export type ResponseBody = boolean;

const handler: PlasmoMessaging.PortHandler<RequestBody, ResponseBody> = async (req, res) => {
    if (req.body === undefined) throw new Error(`can not find request body from direct/check-alive port`);

    const alive = await $bgsw_check_alive(req.body);
    res.send(alive);
};

export default handler;
