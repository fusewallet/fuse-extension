import { Button } from '@heroui/react';
import { useMemo } from 'react';

import Icon from '~components/icon';
import InputPassword from '~components/input-password';
import { check_password } from '~lib/password';
import { cn } from '~lib/utils/cn';

function InputPasswordPage({
    className,
    onBack,
    password1,
    setPassword1,
    password2,
    setPassword2,
    onNext,
}: {
    className?: string;
    onBack: () => void;
    password1: string;
    setPassword1: (password1: string) => void;
    password2: string;
    setPassword2: (password2: string) => void;
    onNext: () => void;
}) {
    const valid = useMemo(() => check_password(password1), [password1]);
    return (
        <div className={cn('flex h-full w-full flex-col justify-between p-5', className)}>
            <div className="flex items-center" onClick={onBack}>
                <Icon
                    name="icon-arrow-left"
                    className="h-[14px] w-[19px] cursor-pointer text-[#FFCF13] duration-300 hover:opacity-85"
                />
            </div>
            <div className="mt-[35px] flex w-full flex-1 flex-col justify-between">
                <div className="w-full">
                    <h1 className="text-2xl leading-6 text-[#FFCF13]">Set Wallet Password</h1>
                    <span className="block pt-[10px] text-xs text-[#999999]">
                        This password is used to unlock the wallet, and we cannot recover it for you
                    </span>
                    <div className="mt-5 w-full">
                        <div className="w-full">
                            <label className="block py-2 text-sm text-[#EEEEEE]">Password</label>
                            <InputPassword
                                placeholder="Password"
                                onChange={setPassword1}
                                errorMessage={!password1 || valid ? undefined : 'password required'}
                            />
                        </div>
                        <div className="mt-4 w-full">
                            <label className="block py-2 text-sm text-[#EEEEEE]">Confirm Password</label>
                            <InputPassword
                                placeholder="Confirm password"
                                onChange={setPassword2}
                                errorMessage={valid && password1 !== password2 ? 'not match' : undefined}
                            />
                        </div>
                    </div>
                </div>
                <Button
                    className="h-[48px] bg-[#FFCF13] text-lg font-semibold text-black"
                    isDisabled={!valid || password1 !== password2}
                    onPress={onNext}
                >
                    Confirm
                </Button>
            </div>
        </div>
    );
}

export default InputPasswordPage;
