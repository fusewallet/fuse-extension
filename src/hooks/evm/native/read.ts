import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useCurrentIdentity } from '~hooks/store/local-secure';

import { SHOULD_DEHYDRATE_QUERY_KEY, useCurrentChainID, useCurrentPublicClient } from '../viem';

// evm native balance
export const useNativeBalance = () => {
    const client = useCurrentPublicClient();
    const { current_identity_network } = useCurrentIdentity();
    const chain_id = useCurrentChainID();
    const enabled = !!client && !!current_identity_network;
    const queryKey = useMemo(() => {
        if (!enabled) return [];
        return [
            `evm_${chain_id}`,
            'native',
            current_identity_network.evm.address,
            'balance',
            SHOULD_DEHYDRATE_QUERY_KEY,
        ];
    }, [chain_id, current_identity_network, enabled]);
    return useQuery({
        queryKey,
        queryFn: async () => {
            if (!client) throw new Error('Client is required');
            if (!current_identity_network || !current_identity_network.evm) throw new Error('evm chain is required');
            const balance = await client.getBalance({ address: current_identity_network.evm.address });
            return balance;
        },
        enabled,
        refetchInterval: 10000,
    });
};
