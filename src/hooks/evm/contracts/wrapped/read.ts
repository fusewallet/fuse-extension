import type { UseQueryOptions } from '@tanstack/react-query';
import type { ContractFunctionArgs, ContractFunctionName } from 'viem';

import { useReadContract } from '~/hooks/evm/contracts';
import { wrappedABI } from '~/lib/abis/wrapped';

export function useWrappedReadContract<TFunctionName extends ContractFunctionName<typeof wrappedABI, 'view'>>(
    address: `0x${string}`,
    functionName: TFunctionName,
    args?: ContractFunctionArgs<typeof wrappedABI, 'pure' | 'view', TFunctionName>,
    queryOptions?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>,
) {
    return useReadContract<typeof wrappedABI, TFunctionName>({
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
    address: `0x${string}`,
    args: ContractFunctionArgs<typeof wrappedABI, 'view', 'balanceOf'>,
    queryOptions?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>,
) {
    return useWrappedReadContract<'balanceOf'>(address, 'balanceOf', args, queryOptions);
}

// Query allowance amount
export function useWrappedReadContractAllowance(
    address: `0x${string}`,
    args: ContractFunctionArgs<typeof wrappedABI, 'view', 'allowance'>,
    queryOptions?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>,
) {
    return useWrappedReadContract<'allowance'>(address, 'allowance', args, queryOptions);
}

// Query total supply
export function useWrappedReadContractTotalSupply(
    address: `0x${string}`,
    queryOptions?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>,
) {
    return useWrappedReadContract<'totalSupply'>(address, 'totalSupply', undefined, queryOptions);
}

// Query token name
export function useWrappedReadContractName(
    address: `0x${string}`,
    queryOptions?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>,
) {
    return useWrappedReadContract<'name'>(address, 'name', undefined, queryOptions);
}

// Query token symbol
export function useWrappedReadContractSymbol(
    address: `0x${string}`,
    queryOptions?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>,
) {
    return useWrappedReadContract<'symbol'>(address, 'symbol', undefined, queryOptions);
}

// Query token decimals
export function useWrappedReadContractDecimals(
    address: `0x${string}`,
    queryOptions?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>,
) {
    return useWrappedReadContract<'decimals'>(address, 'decimals', undefined, queryOptions);
}
