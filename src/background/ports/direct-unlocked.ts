import type { PlasmoMessaging } from '@plasmohq/messaging';

import { $bgsw_get_unlocked } from '~background/memo/unlocked';

export type RequestBody = undefined;
export type ResponseBody = boolean;

const handler: PlasmoMessaging.PortHandler<RequestBody, ResponseBody> = async (_, res) => {
    const unlocked = await $bgsw_get_unlocked();
    res.send(unlocked);
};

export default handler;
