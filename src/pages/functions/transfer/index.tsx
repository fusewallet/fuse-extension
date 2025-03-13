import { useMemo, useState } from 'react';

import Icon from '~components/icon';
import { FusePage } from '~components/layouts/page';
import { FusePageTransition } from '~components/layouts/transition';
import { useCurrentState } from '~hooks/memo/current_state';
import { useGoto } from '~hooks/memo/goto';
import {
    useTokenBalanceIcByRefreshing,
    useTokenInfoCurrent,
    useTokenInfoCustom,
    useTokenPriceIcRead,
} from '~hooks/store/local';
import { useCurrentIdentity } from '~hooks/store/local-secure';
import { cn } from '~lib/utils/cn';
import { FunctionHeader } from '~pages/functions/components/header';
import {
    get_token_unique_id,
    is_same_token_info,
    match_combined_token_info,
    TokenTag,
    type TokenInfo,
} from '~types/tokens';
import { get_preset_all_token_info } from '~types/tokens/preset';

import { TransferShowToken } from './components/token_item';

type Tab = 'current' | 'all' | 'ck' | 'sns' | 'custom';
const TabNames: Record<Tab, string> = {
    current: '⭐️',
    all: 'All',
    ck: 'CK',
    sns: 'SNS',
    custom: 'Custom',
};
const TABS: Tab[] = ['current', 'all', 'ck', 'sns', 'custom'];

function FunctionTransferPage() {
    const current_state = useCurrentState();
    const { current_identity } = useCurrentIdentity();

    const { setHide, goto: _goto, navigate } = useGoto();

    const [tab, setTab] = useState<Tab>('current');
    const [custom] = useTokenInfoCustom();
    const [current] = useTokenInfoCurrent();

    const [search, setSearch] = useState('');
    const { current_chain_network } = useCurrentIdentity();
    const ALL_TOKEN_INFO = useMemo(() => get_preset_all_token_info(current_chain_network), [current_chain_network]);
    const currentTokens = useMemo(() => current, [current]);
    const allTokens = useMemo(() => [...ALL_TOKEN_INFO, ...custom.map((t) => t.token)], [ALL_TOKEN_INFO, custom]);
    const ckTokens = useMemo(() => ALL_TOKEN_INFO.filter((t) => t.tags.includes(TokenTag.ChainIcCk)), [ALL_TOKEN_INFO]);
    const snsTokens = useMemo(
        () => ALL_TOKEN_INFO.filter((t) => t.tags.includes(TokenTag.ChainIcSns)),
        [ALL_TOKEN_INFO],
    );
    const customTokens = useMemo(() => custom.map((t) => t.token), [custom]);

    const tab_tokens = useMemo(() => {
        const tokens: Record<Tab, TokenInfo[]> = {
            current: currentTokens,
            all: allTokens,
            ck: ckTokens,
            sns: snsTokens,
            custom: customTokens,
        };
        return tokens[tab].map((t) => ({
            ...t,
            id: get_token_unique_id(t),
            current: !!currentTokens.find((c) => is_same_token_info(c, t)),
        }));
    }, [tab, currentTokens, allTokens, ckTokens, snsTokens, customTokens]);

    const { tokens, canisters } = useMemo<{
        tokens: (TokenInfo & { id: string; current: boolean })[];
        canisters: string[];
    }>(() => {
        const tokens: (TokenInfo & { id: string; current: boolean })[] = [];
        const canisters: string[] = [];

        for (const token of tab_tokens) {
            match_combined_token_info(token.info, {
                ic: (ic) => {
                    const s = search.trim().toLowerCase();
                    if (
                        !s ||
                        (s && (0 <= ic.name.toLowerCase().indexOf(s) || 0 <= ic.symbol.toLowerCase().indexOf(s)))
                    ) {
                        tokens.push({
                            ...token,
                            id: get_token_unique_id(token),
                            current: !!currentTokens.find((c) => is_same_token_info(c, token)),
                        });
                        canisters.push(ic.canister_id);
                    }
                },
                evm: (evm) => {
                    const s = search.trim().toLowerCase();
                    if (
                        !s ||
                        (s && (0 <= evm.name.toLowerCase().indexOf(s) || 0 <= evm.symbol.toLowerCase().indexOf(s)))
                    ) {
                        tokens.push({
                            ...token,
                            id: get_token_unique_id(token),
                            current: !!currentTokens.find((c) => is_same_token_info(c, token)),
                        });
                        canisters.push(evm.address);
                    }
                },
            });
        }

        return { tokens, canisters };
    }, [tab_tokens, currentTokens, search]);

    const all_ic_prices = useTokenPriceIcRead();
    const ic_prices = useMemo<[string | undefined, string | undefined][]>(
        () =>
            canisters.map((canister_id) => {
                const price = all_ic_prices[canister_id];
                return [price?.price, price?.price_change_24h];
            }),
        [canisters, all_ic_prices],
    );

    const [ic_balances] = useTokenBalanceIcByRefreshing(current_identity?.address.ic?.owner, canisters, 15000);

    return (
        <FusePage current_state={current_state} options={{ refresh_token_info_ic_sleep: 1000 * 60 * 10 }}>
            <FusePageTransition setHide={setHide}>
                <div className="relative flex h-full w-full flex-col items-center justify-start pt-[52px]">
                    <FunctionHeader title={'Select'} onBack={() => _goto('/')} onClose={() => _goto('/')} />

                    <div className="w-full px-5">
                        <div className="flex h-12 w-full items-center rounded-xl border border-[#333333] px-3 transition duration-300 hover:border-[#FFCF13]">
                            <Icon name="icon-search" className="h-[16px] w-[16px] text-[#999999]" />
                            <input
                                type="text"
                                className="h-full w-full border-transparent bg-transparent pl-3 text-base outline-none placeholder:text-sm"
                                placeholder="Search token or canister"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex w-full items-center px-5 py-3 text-sm">
                        {TABS.map((t) => (
                            <span
                                key={t}
                                className={cn(
                                    'cursor-pointer rounded-full px-3 py-1',
                                    tab === t ? 'bg-[#333333] text-[#EEEEEE]' : 'text-[#999999]',
                                )}
                                onClick={() => {
                                    setTab(t);
                                }}
                            >
                                {TabNames[t]}
                            </span>
                        ))}
                    </div>
                    <div className="flex w-full flex-1 flex-col gap-y-[10px] overflow-y-auto px-5 pb-5">
                        {tokens.map((token) => (
                            <TransferShowToken
                                key={get_token_unique_id(token)}
                                goto={(path, options) =>
                                    typeof path === 'number' ? navigate(path) : navigate(path, options)
                                }
                                token={token}
                                canisters={canisters}
                                ic_balances={ic_balances}
                                ic_prices={ic_prices}
                            />
                        ))}
                    </div>
                </div>
            </FusePageTransition>
        </FusePage>
    );
}

export default FunctionTransferPage;
