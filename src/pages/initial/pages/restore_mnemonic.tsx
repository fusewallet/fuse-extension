import { Button } from '@heroui/react';
import { useCallback, useEffect, useState } from 'react';
import { useTimeout } from 'usehooks-ts';

import Icon from '~components/icon';
import { validate_mnemonic } from '~lib/mnemonic';
import { cn } from '~lib/utils/cn';
import { is_development } from '~lib/utils/env';

function RestoreMnemonicPage({
    className,
    onBack,
    mnemonic,
    setMnemonic,
    onNext,
    isLoading = false,
}: {
    className?: string;
    onBack: () => void;
    mnemonic: string;
    setMnemonic: (mnemonic: string) => void;
    onNext: () => void;
    isLoading?: boolean; // button loading status
}) {
    const [count, setCount] = useState<number>(mnemonic ? mnemonic.split(' ').length : 12);
    const [mnemonic12, setMnemonic12] = useState<string[]>(
        count === 12 && mnemonic ? mnemonic.split(' ') : Array(12).fill(''),
    );
    const [mnemonic24, setMnemonic24] = useState<string[]>(
        count === 24 && mnemonic ? mnemonic.split(' ') : Array(24).fill(''),
    );

    useEffect(() => {
        if (mnemonic12.some((word) => !!word.trim())) setMnemonic(mnemonic12.join(' '));
    }, [setMnemonic, mnemonic12]);
    useEffect(() => {
        if (mnemonic24.some((word) => !!word.trim())) setMnemonic(mnemonic24.join(' '));
    }, [setMnemonic, mnemonic24]);

    const handleMnemonic = useCallback(
        (mnemonic: string) => {
            if (!mnemonic) return false;
            while (/^[\s\u3000].*/.test(mnemonic)) mnemonic = mnemonic.slice(1);
            while (/.*[\s\u3000]$/.test(mnemonic)) mnemonic = mnemonic.slice(0, mnemonic.length - 1);
            mnemonic = mnemonic
                .split(/[\s\u3000]+/)
                .join(' ')
                .trim(); // space chars
            const valid = validate_mnemonic(mnemonic);
            if (!valid) return false;

            const words = mnemonic.split(/[\s\u3000]+/); // space chars
            if (count !== words.length) return false;

            if (words.length === 12) setMnemonic12(words);
            if (words.length === 24) setMnemonic24(words);

            setMnemonic(mnemonic);
            return true;
        },
        [count, setMnemonic],
    );

    // auto set mnemonic when testing
    useTimeout(() => {
        if (is_development()) {
            // * when dev
            handleMnemonic('tooth palace artefact ticket rebel limit virus dawn party pet return young');
        }
    }, 300);

    return (
        <div className={cn('flex h-full w-full flex-col justify-between px-5', className)}>
            <div className="flex h-[58px] items-center justify-between">
                <div className="flex items-center" onClick={onBack}>
                    <Icon
                        name="icon-arrow-left"
                        className="mr-3 h-[14px] w-[19px] cursor-pointer text-[#FFCF13] duration-300 hover:opacity-85"
                    />
                    <span className="text-base font-semibold text-[#FFCF13]">Seed Phrase</span>
                </div>
                <div></div>
            </div>
            <div className="mt-5 w-full flex-1 overflow-y-auto">
                <div className="flex w-full items-center gap-x-5">
                    <div className="flex cursor-pointer flex-col items-center" onClick={() => setCount(12)}>
                        <div className="text-sm text-[#EEEEEE]">
                            <i className="pr-2 not-italic text-[#FFCF13]">12</i>words
                        </div>
                        <span className={cn(`mt-1 h-[3px] w-5 bg-[#FFCF13]`, count === 12 ? '' : 'opacity-0')}></span>
                    </div>
                    <div className="flex cursor-pointer flex-col items-center" onClick={() => setCount(24)}>
                        <div className="text-sm text-[#EEEEEE]">
                            <i className="pr-2 not-italic text-[#FFCF13]">24</i>words
                        </div>
                        <span className={cn(`mt-1 h-[3px] w-5 bg-[#FFCF13]`, count === 24 ? '' : 'opacity-0')}></span>
                    </div>
                </div>
                <div className="mt-4 grid w-full grid-cols-2 gap-4">
                    {count === 12 &&
                        Array.from({ length: 12 }, (_, index) => (
                            <div
                                key={index}
                                className="flex h-[48px] items-center rounded-xl border border-[#333333] px-3 duration-300 hover:border-[#FFCF13]"
                            >
                                <i className="mr-2 text-sm not-italic text-[#999999]">{index + 1}.</i>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        className="h-[48px] w-full border-transparent bg-transparent text-base text-[#EEEEEE] outline-none"
                                        value={mnemonic12[index]}
                                        onChange={(e) => {
                                            if (!handleMnemonic(e.target.value)) {
                                                const newInputs = [...mnemonic12];
                                                newInputs[index] = e.target.value;
                                                setMnemonic12(newInputs);
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    {count === 24 &&
                        Array.from({ length: 24 }, (_, index) => (
                            <div
                                key={index}
                                className="flex h-[48px] items-center rounded-xl border border-[#333333] px-3 duration-300 hover:border-[#FFCF13]"
                            >
                                <i className="mr-2 text-sm not-italic text-[#999999]">{index + 1}.</i>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        className="h-[48px] w-full border-transparent bg-transparent text-base text-[#EEEEEE] outline-none"
                                        value={mnemonic24[index]}
                                        onChange={(e) => {
                                            if (!handleMnemonic(e.target.value)) {
                                                const newInputs = [...mnemonic24];
                                                newInputs[index] = e.target.value;
                                                setMnemonic24(newInputs);
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                </div>
            </div>
            <div className="w-full py-5">
                <Button
                    isLoading={isLoading}
                    className="h-[48px] w-full bg-[#FFCF13] text-lg font-semibold text-black"
                    isDisabled={
                        (count === 12
                            ? mnemonic12.some((word) => word.trim() === '')
                            : mnemonic24.some((word) => word.trim() === '')) || !validate_mnemonic(mnemonic)
                    }
                    onPress={onNext}
                >
                    Confirm
                </Button>
            </div>
        </div>
    );
}

export default RestoreMnemonicPage;
