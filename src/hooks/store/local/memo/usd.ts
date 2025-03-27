import BigNumber from 'bignumber.js';
import { useMemo } from 'react';

import { get_token_unique_id, match_combined_token_info, type TokenInfo } from '~types/tokens';
import type { TokenPrices } from '~types/tokens/price';

export const useTokenPriceUsd = (
    tokens: TokenInfo[],
    token_prices: TokenPrices,
    ic_balances: Record<string, string>,
): {
    usd: string;
    usd_changed: BigNumber;
    usd_changed_24h: BigNumber;
} => {
    const { usd, usd_changed, usd_changed_24h } = useMemo(() => {
        let usd = BigNumber(0);
        let usd_now = BigNumber(0);
        let usd_24h = BigNumber(0);

        for (const token of tokens) {
            match_combined_token_info(token.info, {
                ic: (ic) => {
                    const balance = ic_balances[ic.canister_id];
                    if (!balance) return;
                    if (balance === '0') return;
                    const { price, price_change_24h } = token_prices[get_token_unique_id(token)] ?? {};
                    let b: BigNumber | undefined = undefined;
                    if (price !== undefined) {
                        b = BigNumber(balance).times(BigNumber(price)).div(BigNumber(10).pow(ic.decimals));
                        usd = usd.plus(b);
                        if (price_change_24h !== undefined) {
                            usd_now = usd_now.plus(b);
                            const old_price = BigNumber(price).div(
                                BigNumber(1).plus(BigNumber(price_change_24h).div(BigNumber(100))),
                            );
                            const old_b = BigNumber(balance)
                                .times(BigNumber(old_price))
                                .div(BigNumber(10).pow(ic.decimals));
                            usd_24h = usd_24h.plus(old_b);
                        }
                    }
                },
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                ethereum: () => {},
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                ethereum_test_sepolia: () => {},
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                polygon: () => {},
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                polygon_test_amoy: () => {},
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                bsc: () => {},
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                bsc_test: () => {},
            });
        }

        return {
            usd: usd.toFormat(2),
            usd_changed: usd_now.minus(usd_24h),
            usd_changed_24h: usd_24h.gt(BigNumber(0))
                ? usd_now.times(BigNumber(100)).div(usd_24h).minus(BigNumber(100))
                : BigNumber(0),
        };
    }, [ic_balances, tokens, token_prices]);

    return {
        usd,
        usd_changed,
        usd_changed_24h,
    };
};
