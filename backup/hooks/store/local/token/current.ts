import { useCallback } from 'react';

import type { Storage } from '@plasmohq/storage';

import { useCachedStoreData0, type DataMetadata0 } from '~hooks/meta/metadata-0';
import { resort_list, type ResortFunction } from '~lib/utils/sort';
import { get_token_symbol, is_same_token_info, type CurrentTokens, type TokenInfo } from '~types/tokens';
import { DEFAULT_TOKEN_INFO } from '~types/tokens/preset';

import { LOCAL_KEY_TOKEN_INFO_CURRENT } from '../../keys';

// ! always try to use this value to avoid BLINK
type DataType = CurrentTokens;
const get_key = (): string => LOCAL_KEY_TOKEN_INFO_CURRENT;
const get_default_value = (): DataType => DEFAULT_TOKEN_INFO;
let cached_value = get_default_value();
const get_cached_value = (): DataType => cached_value;
const set_cached_value = (value: DataType): DataType => (cached_value = value);
const meta: DataMetadata0<DataType> = {
    get_key,
    get_default_value,
    get_cached_value,
    set_cached_value,
};

// token info current ic -> // * local
export const useTokenInfoCurrentInner = (storage: Storage): [DataType, (value: DataType) => Promise<void>] =>
    useCachedStoreData0(storage, meta);

export const useTokenInfoCurrentInner2 = (
    storage: Storage,
): [
    DataType,
    {
        pushToken: (token: TokenInfo) => Promise<void>;
        removeToken: (token: TokenInfo) => Promise<void>;
        resortToken: ResortFunction;
    },
] => {
    const [current, setCurrent] = useTokenInfoCurrentInner(storage);

    // push
    const pushToken = useCallback(
        async (token: TokenInfo): Promise<void> => {
            if (!storage) return;

            if (current.find((c) => is_same_token_info(c, token)))
                throw new Error(`Token ${get_token_symbol(token)} is exist`);

            const new_current: CurrentTokens = [...current, token];

            await setCurrent(new_current);
        },
        [storage, current, setCurrent],
    );

    // delete
    const removeToken = useCallback(
        async (token: TokenInfo): Promise<void> => {
            if (!storage) return;

            const index = current.findIndex((c) => is_same_token_info(token, c));
            if (index === -1) throw new Error(`Token ${get_token_symbol(token)} is not exist`);

            const new_current: CurrentTokens = [...current];
            new_current.splice(index, 1);

            await setCurrent(new_current);
        },
        [storage, current, setCurrent],
    );

    // resort
    const resortToken = useCallback(
        async (source_index: number, destination_index: number | undefined) => {
            if (!storage || !current) return undefined;

            const next = resort_list(current, source_index, destination_index);
            if (typeof next === 'boolean') return next;

            await setCurrent(next);

            return true;
        },
        [storage, current, setCurrent],
    );

    return [current, { pushToken, removeToken, resortToken }];
};
