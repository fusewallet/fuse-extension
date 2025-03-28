import { TokenTag, type TokenInfo } from '..';
import { BscTestTokenStandard, type BscTestTokenInfo } from '../chain/bsc-test';

export const TOKEN_INFO_BSC_TEST_BNB: BscTestTokenInfo  = { address: '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd', name: 'Test BNB',         symbol: 'tBNB', decimals: 18, standards: [BscTestTokenStandard.NATIVE] };
export const TOKEN_INFO_BSC_TEST_WBNB: BscTestTokenInfo = { address: '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd', name: 'Wrapped BNB',      symbol: 'WBNB', decimals: 18, standards: [BscTestTokenStandard.BEP20] };
export const TOKEN_INFO_BSC_TEST_BUSD: BscTestTokenInfo = { address: '0x78867BbEeF44f2326bF8DDd1941a4439382EF2A7', name: 'Test BUSD',        symbol: 'BUSD', decimals: 18, standards: [BscTestTokenStandard.BEP20] };
export const TOKEN_INFO_BSC_TEST_USDT: BscTestTokenInfo = { address: '0x7ef95a0FEE0Dd31b22626fA2e10Ee6A223F8a684', name: 'Test USDT',        symbol: 'USDT', decimals: 18, standards: [BscTestTokenStandard.BEP20] };
export const TOKEN_INFO_BSC_TEST_USDC: BscTestTokenInfo = { address: '0x64544969ed7EBf5f083679233325356EbE738930', name: 'Test USDC',        symbol: 'USDC', decimals: 18, standards: [BscTestTokenStandard.BEP20] };
export const TOKEN_INFO_BSC_TEST_CAKE: BscTestTokenInfo = { address: '0xa35062141Fa33BCA92Ce69FeD37D0E8908868AAe', name: 'Test PancakeSwap', symbol: 'CAKE', decimals: 18, standards: [BscTestTokenStandard.BEP20] };
export const TOKEN_INFO_BSC_TEST_DAI: BscTestTokenInfo  = { address: '0xEC5dCb5Dbf4B114C9d0F65BcCAb49EC54F6A0867', name: 'Test DAI',         symbol: 'DAI',  decimals: 18, standards: [BscTestTokenStandard.BEP20] };
export const TOKEN_INFO_BSC_TEST_ETH: BscTestTokenInfo  = { address: '0xd66c6B4F0be8CE5b39D52E0Fd1344c389929B378', name: 'Test ETH',         symbol: 'ETH',  decimals: 18, standards: [BscTestTokenStandard.BEP20] };
export const TOKEN_INFO_BSC_TEST_BTCB: BscTestTokenInfo = { address: '0x6ce8dA28E2f864420840cF74474eFf5fD80E65B8', name: 'Test BTCB',        symbol: 'BTCB', decimals: 18, standards: [BscTestTokenStandard.BEP20] };
export const TOKEN_INFO_BSC_TEST_XRP: BscTestTokenInfo  = { address: '0xa83575490D7df4E2F47b7D38ef351a2722cA45b9', name: 'Test XRP',         symbol: 'XRP',  decimals: 18, standards: [BscTestTokenStandard.BEP20] };

// =========================== all token info ===========================

export const PRESET_ALL_TOKEN_INFO_BSC_TEST: TokenInfo[] = [
    { info: { bsc_test: TOKEN_INFO_BSC_TEST_BNB  }, tags: [TokenTag.ChainBscTest] },
    { info: { bsc_test: TOKEN_INFO_BSC_TEST_WBNB }, tags: [TokenTag.ChainBscTest] },
    { info: { bsc_test: TOKEN_INFO_BSC_TEST_BUSD }, tags: [TokenTag.ChainBscTest] },
    { info: { bsc_test: TOKEN_INFO_BSC_TEST_USDT }, tags: [TokenTag.ChainBscTest] },
    { info: { bsc_test: TOKEN_INFO_BSC_TEST_USDC }, tags: [TokenTag.ChainBscTest] },
    { info: { bsc_test: TOKEN_INFO_BSC_TEST_CAKE }, tags: [TokenTag.ChainBscTest] },
    { info: { bsc_test: TOKEN_INFO_BSC_TEST_DAI  }, tags: [TokenTag.ChainBscTest] },
    { info: { bsc_test: TOKEN_INFO_BSC_TEST_ETH  }, tags: [TokenTag.ChainBscTest] },
    { info: { bsc_test: TOKEN_INFO_BSC_TEST_BTCB }, tags: [TokenTag.ChainBscTest] },
    { info: { bsc_test: TOKEN_INFO_BSC_TEST_XRP  }, tags: [TokenTag.ChainBscTest] },
];
