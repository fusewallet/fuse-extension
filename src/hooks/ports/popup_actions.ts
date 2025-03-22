import { usePort } from '@plasmohq/messaging/hook';

import type { RequestBody, ResponseBody } from '~background/ports/direct-popup-actions';
import { DIRECT_PORT_POPUP_ACTIONS } from '~lib/messages';
import type { PopupActions } from '~types/actions';

export const usePopupActions = (): PopupActions => {
    const port = usePort<RequestBody, ResponseBody>(DIRECT_PORT_POPUP_ACTIONS as never);
    return port.data ?? [];
};
