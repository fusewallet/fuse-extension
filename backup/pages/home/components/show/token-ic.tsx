import BigNumber from 'bignumber.js';
import { useEffect, useMemo, useState } from 'react';

import type { GotoFunction } from '~hooks/memo/goto';
import type { TokenInfo } from '~types/tokens';
import type { IcTokenInfo } from '~types/tokens/chain/ic';
import { get_token_logo } from '~types/tokens/preset';
import type { TokenPrices } from '~types/tokens/price';

export const ShowTokenIc = ({
    goto,
    token,
    ic,
    token_prices,
    balances,
}: {
    goto: GotoFunction;
    token: TokenInfo;
    ic: IcTokenInfo;
    token_prices: TokenPrices;
    balances: Record<string, string>;
}) => {
    const [logo, setLogo] = useState<string>();
    useEffect(() => {
        get_token_logo(token.info).then(setLogo);
    }, [token]);

    const [balance, price, price_change_24h] = useMemo(() => {
        const canister_id = ic.canister_id;
        const unique_id = `ic#${canister_id}`;
        return [balances[canister_id], token_prices[unique_id]?.price, token_prices[unique_id]?.price_change_24h];
    }, [ic, balances, token_prices]);

    const usd = useMemo(() => {
        if (balance === undefined) return undefined;
        if (price === undefined) return undefined;
        return BigNumber(balance).times(BigNumber(price)).div(BigNumber(10).pow(ic.decimals)).toFormat(2);
    }, [balance, price, ic]);

    return (
        <div
            className="flex w-full cursor-pointer items-center justify-between rounded-xl bg-[#181818] p-[10px] transition duration-300 hover:bg-[#2B2B2B]"
            onClick={() => goto('/home/token/ic', { state: { canister_id: ic.canister_id } })}
        >
            <div className="flex items-center">
                <img src={logo} className="h-10 w-10 rounded-full" />
                <div className="ml-[10px]">
                    <strong className="block text-base text-[#EEEEEE]">{ic.symbol}</strong>
                    {price === undefined && (
                        <span className="text-xs text-[#999999]">
                            <span className="opacity-0">--</span>
                        </span>
                    )}
                    {price !== undefined && (
                        <>
                            <span className="text-xs text-[#999999]">${BigNumber(price).toFormat(2)}</span>
                            {price_change_24h !== undefined && price_change_24h.startsWith('-') && (
                                <span className="pl-2 text-xs text-[#FF2C40]">
                                    {BigNumber(price_change_24h).toFormat(2)}%
                                </span>
                            )}
                            {price_change_24h !== undefined && !price_change_24h.startsWith('-') && (
                                <span className="pl-2 text-xs text-[#00C431]">
                                    +{BigNumber(price_change_24h).toFormat(2)}%
                                </span>
                            )}
                        </>
                    )}
                </div>
            </div>
            <div className="flex-end flex shrink-0 flex-col">
                <strong className="block text-right text-base text-[#EEEEEE]">
                    {balance === undefined && <span className="opacity-0">--</span>}
                    {balance !== undefined && <>{BigNumber(balance).div(BigNumber(10).pow(ic.decimals)).toFormat(2)}</>}
                </strong>
                <span className="text-right text-xs text-[#999999]">
                    {usd === undefined ? <span className="opacity-0">--</span> : <>${usd}</>}
                </span>
            </div>
        </div>
    );
};
