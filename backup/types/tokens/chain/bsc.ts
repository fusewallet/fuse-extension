import type { Address } from 'viem';

export enum BscTokenStandard {
    NATIVE = 'native',
    BEP20 = 'bep20', // https://eips.ethereum.org/EIPS/eip-20
}

export interface BscTokenInfo {
    address: Address;
    standards: BscTokenStandard[];
    name: string;
    symbol: string;
    decimals: number;
}

// <prefix>:token:info:bsc => [address => info]
export type BscTokens = Record<Address, BscTokenInfo>;

// <prefix>:balance:bsc:address => [canister_id => balance]
export type BscTokenBalances = Record<Address, string>;

export interface BscTokenPrice {
    address: Address;
    price?: string;
    price_change_24h?: string;
}

// <prefix>:token:price:bsc => [address => price]
export type BscTokenPrices = Record<Address, BscTokenPrice>;
