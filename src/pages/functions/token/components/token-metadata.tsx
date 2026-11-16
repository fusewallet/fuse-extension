import BigNumber from 'bignumber.js';
import { useMemo, useState } from 'react';
import { BsDiscord, BsGithub, BsGlobe, BsMedium, BsTelegram, BsTwitterX } from 'react-icons/bs';

import { useTokenMetadataIcByInitial } from '~hooks/store/local';

const TokenMetadata = ({ canister_id }: { canister_id: string }) => {
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
        <div className="flex flex-col px-5 w-full">
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
                <div className="flex justify-between items-center px-3 py-2 w-full text-sm">
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
                <div className="flex justify-between items-center px-3 py-2 w-full text-sm">
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
                <div className="flex justify-between items-center px-3 py-2 w-full text-sm">
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
                <div className="flex justify-between items-center px-3 py-2 w-full text-sm">
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
                <div className="flex gap-3 items-center p-3 w-full">
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
export default TokenMetadata;
