import { Button } from '@heroui/react';
import { useState } from 'react';

import Icon from '~components/icon';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '~components/ui/drawer';
import { type GotoFunction } from '~hooks/memo/goto';
import { useSonnerToast } from '~hooks/toast';

export const AddWalletDrawer = ({
    trigger,
    container,
    onAddWalletByMainMnemonic,
    goto,
    has_main_mnemonic,
    import_prefix,
}: {
    trigger: React.ReactNode;
    container?: HTMLElement | null;
    onAddWalletByMainMnemonic: () => void;
    goto: GotoFunction;
    has_main_mnemonic: boolean;
    import_prefix: string;
}) => {
    const toast = useSonnerToast();

    const [open, setOpen] = useState(false);

    return (
        <Drawer open={open} onOpenChange={setOpen} container={container}>
            <DrawerTrigger>{trigger}</DrawerTrigger>
            <DrawerContent
                className="flex h-full !max-h-full w-full flex-col items-center justify-between border-0 bg-transparent pt-[50px]"
                overlayClassName="bg-black/50"
            >
                <DrawerHeader className="w-full shrink-0 border-t border-[#333333] bg-[#0a0600] px-5 pb-0 pt-1 text-left">
                    <DrawerTitle>
                        <div className="flex w-full items-center justify-between py-3">
                            <span className="text-sm text-white">Add / Connect wallet</span>
                            <DrawerClose>
                                <span className="cursor-pointer text-sm text-[#FFCF13] transition duration-300 hover:opacity-85">
                                    Close
                                </span>
                            </DrawerClose>
                        </div>
                    </DrawerTitle>
                    <DrawerDescription className="hidden" />
                </DrawerHeader>

                <div className="flex h-full w-full shrink flex-col justify-between bg-[#0a0600] px-5 pb-5">
                    <div className="mt-3 h-full w-full">
                        <div className="mt-5 flex w-full flex-col gap-4">
                            {[
                                ...(has_main_mnemonic
                                    ? [
                                          {
                                              callback: () => {
                                                  onAddWalletByMainMnemonic();
                                                  setOpen(false);
                                              },
                                              icon: 'icon-add',
                                              name: 'Create New Account',
                                              description: 'Add a new multi-chain account',
                                          },
                                      ]
                                    : []),
                                {
                                    callback: () => goto(`${import_prefix}/mnemonic`),
                                    icon: 'icon-file',
                                    name: 'Import Seed Phrase',
                                    description: 'Import accounts from another wallet',
                                },
                                {
                                    callback: () => {
                                        toast.error('Come soon');
                                        // goto(`${import_prefix}/private_key`)
                                    },
                                    icon: 'icon-import',
                                    name: 'Import Private Key',
                                    description: 'Import a single-chain account',
                                },
                            ].map(({ callback, icon, name, description }) => (
                                <div
                                    key={icon}
                                    className="flex cursor-pointer items-center rounded-xl bg-[#181818] px-4 py-3 duration-300 hover:bg-[#333333]"
                                    onClick={callback}
                                >
                                    <div className="mr-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#2B2B2B]">
                                        <Icon name={icon} className="h-6 w-6 text-[#999]" />
                                    </div>
                                    <div className="flex flex-col justify-between">
                                        <div className="text-base text-[#EEEEEE]">{name}</div>
                                        <p className="text-xs text-[#999999]">{description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Button
                        className="h-[48px] bg-[#FFCF13] text-lg font-semibold text-black"
                        onPress={() => setOpen(false)}
                    >
                        Close
                    </Button>
                </div>
            </DrawerContent>
        </Drawer>
    );
};
