import { $bgsw_set_password } from '~background/store/session/password';
import { $bgsw_set_password_alive } from '~background/store/session/password_alive';

export const $bgsw_lock = async (tips?: string) => {
    console.error(`do lock`, tips);
    await $bgsw_set_password('');
    await $bgsw_set_password_alive(0);
};
