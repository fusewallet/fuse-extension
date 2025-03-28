import BigNumber from 'bignumber.js';

import type { GotoFunction } from '~hooks/memo/goto';
import type { Chain } from '~types/chain';
import { match_combined_token_info, type CurrentTokenShowInfo } from '~types/tokens';

// import { get_token_logo } from '~types/tokens/preset';

import TokenLogo from './token-logo';

enum TransferType {
    TRANSFER = 'transfer',
    RECEIVE = 'receive',
    DETAILS = 'details',
}

export const TokenCard = ({
    goto,
    info,
    type = TransferType.DETAILS,
}: {
    goto: GotoFunction;
    info: CurrentTokenShowInfo;
    type?: TransferType;
}) => {
    const { token, price, balance, usd_value } = info;
    const { price: price_value, price_change_24h } = price;
    // const [logo, setLogo] = useState<string>();
    const { formatted: formatted_balance } = balance;
    const { formatted: formatted_usd_value } = usd_value;
    // useEffect(() => {
    //     get_token_logo(token.info).then(setLogo);
    // }, [token]);
    const symbol = match_combined_token_info(token.info, {
        ic: (ic) => ic.symbol,
        ethereum: (ethereum) => ethereum.symbol,
        ethereum_test_sepolia: (ethereum_test_sepolia) => ethereum_test_sepolia.symbol,
        polygon: (polygon) => polygon.symbol,
        polygon_test_amoy: (polygon_test_amoy) => polygon_test_amoy.symbol,
        bsc: (bsc) => bsc.symbol,
        bsc_test: (bsc_test) => bsc_test.symbol,
    });
    const route_key = match_combined_token_info(token.info, {
        ic: () => 'ic',
        ethereum: () => 'evm',
        ethereum_test_sepolia: () => 'evm',
        polygon: () => 'evm',
        polygon_test_amoy: () => 'evm',
        bsc: () => 'evm',
        bsc_test: () => 'evm',
    });
    const { address, chain } = match_combined_token_info<{ chain: Chain; address: string }>(token.info, {
        ic: (ic) => ({ chain: 'ic', address: ic.canister_id }),
        ethereum: (ethereum) => ({ chain: 'ethereum', address: ethereum.address }),
        ethereum_test_sepolia: (ethereum_test_sepolia) => ({
            chain: 'ethereum-test-sepolia',
            address: ethereum_test_sepolia.address,
        }),
        polygon: (polygon) => ({ chain: 'polygon', address: polygon.address }),
        polygon_test_amoy: (polygon_test_amoy) => ({ chain: 'polygon-test-amoy', address: polygon_test_amoy.address }),
        bsc: (bsc) => ({ chain: 'bsc', address: bsc.address }),
        bsc_test: (bsc_test) => ({ chain: 'bsc-test', address: bsc_test.address }),
    });

    const goNext = () => {
        if (type === TransferType.DETAILS) {
            goto(`/home/token/${route_key}`, { state: info });
            return;
        }
        if (type === TransferType.TRANSFER) {
            if (route_key === 'ic') {
                goto(`/home/token/ic/transfer`, { state: { canister_id: address } });
                return;
            }
            goto(`/home/token/evm/transfer`, {
                state: {
                    chain,
                    address,
                    info,
                },
            });
            return;
        }
        if (type === TransferType.RECEIVE) {
            goto('/home/receive', {
                state: {
                    chain,
                    address: address,
                },
            });
            return;
        }

        goto('/');
    };

    return (
        <div
            className="flex w-full cursor-pointer items-center justify-between rounded-xl bg-[#181818] p-[10px] transition duration-300 hover:bg-[#2B2B2B]"
            onClick={() => goNext()}
        >
            <div className="flex items-center">
                <TokenLogo chain={chain} address={address} />
                <div className="ml-[10px]">
                    <strong className="block text-base text-[#EEEEEE]">{symbol}</strong>
                    {price_value === undefined && (
                        <span className="text-xs text-[#999999]">
                            <span className="opacity-0">--</span>
                        </span>
                    )}
                    {price_value !== undefined && (
                        <>
                            <span className="text-xs text-[#999999]">${BigNumber(price_value).toFormat(2)}</span>
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
                    {balance !== undefined && <>{formatted_balance}</>}
                </strong>
                <span className="text-right text-xs text-[#999999]">
                    {usd_value === undefined ? <span className="opacity-0">--</span> : <>${formatted_usd_value}</>}
                </span>
            </div>
        </div>
    );
};
