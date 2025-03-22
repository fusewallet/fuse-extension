import CopyToClipboard from 'react-copy-to-clipboard';

import Icon from '~components/icon';
import { useSonnerToast } from '~hooks/toast';

export const ShowSingleAddress = ({
    address,
    truncated,
    icon,
    name,
}: {
    address: string;
    truncated: string;
    icon: string;
    name: string;
}) => {
    const toast = useSonnerToast();
    return (
        <CopyToClipboard text={address} onCopy={() => toast.success('Copied')}>
            <div className="flex items-center">
                <div className="h-6 w-6 overflow-hidden rounded-full">
                    <img src={icon} className="h-full w-full" />
                </div>
                <div className="ml-2 flex items-center justify-between">
                    <span className="pr-3 text-sm font-semibold text-[#eeeeee]">{name}</span>
                    <div className="flex cursor-pointer items-center text-[#999999] transition duration-300 hover:text-[#FFCF13]">
                        <span className="pr-2 text-sm font-normal">{truncated}</span>
                        <Icon
                            name="icon-copy"
                            className="h-[14px] w-[14px] text-[#EEEEEE] transition duration-300 hover:text-[#FFCF13]"
                        />
                    </div>
                </div>
            </div>
        </CopyToClipboard>
    );
};
