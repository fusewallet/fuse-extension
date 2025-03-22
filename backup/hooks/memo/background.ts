import { useEffect } from 'react';
import { useInterval } from 'usehooks-ts';

import { __get_password, useUnlocked, useUnlockedAlive } from '~hooks/store/session';
import { useUserSettingsIdle } from '~hooks/store/sync';
import { is_development } from '~lib/utils/env';
import { CurrentState } from '~types/state';

import { useCurrentState } from './current_state';
import { useLock } from './lock';

export const useBackground = () => {
    const current_state = useCurrentState();
    const lock = useLock();
    const [idle] = useUserSettingsIdle();
    const [unlocked_alive] = useUnlockedAlive();

    // development
    useEffect(() => {
        if (is_development()) console.debug('CURRENT STATE:', current_state);
    }, [current_state]);

    // always check idle
    useInterval(() => {
        if (current_state !== CurrentState.ALIVE) return;
        const now = Date.now();
        if (unlocked_alive + idle < now) {
            // console.error('do lock by idle', 'unlocked_alive->', unlocked_alive, 'idle->', idle);
            lock('idle');
        }
    }, 33);

    const [unlocked] = useUnlocked();
    useEffect(() => {
        if (unlocked) {
            __get_password(unlocked).then((password) => {
                if (!password) lock();
            });
        }
    }, [unlocked, lock]);
};
