import { bsc, mainnet, sepolia } from 'viem/chains';

// Token type definition
export interface EvmTokenInfo {
    chainId: number;
    address: `0x${string}`;
    name: string;
    symbol: string;
    decimals: number;
    logoURI?: string;
    tags?: string[];
    isNative?: boolean;
}

// Helper function to get logo URI from Covalent
export const evm_get_logo_uri = (address: `0x${string}`, chainId: number) => {
    return `https://logos.covalenthq.com/tokens/${chainId}/${address.toLowerCase()}.png`;
};

// Organize token lists by chain ID
export type TokenList = Record<number, EvmTokenInfo[]>;

// Preset token list
export const POPULAR_TOKENS: TokenList = {
    // Ethereum Mainnet (chainId: 1)
    [mainnet.id]: [
        {
            address: '0x0000000000000000000000000000000000000000',
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18,
            chainId: mainnet.id,
            isNative: true,
        },
        {
            address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
            name: 'Wrapped Ether',
            symbol: 'WETH',
            decimals: 18,
            logoURI: evm_get_logo_uri('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', mainnet.id),
            chainId: mainnet.id,
        },
        {
            address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            name: 'USD Coin',
            symbol: 'USDC',
            decimals: 6,
            logoURI: evm_get_logo_uri('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', mainnet.id),
            chainId: mainnet.id,
        },
        {
            address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
            name: 'Tether USD',
            symbol: 'USDT',
            decimals: 6,
            logoURI: evm_get_logo_uri('0xdAC17F958D2ee523a2206206994597C13D831ec7', mainnet.id),
            chainId: mainnet.id,
        },
        // More tokens...
    ],

    // Binance Smart Chain (chainId: 56)
    [bsc.id]: [
        {
            address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
            name: 'Wrapped BNB',
            symbol: 'WBNB',
            decimals: 18,
            logoURI: evm_get_logo_uri('0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', bsc.id),
            chainId: bsc.id,
        },
        // More tokens...
    ],

    // Sepolia Testnet (chainId: 11155111)
    [sepolia.id]: [
        {
            address: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9',
            name: 'Wrapped Ether',
            symbol: 'WETH',
            decimals: 18,
            logoURI: evm_get_logo_uri('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', sepolia.id), // Using mainnet logo
            chainId: sepolia.id,
        },
        {
            address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
            name: 'USD Coin',
            symbol: 'USDC',
            decimals: 6,
            logoURI: evm_get_logo_uri('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', sepolia.id), // Using mainnet logo
            chainId: sepolia.id,
        },
        {
            address: '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0',
            name: 'Tether USD',
            symbol: 'USDT',
            decimals: 6,
            logoURI: evm_get_logo_uri('0xdAC17F958D2ee523a2206206994597C13D831ec7', sepolia.id), // Using mainnet logo
            chainId: sepolia.id,
        },
        {
            address: '0x779877A7B0D9E8603169DdbD7836e478b4624789',
            name: 'ChainLink',
            symbol: 'LINK',
            decimals: 18,
            logoURI: evm_get_logo_uri('0x514910771AF9Ca656af840dff83E8264EcF986CA', sepolia.id), // Using mainnet logo
            chainId: sepolia.id,
        },
        {
            address: '0x8267cF9254734C6Eb452a7bb9AAF97B392258b21',
            name: 'Dai Stablecoin',
            symbol: 'DAI',
            decimals: 18,
            logoURI: evm_get_logo_uri('0x6B175474E89094C44Da98b954EedeAC495271d0F', sepolia.id), // Using mainnet logo
            chainId: sepolia.id,
        },
    ],
};

// Helper function - Get token list for a specific chain
export function getTokensForChain(chainId: number): EvmTokenInfo[] {
    return POPULAR_TOKENS[chainId] || [];
}

// Helper function - Find token by address and chain ID
export function findToken(address: string, chainId: number): EvmTokenInfo | undefined {
    const normalizedAddress = address.toLowerCase();
    const tokens = getTokensForChain(chainId);

    return tokens.find((token) => token.address.toLowerCase() === normalizedAddress);
}
