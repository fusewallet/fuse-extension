import { Button, cn } from '@heroui/react';
import { useState } from 'react';

import Icon from '~components/icon';
import { useSonnerToast } from '~hooks/toast';

function RestoreWayPage({
    className,
    onBack,
    onNext,
}: {
    className?: string;
    onBack: () => void;
    onNext: (way: 'mnemonic' | 'private_key') => void;
}) {
    const toast = useSonnerToast();

    const [selected, setSelected] = useState<'mnemonic' | 'private_key'>();
    return (
        <div className={cn('flex h-full w-full flex-col justify-between', className)}>
            <div className="flex h-[58px] items-center px-5" onClick={onBack}>
                <Icon
                    name="icon-arrow-left"
                    className="h-[14px] w-[19px] cursor-pointer text-[#FFCF13] duration-300 hover:opacity-85"
                />
            </div>
            <div className="flex w-full flex-1 flex-col justify-between px-5 pb-5">
                <div className="w-full">
                    <h1 className="text-2xl leading-6 text-[#FFCF13]">Import wallet</h1>
                    <span className="block pt-[10px] text-xs text-[#999999]">
                        You can import your wallet using the mnemonic phrase or private key.
                    </span>
                    <div className="mt-5 w-full">
                        <div
                            className={cn(
                                `relative w-full cursor-pointer rounded-2xl border p-4`,
                                selected === 'mnemonic' ? 'border-[#FFCF13]' : 'border-[#333333]',
                            )}
                            onClick={() => setSelected('mnemonic')}
                        >
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 transform">
                                {selected === 'mnemonic' && (
                                    <Icon
                                        name="icon-ok"
                                        className="h-[22px] w-[22px] cursor-pointer text-[#FFCF13] duration-300 hover:opacity-85"
                                    />
                                )}
                            </div>
                            <h3 className="text-lg font-semibold text-[#EEEEEE]">Seed phrase</h3>
                            <p className="text-xs text-[#999999]">The mnemonic phrase supports 12 or 24 words.</p>
                        </div>
                        <div
                            className={cn(
                                `relative mt-5 w-full cursor-pointer rounded-2xl border p-4`,
                                selected === 'private_key' ? 'border-[#FFCF13]' : 'border-[#333333]',
                            )}
                            onClick={() => {
                                toast.warning('Come soon');
                                // setSelected('private_key') // TODO not implemented
                            }}
                        >
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 transform">
                                {selected === 'private_key' && (
                                    <Icon
                                        name="icon-ok"
                                        className="h-[22px] w-[22px] cursor-pointer text-[#FFCF13] duration-300 hover:opacity-85"
                                    />
                                )}
                            </div>
                            <h3 className="text-lg font-semibold text-[#EEEEEE]">Private key</h3>
                            <p className="text-xs text-[#999999]">Your private key.</p>
                        </div>
                    </div>
                </div>
                <Button
                    className="h-[48px] bg-[#FFCF13] text-lg font-semibold text-black"
                    isDisabled={!selected}
                    onPress={() => onNext(selected ?? 'mnemonic')}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}

export default RestoreWayPage;
