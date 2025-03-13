import Selected from 'data-base64:~assets/svg/common/selected.svg';

import { cn } from '~lib/utils/cn';

interface ChainItemProps {
    name: string;
    logo: string;
    onClick?: () => void;
    active: boolean;
}
export default function ChainItem({ name, logo, onClick, active }: ChainItemProps) {
    return (
        <div
            onClick={onClick}
            className={cn(
                'relative flex h-[68px] w-full flex-shrink-0 cursor-pointer items-center justify-start gap-x-[12px] rounded-[12px] border border-[#333] px-[13px] transition-colors hover:bg-[#222]',
                active && 'border-[#FFCF13]',
            )}
        >
            <img src={logo} className="w-[44px]" />
            <span className="text-sm font-medium text-[#EEE]">{name}</span>
            {active && <img src={Selected} className="absolute right-[13px]" alt="selected" />}
        </div>
    );
}
