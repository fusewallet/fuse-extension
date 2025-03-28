import BigNumber from 'bignumber.js';
import { useMemo } from 'react';

import type { GotoFunction } from '~hooks/memo/goto';
import TokenLogo from '~pages/home/components/token-logo';
import type { Chain, EvmChain } from '~types/chain';
import type { EvmTokenInfo, TokenInfo } from '~types/tokens';
import type { IcTokenInfo } from '~types/tokens/chain/ic';
import type { TokenPrices } from '~types/tokens/price';

export const TransferShowTokenIc = ({
    goto,
    // token,
    ic,
    type = 'transfer',
    token_prices,
    balances,
}: {
    goto: GotoFunction;
    token: TokenInfo;
    ic: IcTokenInfo;
    type: 'transfer' | 'receive';
    token_prices: TokenPrices;
    balances: Record<string, string>;
}) => {
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

    const goNext = () => {
        if (type === 'transfer') {
            goto('/home/transfer/token/ic', { state: { canister_id: ic.canister_id } });
            return;
        }
        goto('/home/receive', { state: { canister_id: ic.canister_id, chain: 'ic' } });
    };

    return (
        <div
            className="flex w-full cursor-pointer items-center justify-between rounded-xl bg-[#181818] p-[10px] transition duration-300 hover:bg-[#2B2B2B]"
            onClick={() => goNext()}
        >
            <div className="flex items-center">
                <TokenLogo chain="ic" address={`${ic.canister_id}`} />
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

export const TransferShowTokenEvm = ({
    goto,
    token,
    data,
    chain,
    type = 'transfer',
    token_prices,
    balances,
}: {
    goto: GotoFunction;
    token: TokenInfo;
    data: EvmTokenInfo;
    type: 'transfer' | 'receive';
    chain?: EvmChain;
    token_prices: TokenPrices;
    balances: Record<`0x${string}`, bigint>;
}) => {
    const [balance, price, price_change_24h] = useMemo(() => {
        const address = data.address;
        // Use the correct format for EVM tokens based on the chain type
        const chain_type = Object.keys(token.info)[0];
        const unique_id = `${chain_type}#${address}`;
        return [balances[address], token_prices[unique_id]?.price, token_prices[unique_id]?.price_change_24h];
    }, [data, balances, token_prices, token]);

    const usd = useMemo(() => {
        if (balance === undefined) return undefined;
        if (price === undefined) return undefined;
        return BigNumber(`${balance}`).times(BigNumber(price)).div(BigNumber(10).pow(data.decimals)).toFormat(2);
    }, [balance, price, data]);

    const goNext = () => {
        if (type === 'transfer') {
            goto('/home/transfer/token/evm', { state: { address: data.address } });
            return;
        }
        goto('/home/receive', { state: { address: data.address, chain } });
    };

    return (
        <div
            className="flex w-full cursor-pointer items-center justify-between rounded-xl bg-[#181818] p-[10px] transition duration-300 hover:bg-[#2B2B2B]"
            onClick={() => goNext()}
        >
            <div className="flex items-center">
                <TokenLogo chain={chain as Chain} address={data.address} />
                <div className="ml-[10px]">
                    <strong className="block text-base text-[#EEEEEE]">{data.symbol}</strong>
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
                    {balance !== undefined && (
                        <>{BigNumber(`${balance}`).div(BigNumber(10).pow(data.decimals)).toFormat(2)}</>
                    )}
                </strong>
                <span className="text-right text-xs text-[#999999]">
                    {usd === undefined ? <span className="opacity-0">--</span> : <>${usd}</>}
                </span>
            </div>
        </div>
    );
};
