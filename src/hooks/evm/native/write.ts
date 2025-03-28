import { useMutation } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { Address } from 'viem';

import { useCurrentIdentity, useEvmWalletClientCreator } from '~hooks/store/local-secure';
import type { EvmChain } from '~types/chain';
import { get_identity_network_key } from '~types/network';

import { useEvmChainIdentityNetworkByChain } from '../viem';

export const useNativeTransfer = (chain: EvmChain) => {
    const { current_identity_network } = useCurrentIdentity();
    const enabled = !!current_identity_network;
    const create_wallet_client = useEvmWalletClientCreator(chain);
    const identity_network = useEvmChainIdentityNetworkByChain(chain);
    const identity_key = identity_network && get_identity_network_key(identity_network);
    const mutationKey = useMemo(() => {
        if (!identity_key) return [];
        return [identity_key, 'native', 'transfer'];
    }, [identity_key]);
    return useMutation({
        mutationKey,
        mutationFn: async (args: {
            to: Address;
            amount: bigint;
            data?: `0x${string}`;
            maxFeePerGas?: bigint;
            maxPriorityFeePerGas?: bigint;
            gas?: bigint;
        }) => {
            if (!enabled) throw new Error('evm chain is required');
            let walletClient = create_wallet_client();
            if (!walletClient) throw new Error('wallet client is required');
            const tx = await walletClient.sendTransaction(args);
            walletClient = undefined;
            return tx;
        },
    });
};
