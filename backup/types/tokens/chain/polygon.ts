import type { Address } from 'viem';

export enum PolygonTokenStandard {
    NATIVE = 'native',
    ERC20 = 'erc20', // https://eips.ethereum.org/EIPS/eip-20
}

export interface PolygonTokenInfo {
    address: Address;
    standards: PolygonTokenStandard[];
    name: string;
    symbol: string;
    decimals: number;
}

// <prefix>:token:info:ethereum => [address => info]
export type PolygonTokens = Record<Address, PolygonTokenInfo>;

// <prefix>:balance:ethereum:address => [canister_id => balance]
export type PolygonTokenBalances = Record<Address, string>;

export interface PolygonTokenPrice {
    address: Address;
    price?: string;
    price_change_24h?: string;
}

// <prefix>:token:price:ethereum => [address => price]
export type PolygonTokenPrices = Record<Address, PolygonTokenPrice>;
