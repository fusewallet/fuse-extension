import type { Address as EvmAddress } from 'viem';

import { match_chain, type Chain } from '~types/chain';

import { CHAIN_BSC_MAINNET, type ChainBscNetwork } from './bsc';
import { CHAIN_BSC_TEST_MAINNET, type ChainBscTestNetwork } from './bsc-test';
import { CHAIN_ETHEREUM_MAINNET, type ChainEthereumNetwork } from './ethereum';
import { CHAIN_ETHEREUM_TEST_SEPOLIA_MAINNET, type ChainEthereumTestSepoliaNetwork } from './ethereum-test-sepolia';
import { CHAIN_IC_MAINNET, type ChainIcNetwork } from './ic';
import { CHAIN_POLYGON_MAINNET, type ChainPolygonNetwork } from './polygon';
import { CHAIN_POLYGON_TEST_AMOY_MAINNET, type ChainPolygonTestAmoyNetwork } from './polygon-test-amoy';

export type ChainEvmNetwork =
    | ChainEthereumNetwork
    | ChainEthereumTestSepoliaNetwork
    | ChainPolygonNetwork
    | ChainPolygonTestAmoyNetwork
    | ChainBscNetwork
    | ChainBscTestNetwork;

export type ChainNetwork = ChainIcNetwork | ChainEvmNetwork;

export type ChainNetworks = ChainNetwork[]; // user added networks

export const DEFAULT_CHAIN_NETWORKS: ChainNetworks = [
    CHAIN_IC_MAINNET,
    CHAIN_ETHEREUM_MAINNET,
    CHAIN_POLYGON_MAINNET,
    CHAIN_BSC_MAINNET,
];

export const DEFAULT_CHAIN_NETWORKS_TEST: ChainNetworks = [
    CHAIN_ETHEREUM_TEST_SEPOLIA_MAINNET,
    CHAIN_POLYGON_TEST_AMOY_MAINNET,
    CHAIN_BSC_TEST_MAINNET,
];

export interface CurrentChainNetwork {
    ic: ChainIcNetwork;
    ethereum: ChainEthereumNetwork;
    ethereum_test_sepolia: ChainEthereumTestSepoliaNetwork;
    polygon: ChainPolygonNetwork;
    polygon_test_amoy: ChainPolygonTestAmoyNetwork;
    bsc: ChainBscNetwork;
    bsc_test: ChainBscTestNetwork;
}

export type ChainNetworkKey = keyof CurrentChainNetwork;

export const DEFAULT_CURRENT_CHAIN_EVM_NETWORK = {
    ethereum: CHAIN_ETHEREUM_MAINNET,
    ethereum_test_sepolia: CHAIN_ETHEREUM_TEST_SEPOLIA_MAINNET,
    polygon: CHAIN_POLYGON_MAINNET,
    polygon_test_amoy: CHAIN_POLYGON_TEST_AMOY_MAINNET,
    bsc: CHAIN_BSC_MAINNET,
    bsc_test: CHAIN_BSC_TEST_MAINNET,
};

export const DEFAULT_CURRENT_CHAIN_NETWORK: CurrentChainNetwork = {
    ic: CHAIN_IC_MAINNET,
    ...DEFAULT_CURRENT_CHAIN_EVM_NETWORK,
};

// =================== chain identity network ===================

export interface ChainIcIdentityNetwork {
    chain: 'ic';
    owner: string;
    network: ChainIcNetwork;
}

export interface ChainEthereumIdentityNetwork {
    chain: 'ethereum';
    address: EvmAddress;
    network: ChainEthereumNetwork;
}

export interface ChainEthereumTestSepoliaIdentityNetwork {
    chain: 'ethereum-test-sepolia';
    address: EvmAddress;
    network: ChainEthereumTestSepoliaNetwork;
}

export interface ChainPolygonIdentityNetwork {
    chain: 'polygon';
    address: EvmAddress;
    network: ChainPolygonNetwork;
}

export interface ChainPolygonTestAmoyIdentityNetwork {
    chain: 'polygon-test-amoy';
    address: EvmAddress;
    network: ChainPolygonTestAmoyNetwork;
}

export interface ChainBscIdentityNetwork {
    chain: 'bsc';
    address: EvmAddress;
    network: ChainBscNetwork;
}

export interface ChainBscTestIdentityNetwork {
    chain: 'bsc-test';
    address: EvmAddress;
    network: ChainBscTestNetwork;
}

export type IdentityNetwork =
    | ChainIcIdentityNetwork
    | ChainEthereumIdentityNetwork
    | ChainEthereumTestSepoliaIdentityNetwork
    | ChainPolygonIdentityNetwork
    | ChainPolygonTestAmoyIdentityNetwork
    | ChainBscIdentityNetwork
    | ChainBscTestIdentityNetwork;

