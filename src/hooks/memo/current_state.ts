import { useMemo } from 'react';

import { useInitialized, useWelcomed } from '~hooks/store/local';
import { usePopupActionsLength, useUnlocked } from '~hooks/store/session';
import { CurrentState } from '~types/state';

export const useCurrentStateBy = (
    welcomed: boolean,
    initialized: string,
    unlocked: boolean,
    popup_actions_length: number,
) => {
    const current_state = useMemo<CurrentState>(() => {
        if (!welcomed) return CurrentState.WELCOME;
        if (!initialized) return CurrentState.INITIAL;
        if (!unlocked) return CurrentState.LOCKED;
        if (initialized && unlocked) {
            if (popup_actions_length) return CurrentState.ACTION;
            return CurrentState.ALIVE;
        }
        console.error('can not be here');
        return CurrentState.INITIAL;
    }, [welcomed, initialized, unlocked, popup_actions_length]);

    return current_state;
};

export const useCurrentState = () => {
    const [welcomed] = useWelcomed();
    const [initialized] = useInitialized();
    const unlocked = useUnlocked();
    const popup_actions_length = usePopupActionsLength();
    return useCurrentStateBy(welcomed, initialized, unlocked, popup_actions_length);
};
