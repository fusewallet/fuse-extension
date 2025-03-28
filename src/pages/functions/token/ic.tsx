import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CiWallet } from 'react-icons/ci';
import { useLocation, type NavigateFunction } from 'react-router-dom';

import Icon from '~components/icon';
import { FusePage } from '~components/layouts/page';
import { FusePageTransition } from '~components/layouts/transition';
import { useCurrentState } from '~hooks/memo/current_state';
import { useGoto } from '~hooks/memo/goto';
import { useCurrentConnectedIcIdentity } from '~hooks/memo/identity';
import {
    useTokenBalanceIcByRefreshing,
    useTokenInfoCustom,
    useTokenInfoIcByInitial,
    useTokenPriceIcByInitial,
} from '~hooks/store/local';
import { useCurrentIdentity } from '~hooks/store/local-secure';
import { useFuseRecordList } from '~hooks/store/local/memo/record';
import { useSonnerToast } from '~hooks/toast';
import { truncate_text } from '~lib/utils/text';
import { FunctionHeader } from '~pages/functions/components/header';
import { match_fuse_record, type FuseRecord } from '~types/records';
import type { TokenTransferredIcRecord } from '~types/records/token/transferred_ic';
import type { IcTokenInfo } from '~types/tokens/chain/ic';
import { get_token_logo, PRESET_ALL_TOKEN_INFO } from '~types/tokens/preset';

import { TokenMetadataIc } from './components/token-metadata';
import { TransferDetailDrawerIc } from './components/transfer-detail-drawer';

const TransferItem = ({
    item,
    logo,
    token,
}: {
    item: TokenTransferredIcRecord;
    logo: string | undefined;
    token: IcTokenInfo | undefined;
}) => {
    const toAccount = useMemo(() => {
        if (item.to === undefined) return '';
        if (typeof item.to === 'string') {
            return item.to;
        } else {
            return item.to.owner;
        }
    }, [item.to]);

    const amount = useMemo(() => {
        if (item.amount === undefined || token === undefined) return '';
        return new BigNumber(item.amount).dividedBy(new BigNumber(10).pow(new BigNumber(token.decimals))).toFixed(2);
    }, [item, token]);

    const method = useMemo(() => {
        if (item.method === undefined) return '';
        if (item.method === 'icrc1_transfer' || item.method === 'transfer') {
            return 'Send';
        }
        // TODO: receive and swap check
        return 'Receive';
    }, [item.method]);

    return (
        <div className="flex w-full cursor-pointer items-center justify-between px-5 py-[10px] transition duration-300 hover:bg-[#333333]">
            <div className="flex items-center">
                <img
                    src={logo ?? 'https://metrics.icpex.org/images/ryjl3-tyaaa-aaaaa-aaaba-cai.png'}
                    className="h-10 w-10 rounded-full"
                />
                <div className="ml-[10px] text-left">
                    <strong className="block text-base text-[#EEEEEE]">{method}</strong>
                    <span className="text-xs text-[#999999]">To {truncate_text(toAccount)}</span>
                    {/* TODO: swap */}
                    {/* <span className="text-xs text-[#999999]">To ICS</span> */}
                </div>
            </div>

            <div className="text-base font-semibold text-[#EEEEEE]">
                -{amount} {token?.symbol}
            </div>

            {/* TODO: receive */}
            {/* <div className="text-base font-semibold text-[#00C431]">+36.98 {token.symbol}</div> */}

            {/* TODO: swap */}
            {/* <div className="flex flex-col items-end">
                <div className="text-sm text-[#999999]">-1.34 {token.symbol}</div>
                <div className="text-base font-semibold text-[#00C431]">+42,582.76 {token.symbol}</div>
            </div> */}
        </div>
    );
};

