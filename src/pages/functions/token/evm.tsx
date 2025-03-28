import BigNumber from 'bignumber.js';
import { useEffect, useRef, useState } from 'react';
import { CiWallet } from 'react-icons/ci';
import { useInView } from 'react-intersection-observer';
import { useLocation } from 'react-router-dom';
import { isAddressEqual, type Address, type Hash } from 'viem';

import type { GetTransactionsHistoryItem } from '~apis/evm';
import Icon from '~components/icon';
import { FusePage } from '~components/layouts/page';
import { FusePageTransition } from '~components/layouts/transition';
import { useWalletErc20TransactionsHistory, useWalletNativeTransactionsHistory } from '~hooks/apis/evm';
import { useCurrentState } from '~hooks/memo/current_state';
import { useGoto } from '~hooks/memo/goto';
import { useCurrentIdentity } from '~hooks/store/local-secure';
import { useSonnerToast } from '~hooks/toast';
import { truncate_text } from '~lib/utils/text';
import { FunctionHeader } from '~pages/functions/components/header';
import { match_chain, type EvmChain } from '~types/chain';
import { get_evm_token_info, match_combined_token_info, type CurrentTokenShowInfo } from '~types/tokens';
import { BscTokenStandard } from '~types/tokens/chain/bsc';
import { BscTestTokenStandard } from '~types/tokens/chain/bsc-test';
import { EthereumTokenStandard } from '~types/tokens/chain/ethereum';
import { EthereumTestSepoliaTokenStandard } from '~types/tokens/chain/ethereum-test-sepolia';
import { PolygonTokenStandard } from '~types/tokens/chain/polygon';
import { PolygonTestAmoyTokenStandard } from '~types/tokens/chain/polygon-test-amoy';
import { get_token_logo } from '~types/tokens/preset';

import { TokenMetadataEvm } from './components/token-metadata';
import { TransferDetailDrawerEvm } from './components/transfer-detail-drawer';

export const format_number_smart = (value: BigNumber | string | number): string => {
    const bn = new BigNumber(value);

    if (bn.isZero()) return '0';

    if (bn.abs().isGreaterThanOrEqualTo(1e9)) {
        return `${bn
            .dividedBy(1e9)
            .toFixed(2)
            .replace(/\.?0+$/, '')}B`;
    } else if (bn.abs().isGreaterThanOrEqualTo(1e6)) {
        return `${bn
            .dividedBy(1e6)
            .toFixed(2)
            .replace(/\.?0+$/, '')}M`;
    } else if (bn.abs().isGreaterThanOrEqualTo(1e3)) {
        return `${bn
            .dividedBy(1e3)
            .toFixed(1)
            .replace(/\.?0+$/, '')}K`;
    }

    if (bn.abs().isLessThan(1)) {
        const absStr = bn.abs().toFixed();

        if (absStr.includes('e')) {
            return bn.toExponential(2);
        }

        const parts = absStr.split('.');
        if (parts.length > 1) {
            const decimalPart = parts[1];

            let leadingZeros = 0;
            while (leadingZeros < decimalPart.length && decimalPart[leadingZeros] === '0') {
                leadingZeros++;
            }

            if (leadingZeros >= decimalPart.length) {
                return bn.toExponential(2);
            }

            const significantDigits = leadingZeros + 3;
            const formattedDecimal = bn.toFixed(Math.min(significantDigits, 20));

            return formattedDecimal.replace(/(\.\d*?[1-9])0+$|\.0*$/, '$1');
        }
    }

    return bn.toFixed(2).replace(/(\.\d*?[1-9])0+$|\.0*$/, '$1');
};

const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateWithoutTime = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayWithoutTime = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayWithoutTime = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

    if (dateWithoutTime.getTime() === todayWithoutTime.getTime()) {
        return 'Today';
    } else if (dateWithoutTime.getTime() === yesterdayWithoutTime.getTime()) {
        return 'Yesterday';
    } else {
        return date
            .toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric',
            })
            .replace(/\//g, '/');
    }
};

const groupTransactionsByDate = (transactions: GetTransactionsHistoryItem[]) => {
    return transactions.reduce((groups: { [key: string]: GetTransactionsHistoryItem[] }, transaction) => {
        const date = formatDate(transaction.timestamp);
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(transaction);
        return groups;
    }, {});
};

