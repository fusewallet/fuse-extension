import { usePort } from '@plasmohq/messaging/hook';

import type { RequestBody, ResponseBody } from '~background/ports/direct-unlocked';
import { DIRECT_PORT_UNLOCKED } from '~lib/messages';

export const useUnlocked = (): boolean => {
    const port = usePort<RequestBody, ResponseBody>(DIRECT_PORT_UNLOCKED as never);
    return !!port.data;
};
