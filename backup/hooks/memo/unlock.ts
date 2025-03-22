import { useCallback } from 'react';

import { __get_actual_password, refreshUnlockedDirectly } from '~hooks/store/session';
import { verify_password } from '~lib/password';
import { CurrentState } from '~types/state';

export const useUnlock = (
    current_state: CurrentState,
    password_hashed: string,
): ((password: string) => Promise<void>) => {
    // set password when locked
    const unlock = useCallback(
        async (password: string) => {
            if (current_state !== CurrentState.LOCKED)
                return console.error('current state is not locked', current_state);
            if (!password_hashed) return console.error('password hashed is empty', password_hashed);
            const checked = await verify_password(password_hashed, password);
            if (!checked) return console.error('verify password failed', checked);

            const { unlocked } = await __get_actual_password(password);
            await refreshUnlockedDirectly(unlocked);
        },
        [current_state, password_hashed],
    );

    return unlock;
};
