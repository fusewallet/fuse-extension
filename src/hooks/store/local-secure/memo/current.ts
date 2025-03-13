import { useMemo } from 'react';

import { agent_refresh_unique_identity, refresh_unique_evm_wallet_client } from '~hooks/store/agent';
import { match_chain } from '~types/chain';
import { type PrivateKeys, type ShowIdentityKey } from '~types/identity';
import type { ChainEvmNetwork, ChainIcNetwork, ChainNetwork, CurrentIdentityNetwork } from '~types/network';

import { inner_show_identity_key } from './identity';

export const useCurrentIdentityBy = (
    private_keys: PrivateKeys | undefined,
): {
    current_identity: ShowIdentityKey | undefined;
    current_identity_network: CurrentIdentityNetwork | undefined;
    current_chain_network: ChainNetwork | undefined;
} => {
    const current = useMemo(() => {
        const current_chain_network = private_keys?.keys.find(
            (i) => i.id === private_keys.current,
        )?.current_chain_network;

        if (!private_keys || !current_chain_network)
            return {
                current_identity: undefined,
                current_identity_network: undefined,
                current_chain_network: undefined,
            };

        const current = private_keys.keys.find((i) => i.id === private_keys.current);

        if (!current)
            return { current_identity: undefined, current_identity_network: undefined, current_chain_network };

        // ! refresh ic agent or evm wallet client
        match_chain(current_chain_network.chain, {
            ic: () => {
                agent_refresh_unique_identity(current, current_chain_network as ChainIcNetwork); // * refresh identity
            },
            evm: () => {
                refresh_unique_evm_wallet_client(current, current_chain_network as ChainEvmNetwork); // * refresh evm wallet client
            },
        });

        return {
            current_identity: inner_show_identity_key(private_keys, current),
            current_identity_network: private_keys.current_identity_network,
            current_chain_network,
        };
    }, [private_keys]);
    return current;
};
