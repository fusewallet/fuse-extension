let inner_password = '';

export const $bgsw_get_password = async () => inner_password;

// TODO how to notice data which dependency this data?
export const $bgsw_set_password = async (password: string) => (inner_password = password);

// TODO how to notice data which dependency this data?
export const $bgsw_remove_password = async () => (inner_password = '');
