import { useMemo } from 'react';

import Icon from '~components/icon';
import { useTokenBalanceIcByRefreshing } from '~hooks/store/local';
import { useIdentityKeys } from '~hooks/store/local-secure';
import { useTokenPriceUsd } from '~hooks/store/local/memo/usd';
import { cn } from '~lib/utils/cn';
import type { ShowIdentityKey } from '~types/identity';
import { type CurrentTokens } from '~types/tokens';
import type { TokenPrices } from '~types/tokens/price';

export const AccountItem = ({
    wallet,
    current_identity,
    token_prices,
    current_tokens,
}: {
    wallet: ShowIdentityKey;
    current_identity: string | undefined;
    token_prices: TokenPrices;
    current_tokens: CurrentTokens;
}) => {
    const { switchIdentity } = useIdentityKeys();

    const canisters = useMemo(() => {
        const canisters: string[] = [];
        for (const token of current_tokens) {
            if ('ic' in token.info) canisters.push(token.info.ic.canister_id);
        }
        return canisters;
    }, [current_tokens]);
    const [ic_balances] = useTokenBalanceIcByRefreshing(wallet.address.ic?.owner, canisters, 15000);

    const { usd } = useTokenPriceUsd(current_tokens, token_prices, ic_balances);

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