const TransactionCard = ({
    chain,
    transaction,
    logo,
    symbol,
    decimals,
    onClick,
}: {
    chain: EvmChain;
    transaction: GetTransactionsHistoryItem;
    logo?: string;
    symbol: string;
    decimals: number;
    onClick: () => void;
}) => {
    const { current_identity } = useCurrentIdentity();
    const self = match_chain(chain, {
        ic: () => {
            throw new Error('ic token not supported');
        },
        ethereum: () => current_identity?.address.ethereum?.address,
        ethereum_test_sepolia: () => current_identity?.address.ethereum_test_sepolia?.address,
        polygon: () => current_identity?.address.polygon?.address,
        polygon_test_amoy: () => current_identity?.address.polygon_test_amoy?.address,
        bsc: () => current_identity?.address.bsc?.address,
        bsc_test: () => current_identity?.address.bsc_test?.address,
    });
    const isSent = self && isAddressEqual(transaction.from, self);
    const { from, to } = transaction;
    return (
        <div
            key={transaction.hash}
            onClick={onClick}
            className="flex w-full items-center justify-between px-5 py-3 hover:bg-[#333333]"
        >
            <div className="flex items-center">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#333]">
                    <img src={logo} className="h-10 w-10" />
                </div>
                <div className="ml-3">
                    <div className="text-base text-[#EEEEEE]">{isSent ? 'Sent' : 'Received'}</div>
                    <div className="text-xs text-[#999999]">
                        {isSent
                            ? to
                                ? `To ${truncate_text(to)}`
                                : `To ${truncate_text(from)}`
                            : `From ${truncate_text(from)}`}
                    </div>
                </div>
            </div>
            <div className="text-right">
                <div className={`text-base font-medium ${isSent ? 'text-[#EEEEEE]' : 'text-[#00C431]'}`}>
                    {isSent ? '-' : '+'}
                    {format_number_smart(BigNumber(transaction.value).dividedBy(new BigNumber(10).pow(decimals)))}{' '}
                    {symbol}
                </div>
            </div>
        </div>
    );
};

