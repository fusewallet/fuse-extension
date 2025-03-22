import { useMemo } from 'react';

import { useInitialized } from '~hooks/ports/initialized';
import { usePopupActions } from '~hooks/ports/popup_actions';
import { useUnlocked } from '~hooks/ports/unlocked';
import { useWelcomed } from '~hooks/store/local';
import type { PopupActions } from '~types/actions';
import { CurrentState } from '~types/state';

export const useCurrentStateBy = (
    welcomed: boolean,
    initialized: boolean,
    unlocked: boolean,
    popup_actions: PopupActions,
) => {
    const current_state = useMemo<CurrentState>(() => {
        if (!welcomed) return CurrentState.WELCOME;
        if (!initialized) return CurrentState.INITIAL;
        if (!unlocked) return CurrentState.LOCKED;
        if (initialized && unlocked) {
            if (popup_actions && popup_actions.length) return CurrentState.ACTION;
            return CurrentState.ALIVE;
        }
        console.error('can not be here');
        return CurrentState.INITIAL;
    }, [welcomed, initialized, unlocked, popup_actions]);

    return current_state;
};

export const useCurrentState = () => {
    const [welcomed] = useWelcomed();
    const initialized = useInitialized();
    const unlocked = useUnlocked();
    const popup_actions = usePopupActions();
    return useCurrentStateBy(welcomed, initialized, unlocked, popup_actions);
};
