import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import type { Address } from 'viem';

import {
    getErc20TokenPrice,
    getMultipleErc20TokenPrices,
    getWalletErc20TransactionsHistory,
    getWalletNativeTransactionsHistory,
    type GetErc20TransactionsHistoryArgs,
    type GetTransactionsHistoryArgs,
} from '~apis/evm';
import { useEvmChainIdentityNetworkByChain } from '~hooks/evm/viem';
import type { EvmChain } from '~types/chain';
import { get_identity_network_key } from '~types/network';

export interface TransactionsHistoryInfiniteArgs extends Omit<GetTransactionsHistoryArgs, 'cursor' | 'address'> {
    chain: EvmChain;
    initialCursor?: string;
}

export interface Erc20TransactionsHistoryInfiniteArgs
    extends Omit<GetErc20TransactionsHistoryArgs, 'cursor' | 'address'> {
    chain: EvmChain;
    initialCursor?: string;
}

export const useWalletNativeTransactionsHistory = (args: TransactionsHistoryInfiniteArgs) => {
    const identity_network = useEvmChainIdentityNetworkByChain(args.chain);
    const identity_key = identity_network && get_identity_network_key(identity_network);
    const address = identity_network?.address;
    const { limit, initialCursor = '' } = args;
    const chainId = identity_network?.network.chain_id;
    const enabled = !!identity_key && !!chainId && !!address;
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
    const enabled = !!identity_key && !!chainId && !!address;
    const queryKey = identity_key ? [identity_key, 'infinite_erc20_transfers', address, limit] : [];
    return useInfiniteQuery({
        queryKey,
        queryFn: async ({ pageParam = initialCursor }) => {
            if (!chainId || !address) {
                throw new Error('Chain ID or address is not set');
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
export const useTokenPrice = (args: { address: Address; chain: EvmChain }, options = {}) => {
    const identity_network = useEvmChainIdentityNetworkByChain(args.chain);
    const identity_key = identity_network && get_identity_network_key(identity_network);
    const address = args?.address;
    const chainId = identity_network?.network.chain_id;
    const enabled = !!identity_key && !!chainId && !!address;
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
        queryKey: [identity_key, 'multiple_token_prices', addresses],
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
