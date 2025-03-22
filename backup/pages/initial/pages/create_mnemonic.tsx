import { Button } from '@heroui/react';
import { useState } from 'react';

import Icon from '~components/icon';
import { random_mnemonic } from '~lib/mnemonic';
import { cn } from '~lib/utils/cn';

function CreateMnemonicPage({
    className,
    onBack,
    mnemonic12,
    setMnemonic12,
    setMnemonic24,
    onNext,
}: {
    className?: string;
    onBack: () => void;
    mnemonic12: string;
    setMnemonic12: (mnemonic: string) => void;
    mnemonic24: string;
    setMnemonic24: (mnemonic: string) => void;
    onNext: (mnemonic: string) => void;
}) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className={cn('relative flex h-full w-full flex-col justify-between', className)}>
            <div className="flex h-[58px] items-center justify-between px-5">
                <div
                    onClick={() => {
                        onBack();
                        setMnemonic12(random_mnemonic(12));
                        setMnemonic24(random_mnemonic(24));
                    }}
                >
                    <Icon
                        name="icon-arrow-left"
                        className="h-[14px] w-[19px] cursor-pointer text-[#FFCF13] duration-300 hover:opacity-85"
                    />
                </div>
                <div></div>
            </div>

            <div className="flex w-full flex-1 flex-col justify-between px-5 pb-5">
                <div className="flex w-full flex-col">
                    <h1 className="text-2xl leading-6 text-[#FFCF13]">Please write down the seed phrase below</h1>
                    <span className="block pt-[10px] text-xs text-[#999999]">
                        For security, we recommend that you manually back it up and store it safely.
                    </span>
                    <div
                        className="relative mt-5 grid w-full grid-cols-2 rounded-xl border border-[#333333]"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        <div
                            className={cn(
                                'absolute bottom-0 left-0 top-0 flex w-full transform-none items-center justify-center rounded-xl duration-300',
                                isHovered ? 'bg-transparent' : 'bg-[#333333] opacity-30',
                            )}
                        >
                            {!isHovered && <Icon name="icon-eye-slash" className="h-[20px] w-[31px] text-[#999999]" />}
                        </div>
                        {mnemonic12.split(' ').map((word, index) => (
                            <span
                                key={index}
                                className={cn(
                                    `styled-word flex h-[52px] items-center border-[#333333] text-base text-[#EEEEEE]`,
                                    index % 2 === 1 ? 'border-b border-r-0' : 'border-b border-r',
                                    index + 1 > 10 ? 'border-b-0' : '',
                                    isHovered ? '' : 'blur-[4px]',
                                )}
                            >
                                <i className="ml-3 mr-2 flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full bg-[#333333] text-center text-xs not-italic text-[#999999]">
                                    {index + 1}
                                </i>
                                {word}
                            </span>
                        ))}
                    </div>
                </div>

                <Button
                    className="h-[48px] bg-[#FFCF13] text-lg font-semibold text-black"
                    onPress={() => onNext(mnemonic12)}
                >
                    I have recorded it
                </Button>
            </div>
        </div>
    );
}

export default CreateMnemonicPage;
