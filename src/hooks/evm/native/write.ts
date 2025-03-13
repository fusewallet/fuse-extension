import { useMutation } from '@tanstack/react-query';
import { useMemo } from 'react';

import { get_unique_evm_wallet_client } from '~hooks/store/agent';
import { useCurrentIdentity } from '~hooks/store/local-secure';

import { useCurrentChainID } from '../viem';

export const useNativeTransfer = () => {
    const { current_identity_network } = useCurrentIdentity();
    const enabled = !!current_identity_network;
    const chainId = useCurrentChainID();
    const mutationKey = useMemo(() => {
        if (!enabled) return [];
        return [`evm_${chainId}`, 'native', 'transfer', `from_${current_identity_network.evm.address}`];
    }, [chainId, current_identity_network, enabled]);
    return useMutation({
        mutationKey,
        mutationFn: async (args: { to: `0x${string}`; amount: bigint }) => {
            if (!enabled) throw new Error('evm chain is required');
            const walletClient = get_unique_evm_wallet_client();
            if (!walletClient) throw new Error('wallet client is required');
            const tx = await walletClient.sendTransaction({
                to: args.to,
                value: args.amount,
            });
            return tx;
        },
    });
};
