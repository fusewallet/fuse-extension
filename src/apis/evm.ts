import Moralis from 'moralis';
import { toHex, type Address } from 'viem';

const MORALIS_API_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjgwM2QzNmU4LWNhOTItNDhhYS1hMzA2LTIyMWI0NzBiMDVkZSIsIm9yZ0lkIjoiMjQ2OTk5IiwidXNlcklkIjoiMjQ5OTY0IiwidHlwZUlkIjoiZDlhNDNhOTctN2ZhNi00ZTNiLThmNjgtOGNiNTg2NDljYzU4IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3MzI2OTI3MjcsImV4cCI6NDg4ODQ1MjcyN30.oagxTs9n3zWPguMvZjpNEM82o_CMhK7iskIuRgrb07I';

await Moralis.start({
    apiKey: MORALIS_API_KEY,
});
export interface GetTransactionsHistoryArgs {
    address: Address;
    limit: number;
    cursor: string; //cursor for query next page
}

/**
 * Get native token transaction history for a wallet address
 * @param chainId - The ID of the blockchain network
 * @param args - Query parameters including address, page number and items per page
 * @returns Formatted native transaction data with pagination info
 */
export const getWalletNativeTransactionsHistory = async (chainId: number, args: GetTransactionsHistoryArgs) => {
    const chain = toHex(chainId);
    if (!chain) {
        throw new Error(`Unsupported chain ID: ${chainId}`);
    }

    try {
        const response = await Moralis.EvmApi.transaction.getWalletTransactions({
            address: args.address,
            chain,
            limit: args.limit,
            cursor: args.cursor,
            order: 'DESC',
        });

        return {
            data: response.raw.result.map((tx) => ({
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
            total: response.raw.total,
            cursor: response.raw.cursor,
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
export const getWalletErc20TransactionsHistory = async (chainId: number, args: GetTransactionsHistoryArgs) => {
    const chain = toHex(chainId);
    if (!chain) {
        throw new Error(`Unsupported chain ID: ${chainId}`);
    }

    try {
        const response = await Moralis.EvmApi.token.getWalletTokenTransfers({
            address: args.address,
            chain,
            limit: args.limit,
            cursor: args.cursor,
            order: 'DESC',
        });

        return {
            data: response.raw.result.map((transfer) => ({
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
            total: response.raw.total,
            cursor: response.raw.cursor,
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
    const chain = toHex(chainId);
    if (!chain) {
        throw new Error(`Unsupported chain ID: ${chainId}`);
    }
    try {
        const response = await Moralis.EvmApi.token.getTokenPrice({
            address,
            chain,
            include: 'percent_change',
        });
        return response.raw;
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
    const chain = toHex(chainId);
    if (!chain) {
        throw new Error(`Unsupported chain ID: ${chainId}`);
    }

    try {
        const response = await Moralis.EvmApi.token.getMultipleTokenPrices(
            {
                chain,
                include: 'percent_change',
            },
            {
                tokens,
            },
        );
        return response.raw;
    } catch (error) {
        console.error('Error fetching multiple token prices:', error);
        throw error;
    }
};
