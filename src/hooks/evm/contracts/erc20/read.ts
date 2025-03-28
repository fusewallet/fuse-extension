import { type UseQueryOptions } from '@tanstack/react-query';
import { erc20Abi, type Address, type ContractFunctionArgs, type ContractFunctionName } from 'viem';

import type { EvmChain } from '~types/chain';

import { useReadContract } from '..';

export function useERC20ReadContract<TFunctionName extends ContractFunctionName<typeof erc20Abi, 'view'>>(
    chain: EvmChain,
    address: Address,
    functionName: TFunctionName,
    args?: ContractFunctionArgs<typeof erc20Abi, 'view', TFunctionName>,
    queryOptions?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>,
) {
    return useReadContract<typeof erc20Abi, TFunctionName>({
        chain,
        address,
        abi: erc20Abi,
        functionName,
        args,
        queryOptions: {
            ...queryOptions,
            enabled: !!address && queryOptions?.enabled !== false,
        },
    });
}

export function useERC20ReadContractBalanceOf(
    chain: EvmChain,
    address: Address,
    args?: ContractFunctionArgs<typeof erc20Abi, 'view', 'balanceOf'>,
    queryOptions?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>,
) {
    return useERC20ReadContract<'balanceOf'>(chain, address, 'balanceOf', args, queryOptions);
}

export function useERC20ReadContractAllowance(
    chain: EvmChain,
    address: Address,
    args: ContractFunctionArgs<typeof erc20Abi, 'view', 'allowance'>,
    queryOptions?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>,
) {
    return useERC20ReadContract<'allowance'>(chain, address, 'allowance', args, queryOptions);
}

export function useERC20ReadContractTotalSupply(
    chain: EvmChain,
    address: Address,
    args: ContractFunctionArgs<typeof erc20Abi, 'view', 'totalSupply'>,
    queryOptions?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>,
) {
    return useERC20ReadContract<'totalSupply'>(chain, address, 'totalSupply', args, queryOptions);
}
