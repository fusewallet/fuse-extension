export type Chain = 'ic' | 'evm';

export const match_chain = <T>(self: Chain, handlers: Record<Chain, () => T>): T => {
    if (self === 'ic') return handlers.ic();
    if (self === 'evm') return handlers.evm();
    throw new Error(`unknown chain: ${self}`);
};

export const match_chain_async = async <T>(self: Chain, handlers: Record<Chain, () => Promise<T>>): Promise<T> => {
    if (self === 'ic') return handlers.ic();
    if (self === 'evm') return handlers.evm();
    throw new Error(`unknown chain: ${self}`);
};
