export interface ChainBscNetwork {
    chain: 'bsc';
    chain_id: 56;
    name: string;
    created: number; // ms
    rpc: string;
}

export const CHAIN_BSC_MAINNET: ChainBscNetwork = {
    chain: 'bsc',
    chain_id: 56,
    name: 'BNB Smart Chain',
    created: 0, // inner, means mainnet
    rpc: 'mainnet', // 'https://bsc-rpc.publicnode.com'
};
