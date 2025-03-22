import { useNavigate } from 'react-router-dom';

import Icon from '~components/icon';
import { cn } from '~lib/utils/cn';

export const SettingsItem = ({
    icon,
    path,
    title,
    tip,
    arrow = true,
    right,
}: {
    icon?: React.ReactNode;
    path?: string | (() => void);
    title: string;
    tip?: string | number;
    arrow?: boolean;
    right?: React.ReactNode;
}) => {
    const navigate = useNavigate();
    return (
        <div
            onClick={() => {
                if (path === undefined) return;
                if (typeof path === 'string') navigate(path);
                else path();
            }}
            className={cn(
                'flex w-full items-center justify-between border-b border-[#222222] p-3 duration-300 last:border-b-0 hover:bg-[#2B2B2B]',
                path !== undefined ? 'cursor-pointer' : '',
            )}
        >
            <div className="flex items-center">
                {icon}
                <span className="px-3 text-sm text-[#EEEEEE]">{title}</span>
            </div>
            <div className="flex items-center">
                {tip !== undefined && <span className="pr-2 text-sm text-[#999999]">{tip}</span>}
                {arrow && <Icon name="icon-arrow-right" className="h-3 w-3 cursor-pointer text-[#999999]" />}
                {right}
            </div>
        </div>
    );
};
