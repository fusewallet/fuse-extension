import { useMemo } from 'react';

import { useMultipleTokenPrices } from '~hooks/apis/evm';
import { get_token_unique_id, match_combined_token_info, type GroupedTokens, type TokenInfo } from '~types/tokens';
import type { ShowTokenPrice, TokenPrices } from '~types/tokens/price';

import { useTokenPriceIcRead } from '..';

export const useTokenPrices = (tokens: TokenInfo[], grouped_tokens: GroupedTokens): TokenPrices => {
    const all_ic_prices = useTokenPriceIcRead();
    const { data: all_ethereum_prices } = useMultipleTokenPrices({
        addresses: grouped_tokens.ethereum.map((t) => t.info.ethereum.address),
        chain: 'ethereum',
    });
    const { data: all_polygon_prices } = useMultipleTokenPrices({
        addresses: grouped_tokens.polygon.map((t) => t.info.polygon.address),
        chain: 'polygon',
    });
    const { data: all_bsc_prices } = useMultipleTokenPrices({
        addresses: grouped_tokens.bsc.map((t) => t.info.bsc.address),
        chain: 'bsc',
    });
    const token_prices = useMemo(() => {
        const token_prices: TokenPrices = {};
        for (const token of tokens) {
            const unique_id = get_token_unique_id(token);
            const price = match_combined_token_info<ShowTokenPrice | undefined>(token.info, {
                ic: (ic) => all_ic_prices[ic.canister_id],
                ethereum: (ethereum) => ({
                    price: all_ethereum_prices?.[ethereum.address.toLowerCase()]?.usdPrice?.toString(),
                    price_change_24h:
                        all_ethereum_prices?.[ethereum.address.toLowerCase()]?.['24hrPercentChange']?.toString(),
                }),
                ethereum_test_sepolia: () => undefined,
                polygon: (polygon) => ({
                    price: all_polygon_prices?.[polygon.address.toLowerCase()]?.usdPrice?.toString(),
                    price_change_24h:
                        all_polygon_prices?.[polygon.address.toLowerCase()]?.['24hrPercentChange']?.toString(),
                }),
                polygon_test_amoy: () => undefined,
                bsc: (bsc) => ({
                    price: all_bsc_prices?.[bsc.address.toLowerCase()]?.usdPrice?.toString(),
                    price_change_24h: all_bsc_prices?.[bsc.address.toLowerCase()]?.['24hrPercentChange']?.toString(),
                }),
                bsc_test: () => undefined,
            });
            if (price !== undefined) token_prices[unique_id] = price;
        }
        return token_prices;
    }, [tokens, all_ic_prices, all_ethereum_prices, all_polygon_prices, all_bsc_prices]);

    return token_prices;
};
