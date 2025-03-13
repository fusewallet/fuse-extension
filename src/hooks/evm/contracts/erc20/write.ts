import { erc20Abi, type Address } from 'viem';

import { useWriteContract } from '~hooks/evm/contracts';

/**
 * Hook for ERC20 token transfer
 * @returns Mutation hook for ERC20 transfer function
 */
export function useERC20Transfer() {
    const { mutate, isPending, isError, isSuccess, error, data } = useWriteContract<
        typeof erc20Abi,
        'transfer',
        [to: Address, amount: bigint]
    >();

    /**
     * Transfer ERC20 tokens to a recipient
     * @param tokenAddress The ERC20 token contract address
     * @param to Recipient address
     * @param amount Amount to transfer (in smallest unit, e.g. wei)
     */
    const transfer = (tokenAddress: Address, to: Address, amount: bigint) => {
        return mutate({
            address: tokenAddress,
            abi: erc20Abi,
            functionName: 'transfer',
            args: [to, amount],
        });
    };

    return {
        transfer,
        isPending,
        isError,
        isSuccess,
        error,
        data,
    };
}

/**
 * Hook for ERC20 token approval
 * @returns Mutation hook for ERC20 approve function
 */
export function useERC20Approve() {
    const { mutate, isPending, isError, isSuccess, error, data } = useWriteContract<
        typeof erc20Abi,
        'approve',
        [spender: Address, amount: bigint]
    >();

    /**
     * Approve spender to use tokens
     * @param tokenAddress The ERC20 token contract address
     * @param spender Address to approve
     * @param amount Amount to approve (in smallest unit, e.g. wei)
     */
    const approve = (tokenAddress: Address, spender: Address, amount: bigint) => {
        return mutate({
            address: tokenAddress,
            abi: erc20Abi,
            functionName: 'approve',
            args: [spender, amount],
        });
    };

    return {
        approve,
        isPending,
        isError,
        isSuccess,
        error,
        data,
    };
}
