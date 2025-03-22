export interface ChainEthereumNetwork {
    chain: 'ethereum';
    chain_id: 1;
    name: string;
    created: number; // ms
    rpc: string;
}

export const CHAIN_ETHEREUM_MAINNET: ChainEthereumNetwork = {
    chain: 'ethereum',
    chain_id: 1,
    name: 'Ethereum',
    created: 0, // inner, means mainnet
    rpc: 'mainnet', // 'https://eth.merkle.io'
};
