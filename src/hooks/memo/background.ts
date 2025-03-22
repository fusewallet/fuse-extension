import { useEffect } from 'react';
import { useInterval } from 'usehooks-ts';

import { useCheckAlive } from '~hooks/ports/check-alive';
import { useUserSettingsIdle } from '~hooks/store/sync';
import { is_development } from '~lib/utils/env';
import { CurrentState } from '~types/state';

import { useCurrentState } from './current_state';

export const useBackground = () => {
    const current_state = useCurrentState();
    const [idle] = useUserSettingsIdle();
    const [alive, checkAlive] = useCheckAlive();

    // development
    useEffect(() => {
        if (is_development()) console.debug('CURRENT STATE:', current_state);
    }, [current_state]);

    // always check idle
    useInterval(() => {
        if (current_state !== CurrentState.ALIVE) return;
        if (!alive) return;
        checkAlive(idle);
    }, 33);
};
