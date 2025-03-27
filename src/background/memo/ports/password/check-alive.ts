import { $bgsw_lock } from '~background/memo/messages/password/lock';
import { $bgsw_get_password_alive } from '~background/store/session/password_alive';

export const $bgsw_check_alive = async (idle: number) => {
    const password_alive = await $bgsw_get_password_alive();
    const now = Date.now();

    if (password_alive + idle < now) {
        await $bgsw_lock('idle');
        return false;
    }

    return true;
};
