import ic_svg from '~assets/svg/chains/ic.min.svg';
import Icon from '~components/icon';
import { Tooltip, TooltipContent, TooltipTrigger } from '~components/ui/tooltip';
import { truncate_text } from '~lib/utils/text';
import type { ShowIdentityKey } from '~types/identity';

import { ShowSingleAddress } from './show-address';

export const AddressTooltip = ({
    container,
    current_identity,
}: {
    container?: HTMLElement | null | undefined;
    current_identity: ShowIdentityKey;
}) => {
    return (
        <Tooltip>
            <TooltipTrigger>
                <div className="flex flex-row items-center justify-center text-[#EEEEEE] transition duration-300 hover:text-[#FFCF13]">
                    <span className="cursor-pointer px-2 text-base">{current_identity.name}</span>
                    <Icon name="icon-copy" className="h-[14px] w-[14px] cursor-pointer" />
                </div>
            </TooltipTrigger>
            <TooltipContent container={container} side="bottom" align="center">
                <div className="flex flex-col gap-y-2 p-[10px]">
                    {current_identity.address.ic?.owner && (
                        <ShowSingleAddress
                            address={current_identity.address.ic.owner}
                            truncated={truncate_text(current_identity.address.ic.owner)}
                            icon={ic_svg}
                            name="Principal ID"
                        />
                    )}
                    {current_identity.address.ic?.account_id && (
                        <ShowSingleAddress
                            address={current_identity.address.ic.account_id}
                            truncated={truncate_text(current_identity.address.ic.account_id)}
                            icon={ic_svg}
                            name="Account ID"
                        />
                    )}
                </div>
            </TooltipContent>
        </Tooltip>
    );
};
