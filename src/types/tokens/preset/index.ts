import { get_cached_data } from '~hooks/store/local';
import { match_chain, type Chain } from '~types/chain';

import { is_same_token_info, match_combined_token_info, TokenTag, type CombinedTokenInfo, type TokenInfo } from '..';
import {
    PRESET_ALL_TOKEN_INFO_BSC,
    TOKEN_INFO_BSC_BNB,
    TOKEN_INFO_BSC_BUSD,
    TOKEN_INFO_BSC_USDT,
    TOKEN_INFO_BSC_WBNB,
} from './bsc';
import {
    PRESET_ALL_TOKEN_INFO_BSC_TEST,
    TOKEN_INFO_BSC_TEST_BNB,
    TOKEN_INFO_BSC_TEST_BUSD,
    TOKEN_INFO_BSC_TEST_USDC,
    TOKEN_INFO_BSC_TEST_USDT,
    TOKEN_INFO_BSC_TEST_WBNB,
} from './bsc-test';
import {
    PRESET_ALL_TOKEN_INFO_ETHEREUM,
    TOKEN_INFO_ETHEREUM_ETH,
    TOKEN_INFO_ETHEREUM_USDC,
    TOKEN_INFO_ETHEREUM_USDT,
    TOKEN_INFO_ETHEREUM_WETH,
} from './ethereum';
import {
    PRESET_ALL_TOKEN_INFO_ETHEREUM_TEST_SEPOLIA,
    TOKEN_INFO_ETHEREUM_TEST_SEPOLIA_ETH,
    TOKEN_INFO_ETHEREUM_TEST_SEPOLIA_USDC,
    TOKEN_INFO_ETHEREUM_TEST_SEPOLIA_USDT,
    TOKEN_INFO_ETHEREUM_TEST_SEPOLIA_WETH,
} from './ethereum-test-sepolia';
import {
    PRESET_ALL_TOKEN_INFO_IC,
    PRESET_LOGO_IC,
    TOKEN_INFO_IC_CK_BTC,
    TOKEN_INFO_IC_CK_ETH,
    TOKEN_INFO_IC_CK_USDC,
    TOKEN_INFO_IC_CK_USDT,
    TOKEN_INFO_IC_ICP,
    TOKEN_INFO_IC_SNS_CHAT,
    TOKEN_INFO_IC_SNS_ICL,
    TOKEN_INFO_IC_SNS_KONG,
    TOKEN_INFO_IC_SNS_OGY,
} from './ic';
import {
    PRESET_ALL_TOKEN_INFO_POLYGON,
    PRESET_LOGO_POLYGON,
    TOKEN_INFO_POLYGON_MATIC,
    TOKEN_INFO_POLYGON_USDC,
    TOKEN_INFO_POLYGON_USDT,
    TOKEN_INFO_POLYGON_WMATIC,
} from './polygon';
import {
    PRESET_ALL_TOKEN_INFO_POLYGON_TEST_AMOY,
    TOKEN_INFO_POLYGON_TEST_AMOY_MATIC,
    TOKEN_INFO_POLYGON_TEST_AMOY_TEST1,
} from './polygon-test-amoy';

export const get_token_logo_key = (
    token:
        | { ic: { canister_id: string } }
        | { ethereum: { address: string } }
        | { ethereum_test_sepolia: { address: string } }
        | { polygon: { address: string } }
        | { polygon_test_amoy: { address: string } }
        | { bsc: { address: string } }
        | { bsc_test: { address: string } },
): string => {
    if ('ic' in token) return `token:ic:${token.ic.canister_id}:logo`;
    if ('ethereum' in token) return `token:ethereum:${token.ethereum.address}:logo`;
    if ('ethereum_test_sepolia' in token)
        return `token:ethereum_test_sepolia:${token.ethereum_test_sepolia.address}:logo`;
    if ('polygon' in token) return `token:polygon:${token.polygon.address}:logo`;
    if ('polygon_test_amoy' in token) return `token:polygon_test_amoy:${token.polygon_test_amoy.address}:logo`;
    if ('bsc' in token) return `token:bsc:${token.bsc.address}:logo`;
    if ('bsc_test' in token) return `token:bsc_test:${token.bsc_test.address}:logo`;
    return '';
};
// evm token logo
const get_token_logo_from_covalent = (address: string, chainId: number): string => {
    return `https://logos.covalenthq.com/tokens/${chainId}/${address.toLowerCase()}.png`;
};

