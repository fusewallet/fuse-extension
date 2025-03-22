import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { Button, Drawer, DrawerBody, DrawerContent, useDisclosure } from '@heroui/react';
import { useMemo, useRef, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { useParams } from 'react-router-dom';

import Icon from '~components/icon';
import { FusePage } from '~components/layouts/page';
import { FusePageTransition } from '~components/layouts/transition';
import { useCurrentState } from '~hooks/memo/current_state';
import { useGoto, type GotoFunction } from '~hooks/memo/goto';
import { useIdentityKeys } from '~hooks/store/local-secure';
import { useSonnerToast } from '~hooks/toast';
import { truncate_text } from '~lib/utils/text';

import { FunctionHeader } from '../../../components/header';
import BackupMnemonicDrawer from '../../components/show-mnemonic-drawer';

function FunctionSettingsAccountsSinglePage() {
    const current_state = useCurrentState();

    const { setHide, goto } = useGoto();

    return (
        <FusePage current_state={current_state}>
            <FusePageTransition
                className="relative flex h-full w-full flex-col items-center justify-center pt-[52px]"
                setHide={setHide}
                header={
                    <FunctionHeader
                        title={'Manage Account'}
                        onBack={() => goto(-1)}
                        onClose={() => goto('/', { replace: true })}
                    />
                }
            >
                <InnerSingleAccountPage goto={goto} />
            </FusePageTransition>
        </FusePage>
    );
}

export default FunctionSettingsAccountsSinglePage;

const InnerSingleAccountPage = ({ goto: _goto }: { goto: GotoFunction }) => {
    const toast = useSonnerToast();

    const { id } = useParams();

    const { current_identity, identity_list, showMnemonic, showPrivateKey, deleteIdentity, updateIdentity } =
        useIdentityKeys();

    const current = useMemo(() => {
        if (!current_identity || !identity_list) return undefined;
        return identity_list.find((identity) => identity.id === id);
    }, [id, current_identity, identity_list]);

    const [mnemonic, setMnemonic] = useState<string>();
    const [private_key, setPrivateKey] = useState<string>();

    const [isOpenRemove, setIsOpenRemove] = useState(false);
    const removeAccount = async (id: string) => {
        const r = await deleteIdentity(id, '1111qqqq');
        console.error('delete identity', r);
        if (r === undefined) return;
        if (r === false) throw new Error('can not delete');
        // notice successful
        _goto(-1);
    };

    const [isOpenSeedPhrase, setIsOpenSeedPhrase] = useState(false);
    const showSeedPhrase = (id: string) => {
        showMnemonic(id, '1111qqqq').then((m) => {
            console.error('show mnemonic', m);
            if (m === undefined) return;
            if (m === false) setMnemonic('wrong password');
            if (typeof m === 'object') setMnemonic(m.mnemonic);
        });
    };

    const [isOpenPrivatekey, setIsOpenPrivateKey] = useState(false);
    const showPrivate = (id: string) => {
        showPrivateKey(id, '1111qqqq').then((pk) => {
            console.error('show private key', pk);
            if (pk === undefined) return;
            if (pk === false) setPrivateKey('wrong password');
            if (typeof pk === 'string') setPrivateKey(pk);
        });
    };

    const [isOpenAvatar, setIsOpenAvatar] = useState(false);
    const [isOpenAccountName, setIsOpenAccountName] = useState(false);

    const ref = useRef<HTMLDivElement>(null);

    if (!current || !identity_list) return <></>;
    return (
        <div ref={ref} className="w-full px-5">
            <div className="flex items-center justify-center py-7">
                <div className="relative flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#333333] text-4xl">
                    {current.icon}
                    <div
                        className="absolute -right-2 bottom-0 flex h-6 w-6 items-center justify-center rounded-full border border-[#0A0600] bg-[#333333]"
                        onClick={() => {
                            setIsOpenAvatar(true);
                        }}
                    >
                        <Icon
                            name="icon-edit"
                            className="h-3 w-3 cursor-pointer text-[#EEEEEE] duration-300 hover:text-[#FFCF13]"
                        />
                    </div>
                </div>
            </div>
            <div className="w-full overflow-hidden rounded-xl bg-[#181818]">
                <div className="flex cursor-pointer items-center justify-between border-b border-[#222222] px-4 py-3 duration-300 hover:bg-[#333333]">
                    <span className="text-sm text-[#EEEEEE]">Account Name</span>
                    <div
                        className="flex items-center justify-between"
                        onClick={() => {
                            setIsOpenAccountName(true);
                        }}
                    >
                        <span className="text-sm text-[#999999]">{current.name}</span>
                        <Icon name="icon-arrow-right" className="ml-3 h-3 w-3 text-[#999999]" />
                    </div>
                </div>
                {current.address.ic?.owner && (
                    <div className="flex items-center justify-between border-b border-[#222222] px-4 py-3">
                        <span className="text-sm text-[#EEEEEE]">Principal ID</span>
                        <CopyToClipboard text={current.address.ic?.owner} onCopy={() => toast.success('Copied')}>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-[#999999]">
                                    {truncate_text(current.address.ic?.owner || '')}
                                </span>
                                <Icon
                                    name="icon-copy"
                                    className="ml-3 h-3 w-3 cursor-pointer text-[#999999] duration-300 hover:text-[#FFCF13]"
                                />
                            </div>
                        </CopyToClipboard>
                    </div>
                )}
                {current.address.ic?.account_id && (
                    <div className="flex items-center justify-between px-4 py-3">
                        <span className="text-sm text-[#EEEEEE]">Account ID</span>
                        <CopyToClipboard text={current.address.ic?.account_id} onCopy={() => toast.success('Copied')}>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-[#999999]">
                                    {truncate_text(current.address.ic?.account_id || '')}
                                </span>
                                <Icon
                                    name="icon-copy"
                                    className="ml-3 h-3 w-3 cursor-pointer text-[#999999] duration-300 hover:text-[#FFCF13]"
                                />
                            </div>
                        </CopyToClipboard>
                    </div>
                )}
            </div>

            <div className="mt-4 w-full overflow-hidden rounded-xl bg-[#181818]">
                <div
                    className="flex cursor-pointer items-center justify-between border-b border-[#222222] px-4 py-3 duration-300 hover:bg-[#333333]"
                    onClick={() => {
                        setIsOpenSeedPhrase(true);
                    }}
                >
                    <span className="text-sm text-[#EEEEEE]">Backup Seed Phrase</span>
                    <Icon name="icon-arrow-right" className="ml-3 h-3 w-3 text-[#999999]" />
                </div>
                {current.key.type === 'private_key' && (
                    <div
                        className="flex cursor-pointer items-center justify-between px-4 py-3 duration-300 hover:bg-[#333333]"
                        onClick={() => {
                            setIsOpenPrivateKey(true);
                        }}
                    >
                        <span className="text-sm text-[#EEEEEE]">Backup Private Key</span>
                        <Icon name="icon-arrow-right" className="ml-3 h-3 w-3 text-[#999999]" />
                    </div>
                )}
            </div>

            {current.deletable && (
                <div className="mt-4 w-full overflow-hidden rounded-xl bg-[#181818]">
                    <span
                        className="block cursor-pointer px-4 py-3 text-sm text-[#FF2C40] duration-300 hover:opacity-85"
                        onClick={() => {
                            setIsOpenRemove(true);
                        }}
                    >
                        Remove Account
                    </span>
                </div>
            )}
            <RemoveAccount
                isOpen={isOpenRemove}
                setIsOpen={setIsOpenRemove}
                onDelete={() => removeAccount(current.id)}
            />

            <BackupMnemonicDrawer
                isOpen={isOpenSeedPhrase}
                setIsOpen={setIsOpenSeedPhrase}
                onShowSeed={() => showSeedPhrase(current.id)}
                mnemonic={mnemonic}
                type="seed"
                container={ref.current ?? undefined}
            />

            <BackupMnemonicDrawer
                isOpen={isOpenPrivatekey}
                setIsOpen={setIsOpenPrivateKey}
                onShowSeed={() => showPrivate(current.id)}
                mnemonic={private_key}
                type="private"
                container={ref.current ?? undefined}
            />
            <SetName
                isOpen={isOpenAccountName}
                initName={current.name}
                setIsOpen={setIsOpenAccountName}
                onUpdate={(name) => {
                    updateIdentity(current.id, name, current.icon).then((r) => {
                        console.error('update identity', r);
                        if (r === undefined) return;
                        if (r === false) throw new Error('can not update');
                        // notice successful
                        toast.success('Updated');
                        setIsOpenAccountName(false);
                    });
                }}
            />
            <SetAvatar
                isOpen={isOpenAvatar}
                setIsOpen={setIsOpenAvatar}
                initAvatar={current.icon}
                onUpdate={(icon) => {
                    updateIdentity(current.id, current.name, icon).then((r) => {
                        console.error('update identity', r);
                        if (r === undefined) return;
                        if (r === false) throw new Error('can not update');
                        // notice successful
                        toast.success('Updated');
                        setIsOpenAvatar(false);
                    });
                }}
            />
        </div>
    );
};

const RemoveAccount = ({
    isOpen,
    setIsOpen,
    onDelete,
}: {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onDelete: () => Promise<void>;
}) => {
    const { onOpenChange } = useDisclosure();

    const handleClose = async () => {
        try {
            await onDelete();
            setIsOpen(false);
        } catch (error) {
            console.error('Failed to delete account:', error);
        }
    };

    return (
        <Drawer isOpen={isOpen} placement="bottom" onOpenChange={onOpenChange}>
            <DrawerContent>
                <DrawerBody>
                    <div className="fixed bottom-0 left-0 top-[60px] z-20 flex w-full flex-col justify-between border-t border-[#333333] bg-[#0a0600] px-5 pb-5">
                        <div className="mt-8 flex w-full flex-col items-center justify-center py-10">
                            <div className="flex h-[80px] w-[80px] items-center justify-center rounded-full bg-[#271511]">
                                <Icon name="icon-remove" className="h-10 w-10 text-[#FF2C40]" />
                            </div>
                            <div className="w-full py-3 text-center text-lg text-[#FF2C40]">
                                Confirm removal of wallet1?
                            </div>
                            <p className="block text-center text-sm text-[#FFCF13]">
                                Even if you delete this wallet, you can still restore the account using the mnemonic
                                phrase or private key of this wallet.
                            </p>
                        </div>
                        <div className="flex items-center gap-x-3">
                            <Button
                                className="h-[48px] w-full text-lg font-semibold text-black"
                                onPress={() => setIsOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="h-[48px] w-full bg-[#FFCF13] text-lg font-semibold text-black"
                                onPress={handleClose}
                            >
                                Confirm
                            </Button>
                        </div>
                    </div>
                </DrawerBody>
            </DrawerContent>
        </Drawer>
    );
};

const SetName = ({
    initName,
    isOpen,
    setIsOpen,
    onUpdate,
}: {
    initName: string;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onUpdate: (name: string) => void;
}) => {
    const { onOpenChange } = useDisclosure();
    const [name, setName] = useState(initName);
    return (
        <Drawer isOpen={isOpen} placement="bottom" onOpenChange={onOpenChange}>
            <DrawerContent>
                <DrawerBody>
                    <div className="fixed bottom-0 left-0 top-[60px] z-20 flex w-full flex-col justify-between border-t border-[#333333] bg-[#0a0600] px-5 pb-5">
                        <div className="flex w-full items-center justify-between py-3">
                            <span className="text-sm">Account Name</span>
                            <span
                                className="cursor-pointer text-sm text-[#FFCF13] transition duration-300 hover:opacity-85"
                                onClick={() => setIsOpen(false)}
                            >
                                Close
                            </span>
                        </div>
                        <div className="flex-1 overflow-y-auto pt-8">
                            <input
                                type="text"
                                placeholder="Wallet Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="h-[48px] w-full rounded-xl border border-[#333333] bg-transparent px-3 text-sm text-[#EEEEEE] outline-none duration-300 hover:border-[#FFCF13] focus:border-[#FFCF13]"
                            />
                        </div>
                        <Button
                            className="h-[48px] w-full bg-[#FFCF13] text-lg font-semibold text-black"
                            isDisabled={name.length < 1}
                            onPress={() => onUpdate(name)}
                        >
                            Confirm
                        </Button>
                    </div>
                </DrawerBody>
            </DrawerContent>
        </Drawer>
    );
};

const SetAvatar = ({
    isOpen,
    setIsOpen,
    onUpdate,
    initAvatar,
}: {
    initAvatar: string;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onUpdate: (avatar: string) => void;
}) => {
    const { onOpenChange } = useDisclosure();
    const [avatar, setAvatar] = useState(initAvatar);
    return (
        <Drawer isOpen={isOpen} placement="bottom" onOpenChange={onOpenChange}>
            <DrawerContent>
                <DrawerBody>
                    <div className="fixed bottom-0 left-0 top-[60px] z-20 flex w-full flex-col justify-between border-t border-[#333333] bg-[#0a0600] px-5 pb-5">
                        <div className="flex w-full items-center justify-between py-3">
                            <span className="text-sm">Account Name</span>
                            <span
                                className="cursor-pointer text-sm text-[#FFCF13] transition duration-300 hover:opacity-85"
                                onClick={() => setIsOpen(false)}
                            >
                                Close
                            </span>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <div className="flex items-center justify-center py-6">
                                <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#333333] text-4xl">
                                    {avatar}
                                </div>
                            </div>
                            <p className="block w-full text-center text-sm">Choose Your Favorite Emoji</p>
                            <div className="w-full flex-1 pt-5">
                                <Picker
                                    data={data}
                                    theme={'dark'}
                                    navPosition={'none'}
                                    searchPosition={'none'}
                                    skinTonePosition={'none'}
                                    previewPosition={'none'}
                                    dynamicWidth={false}
                                    perLine={10}
                                    maxHeight={100}
                                    emojiSize={22}
                                    emojiButtonSize={29}
                                    maxFrequentRows={2}
                                    onEmojiSelect={(e: any) => {
                                        setAvatar(e?.native);
                                    }}
                                />
                            </div>
                        </div>
                        <div className="w-full pt-5">
                            <Button
                                className="h-[48px] w-full bg-[#FFCF13] text-lg font-semibold text-black"
                                onPress={() => onUpdate(avatar)}
                            >
                                Confirm
                            </Button>
                        </div>
                    </div>
                </DrawerBody>
            </DrawerContent>
        </Drawer>
    );
};
