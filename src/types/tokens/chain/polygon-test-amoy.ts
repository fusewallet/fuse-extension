import type { Address } from 'viem';

export enum PolygonTestAmoyTokenStandard {
    NATIVE = 'native',
    ERC20 = 'erc20', // https://eips.ethereum.org/EIPS/eip-20
}

export interface PolygonTestAmoyTokenInfo {
    address: Address;
    standards: PolygonTestAmoyTokenStandard[];
    name: string;
    symbol: string;
    decimals: number;
}

// <prefix>:token:info:polygon-test-amoy => [address => info]
export type PolygonTestAmoyTokens = Record<Address, PolygonTestAmoyTokenInfo>;

// <prefix>:balance:polygon-test-amoy:address => [canister_id => balance]
export type PolygonTestAmoyTokenBalances = Record<Address, string>;

export interface PolygonTestAmoyTokenPrice {
    address: Address;
    price?: string;
    price_change_24h?: string;
}

// <prefix>:token:price:polygon-test-amoy => [address => price]
export type PolygonTestAmoyTokenPrices = Record<Address, PolygonTestAmoyTokenPrice>;
