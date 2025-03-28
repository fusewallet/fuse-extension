// prettier-ignore // cSpell:words GHST Aavegotchi
import { TokenTag, type TokenInfo } from '..';
import { PolygonTokenStandard, type PolygonTokenInfo } from './../chain/polygon';

import TOKEN_POLYGON_MATIC_SVG from 'data-base64:~assets/svg/tokens/polygon/MATIC.svg';

// =========================== logo ===========================

export const PRESET_LOGO_POLYGON: Record<string, string> = {
    '0x0000000000000000000000000000000000001010': TOKEN_POLYGON_MATIC_SVG,
};

// =========================== token info ===========================

export const TOKEN_INFO_POLYGON_MATIC: PolygonTokenInfo  = { address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', name: 'Matic',           symbol: 'MATIC',  decimals: 18, standards: [PolygonTokenStandard.NATIVE] };
export const TOKEN_INFO_POLYGON_WMATIC: PolygonTokenInfo = { address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', name: 'Wrapped Matic',   symbol: 'WMATIC', decimals: 18, standards: [PolygonTokenStandard.ERC20] };
export const TOKEN_INFO_POLYGON_USDC: PolygonTokenInfo   = { address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', name: 'USD Coin',        symbol: 'USDC',   decimals: 6,  standards: [PolygonTokenStandard.ERC20] };
export const TOKEN_INFO_POLYGON_USDT: PolygonTokenInfo   = { address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', name: 'Tether USD',      symbol: 'USDT',   decimals: 6,  standards: [PolygonTokenStandard.ERC20] };
export const TOKEN_INFO_POLYGON_DAI: PolygonTokenInfo    = { address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', name: 'Dai Stablecoin',  symbol: 'DAI',    decimals: 18, standards: [PolygonTokenStandard.ERC20] };
export const TOKEN_INFO_POLYGON_WETH: PolygonTokenInfo   = { address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', name: 'Wrapped Ether',   symbol: 'WETH',   decimals: 18, standards: [PolygonTokenStandard.ERC20] };
export const TOKEN_INFO_POLYGON_WBTC: PolygonTokenInfo   = { address: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6', name: 'Wrapped Bitcoin', symbol: 'WBTC',   decimals: 8,  standards: [PolygonTokenStandard.ERC20] };
export const TOKEN_INFO_POLYGON_AAVE: PolygonTokenInfo   = { address: '0xD6DF932A45C0f255f85145f286eA0b292B21C90B', name: 'Aave',            symbol: 'AAVE',   decimals: 18, standards: [PolygonTokenStandard.ERC20] };
export const TOKEN_INFO_POLYGON_QUICK: PolygonTokenInfo  = { address: '0x831753DD7087CaC61aB5644b308642cc1c33Dc13', name: 'QuickSwap',       symbol: 'QUICK',  decimals: 18, standards: [PolygonTokenStandard.ERC20] };
export const TOKEN_INFO_POLYGON_GHST: PolygonTokenInfo   = { address: '0x385Eeac5cB85A38A9a07A70c73e0a3271CfB54A7', name: 'Aavegotchi',      symbol: 'GHST',   decimals: 18, standards: [PolygonTokenStandard.ERC20] };

// =========================== all token info ===========================

export const PRESET_ALL_TOKEN_INFO_POLYGON: TokenInfo[] = [
    { info: { polygon: TOKEN_INFO_POLYGON_MATIC  }, tags: [TokenTag.ChainPolygon] },
    { info: { polygon: TOKEN_INFO_POLYGON_WMATIC }, tags: [TokenTag.ChainPolygon] },
    { info: { polygon: TOKEN_INFO_POLYGON_USDC   }, tags: [TokenTag.ChainPolygon] },
    { info: { polygon: TOKEN_INFO_POLYGON_USDT   }, tags: [TokenTag.ChainPolygon] },
    { info: { polygon: TOKEN_INFO_POLYGON_DAI    }, tags: [TokenTag.ChainPolygon] },
    { info: { polygon: TOKEN_INFO_POLYGON_WETH   }, tags: [TokenTag.ChainPolygon] },
    { info: { polygon: TOKEN_INFO_POLYGON_WBTC   }, tags: [TokenTag.ChainPolygon] },
    { info: { polygon: TOKEN_INFO_POLYGON_AAVE   }, tags: [TokenTag.ChainPolygon] },
    { info: { polygon: TOKEN_INFO_POLYGON_QUICK  }, tags: [TokenTag.ChainPolygon] },
    { info: { polygon: TOKEN_INFO_POLYGON_GHST   }, tags: [TokenTag.ChainPolygon] },
];
