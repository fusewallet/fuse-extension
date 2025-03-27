import { useMemo } from 'react';

import { get_token_unique_id, match_combined_token_info, type TokenInfo } from '~types/tokens';
import type { ShowTokenPrice, TokenPrices } from '~types/tokens/price';

import { useTokenPriceIcRead } from '..';

export const useTokenPrices = (tokens: TokenInfo[]): TokenPrices => {
    const all_ic_prices = useTokenPriceIcRead();

    const token_prices = useMemo(() => {
        const token_prices: TokenPrices = {};
        for (const token of tokens) {
            const unique_id = get_token_unique_id(token);
            const price = match_combined_token_info<ShowTokenPrice | undefined>(token.info, {
                ic: (ic) => all_ic_prices[ic.canister_id],
                ethereum: () => undefined,
                ethereum_test_sepolia: () => undefined,
                polygon: () => undefined,
                polygon_test_amoy: () => undefined,
                bsc: () => undefined,
                bsc_test: () => undefined,
            });
            if (price !== undefined) token_prices[unique_id] = price;
        }
        return token_prices;
    }, [tokens, all_ic_prices]);

    return token_prices;
};
