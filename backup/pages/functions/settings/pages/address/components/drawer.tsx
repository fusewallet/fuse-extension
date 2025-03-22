import { Button } from '@heroui/react';
import { useEffect, useState } from 'react';

import Icon from '~components/icon';
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '~components/ui/drawer';
import { cn } from '~lib/utils/cn';
import { check_address_type, type ChainAddress, type MarkedAddress } from '~types/address';

export const AddAddressDrawer = ({
    onAddAddress,
    trigger,
    container,
}: {
    onAddAddress: (address: ChainAddress, name: string) => void;
    trigger?: React.ReactNode;
    container?: HTMLElement | null;
}) => {
    const [open, setOpen] = useState(false);
    const [addrName, setAddrName] = useState<string>('');
    const [customAddress, setCustomAddress] = useState<string>('');
    const [showError, setShowError] = useState<boolean>(false);

    const handleAddAddress = () => {
        try {
            // check address type
            const address_type = check_address_type(customAddress);
            console.log('🚀 ~ handleAddAddress ~ address_type:', address_type);

            if (!address_type) {
                setShowError(true);
                return;
            }

            // add mark address
            onAddAddress({ address: customAddress, type: address_type }, addrName);
            setOpen(false);
        } catch (error) {
            setShowError(true);
            // remove prod
            console.debug('🚀 ~ handleAddAddress ~ error:', error);
        }
    };

    return (
        <Drawer open={open} onOpenChange={setOpen} container={container}>
            <DrawerTrigger>{trigger}</DrawerTrigger>
            <DrawerContent>
                <DrawerHeader className="border-t border-[#333333] bg-[#0a0600] text-left">
                    <DrawerTitle>
                        <div className="flex w-full items-center justify-between py-3 text-white">
                            <span className="text-sm">Add Address</span>
                            <span
                                className="cursor-pointer text-sm text-[#FFCF13] transition duration-300 hover:opacity-85"
                                onClick={() => setOpen(false)}
                            >
                                Close
                            </span>
                        </div>
                    </DrawerTitle>
                    <DrawerDescription />
                </DrawerHeader>
                <div className="flex h-full w-full flex-col justify-between bg-[#0a0600] px-5 pb-5">
                    <div className="w-full">
                        <div className="mb-10 w-full">
                            <div className="w-full">
                                <label className="block py-3 text-sm">Name</label>
                                <input
                                    type="text"
                                    className="h-[48px] w-full rounded-xl border border-[#333333] bg-transparent px-3 text-sm outline-none transition duration-300 placeholder:text-[#999999] hover:border-[#FFCF13] focus:border-[#FFCF13]"
                                    placeholder="Enter a name under 20 characters"
                                    onChange={(e) => {
                                        setAddrName(e.target.value);
                                        setShowError(false);
                                    }}
                                    value={addrName}
                                />
                            </div>
                            <div className="mt-3 w-full">
                                <label className="block py-3 text-sm">Address</label>
                                <textarea
                                    className="w-full resize-none rounded-xl border border-[#333333] bg-transparent px-3 py-3 text-sm outline-none transition duration-300 placeholder:text-[#999999] hover:border-[#FFCF13] focus:border-[#FFCF13]"
                                    placeholder="Enter Principal ID or Account ID"
                                    onChange={(e) => {
                                        setCustomAddress(e.target.value);
                                        setShowError(false);
                                    }}
                                    value={customAddress}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="w-full">
                        <div
                            className={cn(
                                'mb-1 text-left text-sm text-[#FF2C40] opacity-0',
                                showError && 'opacity-100',
                            )}
                        >
                            Invalid address
                        </div>
                        <Button
                            className="h-[48px] w-full rounded-xl bg-[#FFCF13] text-lg font-semibold text-black"
                            isDisabled={!addrName || !customAddress}
                            onPress={() => handleAddAddress()}
                        >
                            Add
                        </Button>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
};

export const EditAddressDrawer = ({
    // isOpen,
    isRecent = false, // recent address or custom address
    initAddress,
    onEditAddress,
    onClose,
    onOpenDelete,
    // trigger,
    container,
}: {
    // isOpen: boolean;
    isRecent?: boolean;
    initAddress?: MarkedAddress;
    onEditAddress: (address: ChainAddress, name: string) => void;
    onClose: () => void;
    onOpenDelete: () => void;
    trigger?: React.ReactNode;
    container?: HTMLElement | null;
}) => {
    const [open, setOpen] = useState<boolean>(false);
    const [addrName, setAddrName] = useState<string>();
    const [customAddress, setCustomAddress] = useState<string>();
    const [showError, setShowError] = useState<boolean>(false);

    useEffect(() => {
        if (!initAddress) {
            setOpen(false);
            setAddrName('');
            setCustomAddress('');
            setShowError(false);
            return;
        }

        setOpen(true);
        setAddrName(initAddress.name);
        setCustomAddress(initAddress.address.address);
    }, [initAddress]);

    const handleEditAddress = () => {
        try {
            if (!customAddress || !addrName) return;

            // check address type
            const address_type = check_address_type(customAddress);
            console.debug('🚀 ~ handleAddAddress ~ address_type:', address_type);

            if (!address_type) {
                setShowError(true);
                return;
            }

            // add mark address
            onEditAddress({ address: customAddress, type: address_type }, addrName);
            onHide();
        } catch (error) {
            setShowError(true);
            // remove prod
            console.debug('🚀 ~ handleAddAddress ~ error:', error);
        }
    };

    const onHide = () => {
        setOpen(false);
        onClose();
    };

    return (
        <Drawer open={open} onOpenChange={setOpen} container={container}>
            <DrawerContent>
                <DrawerHeader className="border-t border-[#333333] bg-[#0a0600] text-left">
                    <DrawerTitle>
                        <div className="flex w-full items-center justify-between py-3 text-white">
                            <span className="text-sm">Edit Address</span>
                            <span
                                className="cursor-pointer text-sm text-[#FFCF13] transition duration-300 hover:opacity-85"
                                onClick={() => onHide()}
                            >
                                Close
                            </span>
                        </div>
                    </DrawerTitle>
                    <DrawerDescription />
                </DrawerHeader>
                <div className="flex h-full w-full flex-col justify-between bg-[#0a0600] px-5 pb-5">
                    <div className="w-full">
                        <div className="mb-10 w-full">
                            <div className="w-full">
                                <label className="block py-3 text-sm">Name</label>
                                <input
                                    type="text"
                                    className="h-[48px] w-full rounded-xl border border-[#333333] bg-transparent px-3 text-sm outline-none transition duration-300 placeholder:text-[#999999] hover:border-[#FFCF13] focus:border-[#FFCF13]"
                                    placeholder="Enter a name under 20 characters"
                                    onChange={(e) => {
                                        setAddrName(e.target.value);
                                        setShowError(false);
                                    }}
                                    value={addrName}
                                />
                            </div>
                            <div className="mt-3 w-full">
                                <label className="block py-3 text-sm">Address</label>
                                <textarea
                                    className="w-full resize-none rounded-xl border border-[#333333] bg-transparent px-3 py-3 text-sm outline-none transition duration-300 placeholder:text-[#999999] hover:border-[#FFCF13] focus:border-[#FFCF13]"
                                    placeholder="Enter Principal ID or Account ID"
                                    onChange={(e) => {
                                        setCustomAddress(e.target.value);
                                        setShowError(false);
                                    }}
                                    value={customAddress}
                                />
                            </div>
                            {!isRecent && (
                                <div
                                    className="mt-3 flex cursor-pointer items-center justify-center text-center text-sm text-[#FF2C40]"
                                    onClick={() => onOpenDelete()}
                                >
                                    <Icon
                                        name="icon-delete"
                                        className="mr-2 h-4 w-4 shrink-0 cursor-pointer text-[#FF2C40]"
                                    />
                                    Delete Address
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="w-full">
                        <div
                            className={cn(
                                'mb-1 text-left text-sm text-[#FF2C40] opacity-0',
                                showError && 'opacity-100',
                            )}
                        >
                            Invalid address
                        </div>
                        <Button
                            className="h-[48px] w-full rounded-xl bg-[#FFCF13] text-lg font-semibold text-black"
                            isDisabled={!addrName || !customAddress}
                            onPress={() => handleEditAddress()}
                        >
                            Confirm
                        </Button>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
};