const InnerPage = ({ info }: { info: CurrentTokenShowInfo }) => {
    const { setHide, goto: _goto, navigate } = useGoto();
    const toast = useSonnerToast();
    const { token, price: token_price, balance, usd_value } = info;
    const { price, price_change_24h } = token_price;
    const [logo, setLogo] = useState<string>();
    useEffect(() => {
        get_token_logo(token.info).then(setLogo);
    }, [token]);
    const { symbol, name, chain, isNative, decimals, address } = get_evm_token_info(info.token.info);
    const containerRef = useRef<HTMLDivElement>(null);

    const transactionsRef = useRef<HTMLDivElement>(null);
    const { ref: loadMoreRef, inView } = useInView();
    const {
        data: nativeTransactionsData,
        fetchNextPage: fetchNextNativePage,
        hasNextPage: hasNextNativePage,
        isFetchingNextPage: isFetchingNextPageNative,
        isLoading: isLoadingNative,
    } = useWalletNativeTransactionsHistory({
        chain,
        limit: 10,
        enabled: isNative,
    });
    const {
        data: erc20TransactionsData,
        fetchNextPage: fetchNextErc20Page,
        hasNextPage: hasNextErc20Page,
        isFetchingNextPage: isFetchingNextErc20Page,
        isLoading: isLoadingErc20,
    } = useWalletErc20TransactionsHistory({
        chain,
        limit: 10,
        enabled: !isNative,
        contractAddresses: [address],
    });
    const isLoading = isNative ? isLoadingNative : isLoadingErc20;
    const isFetchingNextPage = isNative ? isFetchingNextPageNative : isFetchingNextErc20Page;
    const transactionsData = isNative ? nativeTransactionsData : erc20TransactionsData;
    const fetchNextPage = isNative ? fetchNextNativePage : fetchNextErc20Page;
    const hasNextPage = isNative ? hasNextNativePage : hasNextErc20Page;
    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage]);
    const [currentTransaction, setCurrentTransaction] = useState<GetTransactionsHistoryItem>();
    const [transacionDetailOpen, setTransacionDetailOpen] = useState<boolean>(false);
    return (
        <div ref={containerRef} className="relative h-full w-full overflow-hidden">
            <FusePageTransition
                setHide={setHide}
                className="relative flex h-full w-full flex-col items-center justify-center pt-[52px]"
                header={<FunctionHeader title={symbol || ''} onBack={() => _goto('/')} onClose={() => _goto('/')} />}
            >
                <TransferDetailDrawerEvm
                    open={transacionDetailOpen}
                    setOpen={setTransacionDetailOpen}
                    key={`detail-${currentTransaction?.hash}`}
                    container={containerRef.current}
                    info={{
                        hash: currentTransaction?.hash as Hash,
                        chain,
                        logo,
                        symbol,
                        decimals,
                        decoded_transaction: currentTransaction,
                    }}
                ></TransferDetailDrawerEvm>

                <div className="flex h-full flex-col justify-between">
                    <div className="w-full flex-1 overflow-y-auto">
                        <div className="flex w-full items-center px-5">
                            <img src={logo} className="mr-2 h-10 w-10 rounded-full" />
                            <div className="w-auto">
                                <div className="block text-sm text-[#999999]">
                                    <strong className="pr-3 text-base text-[#EEEEEE]">{name}</strong>
                                    {symbol}
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
                                <strong className="text-4xl text-[#FFCF13]">{balance.formatted}</strong>
                                <CiWallet className="ml-3 h-4 w-4 text-[#999999]" />
                            </div>
                            <span className="block w-full text-sm text-[#999999]">≈${usd_value?.formatted}</span>
                        </div>
                        <div className="my-2 flex w-full items-center justify-between px-5">
                            {[
                                {
                                    callback: () =>
                                        navigate('/home/token/evm/transfer', { state: { chain, address, info } }),
                                    icon: 'icon-send',
                                    name: 'Send',
                                },
                                {
                                    // callback: () => navigate('/home/token/evm/receive'),
                                    callback: () => navigate('/home/receive', { state: { chain, address } }),
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

                        <TokenMetadataEvm token={token} />

                        <div ref={transactionsRef} className="mt-5 w-full pb-5">
                            <h3 className="block px-5 pb-4 text-sm text-[#999999]">Transactions</h3>
                            <div className="flex w-full flex-col">
                                {isLoading ? (
                                    Array(3)
                                        .fill(0)
                                        .map((_, idx) => (
                                            <div
                                                key={idx}
                                                className="flex w-full items-center justify-between px-5 py-[10px]"
                                            >
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 animate-pulse rounded-full bg-[#181818]" />
                                                    <div className="ml-[10px] space-y-2">
                                                        <div className="h-4 w-20 animate-pulse rounded bg-[#181818]" />
                                                        <div className="h-3 w-32 animate-pulse rounded bg-[#181818]" />
                                                    </div>
                                                </div>
                                                <div className="h-4 w-24 animate-pulse rounded bg-[#181818]" />
                                            </div>
                                        ))
                                ) : (
                                    <>
                                        {transactionsData?.pages.length &&
                                        transactionsData.pages.length &&
                                        transactionsData.pages[0] &&
                                        transactionsData.pages[0]?.data.length > 0 ? (
                                            <>
                                                {(() => {
                                                    // Flatten all transactions from all pages
                                                    const allTransactions = transactionsData.pages.flatMap(
                                                        (page) => page.data,
                                                    );
                                                    // Group transactions by date after flattening
                                                    const groupedByDate = groupTransactionsByDate(allTransactions);

                                                    return Object.entries(groupedByDate).map(([date, transactions]) => (
                                                        <div key={date} className="w-full">
                                                            <div className="sticky top-0 px-5 py-2 text-xs text-[#999999]">
                                                                {date}
                                                            </div>
                                                            {transactions.map((transaction, idx) => (
                                                                <TransactionCard
                                                                    key={transaction.hash || idx}
                                                                    transaction={transaction}
                                                                    chain={chain}
                                                                    logo={logo}
                                                                    symbol={symbol}
                                                                    decimals={decimals}
                                                                    onClick={() => {
                                                                        setTransacionDetailOpen(true);
                                                                        setCurrentTransaction(transaction);
                                                                    }}
                                                                />
                                                            ))}
                                                        </div>
                                                    ));
                                                })()}

                                                <div ref={loadMoreRef} className="py-4">
                                                    {isFetchingNextPage && (
                                                        <div className="flex justify-center">
                                                            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FFCF13] border-t-transparent" />
                                                        </div>
                                                    )}
                                                </div>

                                                {!hasNextPage && transactionsData.pages[0]?.data.length > 0 && (
                                                    <div className="py-4 text-center text-sm text-[#999999]">
                                                        No more transactions
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-8">
                                                <Icon name="icon-empty" className="h-12 w-12 text-[#999999]" />
                                                <span className="mt-2 text-sm text-[#999999]">No transactions yet</span>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </FusePageTransition>
        </div>
    );
};

function FunctionTokenEvmPage() {
    const current_state = useCurrentState();

    const location = useLocation();
    const info = location.state as CurrentTokenShowInfo;

    return (
        <FusePage current_state={current_state} options={{ refresh_token_info_ic_sleep: 1000 * 60 * 5 }}>
            <InnerPage info={info} />
        </FusePage>
    );
}

export default FunctionTokenEvmPage;
