export enum IcTokenStandard {
    ICRC1 = 'icrc1', // https://github.com/dfinity/ICRC-1/tree/main/standards/ICRC-1
    ICRC2 = 'icrc2', // https://github.com/dfinity/ICRC-1/tree/main/standards/ICRC-2
}

export interface IcTokenInfo {
    canister_id: string;
    standards: IcTokenStandard[];
    name: string;
    symbol: string;
    decimals: number;
    fee: string;
}

// <prefix>:token:info:ic => [canister_id => info]
export type IcTokens = Record<string, IcTokenInfo>;

// <prefix>:balance:ic:address => [canister_id => balance]
export type IcTokenBalances = Record<string, string>;

export interface IcTokenPrice {
    canister_id: string;
    price?: string;
    price_change_24h?: string;
}

// <prefix>:token:price:ic => [canister_id => price]
export type IcTokenPrices = Record<string, IcTokenPrice>;

export interface IcTokenMetadata {
    ledgerId: string;
    marketCap: string;
    fullyDilutedMarketCap: string;
    name: string;
    // 'SNS' | 'CHAIN FUSION' | 'ICRC'
    source: string;
    symbol: string;
    tokenDecimal: number;
    supplyCap: string;
    totalSupply: string;
    description: string;
    tokenDetail: {
        Website: string;
        Github?: string;
        Twitter?: string;
        Discord?: string;
        Telegram?: string;
        Medium?: string;
    };
}
