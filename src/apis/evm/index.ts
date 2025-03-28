import Moralis from 'moralis';
import { type Address } from 'viem';

// API base URL - replace with your Cloudflare Worker URL
const API_BASE_URL = process.env.PLASMO_PUBLIC_MORALIS_URL;

export interface GetTransactionsHistoryArgs {
    address: Address;
    limit: number;
    cursor: string; //cursor for query next page
}
export interface GetErc20TransactionsHistoryArgs extends GetTransactionsHistoryArgs {
    contractAddresses?: Address[];
}
export type GetTransactionsHistoryItem = {
    hash: string;
    from: Address;
    to: Address;
    value: string;
    timestamp: string;
    blockNumber: string;
    gas?: string;
    gasPrice?: string;
    isError?: boolean;
};
/**
 * Get native token transaction history for a wallet address
 * @param chainId - The ID of the blockchain network
 * @param args - Query parameters including address, page number and items per page
 * @returns Formatted native transaction data with pagination info
 */
export const getWalletNativeTransactionsHistory = async (
    chainId: number,
    args: GetTransactionsHistoryArgs,
): Promise<{
    data: GetTransactionsHistoryItem[];
    cursor: string | undefined;
}> => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/native-transactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chainId,
                address: args.address,
                limit: args.limit,
                cursor: args.cursor,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const result: Awaited<ReturnType<typeof Moralis.EvmApi.transaction.getWalletTransactions>>['raw'] =
            await response.json();

        return {
            data: result.result.map((tx) => ({
                hash: tx.hash,
                from: tx.from_address as Address,
                to: (tx.to_address ?? tx.receipt_contract_address) as Address,
                value: tx.value,
                timestamp: tx.block_timestamp,
                blockNumber: tx.block_number,
                gas: tx.gas,
                gasPrice: tx.gas_price,
                isError: tx.receipt_status !== '1',
            })),
            cursor: result.cursor,
        };
    } catch (error) {
        console.error('Error fetching native transactions:', error);
        throw error;
    }
};

/**
 * Get ERC20 token transfers for a wallet address
 * @param chainId - The ID of the blockchain network
 * @param args - Query parameters including address, limit and cursor
 * @returns Formatted ERC20 transfer data with pagination info
 */
