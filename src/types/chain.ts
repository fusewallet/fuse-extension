export type EvmChainMainnet = 'ethereum' | 'bsc' | 'polygon';
export type EvmChainTest = 'ethereum-test-sepolia' | 'bsc-test' | 'polygon-test-amoy';
export type EvmChain = EvmChainMainnet | EvmChainTest;
export type Chain = 'ic' | EvmChain;

export const match_chain = <T>(
    self: Chain,
    {
        ic,
        ethereum,
        ethereum_test_sepolia,
        bsc,
        bsc_test,
        polygon,
        polygon_test_amoy,
    }: {
        ic: () => T;
        ethereum: () => T;
        ethereum_test_sepolia: () => T;
        bsc: () => T;
        bsc_test: () => T;
        polygon: () => T;
        polygon_test_amoy: () => T;
    },
): T => {
    if (self === 'ic') return ic();
    if (self === 'ethereum') return ethereum();
    if (self === 'ethereum-test-sepolia') return ethereum_test_sepolia();
    if (self === 'bsc') return bsc();
    if (self === 'bsc-test') return bsc_test();
    if (self === 'polygon') return polygon();
    if (self === 'polygon-test-amoy') return polygon_test_amoy();
    throw new Error(`unknown chain: ${self}`);
};

export const match_chain_async = async <T>(
    self: Chain,
    {
        ic,
        ethereum,
        ethereum_test_sepolia,
        bsc,
        bsc_test,
        polygon,
        polygon_test_amoy,
    }: {
        ic: () => Promise<T>;
        ethereum: () => Promise<T>;
        ethereum_test_sepolia: () => Promise<T>;
        bsc: () => Promise<T>;
        bsc_test: () => Promise<T>;
        polygon: () => Promise<T>;
        polygon_test_amoy: () => Promise<T>;
    },
): Promise<T> => {
    if (self === 'ic') return ic();
    if (self === 'ethereum') return ethereum();
    if (self === 'ethereum-test-sepolia') return ethereum_test_sepolia();
    if (self === 'bsc') return bsc();
    if (self === 'bsc-test') return bsc_test();
    if (self === 'polygon') return polygon();
    if (self === 'polygon-test-amoy') return polygon_test_amoy();
    throw new Error(`Unknown chain: ${self}`);
};