export const get_token_logo = async (info: CombinedTokenInfo): Promise<string | undefined> => {
    const preset = match_combined_token_info(info, {
        ic: (ic) => PRESET_LOGO_IC[`ic#${ic.canister_id}`],
        ethereum: (ethereum) => get_token_logo_from_covalent(ethereum.address, 1),
        ethereum_test_sepolia: (ethereum_test_sepolia) =>
            get_token_logo_from_covalent(ethereum_test_sepolia.address, 11155111),
        polygon: (polygon) =>
            PRESET_LOGO_POLYGON[polygon.address] ?? get_token_logo_from_covalent(polygon.address, 137),
        polygon_test_amoy: (polygon_test_amoy) => get_token_logo_from_covalent(polygon_test_amoy.address, 80001),
        bsc: (bsc) => get_token_logo_from_covalent(bsc.address, 56),
        bsc_test: (bsc_test) => get_token_logo_from_covalent(bsc_test.address, 97),
    });
    if (preset) return preset;
    const key = get_token_logo_key(info);
    return get_cached_data(key, async () => undefined, 1000 * 60 * 60 * 24 * 365 * 100);
};

export const get_token_logo_by_address = async (address: string, chain: Chain): Promise<string | undefined> => {
    return match_chain(chain, {
        ic: () => PRESET_LOGO_IC[`ic#${address}`],
        ethereum: () => get_token_logo_from_covalent(address, 1),
        ethereum_test_sepolia: () => get_token_logo_from_covalent(address, 11155111),
        polygon: () => PRESET_LOGO_POLYGON[address] ?? get_token_logo_from_covalent(address, 137),
        polygon_test_amoy: () => get_token_logo_from_covalent(address, 80001),
        bsc: () => get_token_logo_from_covalent(address, 56),
        bsc_test: () => get_token_logo_from_covalent(address, 97),
    });
};

