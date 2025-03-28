import BigNumber from 'bignumber.js';
import { useMemo } from 'react';

import { useERC20Balances } from '~hooks/evm/contracts/multicall/read';
import { useNativeBalance } from '~hooks/evm/native/read';
import { useCurrentIdentity, useShowNetworks } from '~hooks/store/local-secure';
import {
    get_token_unique_id,
    group_tokens_by_chain,
    match_combined_token_info,
    TokenTag,
    type CurrentTokenShowInfo,
} from '~types/tokens';
import { BscTokenStandard } from '~types/tokens/chain/bsc';
import { BscTestTokenStandard } from '~types/tokens/chain/bsc-test';
import { EthereumTokenStandard } from '~types/tokens/chain/ethereum';
import { EthereumTestSepoliaTokenStandard } from '~types/tokens/chain/ethereum-test-sepolia';
import { PolygonTokenStandard } from '~types/tokens/chain/polygon';
import { PolygonTestAmoyTokenStandard } from '~types/tokens/chain/polygon-test-amoy';

import { useTokenBalanceIcByRefreshing, useTokenInfoCurrentRead } from '..';
import { useTokenPrices } from '../memo/price';

export const useCurrentTokensShowInfo = () => {
    const current_tokens = useTokenInfoCurrentRead();
    const { current_identity } = useCurrentIdentity();
    const [{ chains: show_networks }] = useShowNetworks();
    const show_tokens = useMemo(() => {
        return current_tokens.filter((s) => {
            const exist = show_networks.filter((t) => s.tags.includes(`chain-${t}` as TokenTag));

            if (exist.length === 0) return false;

            return true;
        });
    }, [current_tokens, show_networks]);

    // 1. group tokens by chain
    const tokens_by_chain = group_tokens_by_chain(current_tokens);

    // 2. get canisters
    const canisters = useMemo<string[]>(
        () => tokens_by_chain.ic.map((t) => t.info.ic.canister_id).filter((s) => !!s) as string[],
        [tokens_by_chain.ic],
    );
    // 3. native token balances
    const { data: ethereum_native_balance } = useNativeBalance('ethereum');
    const { data: ethereum_test_sepolia_native_balance } = useNativeBalance('ethereum-test-sepolia');
    const { data: bsc_native_balance } = useNativeBalance('bsc');
    const { data: bsc_test_native_balance } = useNativeBalance('bsc-test');
    const { data: polygon_native_balance } = useNativeBalance('polygon');
    const { data: polygon_test_amoy_native_balance } = useNativeBalance('polygon-test-amoy');
    // 3. get token balances
    const [all_ic_balances] = useTokenBalanceIcByRefreshing(current_identity?.address.ic?.owner, canisters, 15000);
    const { balances: ethereum_balances } = useERC20Balances(
        'ethereum',
        current_identity?.address.ethereum?.address,
        tokens_by_chain.ethereum.filter((t) => !t.info.ethereum.standards.includes(EthereumTokenStandard.NATIVE)),
    );
    const { balances: ethereum_test_sepolia_balances } = useERC20Balances(
        'ethereum-test-sepolia',
        current_identity?.address.ethereum_test_sepolia?.address,
        tokens_by_chain.ethereum_test_sepolia.filter(
            (t) => !t.info.ethereum_test_sepolia.standards.includes(EthereumTestSepoliaTokenStandard.NATIVE),
        ),
    );
    const { balances: bsc_balances } = useERC20Balances(
        'bsc',
        current_identity?.address.bsc?.address,
        tokens_by_chain.bsc.filter((t) => !t.info.bsc.standards.includes(BscTokenStandard.NATIVE)),
    );
    const { balances: bsc_test_balances } = useERC20Balances(
        'bsc-test',
        current_identity?.address.bsc_test?.address,
        tokens_by_chain.bsc_test.filter((t) => !t.info.bsc_test.standards.includes(BscTestTokenStandard.NATIVE)),
    );
    const { balances: polygon_balances } = useERC20Balances(
        'polygon',
        current_identity?.address.polygon?.address,
        tokens_by_chain.polygon.filter((t) => !t.info.polygon.standards.includes(PolygonTokenStandard.NATIVE)),
    );
    const { balances: polygon_test_amoy_balances } = useERC20Balances(
        'polygon-test-amoy',
        current_identity?.address.polygon_test_amoy?.address,
        tokens_by_chain.polygon_test_amoy.filter(
            (t) => !t.info.polygon_test_amoy.standards.includes(PolygonTestAmoyTokenStandard.NATIVE),
        ),
    );
    const token_prices = useTokenPrices(show_tokens, tokens_by_chain);
    const { tokens_info, all_usd, all_usd_changed, all_usd_changed_24h } = useMemo(() => {
        const tokens_info: CurrentTokenShowInfo[] = [];
        let all_usd = BigNumber(0);
        let all_usd_now = BigNumber(0);
        let all_usd_24h_ago = BigNumber(0);
        for (const token of show_tokens) {
            const unique_id = get_token_unique_id(token);
            const info = match_combined_token_info<CurrentTokenShowInfo | undefined>(token.info, {
                ic: (ic) => {
                    const balance = all_ic_balances[ic.canister_id];
                    const decimals = ic.decimals;
                    const token_price = token_prices[unique_id];
                    const { price, price_change_24h } = token_price;
                    const formatted_balance = balance
                        ? BigNumber(balance).div(BigNumber(10).pow(decimals)).toFormat(2)
                        : undefined;
                    const usd_value = price
                        ? BigNumber(balance).times(BigNumber(price)).div(BigNumber(10).pow(decimals))
                        : undefined;
                    if (usd_value && price) {
                        all_usd = all_usd.plus(usd_value);
                        if (price_change_24h) {
                            all_usd_now = all_usd_now.plus(usd_value);
                            const old_price = BigNumber(price).div(
                                BigNumber(1).plus(BigNumber(price_change_24h).div(BigNumber(100))),
                            );
                            const old_usd_value = BigNumber(balance)
                                .times(BigNumber(old_price))
                                .div(BigNumber(10).pow(decimals));
                            all_usd_24h_ago = all_usd_24h_ago.plus(old_usd_value);
                        }
                    }

                    return {
                        token,
                        price: token_price,
                        balance: {
                            raw: balance,
                            formatted: formatted_balance,
                        },
                        usd_value: {
                            raw: usd_value?.toString(),
                            formatted: usd_value?.toFormat(2),
                        },
                    };
                },
                ethereum: (ethereum) => {
                    const is_native = ethereum.standards.includes(EthereumTokenStandard.NATIVE);
                    const balance = is_native ? ethereum_native_balance : ethereum_balances[unique_id];
                    const decimals = ethereum.decimals;
                    const token_price = token_prices[unique_id];
                    const { price, price_change_24h } = token_price;
                    const formatted_balance = balance
                        ? BigNumber(balance).div(BigNumber(10).pow(decimals)).toFormat(2)
                        : undefined;
                    const usd_value =
                        price && balance
                            ? BigNumber(balance).times(BigNumber(price)).div(BigNumber(10).pow(decimals))
                            : undefined;
                    if (usd_value && price && balance) {
                        all_usd = all_usd.plus(usd_value);
                        if (price_change_24h) {
                            all_usd_now = all_usd_now.plus(usd_value);
                            const old_price = BigNumber(price).div(
                                BigNumber(1).plus(BigNumber(price_change_24h).div(BigNumber(100))),
                            );
                            const old_usd_value = BigNumber(balance)
                                .times(BigNumber(old_price))
                                .div(BigNumber(10).pow(decimals));
                            all_usd_24h_ago = all_usd_24h_ago.plus(old_usd_value);
                        }
                    }
                    return {
                        token,
                        price: token_prices[unique_id],
                        balance: {
                            raw: balance,
                            formatted: formatted_balance,
                        },
                        usd_value: {
                            raw: usd_value?.toString(),
                            formatted: usd_value?.toFormat(2),
                        },
                    };
                },
                ethereum_test_sepolia: (ethereum_test_sepolia) => {
                    const is_native = ethereum_test_sepolia.standards.includes(EthereumTestSepoliaTokenStandard.NATIVE);
                    const balance = is_native
                        ? ethereum_test_sepolia_native_balance
                        : ethereum_test_sepolia_balances[unique_id];
                    const decimals = ethereum_test_sepolia.decimals;
                    return {
                        token,
                        price: {
                            price: '0',
                            price_change_24h: '0',
                        },
                        balance: {
                            raw: balance,
                            formatted: balance
                                ? BigNumber(balance).div(BigNumber(10).pow(decimals)).toFormat(2)
                                : undefined,
                        },
                        usd_value: {
                            raw: '0',
                            formatted: '0',
                        },
                    };
                },
                polygon: (polygon) => {
                    const is_native = polygon.standards.includes(PolygonTokenStandard.NATIVE);
                    const balance = is_native ? polygon_native_balance : polygon_balances[unique_id];
                    const decimals = polygon.decimals;
                    const token_price = token_prices[unique_id];
                    const { price, price_change_24h } = token_price;
                    const formatted_balance = balance
                        ? BigNumber(balance).div(BigNumber(10).pow(decimals)).toFormat(2)
                        : undefined;
                    const usd_value =
                        price && balance
                            ? BigNumber(balance).times(BigNumber(price)).div(BigNumber(10).pow(decimals))
                            : undefined;
                    if (usd_value && price && balance) {
                        all_usd = all_usd.plus(usd_value);
                        if (price_change_24h) {
                            all_usd_now = all_usd_now.plus(usd_value);
                            const old_price = BigNumber(price).div(
                                BigNumber(1).plus(BigNumber(price_change_24h).div(BigNumber(100))),
                            );
                            const old_usd_value = BigNumber(balance)
                                .times(BigNumber(old_price))
                                .div(BigNumber(10).pow(decimals));
                            all_usd_24h_ago = all_usd_24h_ago.plus(old_usd_value);
                        }
                    }
                    return {
                        token,
                        price: token_prices[unique_id],
                        balance: {
                            raw: balance,
                            formatted: formatted_balance,
                        },
                        usd_value: {
                            raw: usd_value?.toString(),
                            formatted: usd_value?.toFormat(2),
                        },
                    };
                },
                polygon_test_amoy: (polygon_test_amoy) => {
                    const is_native = polygon_test_amoy.standards.includes(PolygonTestAmoyTokenStandard.NATIVE);
                    const balance = is_native
                        ? polygon_test_amoy_native_balance
                        : polygon_test_amoy_balances[unique_id];
                    const decimals = polygon_test_amoy.decimals;
                    const formatted_balance = balance
                        ? BigNumber(balance).div(BigNumber(10).pow(decimals)).toFormat(2)
                        : undefined;
                    return {
                        token,
                        price: {
                            price: '0',
                            price_change_24h: '0',
                        },
                        balance: {
                            raw: balance,
                            formatted: formatted_balance,
                        },
                        usd_value: {
                            raw: '0',
                            formatted: '0',
                        },
                    };
                },
                bsc: (bsc) => {
                    const is_native = bsc.standards.includes(BscTokenStandard.NATIVE);
                    const balance = is_native ? bsc_native_balance : bsc_balances[unique_id];
                    const decimals = bsc.decimals;
                    const token_price = token_prices[unique_id];
                    const { price, price_change_24h } = token_price;
                    const formatted_balance = balance
                        ? BigNumber(balance).div(BigNumber(10).pow(decimals)).toFormat(2)
                        : undefined;
                    const usd_value =
                        price && balance
                            ? BigNumber(balance).times(BigNumber(price)).div(BigNumber(10).pow(decimals))
                            : undefined;
                    if (usd_value && price && balance) {
                        all_usd = all_usd.plus(usd_value);
                        if (price_change_24h) {
                            all_usd_now = all_usd_now.plus(usd_value);
                            const old_price = BigNumber(price).div(
                                BigNumber(1).plus(BigNumber(price_change_24h).div(BigNumber(100))),
                            );
                            const old_usd_value = BigNumber(balance)
                                .times(BigNumber(old_price))
                                .div(BigNumber(10).pow(decimals));
                            all_usd_24h_ago = all_usd_24h_ago.plus(old_usd_value);
                        }
                    }
                    return {
                        token,
                        price: token_prices[unique_id],
                        balance: {
                            raw: balance,
                            formatted: formatted_balance,
                        },
                        usd_value: {
                            raw: usd_value?.toString(),
                            formatted: usd_value?.toFormat(2),
                        },
                    };
                },
                bsc_test: (bsc_test) => {
                    const is_native = bsc_test.standards.includes(BscTestTokenStandard.NATIVE);
                    const balance = is_native ? bsc_test_native_balance : bsc_test_balances[unique_id];
                    const decimals = bsc_test.decimals;
                    const formatted_balance = balance
                        ? BigNumber(balance).div(BigNumber(10).pow(decimals)).toFormat(2)
                        : undefined;
                    return {
                        token,
                        price: {
                            price: '0',
                            price_change_24h: '0',
                        },
                        balance: {
                            raw: balance,
                            formatted: formatted_balance,
                        },
                        usd_value: {
                            raw: '0',
                            formatted: '0',
                        },
                    };
                },
            });
            if (info !== undefined) tokens_info.push(info);
        }
        return {
            tokens_info,
            all_usd,
            all_usd_changed: all_usd_now.minus(all_usd_24h_ago),
            all_usd_changed_24h: all_usd_24h_ago.gt(BigNumber(0))
                ? all_usd_now.times(BigNumber(100)).div(all_usd_24h_ago).minus(BigNumber(100))
                : BigNumber(0),
        };
    }, [
        show_tokens,
        all_ic_balances,
        ethereum_balances,
        ethereum_test_sepolia_balances,
        bsc_balances,
        polygon_balances,
        polygon_test_amoy_balances,
        token_prices,
    ]);
    return {
        tokens_info,
        all_usd,
        all_usd_changed,
        all_usd_changed_24h,
    };
};
