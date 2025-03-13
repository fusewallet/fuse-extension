import { type UseQueryOptions } from '@tanstack/react-query';
import { erc20Abi, type ContractFunctionArgs, type ContractFunctionName } from 'viem';

import { useReadContract } from '~hooks/evm/contracts';

export function useERC20ReadContract<TFunctionName extends ContractFunctionName<typeof erc20Abi, 'view'>>(
    address: `0x${string}`,
    functionName: TFunctionName,
    args?: ContractFunctionArgs<typeof erc20Abi, 'view', TFunctionName>,
    queryOptions?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>,
) {
    return useReadContract<typeof erc20Abi, TFunctionName>({
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
    address: `0x${string}`,
    args: ContractFunctionArgs<typeof erc20Abi, 'view', 'balanceOf'>,
    queryOptions?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>,
) {
    return useERC20ReadContract<'balanceOf'>(address, 'balanceOf', args, queryOptions);
}

export function useERC20ReadContractAllowance(
    address: `0x${string}`,
    args: ContractFunctionArgs<typeof erc20Abi, 'view', 'allowance'>,
    queryOptions?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>,
) {
    return useERC20ReadContract<'allowance'>(address, 'allowance', args, queryOptions);
}

export function useERC20ReadContractTotalSupply(
    address: `0x${string}`,
    args: ContractFunctionArgs<typeof erc20Abi, 'view', 'totalSupply'>,
    queryOptions?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>,
) {
    return useERC20ReadContract<'totalSupply'>(address, 'totalSupply', args, queryOptions);
}
