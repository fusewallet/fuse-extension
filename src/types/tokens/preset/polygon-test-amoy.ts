
import { TokenTag, type TokenInfo } from '..';
import { PolygonTestAmoyTokenStandard, type PolygonTestAmoyTokenInfo } from '../chain/polygon-test-amoy';

export const TOKEN_INFO_POLYGON_TEST_AMOY_MATIC: PolygonTestAmoyTokenInfo  = { address: '0x0000000000000000000000000000000000000000', name: 'Amoy Matic',       symbol: 'MATIC',  decimals: 18, standards: [PolygonTestAmoyTokenStandard.NATIVE] };
export const TOKEN_INFO_POLYGON_TEST_AMOY_WMATIC: PolygonTestAmoyTokenInfo = { address: '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889', name: 'Wrapped Matic',    symbol: 'WMATIC', decimals: 18, standards: [PolygonTestAmoyTokenStandard.ERC20] };
export const TOKEN_INFO_POLYGON_TEST_AMOY_USDC: PolygonTestAmoyTokenInfo   = { address: '0x0FA8781a83E46826621b3BC094Ea2A0212e71B23', name: 'Test USD Coin',    symbol: 'USDC',   decimals: 6,  standards: [PolygonTestAmoyTokenStandard.ERC20] };
export const TOKEN_INFO_POLYGON_TEST_AMOY_USDT: PolygonTestAmoyTokenInfo   = { address: '0xA02f6adc7926efeBBd59Fd43A84f4E0c0c91e832', name: 'Test Tether USD',  symbol: 'USDT',   decimals: 6,  standards: [PolygonTestAmoyTokenStandard.ERC20] };
export const TOKEN_INFO_POLYGON_TEST_AMOY_DAI: PolygonTestAmoyTokenInfo    = { address: '0xd393b1E02dA9831Ff419e22eA105aAe4c47E1253', name: 'Test Dai',         symbol: 'DAI',    decimals: 18, standards: [PolygonTestAmoyTokenStandard.ERC20] };
export const TOKEN_INFO_POLYGON_TEST_AMOY_WETH: PolygonTestAmoyTokenInfo   = { address: '0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa', name: 'Test Wrapped ETH', symbol: 'WETH',   decimals: 18, standards: [PolygonTestAmoyTokenStandard.ERC20] };
export const TOKEN_INFO_POLYGON_TEST_AMOY_WBTC: PolygonTestAmoyTokenInfo   = { address: '0x0d787a4a1548f673ed375445535a6c7A1EE56180', name: 'Test Wrapped BTC', symbol: 'WBTC',   decimals: 8,  standards: [PolygonTestAmoyTokenStandard.ERC20] };
export const TOKEN_INFO_POLYGON_TEST_AMOY_AAVE: PolygonTestAmoyTokenInfo   = { address: '0x0AB1917A0cf92cdcf7F7b637EaC3A46BBBE41409', name: 'Test Aave',        symbol: 'AAVE',   decimals: 18, standards: [PolygonTestAmoyTokenStandard.ERC20] };
export const TOKEN_INFO_POLYGON_TEST_AMOY_TEST1: PolygonTestAmoyTokenInfo  = { address: '0x742DfA5Aa70a8212857966D491D67B09Ce7D6ec7', name: 'Test Token 1',     symbol: 'TEST1',  decimals: 18, standards: [PolygonTestAmoyTokenStandard.ERC20] };
export const TOKEN_INFO_POLYGON_TEST_AMOY_TEST2: PolygonTestAmoyTokenInfo  = { address: '0x5D8B4C2554aeB7e86F387B7d3A7e3U4C69f60aa6', name: 'Test Token 2',     symbol: 'TEST2',  decimals: 18, standards: [PolygonTestAmoyTokenStandard.ERC20] };

// =========================== all token info ===========================

export const PRESET_ALL_TOKEN_INFO_POLYGON_TEST_AMOY: TokenInfo[] = [
    { info: { polygon_test_amoy: TOKEN_INFO_POLYGON_TEST_AMOY_MATIC  }, tags: [TokenTag.ChainPolygonTestAmoy] },
    { info: { polygon_test_amoy: TOKEN_INFO_POLYGON_TEST_AMOY_WMATIC }, tags: [TokenTag.ChainPolygonTestAmoy] },
    { info: { polygon_test_amoy: TOKEN_INFO_POLYGON_TEST_AMOY_USDC   }, tags: [TokenTag.ChainPolygonTestAmoy] },
    { info: { polygon_test_amoy: TOKEN_INFO_POLYGON_TEST_AMOY_USDT   }, tags: [TokenTag.ChainPolygonTestAmoy] },
    { info: { polygon_test_amoy: TOKEN_INFO_POLYGON_TEST_AMOY_DAI    }, tags: [TokenTag.ChainPolygonTestAmoy] },
    { info: { polygon_test_amoy: TOKEN_INFO_POLYGON_TEST_AMOY_WETH   }, tags: [TokenTag.ChainPolygonTestAmoy] },
    { info: { polygon_test_amoy: TOKEN_INFO_POLYGON_TEST_AMOY_WBTC   }, tags: [TokenTag.ChainPolygonTestAmoy] },
    { info: { polygon_test_amoy: TOKEN_INFO_POLYGON_TEST_AMOY_AAVE   }, tags: [TokenTag.ChainPolygonTestAmoy] },
    { info: { polygon_test_amoy: TOKEN_INFO_POLYGON_TEST_AMOY_TEST1  }, tags: [TokenTag.ChainPolygonTestAmoy] },
    { info: { polygon_test_amoy: TOKEN_INFO_POLYGON_TEST_AMOY_TEST2  }, tags: [TokenTag.ChainPolygonTestAmoy] },
];
