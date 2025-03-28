import BigNumber from 'bignumber.js';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import ic_svg from '~assets/svg/chains/ic.min.svg';
import Icon from '~components/icon';
import { FusePage } from '~components/layouts/page';
import { useCurrentState } from '~hooks/memo/current_state';
import { useCurrentIdentity } from '~hooks/store/local-secure';
import { useCurrentTokensShowInfo } from '~hooks/store/local/token';
import { useSonnerToast } from '~hooks/toast';
import { truncate_text } from '~lib/utils/text';
import type { ShowIdentityKey } from '~types/identity';
import { get_token_unique_id } from '~types/tokens';

import { AddressTooltip } from './components/address-tooltip';
import SelectChain from './components/select-chain';
import { ShowSingleAddress } from './components/show-address';
import { TokenCard } from './components/show-token';

function HomePage() {
    const current_state = useCurrentState();
    const { current_identity } = useCurrentIdentity();

    return (
        <FusePage
            current_state={current_state}
            options={{
                update_pathname: true,
                refresh_token_price_ic_sleep: 1000 * 60,
            }}
        >
            {current_identity && <InnerHomePage current_identity={current_identity} />}
        </FusePage>
    );
}

export default HomePage;

function InnerHomePage({ current_identity }: { current_identity: ShowIdentityKey }) {
    const toast = useSonnerToast();
    const navigate = useNavigate();

    const ref = useRef<HTMLDivElement>(null);
    const { tokens_info, all_usd, all_usd_changed, all_usd_changed_24h } = useCurrentTokensShowInfo();
    return (
        <div ref={ref} className="relative h-full w-full">
            <div className="absolute top-0 z-10 flex w-full items-center justify-between bg-[#0a0600] px-5 py-3">
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
                            </div>
                        }
                    />
                </div>

                {/** right icons */}
                <div className="flex items-center gap-2.5">
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
                    <SelectChain
                        trigger={
                            <div>
                                <Icon
                                    name="icon-network"
                                    className="h-[18px] w-[18px] cursor-pointer text-[#EEEEEE] transition duration-300 hover:text-[#FFCF13]"
                                />
                            </div>
                        }
                        container={ref.current ?? undefined}
                    />
                </div>
            </div>

            <div className="h-full flex-1 overflow-y-auto pb-5 pt-[60px]">
                <div className="w-full py-2">
                    <div className="block text-center text-4xl font-semibold text-[#FFCF13]">
                        ${all_usd.toFormat(2)}
                    </div>
                    <div className="mt-2 flex w-full items-center justify-center">
                        <span className="mr-2 text-sm text-[#00C431]">
                            {all_usd_changed.gt(BigNumber(0)) ? '+' : all_usd_changed.lt(BigNumber(0)) ? '-' : ''}$
                            {all_usd_changed.abs().toFormat(2)}
                        </span>
                        <span className="rounded bg-[#193620] px-2 py-[2px] text-sm text-[#00C431]">
                            {all_usd_changed_24h.gt(BigNumber(0))
                                ? '+'
                                : all_usd_changed_24h.lt(BigNumber(0))
                                  ? '-'
                                  : ''}
                            {all_usd_changed_24h.abs().toFormat(2)}%
                        </span>
                    </div>
                </div>

                <div className="mt-2 flex w-full items-center justify-between px-5">
                    {[
                        { callback: () => navigate('/home/transfer/transfer'), icon: 'icon-send', name: 'Send' },
                        // { callback: () => navigate('/home/receive'), icon: 'icon-receive', name: 'Receive' },
                        { callback: () => navigate('/home/transfer/receive'), icon: 'icon-receive', name: 'Receive' },
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
                    {tokens_info.map((info) => (
                        <TokenCard
                            key={get_token_unique_id(info.token)}
                            goto={(path, options) =>
                                typeof path === 'number' ? navigate(path) : navigate(path, options)
                            }
                            info={info}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
