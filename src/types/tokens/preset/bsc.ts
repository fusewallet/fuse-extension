import { TokenTag, type TokenInfo } from '..';
import { BscTokenStandard, type BscTokenInfo } from './../chain/bsc';

export const TOKEN_INFO_BSC_BNB: BscTokenInfo  = { address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', name: 'Binance Coin',   symbol: 'BNB',  decimals: 18, standards: [BscTokenStandard.NATIVE] };
export const TOKEN_INFO_BSC_WBNB: BscTokenInfo = { address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', name: 'Wrapped BNB',    symbol: 'WBNB', decimals: 18, standards: [BscTokenStandard.BEP20] };
export const TOKEN_INFO_BSC_BUSD: BscTokenInfo = { address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', name: 'Binance USD',    symbol: 'BUSD', decimals: 18, standards: [BscTokenStandard.BEP20] };
export const TOKEN_INFO_BSC_USDT: BscTokenInfo = { address: '0x55d398326f99059fF775485246999027B3197955', name: 'Tether USD',     symbol: 'USDT', decimals: 18, standards: [BscTokenStandard.BEP20] };
export const TOKEN_INFO_BSC_USDC: BscTokenInfo = { address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', name: 'USD Coin',       symbol: 'USDC', decimals: 18, standards: [BscTokenStandard.BEP20] };
export const TOKEN_INFO_BSC_CAKE: BscTokenInfo = { address: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82', name: 'PancakeSwap',    symbol: 'CAKE', decimals: 18, standards: [BscTokenStandard.BEP20] };
export const TOKEN_INFO_BSC_DAI: BscTokenInfo  = { address: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3', name: 'Dai',            symbol: 'DAI',  decimals: 18, standards: [BscTokenStandard.BEP20] };
export const TOKEN_INFO_BSC_ETH: BscTokenInfo  = { address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8', name: 'Ethereum Token', symbol: 'ETH',  decimals: 18, standards: [BscTokenStandard.BEP20] };
export const TOKEN_INFO_BSC_BTCB: BscTokenInfo = { address: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c', name: 'Bitcoin BEP20',  symbol: 'BTCB', decimals: 18, standards: [BscTokenStandard.BEP20] };
export const TOKEN_INFO_BSC_XRP: BscTokenInfo  = { address: '0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE', name: 'XRP Token',      symbol: 'XRP',  decimals: 18, standards: [BscTokenStandard.BEP20] };

// =========================== all token info ===========================

export const PRESET_ALL_TOKEN_INFO_BSC: TokenInfo[] = [
    { info: { bsc: TOKEN_INFO_BSC_BNB  }, tags: [TokenTag.ChainBsc] },
    { info: { bsc: TOKEN_INFO_BSC_WBNB }, tags: [TokenTag.ChainBsc] },
    { info: { bsc: TOKEN_INFO_BSC_BUSD }, tags: [TokenTag.ChainBsc] },
    { info: { bsc: TOKEN_INFO_BSC_USDT }, tags: [TokenTag.ChainBsc] },
    { info: { bsc: TOKEN_INFO_BSC_USDC }, tags: [TokenTag.ChainBsc] },
    { info: { bsc: TOKEN_INFO_BSC_CAKE }, tags: [TokenTag.ChainBsc] },
    { info: { bsc: TOKEN_INFO_BSC_DAI  }, tags: [TokenTag.ChainBsc] },
    { info: { bsc: TOKEN_INFO_BSC_ETH  }, tags: [TokenTag.ChainBsc] },
    { info: { bsc: TOKEN_INFO_BSC_BTCB }, tags: [TokenTag.ChainBsc] },
    { info: { bsc: TOKEN_INFO_BSC_XRP  }, tags: [TokenTag.ChainBsc] },
];
