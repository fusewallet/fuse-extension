import { get_local_secure_storage } from '~background/store/secure/storage/local';
import { same } from '~lib/utils/same';

// does not need any args, fixed key

export interface FuseSecureDataMetadata0<T> {
    get_password: () => Promise<string>;
    get_key: () => string;
    get_default_value: () => T;
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
                const storage = await get_local_secure_storage<T>(password, meta.get_key());
                const value = await storage.get();
                if (value) await meta.set_cached_value(value);
                if (value === undefined) return meta.get_default_value();
                cached = value;
            }
            return cached ?? meta.get_default_value();
        },
        set: async (value: T) => {
            const cached = await meta.get_cached_value();
            if (same(value, cached)) return;

            const password = await meta.get_password();
            if (!password) throw new Error('invalid password');
            const storage = await get_local_secure_storage<T>(password, meta.get_key());

            await storage.set(value);
            await meta.set_cached_value(value);

            meta.callback?.(value);
        },
    };
};
