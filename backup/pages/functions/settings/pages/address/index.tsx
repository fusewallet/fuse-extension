import { Button, Modal, ModalBody, ModalContent, ModalFooter, useDisclosure } from '@heroui/react';
import { useRef, useState } from 'react';

import Icon from '~components/icon';
import { FusePage } from '~components/layouts/page';
import { FusePageTransition } from '~components/layouts/transition';
import { useCurrentState } from '~hooks/memo/current_state';
import { useGoto } from '~hooks/memo/goto';
import { useMarkedAddresses, useRecentAddresses } from '~hooks/store/local-secure';
import { truncate_principal, truncate_text } from '~lib/utils/text';
import type { ChainAddress, MarkedAddress } from '~types/address';

import { FunctionHeader } from '../../../components/header';
import { AddAddressDrawer, EditAddressDrawer } from './components/drawer';
import { AddressMenuTooltip } from './components/tooltip';

function FunctionSettingsAddressesPage() {
    const current_state = useCurrentState();

    const { setHide, goto } = useGoto();

    const [markedAddresses, { pushOrUpdateMarkedAddress, removeMarkedAddress }] = useMarkedAddresses();
    const [recentAddresses] = useRecentAddresses();

    const [isRecentEdit, setIsRecent] = useState(false);
    const [removeAddress, setRemoveAddress] = useState<ChainAddress>();
    const [editAddress, setEditAddress] = useState<MarkedAddress>();

    const { isOpen, onOpen, onClose } = useDisclosure();

    const ref = useRef<HTMLDivElement>(null);

    return (
        <FusePage current_state={current_state}>
            <div ref={ref} className="relative h-full w-full overflow-hidden">
                <FusePageTransition
                    className="relative flex h-full w-full flex-col items-center justify-center pt-[52px]"
                    setHide={setHide}
                    header={
                        <FunctionHeader
                            title={'Addresses'}
                            onBack={() => goto(-1)}
                            onClose={() => goto('/', { replace: true })}
                        />
                    }
                >
                    {/* <button onClick={pushRandomMarked}>push marked</button> */}
                    {/* <button onClick={() => pushRandomRecent()}>push recent</button> */}

                    <div className="flex h-full flex-col justify-between">
                        <div className="flex-1 overflow-y-auto">
                            {markedAddresses.length === 0 && recentAddresses.length === 0 && (
                                <div className="flex h-full w-full flex-col items-center justify-center py-10">
                                    <Icon name="icon-empty" className="h-[70px] w-[70px] text-[#999999]" />
                                    <p className="text-sm text-[#999999]">No data found</p>
                                </div>
                            )}
                            <div className="w-full px-5">
                                {markedAddresses.map((item) => (
                                    <div
                                        key={`${JSON.stringify(item.address)}`}
                                        className="mt-3 block w-full cursor-pointer rounded-xl bg-[#181818] p-3"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#333333] p-2 text-xl font-bold">
                                                    {item.address.address.charAt(0)}
                                                </div>
                                                <div className="pl-3">
                                                    <span className="block text-sm font-semibold">{item.name}</span>
                                                    <span className="block text-xs text-[#999999]">
                                                        {item.address.address.includes('-')
                                                            ? truncate_principal(item.address.address)
                                                            : truncate_text(item.address.address)}
                                                    </span>
                                                </div>
                                            </div>
                                            <AddressMenuTooltip
                                                container={ref.current ?? undefined}
                                                item={item}
                                                setEditAddress={setEditAddress}
                                                onOpen={onOpen}
                                                setRemoveAddress={setRemoveAddress}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {recentAddresses.length > 0 && (
                                <div className="w-full">
                                    <h2 className="font-xs px-5 pb-2 pt-5 text-[#999999]">Recent Address</h2>
                                    {recentAddresses.map((item, index) => (
                                        <div
                                            key={index + JSON.stringify(item)}
                                            className="flex items-center justify-between px-5"
                                        >
                                            <div className="flex-1 cursor-pointer break-all py-2 text-xs text-[#EEEEEE]">
                                                {item.address.address}
                                            </div>
                                            <div
                                                onClick={() => {
                                                    setEditAddress({
                                                        ...item,
                                                        name: '',
                                                        updated: item.created,
                                                    });
                                                    setIsRecent(true);
                                                }}
                                            >
                                                <Icon
                                                    name="icon-add"
                                                    className="ml-4 h-4 w-4 shrink-0 cursor-pointer text-[#FFCF13] duration-300 hover:opacity-80"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <AddAddressDrawer
                            trigger={
                                <div className="p-5">
                                    <div className="flex h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-[#FFCF13] text-lg font-semibold text-black">
                                        Add
                                    </div>
                                </div>
                            }
                            container={ref.current ?? undefined}
                            onAddAddress={pushOrUpdateMarkedAddress}
                        />

                        <EditAddressDrawer
                            isRecent={isRecentEdit}
                            initAddress={editAddress}
                            onEditAddress={pushOrUpdateMarkedAddress}
                            container={ref.current ?? undefined}
                            onClose={() => {
                                setIsRecent(false);
                                setEditAddress(undefined);
                            }}
                            onOpenDelete={() => {
                                setIsRecent(false);
                                setEditAddress(undefined);

                                if (editAddress) {
                                    setRemoveAddress(editAddress.address);
                                }
                                onOpen();
                            }}
                        />

                        <Modal
                            backdrop="blur"
                            isOpen={isOpen}
                            onClose={onClose}
                            size="xs"
                            classNames={{
                                wrapper: '!z-[51]',
                                backdrop: '!z-[51]',
                                base: '!z-[52]',
                            }}
                            placement="center"
                            hideCloseButton={true}
                        >
                            <ModalContent>
                                {(onClose) => (
                                    <>
                                        <ModalBody>
                                            <div className="flex w-full flex-col items-center justify-center pt-5">
                                                <Icon name="icon-tips" className="h-[56px] w-[56px] text-[#FFCF13]" />
                                                <p className="w-full pt-4 text-base">
                                                    Are you sure you want to delete the address?
                                                </p>
                                            </div>
                                        </ModalBody>
                                        <ModalFooter>
                                            <div className="grid w-full grid-cols-2 gap-x-4">
                                                <Button
                                                    className="rounded-xl bg-[#666666] py-3 text-base text-[#EEEEEE]"
                                                    onPress={onClose}
                                                >
                                                    Close
                                                </Button>
                                                <Button
                                                    className="rounded-xl bg-[#FFCF13] py-3 text-base font-semibold text-black"
                                                    onPress={() => {
                                                        if (!removeAddress) return;

                                                        console.log(
                                                            '🚀 ~ FunctionSettingsAddressesPage ~ removeAddress:',
                                                            removeAddress,
                                                        );
                                                        removeMarkedAddress(removeAddress);
                                                        onClose();
                                                        setRemoveAddress(undefined);
                                                        setEditAddress(undefined);
                                                    }}
                                                >
                                                    Confirm
                                                </Button>
                                            </div>
                                        </ModalFooter>
                                    </>
                                )}
                            </ModalContent>
                        </Modal>
                    </div>
                </FusePageTransition>
            </div>
        </FusePage>
    );
}

export default FunctionSettingsAddressesPage;
