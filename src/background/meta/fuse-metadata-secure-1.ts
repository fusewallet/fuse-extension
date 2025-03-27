import { get_local_secure_storage } from '~background/store/secure/storage/local';
import { same } from '~lib/utils/same';

// does not need any args, fixed key

export interface FuseSecureDataMetadata1<T, A> {
    get_password: () => Promise<string>;
    get_key: (arg: A) => string;
    get_default_value: (arg: A | undefined) => T;
    get_cached_value: (arg: A | undefined) => Promise<T | null>;
    set_cached_value: (value: T, arg: A | undefined) => Promise<T>; // also return new value
    callback?: (value: T, arg: A | undefined) => Promise<void>;
}

// cached data
export const cachedFuseSecureData1 = <T, A>(
    meta: FuseSecureDataMetadata1<T, A>,
    arg: A | undefined, // ! cloud be undefined
): {
    get: () => Promise<T>;
    set: (value: T) => Promise<void>;
} => {
    return {
        get: async () => {
            let cached = await meta.get_cached_value(arg);
            if (cached === null) {
                const password = await meta.get_password();
                if (!password) throw new Error('invalid password');
                if (!arg) throw new Error('invalid arg');
                const storage = await get_local_secure_storage<T>(password, meta.get_key(arg));
                const value = await storage.get();
                if (value) await meta.set_cached_value(value, arg);
                if (value === undefined) return meta.get_default_value(arg);
                cached = value;
            }
            return cached ?? meta.get_default_value(arg);
        },
        set: async (value: T) => {
            const cached = await meta.get_cached_value(arg);
            if (same(value, cached)) return;

            const password = await meta.get_password();
            if (!password) throw new Error('invalid password');
            if (!arg) throw new Error('invalid arg');
            const storage = await get_local_secure_storage<T>(password, meta.get_key(arg));

            await storage.set(value);
            await meta.set_cached_value(value, arg);

            meta.callback?.(value, arg);
        },
    };
};
