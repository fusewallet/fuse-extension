import _ from 'lodash';
import type { Address as EvmAddress } from 'viem';

import type { EvmChain } from '~types/chain';

import { BscTokenStandard, type BscTokenInfo } from './chain/bsc';
import { BscTestTokenStandard, type BscTestTokenInfo } from './chain/bsc-test';
import { EthereumTokenStandard, type EthereumTokenInfo } from './chain/ethereum';
import { EthereumTestSepoliaTokenStandard, type EthereumTestSepoliaTokenInfo } from './chain/ethereum-test-sepolia';
import type { IcTokenInfo } from './chain/ic';
import { PolygonTokenStandard, type PolygonTokenInfo } from './chain/polygon';
import { PolygonTestAmoyTokenStandard, type PolygonTestAmoyTokenInfo } from './chain/polygon-test-amoy';
import type { ShowTokenPrice } from './price';

export enum TokenTag {
    // ic
    ChainIc = 'chain-ic',
    ChainIcSns = 'chain-ic-sns',
    ChainIcCk = 'chain-ic-ck',
    ChainIcCustom = 'chain-ic-custom',
    // ethereum
    ChainEthereum = 'chain-ethereum',
    ChainEthereumCustom = 'chain-ethereum-custom',
    // ethereum test sepolia
    ChainEthereumTestSepolia = 'chain-ethereum-test-sepolia',
    ChainEthereumTestSepoliaCustom = 'chain-ethereum-test-sepolia-custom',
    // polygon
    ChainPolygon = 'chain-polygon',
    ChainPolygonCustom = 'chain-polygon-custom',
    // polygon test amoy
    ChainPolygonTestAmoy = 'chain-polygon-test-amoy',
    ChainPolygonTestAmoyCustom = 'chain-polygon-test-amoy-custom',
    // bsc
    ChainBsc = 'chain-bsc',
    ChainBscCustom = 'chain-bsc-custom',
    // bsc test
    ChainBscTest = 'chain-bsc-test',
    ChainBscTestCustom = 'chain-bsc-test-custom',
}

export type CombinedTokenInfo =
    | { ic: IcTokenInfo }
    | { ethereum: EthereumTokenInfo }
    | { ethereum_test_sepolia: EthereumTestSepoliaTokenInfo }
    | { polygon: PolygonTokenInfo }
    | { polygon_test_amoy: PolygonTestAmoyTokenInfo }
    | { bsc: BscTokenInfo }
    | { bsc_test: BscTestTokenInfo };

export type EvmTokenInfo =
    | EthereumTokenInfo
    | EthereumTestSepoliaTokenInfo
    | PolygonTokenInfo
    | PolygonTestAmoyTokenInfo
    | BscTokenInfo
    | BscTestTokenInfo;

export type AnyTokenInfo = IcTokenInfo | EvmTokenInfo;

export const match_combined_token_info = <T>(
    self: CombinedTokenInfo,
    {
        ic,
        ethereum,
        ethereum_test_sepolia,
        polygon,
        polygon_test_amoy,
        bsc,
        bsc_test,
    }: {
        ic: (ic: IcTokenInfo) => T;
        ethereum: (ethereum: EthereumTokenInfo) => T;
        ethereum_test_sepolia: (ethereum_test_sepolia: EthereumTestSepoliaTokenInfo) => T;
        polygon: (polygon: PolygonTokenInfo) => T;
        polygon_test_amoy: (polygon_test_amoy: PolygonTestAmoyTokenInfo) => T;
        bsc: (bsc: BscTokenInfo) => T;
        bsc_test: (bsc: BscTestTokenInfo) => T;
    },
): T => {
    if ('ic' in self) return ic(self.ic);
    if ('ethereum' in self) return ethereum(self.ethereum);
    if ('ethereum_test_sepolia' in self) return ethereum_test_sepolia(self.ethereum_test_sepolia);
    if ('polygon' in self) return polygon(self.polygon);
    if ('polygon_test_amoy' in self) return polygon_test_amoy(self.polygon_test_amoy);
    if ('bsc' in self) return bsc(self.bsc);
    if ('bsc_test' in self) return bsc_test(self.bsc_test);
    throw new Error('Unknown token info');
};
export const match_combined_token_info_async = async <T>(
    self: CombinedTokenInfo,
    {
        ic,
        ethereum,
        ethereum_test_sepolia,
        polygon,
        polygon_test_amoy,
        bsc,
        bsc_test,
    }: {
        ic: (ic: IcTokenInfo) => Promise<T>;
        ethereum: (ethereum: EthereumTokenInfo) => Promise<T>;
        ethereum_test_sepolia: (ethereum_test_sepolia: EthereumTestSepoliaTokenInfo) => Promise<T>;
        polygon: (polygon: PolygonTokenInfo) => Promise<T>;
        polygon_test_amoy: (polygon_test_amoy: PolygonTestAmoyTokenInfo) => Promise<T>;
        bsc: (bsc: BscTokenInfo) => Promise<T>;
        bsc_test: (bsc: BscTestTokenInfo) => Promise<T>;
    },
): Promise<T> => {
    if ('ic' in self) return ic(self.ic);
    if ('ethereum' in self) return ethereum(self.ethereum);
    if ('ethereum_test_sepolia' in self) return ethereum_test_sepolia(self.ethereum_test_sepolia);
    if ('polygon' in self) return polygon(self.polygon);
    if ('polygon_test_amoy' in self) return polygon_test_amoy(self.polygon_test_amoy);
    if ('bsc' in self) return bsc(self.bsc);
    if ('bsc_test' in self) return bsc_test(self.bsc_test);
    throw new Error('Unknown token info');
};

