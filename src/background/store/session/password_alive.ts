let inner_password_alive = Date.now();

export const $bgsw_get_password_alive = async () => inner_password_alive;

// TODO how to notice data which dependency this data?
export const $bgsw_set_password_alive = async (password_alive: number) => (inner_password_alive = password_alive);
