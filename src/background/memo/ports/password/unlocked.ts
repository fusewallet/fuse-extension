import { $bgsw_get_password } from '~background/store/session/password';

export const $bgsw_get_unlocked = async (): Promise<boolean> => {
    const password = await $bgsw_get_password();
    return !!password;
};
