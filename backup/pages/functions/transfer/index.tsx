import { useMemo, useState } from 'react';

import Icon from '~components/icon';
import { FusePage } from '~components/layouts/page';
import { FusePageTransition } from '~components/layouts/transition';
import { useCurrentState } from '~hooks/memo/current_state';
import { useGoto } from '~hooks/memo/goto';
import { useTokenBalanceIcByRefreshing, useTokenInfoCurrent, useTokenInfoCustom } from '~hooks/store/local';
import { useCurrentIdentity } from '~hooks/store/local-secure';
import { useTokenPrices } from '~hooks/store/local/memo/price';
// import { cn } from '~lib/utils/cn';
import { FunctionHeader } from '~pages/functions/components/header';
import { get_token_unique_id, is_same_token_info, search_tokens, TokenTag, type TokenInfo } from '~types/tokens';
import { PRESET_ALL_TOKEN_INFO } from '~types/tokens/preset';

import { TransferShowToken } from './components/token_item';

type Tab = 'current' | 'all' | 'ck' | 'sns' | 'custom';
// const TabNames: Record<Tab, string> = {
//     current: '⭐️',
//     all: 'All',
//     ck: 'CK',
//     sns: 'SNS',
//     custom: 'Custom',
// };
// const TABS: Tab[] = ['current', 'all', 'ck', 'sns', 'custom'];

function FunctionTransferPage() {
    const current_state = useCurrentState();
    const { current_identity } = useCurrentIdentity();

    const { setHide, goto: _goto, navigate } = useGoto();

    const [custom] = useTokenInfoCustom();
    const [current] = useTokenInfoCurrent();

    const [search, setSearch] = useState('');

    const currentTokens = useMemo(() => current, [current]);
    const allTokens = useMemo(() => [...PRESET_ALL_TOKEN_INFO, ...custom.map((t) => t.token)], [custom]);
    const ckTokens = useMemo(() => PRESET_ALL_TOKEN_INFO.filter((t) => t.tags.includes(TokenTag.ChainIcCk)), []);
    const snsTokens = useMemo(() => PRESET_ALL_TOKEN_INFO.filter((t) => t.tags.includes(TokenTag.ChainIcSns)), []);
    const customTokens = useMemo(() => custom.map((t) => t.token), [custom]);

    const tokens = useMemo(() => {
        const tokens: Record<Tab, TokenInfo[]> = {
            current: currentTokens,
            all: allTokens,
            ck: ckTokens,
            sns: snsTokens,
            custom: customTokens,
        };
        return search_tokens(tokens.current, search).map((t) => ({
            ...t,
            id: get_token_unique_id(t),
            current: !!currentTokens.find((c) => is_same_token_info(c, t)),
        }));
    }, [search, currentTokens, allTokens, ckTokens, snsTokens, customTokens]);

    const canisters = useMemo<string[]>(
        () => tokens.map((t) => ('ic' in t.info ? t.info.ic.canister_id : undefined)).filter((s) => !!s) as string[],
        [tokens],
    );
    const [ic_balances] = useTokenBalanceIcByRefreshing(current_identity?.address.ic?.owner, canisters, 15000);
    const token_prices = useTokenPrices(tokens);

    return (
        <FusePage current_state={current_state} options={{ refresh_token_info_ic_sleep: 1000 * 60 * 10 }}>
            <FusePageTransition setHide={setHide}>
                <div className="relative flex h-full w-full flex-col items-center justify-start pt-[52px]">
                    <FunctionHeader title={'Select'} onBack={() => _goto('/')} onClose={() => _goto('/')} />

                    <div className="px-5 w-full">
                        <div className="flex h-12 w-full items-center rounded-xl border border-[#333333] px-3 transition duration-300 hover:border-[#FFCF13]">
                            <Icon name="icon-search" className="h-[16px] w-[16px] text-[#999999]" />
                            <input
                                type="text"
                                className="pl-3 w-full h-full text-base bg-transparent border-transparent outline-none placeholder:text-sm"
                                placeholder="Search token or canister"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex w-full flex-1 flex-col gap-y-[10px] overflow-y-auto px-5 py-3">
                        {tokens.map((token) => (
                            <TransferShowToken
                                key={get_token_unique_id(token)}
                                goto={(path, options) =>
                                    typeof path === 'number' ? navigate(path) : navigate(path, options)
                                }
                                token={token}
                                token_prices={token_prices}
                                ic_balances={ic_balances}
                            />
                        ))}
                    </div>
                </div>
            </FusePageTransition>
        </FusePage>
    );
}

export default FunctionTransferPage;
