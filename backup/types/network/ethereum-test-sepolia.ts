export interface ChainEthereumTestSepoliaNetwork {
    chain: 'ethereum-test-sepolia';
    chain_id: 11155111;
    name: string;
    created: number; // ms
    rpc: string;
}

export const CHAIN_ETHEREUM_TEST_SEPOLIA_MAINNET: ChainEthereumTestSepoliaNetwork = {
    chain: 'ethereum-test-sepolia',
    chain_id: 11155111,
    name: 'Ethereum Test Sepolia',
    created: 0, // inner, means mainnet
    rpc: 'mainnet', // 'https://ethereum-sepolia-rpc.publicnode.com'
};
