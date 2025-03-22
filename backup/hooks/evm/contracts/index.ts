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

import { useEvmWalletClientCreator } from '~hooks/store/local-secure';
import type { EvmChain } from '~types/chain';
import { get_identity_network_key } from '~types/network';

import { useEvmChainIdentityNetworkByChain, usePublicClientByChain } from '../viem';

export interface UseReadContractConfig<
    TAbi extends Abi | readonly unknown[],
    TFunctionName extends ContractFunctionName<TAbi, 'pure' | 'view'>,
> {
    chain: EvmChain;
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
    const { chain, address, abi, functionName, args, queryOptions } = config;
    const client = usePublicClientByChain(chain);
    const identity_network = useEvmChainIdentityNetworkByChain(chain);
    const identity_key = identity_network && get_identity_network_key(identity_network);
    const queryKey = identity_key ? [identity_key, 'contract', address, functionName, args] : [];
    const enabled = !!client && !!(!queryOptions || queryOptions.enabled);
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
>(
    chain: EvmChain,
) => {
    const create_wallet_client = useEvmWalletClientCreator(chain);
    const identity_network = useEvmChainIdentityNetworkByChain(chain);
    const identity_key = identity_network && get_identity_network_key(identity_network);
    const mutationKey = useMemo(() => {
        if (!identity_key) return [];
        return [identity_key, 'contract', 'write'];
    }, [identity_key]);

    return useMutation({
        mutationKey,
        mutationFn: async (
            params: WriteContractParameters<TAbi, TFunctionName, TArgs, Chain, Account, TChainOverride>,
        ) => {
            const client = create_wallet_client();
            if (!client) throw new Error('Client is required');
            return client.writeContract(params);
        },
    });
};
