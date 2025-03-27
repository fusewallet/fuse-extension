import { same } from '~lib/utils/same';

// does not need any args, fixed key

export interface FuseDataMetadata0<T> {
    get_default_value: () => T;
    get_cached_value: () => Promise<T | undefined>;
    set_cached_value: (value: T) => Promise<T>; // also return new value
    callback?: (value: T) => Promise<void>;
}

// cached data
export const cachedFuseData0 = <T>(
    meta: FuseDataMetadata0<T>,
): {
    get: () => Promise<T>;
    set: (value: T) => Promise<void>;
} => {
    return {
        get: async () => {
            const value = await meta.get_cached_value();
            return value ?? meta.get_default_value();
        },
        set: async (value: T) => {
            const old = await meta.get_cached_value();
            if (same(value, old)) return;

            await meta.set_cached_value(value);
            meta.callback?.(value);
        },
    };
};
