export interface ChainIcNetwork {
    chain: 'ic';
    name: string;
    created: number; // ms
    origin: string;
}

export const CHAIN_IC_MAINNET: ChainIcNetwork = {
    chain: 'ic',
    name: 'Internet Computer',
    created: 0, // inner, means mainnet
    origin: 'mainnet', // 'https://icp-api.io'
};
