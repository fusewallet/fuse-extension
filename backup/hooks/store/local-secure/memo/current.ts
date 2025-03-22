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

export const get_current_identity_network = (address: IdentityAddress, current_chain_network: CurrentChainNetwork) => {
    const current_identity_network: CurrentIdentityNetwork = {
        ic: address.ic ? { chain: 'ic', owner: address.ic.owner, network: current_chain_network.ic } : undefined,
        ethereum: address.ethereum
            ? { chain: 'ethereum', address: address.ethereum.address, network: current_chain_network.ethereum }
            : undefined,
        ethereum_test_sepolia: address.ethereum_test_sepolia
            ? {
                  chain: 'ethereum-test-sepolia',
                  address: address.ethereum_test_sepolia.address,
                  network: current_chain_network.ethereum_test_sepolia,
              }
            : undefined,
        polygon: address.polygon
            ? {
                  chain: 'polygon',
                  address: address.polygon.address,
                  network: current_chain_network.polygon,
              }
            : undefined,
        polygon_test_amoy: address.polygon_test_amoy
            ? {
                  chain: 'polygon-test-amoy',
                  address: address.polygon_test_amoy.address,
                  network: current_chain_network.polygon_test_amoy,
              }
            : undefined,
        bsc: address.bsc
            ? {
                  chain: 'bsc',
                  address: address.bsc.address,
                  network: current_chain_network.bsc,
              }
            : undefined,
        bsc_test: address.bsc_test
            ? {
                  chain: 'bsc-test',
                  address: address.bsc_test.address,
                  network: current_chain_network.bsc_test,
              }
            : undefined,
    };
    return current_identity_network;
};
