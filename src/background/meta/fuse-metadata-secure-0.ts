import { FuseSecureStorage } from '~background/store/secure/storage';
import { __get_local_storage } from '~lib/storage';
import { same } from '~lib/utils/same';

// does not need any args, fixed key

export interface FuseSecureDataMetadata0<T> {
    get_key: () => string;
    default_value: T;
    get_password: () => Promise<string>;
    get_cached_value: () => Promise<T | null>;
    set_cached_value: (value: T) => Promise<T>; // also return new value
    callback?: (value: T) => Promise<void>;
}

// cached data
export const cachedFuseSecureData0 = <T>(
    meta: FuseSecureDataMetadata0<T>,
): {
    get: () => Promise<T>;
    set: (value: T) => Promise<void>;
} => {
    return {
        get: async () => {
            let cached = await meta.get_cached_value();
            if (cached === null) {
                const password = await meta.get_password();
                if (!password) throw new Error('invalid password');
                const storage = await get_secure_storage<T>(password, meta.get_key());
                const value = await storage.get();
                if (value) await meta.set_cached_value(value);
                if (value === undefined) return meta.default_value;
                cached = value;
            }
            return cached ?? meta.default_value;
        },
        set: async (value: T) => {
            const cached = await meta.get_cached_value();
            if (same(value, cached)) return;

            const password = await meta.get_password();
            if (!password) throw new Error('invalid password');
            const storage = await get_secure_storage<T>(password, meta.get_key());

            await storage.set(value);
            await meta.set_cached_value(value);

            meta.callback?.(value);
        },
    };
};

const get_secure_storage = async <T>(password: string, key: string): Promise<FuseSecureStorage<T>> => {
    const secure = new FuseSecureStorage<T>(__get_local_storage(), key);
    await secure.restore(password);
    return secure;
};
