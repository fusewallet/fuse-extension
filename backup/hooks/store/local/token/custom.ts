import { useCallback } from 'react';

import type { Storage } from '@plasmohq/storage';

import { useCachedStoreData0, type DataMetadata0 } from '~hooks/meta/metadata-0';
import { resort_list, type ResortFunction } from '~lib/utils/sort';
import { match_chain, type Chain } from '~types/chain';
import {
    get_token_symbol,
    is_same_token_info,
    TokenTag,
    type AnyTokenInfo,
    type CombinedTokenInfo,
    type CustomTokens,
    type TokenInfo,
} from '~types/tokens';
import type { IcTokenInfo } from '~types/tokens/chain/ic';
import { is_known_token } from '~types/tokens/preset';

import { LOCAL_KEY_TOKEN_INFO_CUSTOM } from '../../keys';

// ! always try to use this value to avoid BLINK
type DataType = CustomTokens;
const get_key = (): string => LOCAL_KEY_TOKEN_INFO_CUSTOM;
const get_default_value = (): DataType => [];
let cached_value = get_default_value();
const get_cached_value = (): DataType => cached_value;
const set_cached_value = (value: DataType): DataType => (cached_value = value);
const meta: DataMetadata0<DataType> = {
    get_key,
    get_default_value,
    get_cached_value,
    set_cached_value,
};

// token info custom ic -> // * local
export const useTokenInfoCustomInner = (storage: Storage): [DataType, (value: DataType) => Promise<void>] =>
    useCachedStoreData0(storage, meta);

export const useTokenInfoCustomInner2 = (
    storage: Storage,
): [
    DataType,
    {
        pushCustomIcToken: (token: IcTokenInfo) => Promise<TokenInfo | undefined>;
        pushCustomToken: (token: AnyTokenInfo, network: Chain) => Promise<TokenInfo | undefined>;
        removeCustomToken: (token: TokenInfo) => Promise<void>;
        resortCustomToken: ResortFunction;
    },
] => {
    const [custom, setCustom] = useTokenInfoCustomInner(storage);

    // push ic
    const pushCustomIcToken = useCallback(
        async (token: IcTokenInfo): Promise<TokenInfo | undefined> => {
            if (!storage) return undefined;

            const combined: TokenInfo = { info: { ic: token }, tags: [TokenTag.ChainIcCustom] };
            if (is_known_token(combined) || !!custom.find((c) => is_same_token_info(c.token, combined)))
                throw new Error(`Token ${get_token_symbol(combined)} is exist`);

            const now = Date.now();
            const new_custom: CustomTokens = [...custom, { created: now, updated: now, token: combined }];

            await setCustom(new_custom);

            return combined;
        },
        [storage, custom, setCustom],
    );

    const getChainKeyAndTag = (chain: Chain): { key: string; tag: TokenTag } => {
        return match_chain<{ key: string; tag: TokenTag }>(chain, {
            ic: () => ({ key: 'ic', tag: TokenTag.ChainIcCustom }),
            ethereum: () => ({ key: 'ethereum', tag: TokenTag.ChainEthereumCustom }),
            ethereum_test_sepolia: () => ({
                key: 'ethereum_test_sepolia',
                tag: TokenTag.ChainEthereumTestSepoliaCustom,
            }),
            polygon: () => ({ key: 'polygon', tag: TokenTag.ChainPolygonCustom }),
            polygon_test_amoy: () => ({ key: 'polygon_test_amoy', tag: TokenTag.ChainPolygonTestAmoyCustom }),
            bsc: () => ({ key: 'bsc', tag: TokenTag.ChainBscCustom }),
            bsc_test: () => ({ key: 'bsc_test', tag: TokenTag.ChainBscTestCustom }),
        });
    };

    // push token
    const pushCustomToken = useCallback(
        async (token: AnyTokenInfo, network: Chain): Promise<TokenInfo | undefined> => {
            if (!storage) return undefined;

            const nameTag = getChainKeyAndTag(network);
            if (!nameTag) throw new Error(`Unknown chain`);

            const tokenInfo = { [nameTag.key]: token } as CombinedTokenInfo;

            const combined: TokenInfo = { info: tokenInfo, tags: [nameTag.tag] };
            if (is_known_token(combined) || !!custom.find((c) => is_same_token_info(c.token, combined)))
                throw new Error(`Token ${get_token_symbol(combined)} is exist`);

            const now = Date.now();
            const new_custom: CustomTokens = [...custom, { created: now, updated: now, token: combined }];

            await setCustom(new_custom);

            return combined;
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

    return [custom, { pushCustomIcToken, pushCustomToken, removeCustomToken, resortCustomToken }];
};
