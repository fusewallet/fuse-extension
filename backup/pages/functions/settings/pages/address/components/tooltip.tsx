import CopyToClipboard from 'react-copy-to-clipboard';

import Icon from '~components/icon';
import { Tooltip, TooltipContent, TooltipTrigger } from '~components/ui/tooltip';
import { useSonnerToast } from '~hooks/toast';
import type { ChainAddress, MarkedAddress } from '~types/address';

export const AddressMenuTooltip = ({
    container,
    item,
    setEditAddress,
    onOpen,
    setRemoveAddress,
}: {
    container?: HTMLElement | null | undefined;
    item: MarkedAddress;
    setEditAddress: (item: MarkedAddress) => void;
    onOpen: () => void;
    setRemoveAddress: (address: ChainAddress) => void;
}) => {
    const toast = useSonnerToast();
    return (
        <Tooltip>
            <TooltipTrigger>
                {
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg duration-300 hover:bg-[#2B2B2B]">
                        <span className="h-[3px] w-[3px] rounded-full bg-[#999999]"></span>
                        <span className="mx-[2px] h-[3px] w-[3px] rounded-full bg-[#999999]"></span>
                        <span className="h-[3px] w-[3px] rounded-full bg-[#999999]"></span>
                    </div>
                }
            </TooltipTrigger>
            <TooltipContent container={container} side="bottom" align="center">
                {
                    <div className="w-[120px] rounded-xl">
                        <CopyToClipboard
                            text={item.address.address}
                            onCopy={() => {
                                toast.success('Copied');
                            }}
                        >
                            <div className="flex items-center rounded-lg p-2 duration-300 hover:bg-[#333333]">
                                <Icon
                                    name="icon-copy"
                                    className="mr-2 h-3 w-3 shrink-0 cursor-pointer text-[#999999]"
                                />
                                <span>Copy</span>
                            </div>
                        </CopyToClipboard>
                        <div
                            className="flex items-center rounded-lg p-2 duration-300 hover:bg-[#333333]"
                            onClick={(e) => {
                                e.stopPropagation();
                                setEditAddress(item);
                            }}
                        >
                            <Icon name="icon-edit" className="mr-2 h-4 w-4 shrink-0 cursor-pointer text-[#999999]" />
                            <span>Edit</span>
                        </div>
                        <div
                            className="flex items-center rounded-lg p-2 duration-300 hover:bg-[#333333]"
                            onClick={(e) => {
                                e.stopPropagation();
                                onOpen();
                                setRemoveAddress(item.address);
                                // removeMarkedAddress(item.address);
                            }}
                        >
                            <Icon name="icon-delete" className="mr-2 h-4 w-4 shrink-0 cursor-pointer text-[#999999]" />
                            <span>Delete</span>
                        </div>
                    </div>
                }
            </TooltipContent>
        </Tooltip>
    );
};