export interface TokenInfo {
    info: CombinedTokenInfo;
    tags: TokenTag[];
}

const get_token_main_address = (token: TokenInfo) => {
    return match_combined_token_info(token.info, {
        ic: (ic) => ic.canister_id,
        ethereum: (ethereum) => ethereum.address,
        ethereum_test_sepolia: (ethereum_test_sepolia) => ethereum_test_sepolia.address,
        polygon: (polygon) => polygon.address,
        polygon_test_amoy: (polygon_test_amoy) => polygon_test_amoy.address,
        bsc: (bsc) => bsc.address,
        bsc_test: (bsc_test) => bsc_test.address,
    });
};

export const is_same_token_info = (a: TokenInfo, b: TokenInfo): boolean => {
    if (Object.keys(a)[0] !== Object.keys(b)[0]) return false;
    return get_token_main_address(a) === get_token_main_address(b);
};
export type TokenUniqueId = string;
export const get_token_unique_id = (token: TokenInfo): TokenUniqueId => {
    return match_combined_token_info(token.info, {
        ic: (ic) => `ic#${ic.canister_id}`,
        ethereum: (ethereum) => `ethereum#${ethereum.address}_${ethereum.symbol}`,
        ethereum_test_sepolia: (ethereum_test_sepolia) =>
            `ethereum_test_sepolia#${ethereum_test_sepolia.address}_${ethereum_test_sepolia.symbol}`,
        polygon: (polygon) => `polygon#${polygon.address}_${polygon.symbol}`,
        polygon_test_amoy: (polygon_test_amoy) =>
            `polygon_test_amoy#${polygon_test_amoy.address}_${polygon_test_amoy.symbol}`,
        bsc: (bsc) => `bsc#${bsc.address}_${bsc.symbol}`,
        bsc_test: (bsc_test) => `bsc_test#${bsc_test.address}_${bsc_test.symbol}`,
    });
};
export const get_token_name = (token: TokenInfo): string => {
    return match_combined_token_info(token.info, {
        ic: (ic) => ic.name,
        ethereum: (ethereum) => ethereum.name,
        ethereum_test_sepolia: (ethereum_test_sepolia) => ethereum_test_sepolia.name,
        polygon: (polygon) => polygon.name,
        polygon_test_amoy: (polygon_test_amoy) => polygon_test_amoy.name,
        bsc: (bsc) => bsc.name,
        bsc_test: (bsc_test) => bsc_test.name,
    });
};
export const get_token_symbol = (token: TokenInfo): string => {
    return match_combined_token_info(token.info, {
        ic: (ic) => ic.symbol,
        ethereum: (ethereum) => ethereum.symbol,
        ethereum_test_sepolia: (ethereum_test_sepolia) => ethereum_test_sepolia.symbol,
        polygon: (polygon) => polygon.symbol,
        polygon_test_amoy: (polygon_test_amoy) => polygon_test_amoy.symbol,
        bsc: (bsc) => bsc.symbol,
        bsc_test: (bsc_test) => bsc_test.symbol,
    });
};
export const search_tokens = (tokens: TokenInfo[], search: string) => {
    const s = search.trim().toLowerCase();
    if (!s) return tokens;
    return tokens.filter(
        (t) => 0 <= get_token_name(t).toLowerCase().indexOf(s) || 0 <= get_token_symbol(t).toLowerCase().indexOf(s),
    );
};

type TokenInfoWithIc = TokenInfo & { info: { ic: IcTokenInfo } };
type TokenInfoWithEthereum = TokenInfo & { info: { ethereum: EthereumTokenInfo } };
type TokenInfoWithEthereumTestSepolia = TokenInfo & { info: { ethereum_test_sepolia: EthereumTestSepoliaTokenInfo } };
type TokenInfoWithPolygon = TokenInfo & { info: { polygon: PolygonTokenInfo } };
type TokenInfoWithPolygonTestAmoy = TokenInfo & { info: { polygon_test_amoy: PolygonTestAmoyTokenInfo } };
type TokenInfoWithBsc = TokenInfo & { info: { bsc: BscTokenInfo } };
type TokenInfoWithBscTest = TokenInfo & { info: { bsc_test: BscTestTokenInfo } };

export type TokenInfoWithEvm =
    | TokenInfoWithEthereum
    | TokenInfoWithEthereumTestSepolia
    | TokenInfoWithPolygon
    | TokenInfoWithPolygonTestAmoy
    | TokenInfoWithBsc
    | TokenInfoWithBscTest;

