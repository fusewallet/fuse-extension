import { __get_local_storage } from '~lib/storage';

import { FuseSecureStorage } from '.';

export const get_local_secure_storage = async <T>(password: string, key: string): Promise<FuseSecureStorage<T>> => {
    const secure = new FuseSecureStorage<T>(__get_local_storage(), key);
    await secure.restore(password);
    return secure;
};
