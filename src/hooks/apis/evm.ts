import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import type { Address } from 'viem';

import {
    getErc20TokenPrice,
    getMultipleErc20TokenPrices,
    getSuggestedGasFees,
    getTokenDetail,
    getWalletErc20TransactionsHistory,
    getWalletNativeTransactionsHistory,
    type GetErc20TransactionsHistoryArgs,
    type GetTransactionsHistoryArgs,
} from '~apis/evm';
import { SHOULD_DEHYDRATE_QUERY_KEY, useEvmChainIdentityNetworkByChain } from '~hooks/evm/viem';
import type { EvmChain } from '~types/chain';
import { get_identity_network_key } from '~types/network';

export interface TransactionsHistoryInfiniteArgs extends Omit<GetTransactionsHistoryArgs, 'cursor' | 'address'> {
    chain: EvmChain;
    enabled?: boolean;
    initialCursor?: string;
}

export interface Erc20TransactionsHistoryInfiniteArgs
    extends Omit<GetErc20TransactionsHistoryArgs, 'cursor' | 'address'> {
    chain: EvmChain;
    enabled?: boolean;
    initialCursor?: string;
    contractAddresses?: Address[];
}

export const useWalletNativeTransactionsHistory = (args: TransactionsHistoryInfiniteArgs) => {
    const identity_network = useEvmChainIdentityNetworkByChain(args.chain);
    const identity_key = identity_network && get_identity_network_key(identity_network);
    const address = identity_network?.address;
    const { limit, initialCursor = '' } = args;
    const chainId = identity_network?.network.chain_id;
    const enabled = !!identity_key && !!chainId && !!address && args.enabled;
    const queryKey = identity_key ? [identity_key, 'infinite_transactions_history', address, limit] : [];
    return useInfiniteQuery({
        queryKey,
        queryFn: async ({ pageParam = initialCursor }) => {
            if (!chainId || !address) {
                throw new Error('Chain ID or address is not set');
            }
            return getWalletNativeTransactionsHistory(chainId, {
                address,
                limit,
                cursor: pageParam, // Use cursor as pagination parameter
            });
        },
        initialPageParam: initialCursor,
        // Use returned cursor as parameter for next page
        getNextPageParam: (lastPage) => {
            return lastPage.cursor || undefined;
        },
        // No need for getPreviousPageParam with cursor pagination
        maxPages: 100,
        enabled,
    });
};

export const useWalletErc20TransactionsHistory = (args: Erc20TransactionsHistoryInfiniteArgs) => {
    const identity_network = useEvmChainIdentityNetworkByChain(args.chain);
    const identity_key = identity_network && get_identity_network_key(identity_network);
    const address = identity_network?.address;
    const { limit, initialCursor = '', contractAddresses } = args;
    const chainId = identity_network?.network.chain_id;
    const enabled = !!identity_key && !!chainId && !!address && args.enabled;
    const queryKey = identity_key ? [identity_key, 'infinite_erc20_transfers', address, limit] : [];
    return useInfiniteQuery({
        queryKey,
        queryFn: async ({ pageParam = initialCursor }) => {
            if (!chainId || !address) {
                throw new Error('Chain ID or address is not set');
            }
            if (!contractAddresses) {
                throw new Error('Contract addresses are not set');
            }
            return getWalletErc20TransactionsHistory(chainId, {
                address,
                limit,
                cursor: pageParam,
                contractAddresses,
            });
        },
        initialPageParam: initialCursor,
        getNextPageParam: (lastPage) => {
            return lastPage.cursor || undefined;
        },
        maxPages: 100,
        enabled,
    });
};

/**
 * Hook to fetch single token price
 * @param address - Token contract address
 * @param options - Query options (enabled, refetchInterval, etc.)
 */