export const match_identity_network = <T>(
    self: IdentityNetwork,
    {
        ic,
        ethereum,
        ethereum_test_sepolia,
        polygon,
        polygon_test_amoy,
        bsc,
        bsc_test,
    }: {
        ic: (ic: ChainIcIdentityNetwork) => T;
        ethereum: (ethereum: ChainEthereumIdentityNetwork) => T;
        ethereum_test_sepolia: (ethereum_test_sepolia: ChainEthereumTestSepoliaIdentityNetwork) => T;
        polygon: (polygon: ChainPolygonIdentityNetwork) => T;
        polygon_test_amoy: (polygon_test_amoy: ChainPolygonTestAmoyIdentityNetwork) => T;
        bsc: (bsc: ChainBscIdentityNetwork) => T;
        bsc_test: (bsc_test: ChainBscTestIdentityNetwork) => T;
    },
): T => {
    if (self.chain === 'ic') return ic(self);
    if (self.chain === 'ethereum') return ethereum(self);
    if (self.chain === 'ethereum-test-sepolia') return ethereum_test_sepolia(self);
    if (self.chain === 'polygon') return polygon(self);
    if (self.chain === 'polygon-test-amoy') return polygon_test_amoy(self);
    if (self.chain === 'bsc') return bsc(self);
    if (self.chain === 'bsc-test') return bsc_test(self);
    throw new Error(`Unknown identity network: ${JSON.stringify(self)}`);
};
export const match_identity_network_async = async <T>(
    self: IdentityNetwork,
    {
        ic,
        ethereum,
        ethereum_test_sepolia,
        polygon,
        polygon_test_amoy,
        bsc,
        bsc_test,
    }: {
        ic: (ic: ChainIcIdentityNetwork) => Promise<T>;
        ethereum: (ethereum: ChainEthereumIdentityNetwork) => Promise<T>;
        ethereum_test_sepolia: (ethereum_test_sepolia: ChainEthereumTestSepoliaIdentityNetwork) => Promise<T>;
        polygon: (polygon: ChainPolygonIdentityNetwork) => Promise<T>;
        polygon_test_amoy: (polygon_test_amoy: ChainPolygonTestAmoyIdentityNetwork) => Promise<T>;
        bsc: (bsc: ChainBscIdentityNetwork) => Promise<T>;
        bsc_test: (bsc_test: ChainBscTestIdentityNetwork) => Promise<T>;
    },
): Promise<T> => {
    if (self.chain === 'ic') return ic(self);
    if (self.chain === 'ethereum') return ethereum(self);
    if (self.chain === 'ethereum-test-sepolia') return ethereum_test_sepolia(self);
    if (self.chain === 'polygon') return polygon(self);
    if (self.chain === 'polygon-test-amoy') return polygon_test_amoy(self);
    if (self.chain === 'bsc') return bsc(self);
    if (self.chain === 'bsc-test') return bsc_test(self);
    throw new Error(`Unknown identity network: ${JSON.stringify(self)}`);
};

export const get_identity_network_key = (identity_network: IdentityNetwork): string => {
    return match_identity_network(identity_network, {
        ic: (ic) => `${ic.chain}:${ic.owner}:${ic.network.origin}`,
        ethereum: (ethereum) => `${ethereum.chain}:${ethereum.address}:${ethereum.network.rpc}`,
        ethereum_test_sepolia: (ethereum_test_sepolia) =>
            `${ethereum_test_sepolia.chain}:${ethereum_test_sepolia.address}:${ethereum_test_sepolia.network.rpc}`,
        polygon: (polygon) => `${polygon.chain}:${polygon.address}:${polygon.network.rpc}`,
        polygon_test_amoy: (polygon_test_amoy) =>
            `${polygon_test_amoy.chain}:${polygon_test_amoy.address}:${polygon_test_amoy.network.rpc}`,
        bsc: (bsc) => `${bsc.chain}:${bsc.address}:${bsc.network.rpc}`,
        bsc_test: (bsc_test) => `${bsc_test.chain}:${bsc_test.address}:${bsc_test.network.rpc}`,
    });
};

// current
export interface CurrentIdentityNetwork {
    ic?: ChainIcIdentityNetwork;
    ethereum?: ChainEthereumIdentityNetwork;
    ethereum_test_sepolia?: ChainEthereumTestSepoliaIdentityNetwork;
    polygon?: ChainPolygonIdentityNetwork;
    polygon_test_amoy?: ChainPolygonTestAmoyIdentityNetwork;
    bsc?: ChainBscIdentityNetwork;
    bsc_test?: ChainBscTestIdentityNetwork;
}
//
export const get_default_rpc = (chain: Chain) => {
    const rpc = match_chain(chain, {
        ic: () => process.env.PLASMO_PUBLIC_DEFAULT_IC_RPC,
        ethereum: () => process.env.PLASMO_PUBLIC_DEFAULT_ETHEREUM_RPC,
        ethereum_test_sepolia: () => process.env.PLASMO_PUBLIC_DEFAULT_ETHEREUM_TEST_SEPOLIA_RPC,
        polygon: () => process.env.PLASMO_PUBLIC_DEFAULT_POLYGON_RPC,
        polygon_test_amoy: () => process.env.PLASMO_PUBLIC_DEFAULT_POLYGON_TEST_AMOY_RPC,
        bsc: () => process.env.PLASMO_PUBLIC_DEFAULT_BSC_RPC,
        bsc_test: () => process.env.PLASMO_PUBLIC_DEFAULT_BSC_TEST_RPC,
    });

    if (!rpc) {
        throw new Error(`No default RPC found for chain ${chain}`);
    }

    return rpc;
};
