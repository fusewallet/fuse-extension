import { usePort } from '@plasmohq/messaging/hook';

import type { RequestBody, ResponseBody } from '~background/ports/direct-initialized';
import { DIRECT_PORT_INITIALIZED } from '~lib/messages';

export const useInitialized = (): boolean => {
    const port = usePort<RequestBody, ResponseBody>(DIRECT_PORT_INITIALIZED as never);
    return !!port.data;
};
