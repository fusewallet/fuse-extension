import { useMemo } from 'react';

import { agent_refresh_unique_identity } from '~hooks/store/agent';
import { type IdentityAddress, type KeyRings, type ShowIdentityKey } from '~types/identity';
import type { CurrentChainNetwork, CurrentIdentityNetwork } from '~types/network';

import { inner_show_identity_key } from './identity';

export const useCurrentIdentityBy = (
    key_rings: KeyRings | undefined,
    current_chain_network: CurrentChainNetwork,
): { current_identity: ShowIdentityKey | undefined; current_identity_network: CurrentIdentityNetwork | undefined } => {
    const current = useMemo<{
        current_identity: ShowIdentityKey | undefined;
        current_identity_network: CurrentIdentityNetwork | undefined;
    }>(() => {
        if (!key_rings || !current_chain_network)
            return { current_identity: undefined, current_identity_network: undefined };
        const current = key_rings.keys.find((i) => i.id === key_rings.current);
        if (!current) return { current_identity: undefined, current_identity_network: undefined };

        // ! refresh agent
        agent_refresh_unique_identity(current, current_chain_network); // * refresh identity

        const address = current.address;
        return {
            current_identity: inner_show_identity_key(key_rings, current),
            current_identity_network: get_current_identity_network(address, current_chain_network),
        };
    }, [key_rings, current_chain_network]);

    return current;
};