export type GroupedTokens = {
    ic: TokenInfoWithIc[];
    ethereum: TokenInfoWithEthereum[];
    ethereum_test_sepolia: TokenInfoWithEthereumTestSepolia[];
    polygon: TokenInfoWithPolygon[];
    polygon_test_amoy: TokenInfoWithPolygonTestAmoy[];
    bsc: TokenInfoWithBsc[];
    bsc_test: TokenInfoWithBscTest[];
};
export const group_tokens_by_chain = (tokens: TokenInfo[]): GroupedTokens => {
    const grouped = _.groupBy(tokens, (token) => {
        // Get the chain key for the token
        const chainKey = Object.keys(token.info)[0];
        return chainKey;
    });
    return {
        ic: (grouped.ic || []) as TokenInfoWithIc[],
        ethereum: (grouped.ethereum || []) as TokenInfoWithEthereum[],
        ethereum_test_sepolia: (grouped.ethereum_test_sepolia || []) as TokenInfoWithEthereumTestSepolia[],
        polygon: (grouped.polygon || []) as TokenInfoWithPolygon[],
        polygon_test_amoy: (grouped.polygon_test_amoy || []) as TokenInfoWithPolygonTestAmoy[],
        bsc: (grouped.bsc || []) as TokenInfoWithBsc[],
        bsc_test: (grouped.bsc_test || []) as TokenInfoWithBscTest[],
    };
};
export interface CustomToken {
    created: number;
    updated: number;
    token: TokenInfo;
}

// <prefix>:token:info:custom => TokenInfo[]
export type CustomTokens = CustomToken[];

// <prefix>:token:info:current => TokenInfo[]
export type CurrentTokens = TokenInfo[];

export type CurrentTokenShowInfo = {
    token: TokenInfo;
    price: ShowTokenPrice;
    balance: {
        raw: string | undefined;
        formatted: string | undefined;
    };
    usd_value: {
        raw: string | undefined;
        formatted: string | undefined;
    };
};

export const get_evm_token_info = (info: CombinedTokenInfo) => {
    return match_combined_token_info<{
        symbol: string;
        name: string;
        chain: EvmChain;
        isNative: boolean;
        isErc20: boolean;
        address: EvmAddress;
        decimals: number;
    }>(info, {
        ic: () => {
            throw new Error('ic token not supported');
        },
        ethereum: (ethereum) => ({
            symbol: ethereum.symbol,
            name: ethereum.name,
            chain: 'ethereum',
            address: ethereum.address,
            isNative: ethereum.standards.includes(EthereumTokenStandard.NATIVE),
            isErc20: ethereum.standards.includes(EthereumTokenStandard.ERC20),
            decimals: ethereum.decimals,
        }),
        ethereum_test_sepolia: (ethereum_test_sepolia) => ({
            symbol: ethereum_test_sepolia.symbol,
            name: ethereum_test_sepolia.name,
            chain: 'ethereum-test-sepolia',
            address: ethereum_test_sepolia.address,
            isNative: ethereum_test_sepolia.standards.includes(EthereumTestSepoliaTokenStandard.NATIVE),
            isErc20: ethereum_test_sepolia.standards.includes(EthereumTestSepoliaTokenStandard.ERC20),
            decimals: ethereum_test_sepolia.decimals,
        }),
        polygon: (polygon) => ({
            symbol: polygon.symbol,
            name: polygon.name,
            chain: 'polygon',
            address: polygon.address,
            isNative: polygon.standards.includes(PolygonTokenStandard.NATIVE),
            isErc20: polygon.standards.includes(PolygonTokenStandard.ERC20),
            decimals: polygon.decimals,
        }),
        polygon_test_amoy: (polygon_test_amoy) => ({
            symbol: polygon_test_amoy.symbol,
            name: polygon_test_amoy.name,
            chain: 'polygon-test-amoy',
            address: polygon_test_amoy.address,
            isNative: polygon_test_amoy.standards.includes(PolygonTestAmoyTokenStandard.NATIVE),
            isErc20: polygon_test_amoy.standards.includes(PolygonTestAmoyTokenStandard.ERC20),
            decimals: polygon_test_amoy.decimals,
        }),
        bsc: (bsc) => ({
            symbol: bsc.symbol,
            name: bsc.name,
            chain: 'bsc',
            address: bsc.address,
            isNative: bsc.standards.includes(BscTokenStandard.NATIVE),
            isErc20: bsc.standards.includes(BscTokenStandard.BEP20),
            decimals: bsc.decimals,
        }),
        bsc_test: (bsc_test) => ({
            symbol: bsc_test.symbol,
            name: bsc_test.name,
            chain: 'bsc-test',
            address: bsc_test.address,
            isNative: bsc_test.standards.includes(BscTestTokenStandard.NATIVE),
            isErc20: bsc_test.standards.includes(BscTestTokenStandard.BEP20),
            decimals: bsc_test.decimals,
        }),
    });
};
