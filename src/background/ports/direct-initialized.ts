import type { PlasmoMessaging } from '@plasmohq/messaging';

import { $bgsw_is_key_rings_exist } from '~background/store/secure/key_rings';

export type RequestBody = undefined;
export type ResponseBody = boolean;

const handler: PlasmoMessaging.PortHandler<RequestBody, ResponseBody> = async (_, res) => {
    const initialized = await $bgsw_is_key_rings_exist();
    res.send(initialized);
};

export default handler;
