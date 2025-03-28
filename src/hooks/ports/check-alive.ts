import { useCallback } from 'react';

import { usePort } from '@plasmohq/messaging/hook';

import type { RequestBody, ResponseBody } from '~background/ports/direct/check-alive';
import { DIRECT_PORT_CHECK_ALIVE } from '~lib/messages';

export const useCheckAlive = (): [boolean, (idle: number) => void] => {
    const port = usePort<RequestBody, ResponseBody>(DIRECT_PORT_CHECK_ALIVE as never);

    const checkAlive = useCallback((idle: number) => port.send(idle), [port]);

    return [!!port.data, checkAlive];
};
