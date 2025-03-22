import { Tooltip, TooltipContent, TooltipTrigger } from '~components/ui/tooltip';

export const AddressTooltip = ({
    container,
    trigger,
    content,
}: {
    container?: HTMLElement | null | undefined;
    trigger: React.ReactNode;
    content: React.ReactNode;
}) => {
    return (
        <Tooltip>
            <TooltipTrigger>{trigger}</TooltipTrigger>
            <TooltipContent container={container} side="bottom" align="center">
                {content}
            </TooltipContent>
        </Tooltip>
    );
};