export const getWalletErc20TransactionsHistory = async (
    chainId: number,
    args: GetErc20TransactionsHistoryArgs,
): Promise<{
    data: GetTransactionsHistoryItem[];
    cursor: string | undefined;
}> => {
    const { address, limit, cursor, contractAddresses } = args;
    try {
        const response = await fetch(`${API_BASE_URL}/api/token-transfers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chainId,
                address,
                limit,
                cursor,
                ...(contractAddresses && { contractAddresses }),
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const result: Awaited<ReturnType<typeof Moralis.EvmApi.token.getWalletTokenTransfers>>['raw'] =
            await response.json();

        return {
            data: result.result.map((transfer) => ({
                hash: transfer.transaction_hash,
                from: transfer.from_address as Address,
                to: transfer.to_address as Address,
                value: transfer.value,
                timestamp: transfer.block_timestamp,
                blockNumber: transfer.block_number,
            })),
            cursor: result.cursor,
        };
    } catch (error) {
        console.error('Error fetching ERC20 transfers:', error);
        throw error;
    }
};

/**
 * Get ERC20 token price
 * @param chainId - Chain ID (1: Ethereum, 11155111: Sepolia)
 * @param address - Token contract address
 * @returns Token price info (USD and native price)
 */
export const getErc20TokenPrice = async (chainId: number, address: Address) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/token-price`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chainId,
                address,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const result: Awaited<ReturnType<typeof Moralis.EvmApi.token.getTokenPrice>> = await response.json();

        return result.raw;
    } catch (error) {
        console.error('Error fetching ERC20 token price:', error);
        throw error;
    }
};

interface TokenPriceQuery {
    tokenAddress: Address;
    exchange?: string; // Optional exchange name
    toBlock?: string; // Optional block number
}

/**
 * Get prices for multiple ERC20 tokens
 * @param chainId - Chain ID (1: Ethereum, 11155111: Sepolia)
 * @param tokens - Array of token addresses and optional params
 */
export const getMultipleErc20TokenPrices = async (chainId: number, tokens: TokenPriceQuery[]) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/multiple-token-prices`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chainId,
                tokens,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const result: Awaited<ReturnType<typeof Moralis.EvmApi.token.getMultipleTokenPrices>>['raw'] =
            await response.json();

        return result.reduce(
            (acc, token) => {
                if (token?.tokenAddress) {
                    acc[token.tokenAddress.toLowerCase()] = token;
                }
                return acc;
            },
            {} as Record<string, (typeof result)[0]>,
        );
    } catch (error) {
        console.error('Error fetching multiple token prices:', error);
        throw error;
    }
};

interface TokenPlatformDetail {
    decimal_place: number;
    contract_address: string;
}
interface TokenMarketData {
    current_price: {
        usd: number;
    };
    ath: {
        usd: number;
    };
    ath_change_percentage: {
        usd: number;
    };
    ath_date: {
        usd: string;
    };
    atl: {
        usd: number;
    };
    atl_change_percentage: {
        usd: number;
    };
    atl_date: {
        usd: string;
    };
    market_cap: {
        usd: number;
    };
    market_cap_rank: number;
    total_volume: {
        usd: number;
    };
    high_24h: {
        usd: number;
    };
    low_24h: {
        usd: number;
    };
    price_change_24h: number;
    price_change_percentage_24h: number;
    price_change_percentage_7d: number;
    price_change_percentage_14d: number;
    price_change_percentage_30d: number;
    price_change_percentage_60d: number;
    price_change_percentage_200d: number;
    price_change_percentage_1y: number;
    market_cap_change_24h: number;
    market_cap_change_percentage_24h: number;
    total_supply: number;
    max_supply: number | null;
    circulating_supply: number;
    last_updated: string;
}
interface TokenLinks {
    homepage: string[];
    whitepaper: string;
    blockchain_site: string[];
    official_forum_url: string[];
    chat_url: string[];
    announcement_url: string[];
    snapshot_url: string | null;
    twitter_screen_name: string;
    facebook_username: string;
    bitcointalk_thread_identifier: number | null;
    telegram_channel_identifier: string;
    subreddit_url: string;
    repos_url: {
        github: string[];
        bitbucket: string[];
    };
}

interface TokenImage {
    thumb: string;
    small: string;
    large: string;
}

interface TokenDetail {
    id: string;
    symbol: string;
    name: string;
    web_slug: string;
    asset_platform_id: string;
    platforms: Record<string, string>;
    detail_platforms: Record<string, TokenPlatformDetail>;
    block_time_in_minutes: number;
    hashing_algorithm: string | null;
    categories: string[];
    preview_listing: boolean;
    public_notice: string;
    additional_notices: string[];
    description: {
        en: string;
    };
    links: TokenLinks;
    image: TokenImage;
    country_origin: string;
    genesis_date: string | null;
    contract_address: string;
    sentiment_votes_up_percentage: number;
    sentiment_votes_down_percentage: number;
    watchlist_portfolio_users: number;
    market_cap_rank: number;
    status_updates: any[];
    last_updated: string;
    market_data: TokenMarketData;
}
/**
 * Get token Detail
 * @param chainId - Chain ID (1: Ethereum, 11155111: Sepolia)
 * @param address - Token contract address
 * @returns Token Detail
 */
export const getTokenDetail = async (chainId: number, address: Address, isNative = false) => {
    const params = new URLSearchParams({
        chainId: `${chainId}`,
        address,
    });
    if (isNative) {
        params.append('isNative', 'true');
    }
    try {
        const response = await fetch(`${API_BASE_URL}/api/token-detail?${params}`);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const result: Awaited<TokenDetail> = await response.json();
        return result;
    } catch (error) {
        console.error('Error fetching token info:', error);
        throw error;
    }
};

export interface GasFeeEstimate {
    suggestedMaxPriorityFeePerGas: string;
    suggestedMaxFeePerGas: string;
    minWaitTimeEstimate: number;
    maxWaitTimeEstimate: number;
}

export interface SuggestedGasFees {
    low: GasFeeEstimate;
    medium: GasFeeEstimate;
    high: GasFeeEstimate;
    estimatedBaseFee: string;
    networkCongestion: number;
    latestPriorityFeeRange: string[];
    historicalPriorityFeeRange: string[];
    historicalBaseFeeRange: string[];
    priorityFeeTrend: 'up' | 'down';
    baseFeeTrend: 'up' | 'down';
    version: string;
}

export const getSuggestedGasFees = async (chainId: number): Promise<SuggestedGasFees> => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/suggested-gas-fees?chainId=${chainId}`);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const result: SuggestedGasFees = await response.json();
        return result;
    } catch (error) {
        console.error('Error fetching suggested gas fees:', error);
        throw error;
    }
};
