import type { PlasmoMessaging } from '@plasmohq/messaging';

import { $bgsw_get_popup_actions } from '~background/store/session/popup_actions';
import type { PopupActions } from '~types/actions';

export type RequestBody = undefined;
export type ResponseBody = PopupActions;

const handler: PlasmoMessaging.PortHandler<RequestBody, ResponseBody> = async (_, res) => {
    // if (req.body === undefined) throw new Error(`can not find request body from direct-popup-actions port`);

    const actions = await $bgsw_get_popup_actions();
    res.send(actions);
};

export default handler;
