import { POPULAR_TOKENS } from '~types/tokens/evm';

import { useCurrentChainID } from '../viem';

// evm token list
export const useEVMTokenList = () => {
    const chainId = useCurrentChainID();
    return chainId ? POPULAR_TOKENS[chainId] : [];
};
