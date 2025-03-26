import type { Address } from 'viem';

export enum EthereumTestSepoliaTokenStandard {
    NATIVE = 'native',
    ERC20 = 'erc20', // https://eips.ethereum.org/EIPS/eip-20
}

export interface EthereumTestSepoliaTokenInfo {
    address: Address;
    standards: EthereumTestSepoliaTokenStandard[];
    name: string;
    symbol: string;
    decimals: number;
}

// <prefix>:token:info:ethereum-test-sepolia => [address => info]
export type EthereumTestSepoliaTokens = Record<Address, EthereumTestSepoliaTokenInfo>;

// <prefix>:balance:ethereum-test-sepolia:address => [canister_id => balance]
export type EthereumTestSepoliaTokenBalances = Record<Address, string>;

export interface EthereumTestSepoliaTokenPrice {
    address: Address;
    price?: string;
    price_change_24h?: string;
}

// <prefix>:token:price:ethereum-test-sepolia => [address => price]
export type EthereumTestSepoliaTokenPrices = Record<Address, EthereumTestSepoliaTokenPrice>;
