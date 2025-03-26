import type { Address } from 'viem';

export enum BscTestTokenStandard {
    NATIVE = 'native',
    BEP20 = 'bep20', // https://eips.ethereum.org/EIPS/eip-20
}

export interface BscTestTokenInfo {
    address: Address;
    standards: BscTestTokenStandard[];
    name: string;
    symbol: string;
    decimals: number;
}

// <prefix>:token:info:bsc-test => [address => info]
export type BscTestTokens = Record<Address, BscTestTokenInfo>;

// <prefix>:balance:bsc-test:address => [canister_id => balance]
export type BscTestTokenBalances = Record<Address, string>;

export interface BscTestTokenPrice {
    address: Address;
    price?: string;
    price_change_24h?: string;
}

// <prefix>:token:price:bsc-test => [address => price]
export type BscTestTokenPrices = Record<Address, BscTestTokenPrice>;
