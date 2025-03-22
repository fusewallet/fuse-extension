// prettier-ignore // cSpell:words Shiba
import { TokenTag, type TokenInfo } from '..';
import { EthereumTokenStandard, type EthereumTokenInfo } from './../chain/ethereum';

export const TOKEN_INFO_ETHEREUM_ETH: EthereumTokenInfo  = { address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', name: 'Ethereum',      symbol: 'ETH',   decimals: 18, standards: [EthereumTokenStandard.NATIVE] };
export const TOKEN_INFO_ETHEREUM_WETH: EthereumTokenInfo = { address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', name: 'Wrapped Ether', symbol: 'WETH',  decimals: 18, standards: [EthereumTokenStandard.ERC20] };
export const TOKEN_INFO_ETHEREUM_USDC: EthereumTokenInfo = { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', name: 'USD Coin',      symbol: 'USDC',  decimals: 6,  standards: [EthereumTokenStandard.ERC20] };
export const TOKEN_INFO_ETHEREUM_USDT: EthereumTokenInfo = { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', name: 'Tether USD',    symbol: 'USDT',  decimals: 6,  standards: [EthereumTokenStandard.ERC20] };
export const TOKEN_INFO_ETHEREUM_DAI: EthereumTokenInfo  = { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', name: 'Dai',           symbol: 'DAI',   decimals: 18, standards: [EthereumTokenStandard.ERC20] };
export const TOKEN_INFO_ETHEREUM_LINK: EthereumTokenInfo = { address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', name: 'ChainLink',     symbol: 'LINK',  decimals: 18, standards: [EthereumTokenStandard.ERC20] };
export const TOKEN_INFO_ETHEREUM_WBTC: EthereumTokenInfo = { address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', name: 'Wrapped BTC',   symbol: 'WBTC',  decimals: 8,  standards: [EthereumTokenStandard.ERC20] };
export const TOKEN_INFO_ETHEREUM_UNI: EthereumTokenInfo  = { address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', name: 'Uniswap',       symbol: 'UNI',   decimals: 18, standards: [EthereumTokenStandard.ERC20] };
export const TOKEN_INFO_ETHEREUM_PEPE: EthereumTokenInfo = { address: '0x6982508145454Ce325dDbE47a25d4ec3d2311933', name: 'Pepe',          symbol: 'PEPE',  decimals: 18, standards: [EthereumTokenStandard.ERC20] };
export const TOKEN_INFO_ETHEREUM_SHIB: EthereumTokenInfo = { address: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE', name: 'Shiba Inu',     symbol: 'SHIB',  decimals: 18, standards: [EthereumTokenStandard.ERC20] };

// =========================== all token info ===========================

export const PRESET_ALL_TOKEN_INFO_ETHEREUM: TokenInfo[] = [
    { info: { ethereum: TOKEN_INFO_ETHEREUM_ETH },  tags: [TokenTag.ChainEthereum] },
    { info: { ethereum: TOKEN_INFO_ETHEREUM_WETH }, tags: [TokenTag.ChainEthereum] },
    { info: { ethereum: TOKEN_INFO_ETHEREUM_USDC }, tags: [TokenTag.ChainEthereum] },
    { info: { ethereum: TOKEN_INFO_ETHEREUM_USDT }, tags: [TokenTag.ChainEthereum] },
    { info: { ethereum: TOKEN_INFO_ETHEREUM_DAI },  tags: [TokenTag.ChainEthereum] },
    { info: { ethereum: TOKEN_INFO_ETHEREUM_LINK }, tags: [TokenTag.ChainEthereum] },
    { info: { ethereum: TOKEN_INFO_ETHEREUM_WBTC }, tags: [TokenTag.ChainEthereum] },
    { info: { ethereum: TOKEN_INFO_ETHEREUM_UNI },  tags: [TokenTag.ChainEthereum] },
    { info: { ethereum: TOKEN_INFO_ETHEREUM_PEPE }, tags: [TokenTag.ChainEthereum] },
    { info: { ethereum: TOKEN_INFO_ETHEREUM_SHIB }, tags: [TokenTag.ChainEthereum] },
];