export const DEFAULT_TOKEN_INFO: TokenInfo[] = [
    // ======================= IC =======================
    { info: { ic: TOKEN_INFO_IC_ICP }, tags: [TokenTag.ChainIc] },
    // CK
    { info: { ic: TOKEN_INFO_IC_CK_BTC }, tags: [TokenTag.ChainIc, TokenTag.ChainIcCk] },
    { info: { ic: TOKEN_INFO_IC_CK_ETH }, tags: [TokenTag.ChainIc, TokenTag.ChainIcCk] },
    { info: { ic: TOKEN_INFO_IC_CK_USDC }, tags: [TokenTag.ChainIc, TokenTag.ChainIcCk] },
    { info: { ic: TOKEN_INFO_IC_CK_USDT }, tags: [TokenTag.ChainIc, TokenTag.ChainIcCk] },
    // SNS
    { info: { ic: TOKEN_INFO_IC_SNS_CHAT }, tags: [TokenTag.ChainIc, TokenTag.ChainIcSns] },
    { info: { ic: TOKEN_INFO_IC_SNS_ICL }, tags: [TokenTag.ChainIc, TokenTag.ChainIcSns] },
    { info: { ic: TOKEN_INFO_IC_SNS_OGY }, tags: [TokenTag.ChainIc, TokenTag.ChainIcSns] },
    { info: { ic: TOKEN_INFO_IC_SNS_KONG }, tags: [TokenTag.ChainIc, TokenTag.ChainIcSns] },
    // ======================= EVM =======================
    // ETHEREUM
    { info: { ethereum: TOKEN_INFO_ETHEREUM_ETH }, tags: [TokenTag.ChainEthereum] },
    { info: { ethereum: TOKEN_INFO_ETHEREUM_WETH }, tags: [TokenTag.ChainEthereum] },
    { info: { ethereum: TOKEN_INFO_ETHEREUM_USDC }, tags: [TokenTag.ChainEthereum] },
    { info: { ethereum: TOKEN_INFO_ETHEREUM_USDT }, tags: [TokenTag.ChainEthereum] },
    // ETHEREUM TEST SEPOLIA
    {
        info: { ethereum_test_sepolia: TOKEN_INFO_ETHEREUM_TEST_SEPOLIA_ETH },
        tags: [TokenTag.ChainEthereumTestSepolia],
    },
    {
        info: { ethereum_test_sepolia: TOKEN_INFO_ETHEREUM_TEST_SEPOLIA_WETH },
        tags: [TokenTag.ChainEthereumTestSepolia],
    },
    {
        info: { ethereum_test_sepolia: TOKEN_INFO_ETHEREUM_TEST_SEPOLIA_USDC },
        tags: [TokenTag.ChainEthereumTestSepolia],
    },
    {
        info: { ethereum_test_sepolia: TOKEN_INFO_ETHEREUM_TEST_SEPOLIA_USDT },
        tags: [TokenTag.ChainEthereumTestSepolia],
    },
    // POLYGON
    { info: { polygon: TOKEN_INFO_POLYGON_MATIC }, tags: [TokenTag.ChainPolygon] },
    { info: { polygon: TOKEN_INFO_POLYGON_WMATIC }, tags: [TokenTag.ChainPolygon] },
    { info: { polygon: TOKEN_INFO_POLYGON_USDC }, tags: [TokenTag.ChainPolygon] },
    { info: { polygon: TOKEN_INFO_POLYGON_USDT }, tags: [TokenTag.ChainPolygon] },
    // POLYGON TEST AMOY
    { info: { polygon_test_amoy: TOKEN_INFO_POLYGON_TEST_AMOY_MATIC }, tags: [TokenTag.ChainPolygonTestAmoy] },
    { info: { polygon_test_amoy: TOKEN_INFO_POLYGON_TEST_AMOY_TEST1 }, tags: [TokenTag.ChainPolygonTestAmoy] },
    // BSC
    { info: { bsc: TOKEN_INFO_BSC_BNB }, tags: [TokenTag.ChainBsc] },
    { info: { bsc: TOKEN_INFO_BSC_WBNB }, tags: [TokenTag.ChainBsc] },
    { info: { bsc: TOKEN_INFO_BSC_BUSD }, tags: [TokenTag.ChainBsc] },
    { info: { bsc: TOKEN_INFO_BSC_USDT }, tags: [TokenTag.ChainBsc] },
    // BSC TEST
    { info: { bsc_test: TOKEN_INFO_BSC_TEST_BNB }, tags: [TokenTag.ChainBscTest] },
    { info: { bsc_test: TOKEN_INFO_BSC_TEST_WBNB }, tags: [TokenTag.ChainBscTest] },
    { info: { bsc_test: TOKEN_INFO_BSC_TEST_BUSD }, tags: [TokenTag.ChainBscTest] },
    { info: { bsc_test: TOKEN_INFO_BSC_TEST_USDT }, tags: [TokenTag.ChainBscTest] },
    { info: { bsc_test: TOKEN_INFO_BSC_TEST_USDC }, tags: [TokenTag.ChainBscTest] },
];

export const PRESET_ALL_TOKEN_INFO = [
    ...PRESET_ALL_TOKEN_INFO_IC,
    ...PRESET_ALL_TOKEN_INFO_ETHEREUM,
    ...PRESET_ALL_TOKEN_INFO_ETHEREUM_TEST_SEPOLIA,
    ...PRESET_ALL_TOKEN_INFO_POLYGON,
    ...PRESET_ALL_TOKEN_INFO_POLYGON_TEST_AMOY,
    ...PRESET_ALL_TOKEN_INFO_BSC,
    ...PRESET_ALL_TOKEN_INFO_BSC_TEST,
];

export const is_known_token = (token: TokenInfo): boolean =>
    !!PRESET_ALL_TOKEN_INFO.find((t) => is_same_token_info(t, token));
