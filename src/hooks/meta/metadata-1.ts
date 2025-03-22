import { useCallback, useEffect, useState } from 'react';

import type { Storage, StorageWatchCallback } from '@plasmohq/storage';

import { same } from '~lib/utils/same';

// with single param

export interface DataMetadata1<T, A> {
    get_key: (arg: A) => string;
    get_default_value: (arg: A) => T;
    get_cached_value: (arg: A) => T;
    set_cached_value: (value: T, arg: A) => T; // also return new value
}

// cached data
export const useCachedStoreData1 = <T, A>(
    storage: Storage,
    meta: DataMetadata1<T, A>,
    arg: A, // ! can not be undefined
): [T, (value: T) => Promise<void>] => {
    const [value, setValue] = useState<T>(meta.get_cached_value(arg)); // use cached value to init

    // watch this key, cloud notice other hook of this
    useEffect(() => {
        if (!storage) return;

        const key = meta.get_key(arg);
        const callback: StorageWatchCallback = (d) => {
            const value = d.newValue ?? meta.get_default_value(arg);
            const cached_value = meta.get_cached_value(arg);
            if (!same(cached_value, value)) meta.set_cached_value(value, arg);
            setValue(value); // * always update
        };
        storage.watch({ [key]: callback });
        return () => {
            storage.unwatch({ [key]: callback });
        };
    }, [storage, meta, arg]);

    // init on this hook
    useEffect(() => {
        if (!storage) return setValue(meta.set_cached_value(meta.get_default_value(arg), arg));

        const key = meta.get_key(arg);
        storage.get<T>(key).then((value) => {
            if (value === undefined) value = meta.get_cached_value(arg);
            setValue(meta.set_cached_value(value, arg));
        });
    }, [storage, meta, arg]);

    // update on this hook
    const updateValue = useCallback(
        async (value: T) => {
            if (!storage) return;

            const key = meta.get_key(arg);
            await storage.set(key, value);
            // setValue(meta.set_cached_value(value, arg)); // * already watched
        },
        [storage, meta, arg],
    );

    return [value, updateValue];
};
