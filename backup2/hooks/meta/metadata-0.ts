import { useCallback, useEffect, useState } from 'react';

import type { Storage, StorageWatchCallback } from '@plasmohq/storage';

import { same } from '~lib/utils/same';

// does not need any args, fixed key

export interface DataMetadata0<T> {
    get_key: () => string;
    get_default_value: () => T;
    get_cached_value: () => T;
    set_cached_value: (value: T) => T; // also return new value
}

// cached data
export const useCachedStoreData0 = <T>(storage: Storage, meta: DataMetadata0<T>): [T, (value: T) => Promise<void>] => {
    const [value, setValue] = useState<T>(meta.get_cached_value()); // use cached value to init

    // watch this key, cloud notice other hook of this
    useEffect(() => {
        if (!storage) return;

        const key = meta.get_key();
        const callback: StorageWatchCallback = (d) => {
            const value = d.newValue ?? meta.get_default_value();
            const cached_value = meta.get_cached_value();
            if (!same(cached_value, value)) meta.set_cached_value(value);
            setValue(value); // * always update
        };
        storage.watch({ [key]: callback });
        return () => {
            storage.unwatch({ [key]: callback });
        };
    }, [storage, meta]);

    // init on this hook
    useEffect(() => {
        if (!storage) return setValue(meta.set_cached_value(meta.get_default_value()));

        const key = meta.get_key();
        storage.get<T>(key).then((value) => {
            if (value === undefined) value = meta.get_cached_value();
            setValue(meta.set_cached_value(value));
        });
    }, [storage, meta]);

    // update on this hook
    const updateValue = useCallback(
        async (value: T) => {
            if (!storage) return;

            const key = meta.get_key();
            await storage.set(key, value);
            // setValue(meta.set_cached_value(value)); // * already watched
        },
        [storage, meta],
    );

    return [value, updateValue];
};
