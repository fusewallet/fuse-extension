export interface ChainPolygonNetwork {
    chain: 'polygon';
    chain_id: 137;
    name: string;
    created: number; // ms
    rpc: string;
}

export const CHAIN_POLYGON_MAINNET: ChainPolygonNetwork = {
    chain: 'polygon',
    chain_id: 137,
    name: 'Polygon',
    created: 0, // inner, means mainnet
    rpc: 'mainnet', // 'https://polygon-bor-rpc.publicnode.com'
};
