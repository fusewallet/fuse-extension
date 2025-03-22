import { __get_local_storage } from '~lib/storage';
import type { KeyRings } from '~types/identity';

import { FuseSecureStorage } from './storage';
import { LOCAL_SECURE_KEY_KEY_RINGS } from './storage/keys';

// exist
export const $bgsw_is_key_rings_exist = async () => {
    return __get_local_storage().getItem(LOCAL_SECURE_KEY_KEY_RINGS) !== undefined;
};

// data

let inner_key_rings: KeyRings | null | undefined = null;

const get_secure_storage = async (password: string): Promise<FuseSecureStorage<KeyRings>> => {
    const secure = new FuseSecureStorage<KeyRings>(__get_local_storage(), LOCAL_SECURE_KEY_KEY_RINGS);
    return await secure.restore(password);
};

export const $bgsw_get_key_rings = async (password: string): Promise<KeyRings | undefined> => {
    if (!password) return undefined;

    if (inner_key_rings === null) {
        const secure = await get_secure_storage(password);
        inner_key_rings = await secure.get();
    }

    return inner_key_rings;
};

export const $bgsw_set_key_rings = async (password: string, key_rings: KeyRings) => {
    if (!password) throw new Error('invalid password');

    const secure = await get_secure_storage(password);
    await secure.set(key_rings);
    inner_key_rings = key_rings;
};

export const $bgsw_remove_key_rings = async (password: string) => {
    if (!password) throw new Error('invalid password');

    const secure = await get_secure_storage(password);
    await secure.remove();
};
