import { useQuery } from '@tanstack/react-query';
import { encodeFunctionData, erc20Abi, type Address } from 'viem';

import { useWriteContract } from '~hooks/evm/contracts';
import { useEvmChainIdentityNetworkByChain, usePublicClientByChain } from '~hooks/evm/viem';
import { useCurrentIdentity } from '~hooks/store/local-secure';
import type { EvmChain } from '~types/chain';
import { get_identity_network_key } from '~types/network';

/**
 * Hook for ERC20 token transfer
 * @returns Mutation hook for ERC20 transfer function
 */
export function useERC20Transfer(chain: EvmChain) {
    const { mutateAsync, isPending, isError, isSuccess, error, data } = useWriteContract<
        typeof erc20Abi,
        'transfer',
        [to: Address, amount: bigint]
    >(chain);

    /**
     * Transfer ERC20 tokens to a recipient
     * @param tokenAddress The ERC20 token contract address
     * @param to Recipient address
     * @param amount Amount to transfer (in smallest unit, e.g. wei)
     */
    const transfer = (args: {
        tokenAddress: Address;
        to: Address;
        amount: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
        gasLimit?: bigint;
    }) => {
        const { tokenAddress, to, amount, gasLimit, maxFeePerGas, maxPriorityFeePerGas } = args;
        return mutateAsync({
            address: tokenAddress,
            abi: erc20Abi,
            functionName: 'transfer',
            args: [to, amount],
            gas: gasLimit,
            maxPriorityFeePerGas,
            maxFeePerGas,
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
export function useERC20Approve(chain: EvmChain) {
    const { mutate, isPending, isError, isSuccess, error, data } = useWriteContract<
        typeof erc20Abi,
        'approve',
        [spender: Address, amount: bigint]
    >(chain);

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

export const useEstimateErc20TransferGasFee = (
    chain: EvmChain,
    args: {
        tokenAddress?: Address;
        to?: Address;
        amount?: bigint;
    },
    options?: {
        enabled?: boolean;
    },
) => {
    const publicClient = usePublicClientByChain(chain);
    const identity_network = useEvmChainIdentityNetworkByChain(chain);
    const identity_key = identity_network && get_identity_network_key(identity_network);
    const { tokenAddress, to, amount } = args;
    const fetchGasFee = async () => {
        if (!tokenAddress || !to || amount === undefined) {
            return undefined;
        }
        const gasLimit = await publicClient.estimateGas({
            account: identity_network?.address,
            to: tokenAddress,
            data: encodeFunctionData({
                abi: erc20Abi,
                functionName: 'transfer',
                args: [to, amount],
            }),
        });

        const eip1559 = await publicClient.estimateFeesPerGas();
        const worse_case_gas_price = eip1559.maxFeePerGas;
        const bufferedGasLimit = (gasLimit * 120n) / 100n;
        const estimatedFee = bufferedGasLimit * worse_case_gas_price;

        return { gasLimit: bufferedGasLimit, eip1559, estimatedFee };
    };
    const enabled =
        !!publicClient &&
        !!identity_key &&
        !!tokenAddress &&
        !!(!options || options?.enabled) &&
        !!to &&
        amount !== undefined;
    return useQuery({
        queryKey: [identity_key, 'estimate_erc20_transfer_gas_fee', tokenAddress, to],
        queryFn: fetchGasFee,
        enabled,
        refetchInterval: 10_000,
    });
};
