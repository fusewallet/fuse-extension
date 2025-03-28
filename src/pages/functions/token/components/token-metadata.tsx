import BigNumber from 'bignumber.js';
import { useMemo, useState } from 'react';
import { BsDiscord, BsGithub, BsGlobe, BsMedium, BsTelegram, BsTwitterX } from 'react-icons/bs';
import type { Address as EvmAddress } from 'viem';

import { ExpandableHtml } from '~components/safe-html';
import { useTokenDetail as useTokenDetailEvm } from '~hooks/apis/evm';
import { useTokenMetadataIcByInitial } from '~hooks/store/local';
import type { EvmChain } from '~types/chain';
import { match_combined_token_info, type TokenInfo } from '~types/tokens';
import { BscTokenStandard } from '~types/tokens/chain/bsc';
import { BscTestTokenStandard } from '~types/tokens/chain/bsc-test';
import { EthereumTokenStandard } from '~types/tokens/chain/ethereum';
import { EthereumTestSepoliaTokenStandard } from '~types/tokens/chain/ethereum-test-sepolia';
import { PolygonTokenStandard } from '~types/tokens/chain/polygon';
import { PolygonTestAmoyTokenStandard } from '~types/tokens/chain/polygon-test-amoy';

const TokenMetadataIc = ({ canister_id }: { canister_id: string }) => {
    const metadata = useTokenMetadataIcByInitial(canister_id);

    const [isExpanded, setIsExpanded] = useState(false);

    const truncatedText = useMemo(() => {
        if (!metadata || !metadata?.description) return undefined;
        return metadata?.description.slice(0, 200);
    }, [metadata]);

    const shouldTruncate = useMemo(() => {
        if (!metadata || !metadata?.description) return undefined;
        return metadata.description.length > 200;
    }, [metadata]);

    const Socials = useMemo(() => {
        if (!metadata || !metadata?.tokenDetail) return [];

        return Object.entries(metadata.tokenDetail);
    }, [metadata]);

    return (
        <div className="flex w-full flex-col px-5">
            {metadata && <h3 className="py-2 text-sm text-[#999999]">About</h3>}
            {metadata?.description && (
                <div className="text-sm">
                    {isExpanded ? metadata?.description : truncatedText}
                    {shouldTruncate && (
                        <>
                            {!isExpanded && '...'}
                            <span
                                className="ml-2 cursor-pointer text-[#FFCF13]"
                                onClick={() => setIsExpanded(!isExpanded)}
                            >
                                {isExpanded ? 'Less' : 'More'}
                            </span>
                        </>
                    )}
                </div>
            )}
            <div className="mt-5 w-full rounded-xl bg-[#181818]">
                <div className="flex w-full items-center justify-between px-3 py-2 text-sm">
                    <span className="text-[#999999]">Market cap</span>
                    {metadata?.marketCap && (
                        <span>
                            $
                            {BigNumber(metadata?.marketCap).toFormat(2, {
                                groupSeparator: ',',
                                groupSize: 3,
                                decimalSeparator: '.',
                            })}
                        </span>
                    )}
                    {!metadata?.marketCap && <span>--</span>}
                </div>
                <div className="flex w-full items-center justify-between px-3 py-2 text-sm">
                    <span className="text-[#999999]">FDV</span>
                    {metadata?.fullyDilutedMarketCap && (
                        <span>
                            $
                            {BigNumber(metadata?.fullyDilutedMarketCap).toFormat(2, {
                                groupSeparator: ',',
                                groupSize: 3,
                                decimalSeparator: '.',
                            })}
                        </span>
                    )}
                    {!metadata?.fullyDilutedMarketCap && <span>--</span>}
                </div>
                <div className="flex w-full items-center justify-between px-3 py-2 text-sm">
                    <span className="text-[#999999]">Circulating Supply</span>
                    {metadata?.totalSupply && (
                        <span>
                            {BigNumber(metadata?.totalSupply)
                                .div(BigNumber(10).pow(metadata?.tokenDecimal))
                                .toFormat(2, {
                                    groupSeparator: ',',
                                    groupSize: 3,
                                    decimalSeparator: '.',
                                })}
                        </span>
                    )}
                    {!metadata?.totalSupply && <span>--</span>}
                </div>
                <div className="flex w-full items-center justify-between px-3 py-2 text-sm">
                    <span className="text-[#999999]">Total supply</span>
                    {metadata?.totalSupply && (
                        <span>
                            {BigNumber(metadata?.totalSupply)
                                .div(BigNumber(10).pow(metadata?.tokenDecimal))
                                .toFormat(2, {
                                    groupSeparator: ',',
                                    groupSize: 3,
                                    decimalSeparator: '.',
                                })}
                        </span>
                    )}
                    {!metadata?.totalSupply && <span>--</span>}
                </div>
                <div className="flex w-full items-center gap-3 p-3">
                    {Socials.map((Social) => {
                        const [key, value] = Social;

                        if (!value) return null;

                        return (
                            <span
                                key={`${key}-${value}`}
                                onClick={() => {
                                    window.open(value, '_blank');
                                }}
                            >
                                {key === 'Website' && (
                                    <BsGlobe className="h-4 w-4 cursor-pointer duration-300 hover:text-[#FFCF13]" />
                                )}
                                {key === 'Telegram' && (
                                    <BsTelegram className="h-4 w-4 cursor-pointer duration-300 hover:text-[#FFCF13]" />
                                )}
                                {key === 'Twitter' && (
                                    <BsTwitterX className="h-4 w-4 cursor-pointer duration-300 hover:text-[#FFCF13]" />
                                )}
                                {key === 'Discord' && (
                                    <BsDiscord className="h-4 w-4 cursor-pointer duration-300 hover:text-[#FFCF13]" />
                                )}
                                {key === 'Github' && (
                                    <BsGithub className="h-4 w-4 cursor-pointer duration-300 hover:text-[#FFCF13]" />
                                )}
                                {key === 'Medium' && (
                                    <BsMedium className="h-4 w-4 cursor-pointer duration-300 hover:text-[#FFCF13]" />
                                )}
                                {/* TODO: add other */}
                            </span>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const TokenMetadataEvm = ({ token }: { token: TokenInfo }) => {
    const { address, chain, isNative } = match_combined_token_info<{
        address: EvmAddress;
        chain: EvmChain;
        isNative: boolean;
    }>(token.info, {
        ic: () => {
            throw new Error('IC chain is not supported');
        },
        ethereum: (ethereum) => ({
            address: ethereum.address,
            chain: 'ethereum',
            isNative: ethereum.standards.includes(EthereumTokenStandard.NATIVE),
        }),
        ethereum_test_sepolia: (ethereum_test_sepolia) => ({
            address: ethereum_test_sepolia.address,
            chain: 'ethereum-test-sepolia',
            isNative: ethereum_test_sepolia.standards.includes(EthereumTestSepoliaTokenStandard.NATIVE),
        }),
        polygon: (polygon) => ({
            address: polygon.address,
            chain: 'polygon',
            isNative: polygon.standards.includes(PolygonTokenStandard.NATIVE),
        }),
        polygon_test_amoy: (polygon_test_amoy) => ({
            address: polygon_test_amoy.address,
            chain: 'polygon-test-amoy',
            isNative: polygon_test_amoy.standards.includes(PolygonTestAmoyTokenStandard.NATIVE),
        }),
        bsc: (bsc) => ({
            address: bsc.address,
            chain: 'bsc',
            isNative: bsc.standards.includes(BscTokenStandard.NATIVE),
        }),
        bsc_test: (bsc_test) => ({
            address: bsc_test.address,
            chain: 'bsc-test',
            isNative: bsc_test.standards.includes(BscTestTokenStandard.NATIVE),
        }),
    });
    const { data: tokenDetail } = useTokenDetailEvm({ address, chain, isNative });
    const { description, links, market_cap, fully_diluted_market_cap, circulating_supply, total_supply } =
        tokenDetail ?? {};
    const Socials = useMemo(() => {
        if (!links) return [];
        return Object.entries(links);
    }, [links]);
    return (
        <div className="flex w-full flex-col px-5">
            <h3 className="py-2 text-sm text-[#999999]">About</h3>
            {description && <ExpandableHtml description={description} />}
            <div className="mt-5 w-full rounded-xl bg-[#181818]">
                <div className="flex w-full items-center justify-between px-3 py-2 text-sm">
                    <span className="text-[#999999]">Market cap</span>
                    {market_cap ? (
                        <span>
                            $
                            {BigNumber(market_cap).toFormat(2, {
                                groupSeparator: ',',
                                groupSize: 3,
                                decimalSeparator: '.',
                            })}
                        </span>
                    ) : (
                        <span>--</span>
                    )}
                </div>
                <div className="flex w-full items-center justify-between px-3 py-2 text-sm">
                    <span className="text-[#999999]">FDV</span>
                    {fully_diluted_market_cap ? (
                        <span>
                            $
                            {BigNumber(fully_diluted_market_cap).toFormat(2, {
                                groupSeparator: ',',
                                groupSize: 3,
                                decimalSeparator: '.',
                            })}
                        </span>
                    ) : (
                        <span>--</span>
                    )}
                </div>
                <div className="flex w-full items-center justify-between px-3 py-2 text-sm">
                    <span className="text-[#999999]">Circulating Supply</span>
                    {circulating_supply ? (
                        <span>
                            {BigNumber(circulating_supply).toFormat(2, {
                                groupSeparator: ',',
                                groupSize: 3,
                                decimalSeparator: '.',
                            })}
                        </span>
                    ) : (
                        <span>--</span>
                    )}
                </div>
                <div className="flex w-full items-center justify-between px-3 py-2 text-sm">
                    <span className="text-[#999999]">Total supply</span>
                    {total_supply ? (
                        <span>
                            {BigNumber(total_supply).toFormat(2, {
                                groupSeparator: ',',
                                groupSize: 3,
                                decimalSeparator: '.',
                            })}
                        </span>
                    ) : (
                        <span>--</span>
                    )}
                </div>
                <div className="flex w-full items-center gap-3 p-3">
                    {Socials.map(([key, value]) => {
                        if (!value) return null;

                        return (
                            <span key={`${key}-${value}`} onClick={() => window.open(value, '_blank')}>
                                {key === 'website' && (
                                    <BsGlobe className="h-4 w-4 cursor-pointer duration-300 hover:text-[#FFCF13]" />
                                )}
                                {key === 'twitter' && (
                                    <BsTwitterX className="h-4 w-4 cursor-pointer duration-300 hover:text-[#FFCF13]" />
                                )}
                                {key === 'telegram' && (
                                    <BsTelegram className="h-4 w-4 cursor-pointer duration-300 hover:text-[#FFCF13]" />
                                )}
                                {/* {key === 'Discord' && (
                                    <BsDiscord className="h-4 w-4 cursor-pointer duration-300 hover:text-[#FFCF13]" />
                                )}
                                {key === 'Github' && (
                                    <BsGithub className="h-4 w-4 cursor-pointer duration-300 hover:text-[#FFCF13]" />
                                )}
                                {key === 'Medium' && (
                                    <BsMedium className="h-4 w-4 cursor-pointer duration-300 hover:text-[#FFCF13]" />
                                )} */}
                            </span>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export { TokenMetadataIc, TokenMetadataEvm };
