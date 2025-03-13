import BigNumber from 'bignumber.js';
import { useMemo } from 'react';

import Icon from '~components/icon';
import { useTokenBalanceIcByRefreshing } from '~hooks/store/local';
import { useIdentityKeys } from '~hooks/store/local-secure';
import { cn } from '~lib/utils/cn';
import type { ShowIdentityKey } from '~types/identity';
import { match_combined_token_info, type CurrentTokens } from '~types/tokens';

export const AccountItem = ({
    wallet,
    current_identity,
    canisters,
    current_tokens,
    ic_prices,
}: {
    wallet: ShowIdentityKey;
    current_identity: string | undefined;
    canisters: string[];
    current_tokens: CurrentTokens;
    ic_prices: [string | undefined, string | undefined][];
}) => {
    const { switchIdentity } = useIdentityKeys();

    const [ic_balances] = useTokenBalanceIcByRefreshing(wallet.address.ic?.owner, canisters, 15000);

    const { usd } = useMemo(() => {
        let usd = BigNumber(0);
        let usd_now = BigNumber(0);
        let usd_24h = BigNumber(0);

        for (const token of current_tokens) {
            match_combined_token_info(token.info, {
                ic: (ic) => {
                    const index = canisters.findIndex((c) => c == ic.canister_id);
                    if (index < 0) return;
                    const balance = ic_balances[index];
                    if (!balance) return;
                    if (balance === '0') return;
                    const [price, price_changed_24h] = ic_prices[index];
                    let b: BigNumber | undefined = undefined;
                    if (price !== undefined) {
                        b = BigNumber(balance).times(BigNumber(price)).div(BigNumber(10).pow(ic.decimals));
                        usd = usd.plus(b);
                        if (price_changed_24h !== undefined) {
                            usd_now = usd_now.plus(b);
                            const old_price = BigNumber(price).div(
                                BigNumber(1).plus(BigNumber(price_changed_24h).div(BigNumber(100))),
                            );
                            const old_b = BigNumber(balance)
                                .times(BigNumber(old_price))
                                .div(BigNumber(10).pow(ic.decimals));
                            usd_24h = usd_24h.plus(old_b);
                        }
                    }
                },
                evm: (evm) => {
                    const index = canisters.findIndex((c) => c == evm.address);
                    if (index < 0) return;
                    const balance = '0';
                    if (!balance) return;
                    if (balance === '0') return;
                },
            });
        }

        return {
            usd: usd.toFormat(2),
            usd_changed: usd_now.minus(usd_24h),
            usd_changed_24h: usd_24h.gt(BigNumber(0))
                ? usd_now.times(BigNumber(100)).div(usd_24h).minus(BigNumber(100))
                : BigNumber(0),
        };
    }, [canisters, ic_balances, current_tokens, ic_prices]);

    return (
        <div
            key={wallet.id}
            className={cn(
                `flex w-full cursor-pointer items-center justify-between rounded-xl border border-[#181818] bg-[#181818] px-3 py-3 duration-300 hover:bg-[#2B2B2B]`,
                wallet.id === current_identity && 'border-[#FFCF13]',
            )}
            onClick={() => {
                if (current_identity !== wallet.id) {
                    switchIdentity(wallet.id).then((r) => {
                        if (r === undefined) return;
                        if (r === false) throw Error('switch identity failed');
                        // notice successful
                    });
                }
            }}
        >
            <div className="flex items-center">
                <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#333333] p-2 text-2xl">
                    {wallet.icon}
                </div>
                <div className="ml-3 flex flex-col">
                    <span className="text-base">{wallet.name}</span>
                    {/* wallet amount */}
                    <span className="text-sm text-[#FFCF13]">${usd}</span>
                </div>
            </div>
            {wallet.id === current_identity && <Icon name="icon-ok" className="h-5 w-5 text-[#FFCF13]" />}
        </div>
    );
};