export const useTokenPrice = (args: { address: Address; chain: EvmChain; enabled?: boolean }, options = {}) => {
    const identity_network = useEvmChainIdentityNetworkByChain(args.chain);
    const identity_key = identity_network && get_identity_network_key(identity_network);
    const address = args?.address;
    const chainId = identity_network?.network.chain_id;
    const enabled = !!identity_key && !!chainId && !!address && args.enabled;
    return useQuery({
        queryKey: [identity_key, 'token_price', address],
        queryFn: () => {
            if (!chainId || !address) throw new Error('Chain ID or address is not set');
            return getErc20TokenPrice(chainId, address);
        },
        enabled,
        ...options,
    });
};

/**
 * Hook to fetch multiple token prices
 * @param addresses - Array of token contract addresses
 * @param options - Query options (enabled, refetchInterval, etc.)
 */
export const useMultipleTokenPrices = (args: { addresses: Address[]; chain: EvmChain }, options = {}) => {
    const identity_network = useEvmChainIdentityNetworkByChain(args.chain);
    const identity_key = identity_network && get_identity_network_key(identity_network);
    const addresses = args?.addresses;
    const chainId = identity_network?.network.chain_id;
    const enabled = !!identity_key && !!chainId && !!addresses;

    return useQuery({
        queryKey: [identity_key, 'multiple_token_prices', addresses, SHOULD_DEHYDRATE_QUERY_KEY],
        queryFn: () => {
            if (!chainId) throw new Error('Chain ID is not set');
            return getMultipleErc20TokenPrices(
                chainId,
                addresses.map((addr) => ({ tokenAddress: addr })),
            );
        },
        enabled,
        ...options,
    });
};

export const useTokenDetail = (args: { address: Address; chain: EvmChain; isNative?: boolean }, options = {}) => {
    const identity_network = useEvmChainIdentityNetworkByChain(args.chain);
    const identity_key = identity_network && get_identity_network_key(identity_network);
    const { address, isNative = false, chain } = args;
    const chainId = identity_network?.network.chain_id;
    const enabled = !!identity_key && !!chainId && !!address;
    return useQuery({
        queryKey: [identity_key, 'token_detail', chain, address, isNative, SHOULD_DEHYDRATE_QUERY_KEY],
        queryFn: async () => {
            if (!chainId) throw new Error('Chain ID is not set');
            const data = await getTokenDetail(chainId, address, isNative);
            let fully_diluted_market_cap;
            // if max_supply is set, use max_supply to calculate fully_diluted_market_cap
            if (data?.market_data?.max_supply) {
                fully_diluted_market_cap = data?.market_data?.current_price?.usd * data?.market_data?.max_supply;
            } else {
                // if max_supply is not set, use total_supply to calculate fully_diluted_market_cap
                fully_diluted_market_cap =
                    (data?.market_data?.current_price?.usd ?? 0) * (data?.market_data?.total_supply ?? 0);
            }
            const has_twitter = data?.links?.twitter_screen_name && data?.links?.twitter_screen_name !== '';
            const has_telegram =
                data?.links?.telegram_channel_identifier && data?.links?.telegram_channel_identifier !== '';
            return {
                description: data?.description?.en,
                links: {
                    website: data?.links?.homepage[0],
                    twitter: has_twitter ? `https://x.com/${data?.links?.twitter_screen_name}` : undefined,
                    telegram: has_telegram ? `https://t.me/${data?.links?.telegram_channel_identifier}` : undefined,
                },
                market_cap: data?.market_data?.market_cap?.usd,
                total_supply: data?.market_data?.total_supply,
                circulating_supply: data?.market_data?.circulating_supply,
                fully_diluted_market_cap,
            };
        },
        enabled,
        staleTime: Infinity,
        ...options,
    });
};

export const useSuggestedGasFees = (chain: EvmChain) => {
    const identity_network = useEvmChainIdentityNetworkByChain(chain);
    const identity_key = identity_network && get_identity_network_key(identity_network);
    const chainId = identity_network?.network.chain_id;
    const enabled = !!identity_key && !!chainId;
    return useQuery({
        queryKey: [identity_key, 'suggested_gas_fees', chainId],
        queryFn: () => {
            if (!chainId) throw new Error('Chain ID is not set');
            return getSuggestedGasFees(chainId);
        },
        enabled,
    });
};
