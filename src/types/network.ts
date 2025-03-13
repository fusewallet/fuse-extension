import ETHLogo from 'data-base64:~assets/svg/chains/eth.svg';
import ICLogo from 'data-base64:~assets/svg/chains/ic.svg';
import type { Chain as ViemChain } from 'viem';
import { mainnet as eth_mainnet, sepolia as eth_sepolia } from 'viem/chains';

import { match_chain, type Chain } from './chain';

export interface ChainIcNetwork {
    chain: 'ic';
    name: string;
    created: number; // ms
    origin: string;
}

// ================ EVM Chain Definitions - Ethereum Mainnet and Sepolia Testnet ================
export interface ChainEvmNetwork {
    chain: 'evm';
    name: string;
    created: number; // ms
    chainId: number;
    viemChain: ViemChain;
    rpcUrl?: string; // Optional custom RPC URL
}

export const CHAIN_IC_MAINNET: ChainIcNetwork = {
    chain: 'ic',
    name: 'Internet Computer Mainnet',
    created: 0, // inner, means mainnet
    origin: 'mainnet', //'https://icp-api.io'
};
export const DEFAULT_CHAIN_NETWORK = CHAIN_IC_MAINNET;

// EVM Chain Definitions - Just Ethereum Mainnet and Sepolia Testnet
export const CHAIN_EVM_ETHEREUM: ChainEvmNetwork = {
    chain: 'evm',
    name: 'Ethereum Mainnet',
    created: 0, // mainnet
    chainId: eth_mainnet.id,
    viemChain: eth_mainnet,
};

export const CHAIN_EVM_SEPOLIA: ChainEvmNetwork = {
    chain: 'evm',
    name: 'Ethereum Sepolia Testnet',
    created: Date.now(), // testnet
    chainId: eth_sepolia.id,
    viemChain: eth_sepolia,
};

// Default EVM networks list
export const DEFAULT_EVM_NETWORKS: ChainEvmNetwork[] = [CHAIN_EVM_ETHEREUM, CHAIN_EVM_SEPOLIA];

export type ChainNetwork = ChainIcNetwork | ChainEvmNetwork;
export type ChainNetworks = ChainNetwork[]; // user added networks

// define type guard functions
export const isEvmNetwork = (network: ChainNetwork | undefined): network is ChainEvmNetwork => {
    return !!network && network.chain === 'evm';
};
export const isIcNetwork = (network: ChainNetwork | undefined): network is ChainIcNetwork => {
    return !!network && network.chain === 'ic';
};

export const DEFAULT_CHAIN_NETWORKS_LOGO = {
    ic: {
        mainnet: ICLogo,
    },
    evm: {
        [`${eth_mainnet.id}`]: ETHLogo,
        [`${eth_sepolia.id}`]: ETHLogo,
    },
};
export const DEFAULT_CHAIN_NETWORKS: Record<Chain, ChainNetwork[]> = {
    ic: [CHAIN_IC_MAINNET],
    evm: [CHAIN_EVM_ETHEREUM, CHAIN_EVM_SEPOLIA],
};
export interface CurrentChainNetwork {
    ic: ChainIcNetwork;
    evm: ChainEvmNetwork;
}

export const DEFAULT_CURRENT_CHAIN_NETWORK: CurrentChainNetwork = {
    ic: CHAIN_IC_MAINNET,
    evm: CHAIN_EVM_ETHEREUM,
};

// =================== chain identity network ===================

export interface ChainIcIdentityNetwork {
    chain: Extract<Chain, 'ic'>;
    owner: string;
    network: ChainIcNetwork;
}

export interface ChainEvmIdentityNetwork {
    chain: Extract<Chain, 'evm'>;
    address: `0x${string}`;
    network: ChainEvmNetwork;
}

export type IdentityNetwork = ChainIcIdentityNetwork | ChainEvmIdentityNetwork;

export const get_identity_network_key = (identity_network: IdentityNetwork): string => {
    return match_chain(identity_network.chain, {
        ic: () => {
            const icNetwork = identity_network as ChainIcIdentityNetwork;
            return `${icNetwork.chain}:${icNetwork.owner}:${icNetwork.network.origin}`;
        },
        evm: () => {
            const evmNetwork = identity_network as ChainEvmIdentityNetwork;
            return `${evmNetwork.chain}:${evmNetwork.address}:${evmNetwork.network.chainId}`;
        },
    });
};
// Helper function to get current identity network
export const get_current_identity_network = (
    chain: Chain,
    current_identity_network: CurrentIdentityNetwork,
): IdentityNetwork => {
    return match_chain<IdentityNetwork>(chain, {
        ic: () => current_identity_network.ic,
        evm: () => current_identity_network.evm,
    });
};
// Helper function to get network by chain ID
export const get_evm_network_by_chain_id = (chainId: number): ChainEvmNetwork | undefined => {
    return DEFAULT_EVM_NETWORKS.find((network) => network.chainId === chainId);
};

// current
export interface CurrentIdentityNetwork {
    ic: ChainIcIdentityNetwork;
    evm: ChainEvmIdentityNetwork;
}

// Helper function to check if a network is a testnet
export const is_testnet = (network: ChainNetwork): boolean => {
    return network.created > 0;
};

// Helper function to get RPC URL for an EVM network
export const get_evm_rpc_url = (network: ChainEvmNetwork): string => {
    // Return custom RPC URL if provided
    if (network.rpcUrl) {
        return network.rpcUrl;
    }

    // Otherwise return the default RPC URL from Viem chain definition
    return network.viemChain.rpcUrls.default.http[0];
};

// get chain network logo
export const get_chain_network_logo = (chain: Chain, network: ChainNetwork): string => {
    return match_chain(chain, {
        ic: () => DEFAULT_CHAIN_NETWORKS_LOGO.ic.mainnet,
        evm: () => DEFAULT_CHAIN_NETWORKS_LOGO.evm[`${(network as ChainEvmNetwork).chainId}`],
    });
};
// check two chain network is same
export const is_same_chain_network = (a: ChainNetwork, b: ChainNetwork): boolean => {
    return a.chain === b.chain && a.name === b.name;
};
