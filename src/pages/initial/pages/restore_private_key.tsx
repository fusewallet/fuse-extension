import { Button } from '@heroui/react';
import { useState } from 'react';

import Icon from '~components/icon';
import { cn } from '~lib/utils/cn';

function RestorePrivateKeyPage({
    className,
    onBack,
    onNext,
    isLoading,
}: {
    className?: string;
    onBack: () => void;
    onNext: () => void;
    isLoading?: boolean;
}) {
    const [privateKey, setPrivateKey] = useState('');
    return (
        <div className={cn('flex h-full w-full flex-col justify-between', className)}>
            <div className="flex h-[58px] items-center justify-between px-5">
                <div className="flex items-center" onClick={onBack}>
                    <Icon
                        name="icon-arrow-left"
                        className="mr-3 h-[14px] w-[19px] cursor-pointer text-[#FFCF13] duration-300 hover:opacity-85"
                    />
                    <span className="text-base font-semibold text-[#FFCF13]">Private key</span>
                </div>
                <div></div>
            </div>
            <div className="flex w-full flex-1 flex-col justify-between px-5 pb-5">
                <div className="mt-5 h-full w-full">
                    <textarea
                        value={privateKey}
                        onChange={(e) => setPrivateKey(e.target.value)}
                        className="h-full w-full resize-none rounded-2xl border border-[#333] bg-transparent p-3 text-base text-[#EEEEEE] outline-none placeholder:text-sm placeholder:text-[#999999] focus:border-[#FFCF13]"
                        placeholder="Enter your private key"
                    ></textarea>
                </div>
                <Button
                    className="mt-5 h-[48px] bg-[#FFCF13] text-lg font-semibold text-black"
                    isDisabled={privateKey.length <= 20}
                    onPress={onNext}
                    isLoading={isLoading}
                >
                    Confirm
                </Button>
            </div>
        </div>
    );
}

export default RestorePrivateKeyPage;
