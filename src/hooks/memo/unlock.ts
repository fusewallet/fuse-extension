import { useCallback } from 'react';

import { verify_password } from '~lib/identity/password';
import { direct_message_handle_password_unlock } from '~lib/messages/direct/direct-handle-password';
import { CurrentState } from '~types/state';

export const useUnlock = (
    current_state: CurrentState,
    initialized: string,
): ((password: string) => Promise<boolean>) => {
    // set password when locked
    const unlock = useCallback(
        async (password: string) => {
            if (current_state !== CurrentState.LOCKED) {
                console.error('current state is not locked', current_state);
                return false;
            }

            const checked = await verify_password(initialized, password);
            if (!checked) {
                console.error('verify password failed', checked);
                return false;
            }

            return await direct_message_handle_password_unlock(password);
        },
        [current_state, initialized],
    );

    return unlock;
};
