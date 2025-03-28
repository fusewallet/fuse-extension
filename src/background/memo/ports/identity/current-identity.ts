import type { ResponseBody } from '~background/ports/direct/current-identity';
import { $bgsw_agent_refresh_unique_identity } from '~background/store/agent';
import { $bgsw_current_chain_network } from '~background/store/secure/current/current_chain_networks';
import { $bgsw_get_key_rings } from '~background/store/secure/key_rings';
import { $bgsw_get_password } from '~background/store/session/password';
import { type IdentityAddress } from '~types/identity';
import type { CurrentChainNetwork, CurrentIdentityNetwork } from '~types/network';

import { inner_show_identity_key } from './show-identity-list';

export const $bgsw_current_identity = async (): Promise<ResponseBody | undefined> => {
    const password = await $bgsw_get_password();
    if (!password) return undefined;

    const key_rings = await $bgsw_get_key_rings();
    if (!key_rings) return undefined;

    const { get: get_current_chain_network } = $bgsw_current_chain_network(key_rings.current);
    const current_chain_network = await get_current_chain_network();
    if (!current_chain_network) return undefined;

    const current = key_rings.keys.find((i) => i.id === key_rings.current);
    if (!current) return { current_identity: undefined, current_chain_network, current_identity_network: undefined };

    // ! refresh agent
    $bgsw_agent_refresh_unique_identity(current, current_chain_network); // * refresh identity

    const address = current.address;
    return {
        current_identity: inner_show_identity_key(key_rings, current),
        current_chain_network,
        current_identity_network: get_current_identity_network(address, current_chain_network),
    };
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
