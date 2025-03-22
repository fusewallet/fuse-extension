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
/**
 * Get native token transaction history for a wallet address
 * @param chainId - The ID of the blockchain network
 * @param args - Query parameters including address, page number and items per page
 * @returns Formatted native transaction data with pagination info
 */
export const getWalletNativeTransactionsHistory = async (chainId: number, args: GetTransactionsHistoryArgs) => {
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

        const result: Awaited<ReturnType<typeof Moralis.EvmApi.transaction.getWalletTransactions>> =
            await response.json();

        return {
            data: result.raw.result.map((tx) => ({
                hash: tx.hash,
                from: tx.from_address,
                to: tx.to_address,
                value: tx.value,
                timestamp: tx.block_timestamp,
                blockNumber: tx.block_number,
                gas: tx.gas,
                gasPrice: tx.gas_price,
                isError: tx.receipt_status !== '1',
            })),
            total: result.raw.total,
            cursor: result.raw.cursor,
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
export const getWalletErc20TransactionsHistory = async (chainId: number, args: GetErc20TransactionsHistoryArgs) => {
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

        const result: Awaited<ReturnType<typeof Moralis.EvmApi.token.getWalletTokenTransfers>> = await response.json();

        return {
            data: result.raw.result.map((transfer) => ({
                hash: transfer.transaction_hash,
                tokenName: transfer.token_name,
                tokenSymbol: transfer.token_symbol,
                tokenLogo: transfer.token_logo,
                tokenDecimals: transfer.token_decimals,
                contractAddress: transfer.address,
                from: transfer.from_address,
                fromLabel: transfer.from_address_label,
                to: transfer.to_address,
                toLabel: transfer.to_address_label,
                value: transfer.value,
                timestamp: transfer.block_timestamp,
                blockNumber: transfer.block_number,
                transactionIndex: transfer.transaction_index,
                logIndex: transfer.log_index,
                possibleSpam: transfer.possible_spam,
            })),
            total: result.raw.total,
            cursor: result.raw.cursor,
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

        const result: Awaited<ReturnType<typeof Moralis.EvmApi.token.getMultipleTokenPrices>> = await response.json();

        return result.raw;
    } catch (error) {
        console.error('Error fetching multiple token prices:', error);
        throw error;
    }
};

/**
 * Get token Detail
 * @param chainId - Chain ID (1: Ethereum, 11155111: Sepolia)
 * @param address - Token contract address
 * @returns Token Detail
 */
export const getTokenDetail = async (chainId: number, address: Address) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/token-info`, {
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
        const result: Awaited<ReturnType<typeof Moralis.EvmApi.token.getTokenMetadata>> = await response.json();
        return result.raw;
    } catch (error) {
        console.error('Error fetching token info:', error);
        throw error;
    }
};
