export interface ChainPolygonTestAmoyNetwork {
    chain: 'polygon-test-amoy';
    chain_id: 80002;
    name: string;
    created: number; // ms
    rpc: string;
}

export const CHAIN_POLYGON_TEST_AMOY_MAINNET: ChainPolygonTestAmoyNetwork = {
    chain: 'polygon-test-amoy',
    chain_id: 80002,
    name: 'Polygon Test Amoy',
    created: 0, // inner, means mainnet
    rpc: 'mainnet', // 'https://polygon-amoy-bor-rpc.publicnode.com'
};
