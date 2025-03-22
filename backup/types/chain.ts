export type EvmChainMainnet = 'ethereum' | 'polygon' | 'bsc';
export type EvmChainTest = 'ethereum-test-sepolia' | 'polygon-test-amoy' | 'bsc-test';
export type EvmChain = EvmChainMainnet | EvmChainTest;
export type Chain = 'ic' | EvmChain;

export const match_chain = <T>(
    self: Chain,
    {
        ic,
        ethereum,
        ethereum_test_sepolia,
        polygon,
        polygon_test_amoy,
        bsc,
        bsc_test,
    }: {
        ic: () => T;
        ethereum: () => T;
        ethereum_test_sepolia: () => T;
        polygon: () => T;
        polygon_test_amoy: () => T;
        bsc: () => T;
        bsc_test: () => T;
    },
): T => {
    if (self === 'ic') return ic();
    if (self === 'ethereum') return ethereum();
    if (self === 'ethereum-test-sepolia') return ethereum_test_sepolia();
    if (self === 'polygon') return polygon();
    if (self === 'polygon-test-amoy') return polygon_test_amoy();
    if (self === 'bsc') return bsc();
    if (self === 'bsc-test') return bsc_test();
    throw new Error(`unknown chain: ${self}`);
};

export const match_chain_async = async <T>(
    self: Chain,
    {
        ic,
        ethereum,
        ethereum_test_sepolia,
        polygon,
        polygon_test_amoy,
        bsc,
        bsc_test,
    }: {
        ic: () => Promise<T>;
        ethereum: () => Promise<T>;
        ethereum_test_sepolia: () => Promise<T>;
        polygon: () => Promise<T>;
        polygon_test_amoy: () => Promise<T>;
        bsc: () => Promise<T>;
        bsc_test: () => Promise<T>;
    },
): Promise<T> => {
    if (self === 'ic') return ic();
    if (self === 'ethereum') return ethereum();
    if (self === 'ethereum-test-sepolia') return ethereum_test_sepolia();
    if (self === 'polygon') return polygon();
    if (self === 'polygon-test-amoy') return polygon_test_amoy();
    if (self === 'bsc') return bsc();
    if (self === 'bsc-test') return bsc_test();
    throw new Error(`Unknown chain: ${self}`);
};