const InnerPage = ({ canister_id, navigate }: { canister_id: string; navigate: NavigateFunction }) => {
    const { setHide, goto: _goto } = useGoto();
    const toast = useSonnerToast();
    const { current_identity, current_identity_network } = useCurrentIdentity();
    const [custom] = useTokenInfoCustom();

    // , { done, load }
    const [list] = useFuseRecordList(current_identity_network);

    const getDateString = (timestamp: number) => dayjs(timestamp).format('MM/DD/YYYY');

    // only show records of the current canister and token_transferred_ic type
    const token_transferred_ic_list = useMemo<Record<string, TokenTransferredIcRecord[]>>(() => {
        const all_list = list.filter((r) => {
            return match_fuse_record(r, {
                connected: () => false,
                token_transferred_ic: (token_transferred_ic) => {
                    return token_transferred_ic.canister_id === canister_id;
                },
                approved_ic: () => false,
            });
        });

        return all_list.reduce<Record<string, TokenTransferredIcRecord[]>>((acc, item) => {
            const entryType = Object.keys(item)[0] as keyof FuseRecord;
            const entries: [string, TokenTransferredIcRecord][] = Object.entries(item);

            const created = (item[entryType] as TokenTransferredIcRecord)?.created;
            const trans_item = entries[0][1] as TokenTransferredIcRecord;
            if (created) {
                const dateKey = getDateString(created);
                (acc[dateKey] ||= []).push(trans_item);
            }
            return acc;
        }, {});
    }, [canister_id, list]);

    const allTokens = useMemo(() => [...PRESET_ALL_TOKEN_INFO, ...custom.map((t) => t.token)], [custom]);

    const token = useTokenInfoIcByInitial(canister_id);
    const [logo, setLogo] = useState<string>();

    useEffect(() => {
        const token = allTokens.find((t) => 'ic' in t.info && t.info.ic.canister_id === canister_id);

        if (!token) throw new Error('Unknown token info');
        get_token_logo(token.info).then(setLogo);
    }, [allTokens, canister_id]);

    // price
    const token_price = useTokenPriceIcByInitial(canister_id);
    // balance
    const identity = useCurrentConnectedIcIdentity(current_identity?.id);
    // { refreshBalance }
    const [ic_balances] = useTokenBalanceIcByRefreshing(identity?.principal, [canister_id], 5000);
    const balance = useMemo(() => ic_balances[canister_id], [ic_balances, canister_id]);

    const showBalance = useMemo<string | undefined>(() => {
        if (token === undefined || balance === undefined) return '0';
        return new BigNumber(balance).dividedBy(new BigNumber(10).pow(new BigNumber(token.decimals))).toFixed();
    }, [token, balance]);

    const tokenUsd = useMemo(() => {
        if (token_price === undefined || token === undefined || balance === undefined) return '0.00';
        if (token_price?.price === undefined) return '0.00';

        const { price } = token_price;
        return BigNumber(balance).times(BigNumber(price)).div(BigNumber(10).pow(token?.decimals)).toFormat(2);
    }, [balance, token_price, token]);

    const [price, price_change_24h] = useMemo(() => {
        if (token_price === undefined) return [undefined, undefined];
        return [token_price.price, token_price.price_change_24h];
    }, [token_price]);

    const ref = useRef<HTMLDivElement>(null);

    const transactionsRef = useRef<HTMLDivElement>(null);

    return (
        <div ref={ref} className="relative h-full w-full overflow-hidden">
            <FusePageTransition
                setHide={setHide}
                className="relative flex h-full w-full flex-col items-center justify-center pt-[52px]"
                header={
                    <FunctionHeader title={token?.symbol || ''} onBack={() => _goto('/')} onClose={() => _goto('/')} />
                }
            >
                <div className="flex h-full flex-col justify-between">
                    <div className="w-full flex-1 overflow-y-auto">
                        <div className="flex w-full items-center px-5">
                            <img src={logo} className="mr-2 h-10 w-10 rounded-full" />
                            <div className="w-auto">
                                <div className="block text-sm text-[#999999]">
                                    <strong className="pr-3 text-base text-[#EEEEEE]">{token?.name}</strong>
                                    {token?.symbol}
                                </div>

                                <div className="m-1 block text-sm text-[#999999]">
                                    {price === undefined && (
                                        <span className="text-xs text-[#999999]">
                                            <span className="opacity-0">--</span>
                                        </span>
                                    )}
                                    {price !== undefined && (
                                        <>
                                            <span className="text-xs text-[#999999]">
                                                ${BigNumber(price).toFormat(2)}
                                            </span>
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
                        </div>
                        <div className="my-4 px-5">
                            <div className="flex items-center">
                                <strong className="text-4xl text-[#FFCF13]">{showBalance}</strong>
                                <CiWallet className="ml-3 h-4 w-4 text-[#999999]" />
                            </div>
                            <span className="block w-full text-sm text-[#999999]">≈${tokenUsd}</span>
                        </div>
                        <div className="my-2 flex w-full items-center justify-between px-5">
                            {[
                                {
                                    callback: () => navigate('/home/token/ic/transfer', { state: { canister_id } }),
                                    icon: 'icon-send',
                                    name: 'Send',
                                },
                                {
                                    // callback: () => navigate('/home/token/ic/receive'),
                                    callback: () =>
                                        navigate('/home/receive', { state: { chain: 'ic', address: canister_id } }),
                                    icon: 'icon-receive',
                                    name: 'Receive',
                                },
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
                                        transactionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    },
                                    icon: 'icon-history',
                                    name: 'History',
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

                        <TokenMetadataIc canister_id={canister_id} />

                        <div ref={transactionsRef} className="mt-5 w-full pb-5">
                            <h3 className="block px-5 pb-4 text-sm text-[#999999]">Transactions</h3>
                            <div className="flex w-full flex-col">
                                {Object.entries(token_transferred_ic_list).map(([date, records]) => (
                                    <div className="w-full" key={`transfer_${date}`}>
                                        <div className="px-5 py-[5px] text-xs text-[#999999]">{date}</div>
                                        {records &&
                                            records.map((record, idx) => {
                                                return (
                                                    <div className="w-full" key={`transfer_item_${idx}`}>
                                                        <TransferDetailDrawerIc
                                                            trigger={
                                                                <TransferItem item={record} logo={logo} token={token} />
                                                            }
                                                            currentDetail={record}
                                                            token={token}
                                                            logo={logo}
                                                            container={ref.current ?? undefined}
                                                        />
                                                    </div>
                                                );
                                            })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </FusePageTransition>
        </div>
    );
};

function FunctionTokenIcPage() {
    const current_state = useCurrentState();

    const { goto: _goto, navigate } = useGoto();

    const location = useLocation();
    const canister_id = location.state?.token?.info?.ic?.canister_id;

    if (!canister_id) return <></>;
    return (
        <FusePage current_state={current_state} options={{ refresh_token_info_ic_sleep: 1000 * 60 * 5 }}>
            <InnerPage canister_id={canister_id} navigate={navigate} />
        </FusePage>
    );
}

export default FunctionTokenIcPage;
