import { Button, useDisclosure } from '@heroui/react';
import { useEffect, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';

import Icon from '~components/icon';
import InputPassword from '~components/input-password';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from '~components/ui/drawer';
import { usePasswordHashed } from '~hooks/store/local';
import { useSonnerToast } from '~hooks/toast';
import { verify_password } from '~lib/password';
import { cn } from '~lib/utils/cn';

type BackupType = 'seed' | 'private';
const BackupMnemonicDrawer = ({
    container,
    isOpen,
    setIsOpen,
    onShowSeed,
    mnemonic,
    type,
}: {
    container?: HTMLElement | null;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onShowSeed: () => void;
    mnemonic?: string;
    type: BackupType;
}) => {
    const toast = useSonnerToast();

    const { onOpenChange } = useDisclosure();
    const [valid, setValid] = useState(false);
    const [password1, setPassword1] = useState('');
    const [password_hashed] = usePasswordHashed();

    const onHidden = () => {
        setIsOpen(false);
        // reset state
        setPassword1('');
        setValid(false);
    };

    useEffect(() => {
        if (!isOpen) return;

        (async () => {
            if (!password1) return false;
            if (!password_hashed) return false;
            return verify_password(password_hashed, password1);
        })().then(setValid);
    }, [isOpen, password1, password_hashed]);

    return (
        <Drawer open={isOpen} onOpenChange={onOpenChange} container={container}>
            <DrawerContent
                className="flex h-full !max-h-full w-full flex-col items-center justify-between border-0 bg-transparent pt-[50px]"
                overlayClassName="bg-black/50"
            >
                <DrawerHeader className="w-full shrink-0 border-t border-[#333333] bg-[#0a0600] px-5 pb-0 pt-1 text-left">
                    <DrawerTitle>
                        <div className="flex w-full items-center justify-between py-3">
                            <span className="text-sm text-white">
                                {type === 'seed' ? 'Backup Seed Phrase' : 'Backup Private Key'}
                            </span>
                            <DrawerClose>
                                <span
                                    onClick={() => onHidden()}
                                    className="cursor-pointer text-sm text-[#FFCF13] transition duration-300 hover:opacity-85"
                                >
                                    Close
                                </span>
                            </DrawerClose>
                        </div>
                    </DrawerTitle>
                    <DrawerDescription className="hidden" />
                </DrawerHeader>

                <div className="flex h-full w-full flex-col bg-[#0a0600] px-5 pb-5">
                    {mnemonic && valid ? (
                        <div className="flex-1 overflow-y-auto">
                            <div className="mb-4 mt-2 block rounded-xl bg-[#2E1D01] px-4 py-3 text-sm text-[#FFCF13]">
                                For security, we recommend that you manually back it up and store it safely.
                            </div>
                            {type === 'seed' ? (
                                <div className="mt-5 grid w-full grid-cols-2 rounded-xl border border-[#333333]">
                                    {mnemonic.split(' ').map((word, index) => (
                                        <span
                                            key={index}
                                            className={cn(
                                                `styled-word flex h-[52px] items-center border-[#333333] text-base text-[#EEEEEE]`,
                                                index % 2 === 1 ? 'border-b border-r-0' : 'border-b border-r',
                                                index + 1 > 10 ? 'border-b-0' : '',
                                            )}
                                        >
                                            <i className="ml-3 mr-2 flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full bg-[#333333] text-center text-xs not-italic text-[#999999]">
                                                {index + 1}
                                            </i>
                                            {word}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <div className="mt-5 w-full rounded-xl border border-[#333333]">
                                    <p className="block h-[120px] break-words p-3 text-sm">{mnemonic}</p>
                                    <CopyToClipboard text={mnemonic} onCopy={() => toast.success('Copied')}>
                                        <div className="flex w-full cursor-pointer items-center justify-center border-t border-[#333333] py-3 duration-300 hover:opacity-85">
                                            <Icon name="icon-copy" className="mr-2 h-3 w-3 text-[#FFCF13]" />
                                            <span className="text-sm text-[#FFCF13]">Copy</span>
                                        </div>
                                    </CopyToClipboard>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="w-full flex-1">
                            <div className="mt-8 flex w-full flex-col items-center justify-center">
                                <div className="flex h-[68px] w-[68px] items-center justify-center rounded-full bg-[#2E1D01]">
                                    <Icon name="icon-warning" className="h-10 w-10 text-[#FFA000]" />
                                </div>
                                <p className="block py-5 text-center text-sm text-[#FFCF13]">
                                    Your seed phrase is the only way to recover your wallet. Do not let anyone see it.
                                </p>
                                <div className="mt-5 w-full">
                                    <label className="block pb-3 text-sm">Your Password</label>
                                    <InputPassword
                                        placeholder="Enter your Password"
                                        onChange={setPassword1}
                                        errorMessage={!password1 || valid ? undefined : 'password is mismatch'}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    {mnemonic && valid ? (
                        <Button
                            className="h-[48px] w-full bg-[#FFCF13] text-lg font-semibold text-black"
                            onPress={() => onHidden()}
                        >
                            I have recorded it
                        </Button>
                    ) : (
                        <Button
                            className="h-[48px] w-full bg-[#FFCF13] text-lg font-semibold text-black"
                            onPress={onShowSeed}
                        >
                            Confirm
                        </Button>
                    )}
                </div>
            </DrawerContent>
        </Drawer>
    );
};

export default BackupMnemonicDrawer;
