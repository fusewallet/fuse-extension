import BigNumber from 'bignumber.js';
import { useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import eth_svg from '~assets/svg/chains/eth.svg';
import ic_svg from '~assets/svg/chains/ic.min.svg';
import Icon from '~components/icon';
import { FusePage } from '~components/layouts/page';
import { useCurrentState } from '~hooks/memo/current_state';
import { useTokenBalanceIcByRefreshing, useTokenInfoCurrentRead, useTokenPriceIcRead } from '~hooks/store/local';
import { useCurrentIdentity } from '~hooks/store/local-secure';
import { useSonnerToast } from '~hooks/toast';
import { truncate_text } from '~lib/utils/text';
import { match_chain } from '~types/chain';
import type { ShowIdentityKey } from '~types/identity';
import type { ChainNetwork } from '~types/network';
import { get_token_unique_id, match_combined_token_info } from '~types/tokens';

import { AddressTooltip } from './components/address-tooltip';
import { ChainSelector } from './components/chain-selector';
import { ShowSingleAddress } from './components/show-address';
import { HomeShowToken } from './components/show-token';

function HomePage() {
    const current_state = useCurrentState();
    const { current_identity, current_chain_network } = useCurrentIdentity();

    return (
        <FusePage
            current_state={current_state}
            options={{
                update_pathname: true,
                refresh_token_price_ic_sleep: 1000 * 60,
            }}
        >
            {current_identity && current_chain_network && (
                <InnerHomePage current_identity={current_identity} current_chain_network={current_chain_network} />
            )}
        </FusePage>
    );
}

export default HomePage;

function InnerHomePage({
    current_identity,
    current_chain_network,
}: {
    current_identity: ShowIdentityKey;
    current_chain_network: ChainNetwork;
}) {
    const toast = useSonnerToast();
    const navigate = useNavigate();

    const current_tokens = useTokenInfoCurrentRead();

    const canisters = useMemo(() => {
        const canisters: string[] = [];
        for (const token of current_tokens) {
            match_combined_token_info(token.info, {
                ic: (ic) => canisters.push(ic.canister_id),
                evm: (evm) => canisters.push(evm.address),
            });
        }
        return canisters;
    }, [current_tokens]);
    const all_ic_prices = useTokenPriceIcRead();
    const ic_prices = useMemo<[string | undefined, string | undefined][]>(
        () =>
            canisters.map((canister_id) => {
                const price = all_ic_prices[canister_id];
                return [price?.price, price?.price_change_24h];
            }),
        [canisters, all_ic_prices],
    );

    const [ic_balances] = useTokenBalanceIcByRefreshing(current_identity.address.ic?.owner, canisters, 15000);

    const { usd, usd_changed, usd_changed_24h } = useMemo(() => {
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

    const ref = useRef<HTMLDivElement>(null);
    return (
        <div ref={ref} className="relative h-full w-full">
            <div className="absolute top-0 flex w-full items-center justify-between bg-[#0a0600] px-5 py-3">
                <div className="flex items-center">
                    <div
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#333333] text-lg font-semibold text-[#999999]"
                        onClick={() => navigate('/home/switch/account')}
                    >
                        <div
                            style={{
                                lineHeight: '22px',
                                fontSize: '22px',
                                transform: 'translateY(1.5px)',
                            }}
                        >
                            {current_identity.icon}
                        </div>
                    </div>

                    {/** copy address  */}
                    <AddressTooltip
                        container={ref.current ?? undefined}
                        trigger={
                            <div className="flex flex-row items-center justify-center text-[#EEEEEE] transition duration-300 hover:text-[#FFCF13]">
                                <span className="cursor-pointer px-2 text-base">{current_identity.name}</span>
                                <Icon name="icon-copy" className="h-[14px] w-[14px] cursor-pointer" />
                            </div>
                        }
                        content={
                            <div className="flex flex-col gap-y-2 p-[10px]">
                                {match_chain(current_chain_network.chain, {
                                    ic: () => (
                                        <>
                                            {current_identity.address.ic?.owner && (
                                                <ShowSingleAddress
                                                    address={current_identity.address.ic.owner}
                                                    truncated={truncate_text(current_identity.address.ic.owner)}
                                                    icon={ic_svg}
                                                    name="Principal ID"
                                                />
                                            )}
                                            {current_identity.address.ic?.account_id && (
                                                <ShowSingleAddress
                                                    address={current_identity.address.ic.account_id}
                                                    truncated={truncate_text(current_identity.address.ic.account_id)}
                                                    icon={ic_svg}
                                                    name="Account ID"
                                                />
                                            )}
                                        </>
                                    ),
                                    evm: () => (
                                        <>
                                            {current_identity.address.evm.address && (
                                                <ShowSingleAddress
                                                    address={current_identity.address.evm.address}
                                                    truncated={truncate_text(current_identity.address.evm.address)}
                                                    icon={eth_svg}
                                                    name="EVM Address"
                                                />
                                            )}
                                        </>
                                    ),
                                })}
                            </div>
                        }
                    />
                </div>

                {/** right icons */}
                <div className="flex items-center gap-3">
                    {[
                        { callback: () => navigate('/home/token/view'), icon: 'icon-search' },
                        { callback: () => navigate('/home/records'), icon: 'icon-history' },
                        { callback: () => navigate('/home/settings'), icon: 'icon-setting' },
                    ].map(({ callback, icon }) => (
                        <div key={icon} onClick={callback}>
                            <Icon
                                name={icon}
                                className="h-[18px] w-[18px] cursor-pointer text-[#EEEEEE] transition duration-300 hover:text-[#FFCF13]"
                            />
                        </div>
                    ))}
                    <ChainSelector />
                </div>
            </div>

            <div className="h-full flex-1 overflow-y-auto pb-5 pt-[60px]">
                <div className="w-full py-2">
                    <div className="block text-center text-4xl font-semibold text-[#FFCF13]">${usd}</div>
                    <div className="mt-2 flex w-full items-center justify-center">
                        <span className="mr-2 text-sm text-[#00C431]">
                            {usd_changed.gt(BigNumber(0)) ? '+' : usd_changed.lt(BigNumber(0)) ? '-' : ''}$
                            {usd_changed.abs().toFormat(2)}
                        </span>
                        <span className="rounded bg-[#193620] px-2 py-[2px] text-sm text-[#00C431]">
                            {usd_changed_24h.gt(BigNumber(0)) ? '+' : usd_changed_24h.lt(BigNumber(0)) ? '-' : ''}
                            {usd_changed_24h.abs().toFormat(2)}%
                        </span>
                    </div>
                </div>

                <div className="mt-2 flex w-full items-center justify-between px-5">
                    {[
                        { callback: () => navigate('/home/transfer'), icon: 'icon-send', name: 'Send' },
                        { callback: () => navigate('/home/receive'), icon: 'icon-receive', name: 'Receive' },
                        {
                            callback: () => {
                                toast.info('Come soon');
                                // navigate('/home/swap')
                            },
                            icon: 'icon-swap',
                            name: 'Swap',
                        },
                        {
                            callback: () => {
                                toast.info('Come soon');
                                // navigate('/home/dapps')
                            },
                            icon: 'icon-dapps',
                            name: 'Dapps',
                        },
                    ].map(({ callback, icon, name }) => (
                        <div
                            key={icon}
                            onClick={callback}
                            className="flex h-[70px] w-[70px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-[#333333] transition duration-300 hover:border-[#FFCF13]"
                        >
                            <Icon
                                name={icon}
                                className="h-[20px] w-[20px] cursor-pointer font-semibold text-[#FFCF13]"
                            />
                            <span className="pt-1 text-xs text-[#EEEEEE]">{name}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-5 flex w-full flex-col gap-y-[10px] px-5">
                    {current_tokens.map((token) => (
                        <HomeShowToken
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
        </div>
    );
}
