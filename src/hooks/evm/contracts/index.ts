import { useMutation, useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
    type Abi,
    type Account,
    type Address,
    type Chain,
    type ContractFunctionArgs,
    type ContractFunctionName,
    type WriteContractParameters,
} from 'viem';

import { get_unique_evm_wallet_client } from '~hooks/store/agent';

import { useCurrentChainID, useCurrentPublicClient } from '../viem';

export interface UseReadContractConfig<
    TAbi extends Abi | readonly unknown[],
    TFunctionName extends ContractFunctionName<TAbi, 'pure' | 'view'>,
> {
    address: Address;
    abi: TAbi;
    functionName: TFunctionName;
    args?: ContractFunctionArgs<TAbi, 'pure' | 'view', TFunctionName>;
    queryOptions?: Omit<UseQueryOptions, 'queryFn' | 'queryKey'>;
}

export const useReadContract = <
    TAbi extends Abi | readonly unknown[],
    TFunctionName extends ContractFunctionName<TAbi, 'pure' | 'view'>,
>(
    config: UseReadContractConfig<TAbi, TFunctionName>,
) => {
    const { address, abi, functionName, args, queryOptions } = config;
    const client = useCurrentPublicClient();
    const chain_id = useCurrentChainID();
    const queryKey = useMemo(() => {
        if (!chain_id || !client) return [];
        return [`evm_${chain_id}`, 'contract', address, functionName, args];
    }, [address, chain_id, functionName, args, client]);
    const enabled = !!chain_id && !!client && !!(!queryOptions || queryOptions.enabled);
    return useQuery({
        queryKey,
        queryFn: async () => {
            if (!client) throw new Error('Client is required');
            return client.readContract({
                address,
                abi,
                functionName,
                args,
            });
        },
        enabled,
    });
};

export const useWriteContract = <
    TAbi extends Abi | readonly unknown[],
    TFunctionName extends ContractFunctionName<TAbi, 'payable' | 'nonpayable'>,
    TArgs extends ContractFunctionArgs<TAbi, 'payable' | 'nonpayable', TFunctionName>,
    TChainOverride extends Chain | undefined = undefined,
>() => {
    const client = get_unique_evm_wallet_client();
    const chain_id = useCurrentChainID();

    const queryKey = useMemo(() => {
        if (!chain_id || !client) return [];
        return [`evm_${chain_id}`, 'contract'];
    }, [chain_id, client]);

    return useMutation({
        mutationKey: queryKey,
        mutationFn: async (
            params: WriteContractParameters<TAbi, TFunctionName, TArgs, Chain, Account, TChainOverride>,
        ) => {
            if (!client) throw new Error('Client is required');
            return client.writeContract(params);
        },
    });
};
