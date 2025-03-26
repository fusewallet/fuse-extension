import type { PlasmoMessaging } from '@plasmohq/messaging';

import { $bgsw_get_unlocked } from '~background/memo/ports/password/unlocked';

export type RequestBody = undefined;
export type ResponseBody = boolean;

const handler: PlasmoMessaging.PortHandler<RequestBody, ResponseBody> = async (_, res) => {
    // if (req.body === undefined) throw new Error(`can not find request body from direct-unlocked port`);

    const unlocked = await $bgsw_get_unlocked();
    res.send(unlocked);
};

export default handler;
