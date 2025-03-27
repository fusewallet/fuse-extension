import { usePort } from '@plasmohq/messaging/hook';

import type { RequestBody, ResponseBody } from '~background/ports/direct-show-identity-list';
import { DIRECT_PORT_SHOW_IDENTITY_LIST } from '~lib/messages';

export const useShowIdentityList = (): ResponseBody => {
    const port = usePort<RequestBody, ResponseBody>(DIRECT_PORT_SHOW_IDENTITY_LIST as never);
    return port.data;
};
