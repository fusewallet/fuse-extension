
import { TokenTag, type TokenInfo } from '..';
import { PolygonTestAmoyTokenStandard, type PolygonTestAmoyTokenInfo } from '../chain/polygon-test-amoy';

export const TOKEN_INFO_POLYGON_TEST_AMOY_MATIC: PolygonTestAmoyTokenInfo  = { address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', name: 'Amoy Matic',       symbol: 'MATIC',  decimals: 18, standards: [PolygonTestAmoyTokenStandard.NATIVE] };
export const TOKEN_INFO_POLYGON_TEST_AMOY_TEST1: PolygonTestAmoyTokenInfo  = { address: '0xc5f1212042b90CFD91D09Ca0D4187eBeb586C2cC', name: 'Test Token 1',     symbol: 'TEST1',  decimals: 18, standards: [PolygonTestAmoyTokenStandard.ERC20] };

// =========================== all token info ===========================

export const PRESET_ALL_TOKEN_INFO_POLYGON_TEST_AMOY: TokenInfo[] = [
    { info: { polygon_test_amoy: TOKEN_INFO_POLYGON_TEST_AMOY_MATIC  }, tags: [TokenTag.ChainPolygonTestAmoy] },
    { info: { polygon_test_amoy: TOKEN_INFO_POLYGON_TEST_AMOY_TEST1  }, tags: [TokenTag.ChainPolygonTestAmoy] },
];
