import { __get_session_storage } from '~lib/storage';
import { SESSION_KEY_UNLOCKED } from '~lib/storage/keys';

let inner_password = '';

export const $bgsw_get_password = async () => inner_password;

// TODO how to notice data which dependency this data?
export const $bgsw_set_password = async (password: string) => {
    inner_password = password;
    await refresh_unlocked();
};

// TODO how to notice data which dependency this data?
export const $bgsw_remove_password = async () => {
    inner_password = '';
    await refresh_unlocked();
};

// always refresh unlocked value
const refresh_unlocked = async () => __get_session_storage().setItem(SESSION_KEY_UNLOCKED, !!inner_password);
