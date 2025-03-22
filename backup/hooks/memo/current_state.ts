import { useMemo } from 'react';

import type { PopupActions } from '~types/actions';
import { CurrentState } from '~types/state';

import { usePasswordHashed, useWelcomed } from '../store/local';
import { usePopupActions, useUnlocked } from '../store/session';

export const useCurrentStateBy = (
    welcomed: boolean,
    password_hashed: string,
    unlocked: string,
    popup_actions: PopupActions,
) => {
    const current_state = useMemo<CurrentState>(() => {
        if (!welcomed) return CurrentState.WELCOME;
        if (!password_hashed) return CurrentState.INITIAL;
        if (!unlocked) return CurrentState.LOCKED;
        if (password_hashed && unlocked) {
            if (popup_actions && popup_actions.length) return CurrentState.ACTION;
            return CurrentState.ALIVE;
        }
        console.error('can not be here');
        return CurrentState.INITIAL;
    }, [welcomed, password_hashed, unlocked, popup_actions]);

    return current_state;
};

export const useCurrentState = () => {
    const [welcomed] = useWelcomed();
    const [password_hashed] = usePasswordHashed();
    const [unlocked] = useUnlocked();
    const [popup_actions] = usePopupActions();
    return useCurrentStateBy(welcomed, password_hashed, unlocked, popup_actions);
};
