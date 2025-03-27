import Icon from '~components/icon';

export const FunctionHeader = ({
    title,
    onBack,
    onClose,
}: {
    title: string;
    onBack?: () => void;
    onClose?: () => void;
}) => {
    return (
        <div className="absolute top-0 flex w-full items-center justify-between bg-[#0a0600] px-5 py-3">
            {onBack ? (
                <div onClick={onBack}>
                    <Icon
                        name="icon-arrow-left"
                        className="h-[14px] w-[19px] cursor-pointer text-[#FFCF13] duration-300 hover:opacity-85"
                    />
                </div>
            ) : (
                <div></div>
            )}

            <div className="text-lg">{title}</div>

            {onClose ? (
                <div className="w-[14px]" onClick={onClose}>
                    <Icon
                        name="icon-close"
                        className="h-5 w-5 cursor-pointer text-[#FFCF13] duration-300 hover:opacity-85"
                    />
                </div>
            ) : (
                <div></div>
            )}
        </div>
    );
};
