import { useCallback } from 'react';

import type { Storage } from '@plasmohq/storage';

import { useCachedStoreData1, type DataMetadata1 } from '~hooks/meta/metadata-1';
import { resort_list, type ResortFunction } from '~lib/utils/sort';
import { get_identity_network_key, type IdentityNetwork } from '~types/network';
import { get_token_symbol, is_same_token_info, type CustomTokens, type TokenInfo } from '~types/tokens';
import { is_known_token } from '~types/tokens/preset';

import { LOCAL_KEY_TOKEN_INFO_CUSTOM } from '../../keys';

// ! always try to use this value to avoid BLINK
type DataType = CustomTokens;
const get_key = (identity_network: IdentityNetwork): string => LOCAL_KEY_TOKEN_INFO_CUSTOM(identity_network);
const get_default_value = (): DataType => [];
const cached_value: Record<string, DataType> = {};
const get_cached_value = (identity_network: IdentityNetwork): DataType =>
    cached_value[get_identity_network_key(identity_network)] ?? get_default_value();
const set_cached_value = (value: DataType, identity_network: IdentityNetwork): DataType =>
    (cached_value[get_identity_network_key(identity_network)] = value);
const meta: DataMetadata1<DataType, IdentityNetwork> = {
    get_key,
    get_default_value,
    get_cached_value,
    set_cached_value,
};

// token info custom ic -> // * local
export const useTokenInfoCustomInner = (
    storage: Storage,
    identity_network: IdentityNetwork,
): [DataType, (value: DataType) => Promise<void>] => useCachedStoreData1(storage, meta, identity_network);

export const useTokenInfoCustomInner2 = (
    storage: Storage,
    identity_network: IdentityNetwork,
): [
    DataType,
    {
        pushCustomToken: (token: TokenInfo) => Promise<TokenInfo | undefined>;
        removeCustomToken: (token: TokenInfo) => Promise<void>;
        resortCustomToken: ResortFunction;
    },
] => {
    const [custom, setCustom] = useTokenInfoCustomInner(storage, identity_network);

    // push
    const pushCustomToken = useCallback(
        async (token: TokenInfo): Promise<TokenInfo | undefined> => {
            if (!storage) return undefined;

            if (is_known_token(token) || !!custom.find((c) => is_same_token_info(c.token, token)))
                throw new Error(`Token ${get_token_symbol(token)} is exist`);

            const now = Date.now();
            const new_custom: CustomTokens = [...custom, { created: now, updated: now, token }];

            await setCustom(new_custom);

            return token;
        },
        [storage, custom, setCustom],
    );

    // delete
    const removeCustomToken = useCallback(
        async (token: TokenInfo): Promise<void> => {
            if (!storage) return;

            const index = custom.findIndex((c) => is_same_token_info(token, c.token));
            if (index === -1) throw new Error(`Token ${get_token_symbol(token)} is not exist`);

            const new_custom: CustomTokens = [...custom];
            new_custom.splice(index, 1);

            await setCustom(new_custom);
        },
        [storage, custom, setCustom],
    );

    // resort
    const resortCustomToken = useCallback(
        async (source_index: number, destination_index: number | undefined) => {
            if (!storage || !custom) return undefined;

            const next = resort_list(custom, source_index, destination_index);
            if (typeof next === 'boolean') return next;

            await setCustom(next);

            return true;
        },
        [storage, custom, setCustom],
    );

    return [custom, { pushCustomToken, removeCustomToken, resortCustomToken }];
};
