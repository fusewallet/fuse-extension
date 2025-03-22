import type { UseQueryOptions } from '@tanstack/react-query';
import type { Address, ContractFunctionArgs, ContractFunctionName } from 'viem';

import { useReadContract } from '~/hooks/evm/contracts';
import { wrappedABI } from '~lib/abis/wrapped';
import type { EvmChain } from '~types/chain';

export function useWrappedReadContract<TFunctionName extends ContractFunctionName<typeof wrappedABI, 'view'>>(
    chain: EvmChain,
    address: Address,
    functionName: TFunctionName,
    args?: ContractFunctionArgs<typeof wrappedABI, 'pure' | 'view', TFunctionName>,
    queryOptions?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>,
) {
    return useReadContract<typeof wrappedABI, TFunctionName>({
        chain,
        address,
        abi: wrappedABI,
        functionName,
        args,
        queryOptions: {
            ...queryOptions,
            enabled: !!address && queryOptions?.enabled !== false,
        },
    });
}

export function useWrappedReadContractBalanceOf(
    chain: EvmChain,
    address: Address,
    args: ContractFunctionArgs<typeof wrappedABI, 'view', 'balanceOf'>,
    queryOptions?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>,
) {
    return useWrappedReadContract<'balanceOf'>(chain, address, 'balanceOf', args, queryOptions);
}

// Query allowance amount
export function useWrappedReadContractAllowance(
    chain: EvmChain,
    address: Address,
    args: ContractFunctionArgs<typeof wrappedABI, 'view', 'allowance'>,
    queryOptions?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>,
) {
    return useWrappedReadContract<'allowance'>(chain, address, 'allowance', args, queryOptions);
}

// Query total supply
export function useWrappedReadContractTotalSupply(
    chain: EvmChain,
    address: Address,
    queryOptions?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>,
) {
    return useWrappedReadContract<'totalSupply'>(chain, address, 'totalSupply', undefined, queryOptions);
}

// Query token name
export function useWrappedReadContractName(
    chain: EvmChain,
    address: Address,
    queryOptions?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>,
) {
    return useWrappedReadContract<'name'>(chain, address, 'name', undefined, queryOptions);
}

// Query token symbol
export function useWrappedReadContractSymbol(
    chain: EvmChain,
    address: Address,
    queryOptions?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>,
) {
    return useWrappedReadContract<'symbol'>(chain, address, 'symbol', undefined, queryOptions);
}

// Query token decimals
export function useWrappedReadContractDecimals(
    chain: EvmChain,
    address: Address,
    queryOptions?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>,
) {
    return useWrappedReadContract<'decimals'>(chain, address, 'decimals', undefined, queryOptions);
}
