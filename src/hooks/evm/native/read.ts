import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import type { EvmChain } from '~types/chain';
import { get_identity_network_key } from '~types/network';

import { SHOULD_DEHYDRATE_QUERY_KEY, useEvmChainIdentityNetworkByChain, usePublicClientByChain } from '../viem';

// evm native balance
export const useNativeBalance = (chain: EvmChain, queryOptions?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>) => {
    const client = usePublicClientByChain(chain);
    const identity_network = useEvmChainIdentityNetworkByChain(chain);
    const identity_key = identity_network && get_identity_network_key(identity_network);
    const queryKey = identity_key ? [identity_key, 'native', 'balance', SHOULD_DEHYDRATE_QUERY_KEY] : [];
    const enabled = !!client && !!identity_network && !!(!queryOptions || queryOptions.enabled);
    return useQuery({
        queryKey,
        queryFn: async () => {
            if (!client) throw new Error('Client is required');
            if (!identity_network) throw new Error('evm chain is required');
            const balance = await client.getBalance({ address: identity_network.address });
            return balance.toString();
        },
        enabled,
        refetchInterval: 10000,
    });
};
