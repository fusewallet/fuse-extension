export interface ChainBscTestNetwork {
    chain: 'bsc-test';
    chain_id: 97;
    name: string;
    created: number; // ms
    rpc: string;
}

export const CHAIN_BSC_TEST_MAINNET: ChainBscTestNetwork = {
    chain: 'bsc-test',
    chain_id: 97,
    name: 'BSC Test',
    created: 0, // inner, means mainnet
    rpc: 'mainnet', // 'https://bsc-testnet-rpc.publicnode.com'
};
