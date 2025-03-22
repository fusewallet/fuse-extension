import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BsArrowsMove } from 'react-icons/bs';

import { broadcastMessage } from '~background';
import { FusePage } from '~components/layouts/page';
import { FusePageTransition } from '~components/layouts/transition';
import { useCurrentState } from '~hooks/memo/current_state';
import { useGoto } from '~hooks/memo/goto';
import { useCurrentIdentity, useIdentityKeys } from '~hooks/store/local-secure';
import { useSonnerToast } from '~hooks/toast';
import { cn } from '~lib/utils/cn';
import { resort_list } from '~lib/utils/sort';
import { AddWalletDrawer } from '~pages/functions/switch/components/add-wallet-drawer';
import type { ShowIdentityKey } from '~types/identity';

import { FunctionHeader } from '../../../components/header';

const AccountItem = ({
    identity,
    current_identity,
    switchIdentity,
}: {
    identity: ShowIdentityKey;
    current_identity: string | undefined;
    switchIdentity: (id: string) => Promise<boolean | undefined>;
}) => {
    const { navigate } = useGoto();
    return (
        <div
            className="flex items-center justify-between"
            onClick={() => navigate(`/home/settings/accounts/${identity.id}`)}
        >
            <div className="flex cursor-default items-center">
                <div
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#333333] p-2 text-2xl"
                    onClick={(e) => {
                        if (current_identity !== identity.id) {
                            switchIdentity(identity.id).then((r) => {
                                if (r === undefined) return;
                                if (r === false) throw Error('switch identity failed');
                                // notice successful
                            });
                        }
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                >
                    {identity.icon}
                </div>
                <span className="pl-3 text-sm">{identity.name}</span>
                {identity.id === current_identity && (
                    <span className="ml-3 rounded-full bg-[#333333] px-2 py-[2px] text-xs">CURRENT</span>
                )}
            </div>
            <div>
                <BsArrowsMove className="h-4 w-4 text-[#999999]" />
            </div>
        </div>
    );
};

function FunctionSettingsAccountsPage() {
    const current_state = useCurrentState();

    const { setHide, goto } = useGoto();

    const {
        current_identity,
        identity_list,
        main_mnemonic_identity,
        pushIdentityByMainMnemonic,
        switchIdentity,
        resortIdentityKeys,
    } = useIdentityKeys();

    const ref = useRef<HTMLDivElement>(null);

    const toast = useSonnerToast();

    const new_identity_list = useMemo(() => {
        if (!identity_list) return [];
        return identity_list.map((identity) => ({
            ...identity,
            current: identity.id === current_identity,
        }));
    }, [current_identity, identity_list]);

    const [wrapped, setWrapped] = useState<(ShowIdentityKey & { current: boolean })[]>([]);
    useEffect(() => setWrapped([...new_identity_list]), [new_identity_list]);

    const onDragEnd = useCallback(
        (result: DropResult) => {
            const source_index = result.source.index;
            const destination_index = result.destination?.index;

            if (destination_index === undefined) return;

            if (source_index === destination_index) {
                console.error('same source_index with destination_index', source_index, destination_index);
                return;
            }
            const next = resort_list(wrapped, result.source.index, result.destination?.index);
            if (typeof next === 'object') setWrapped(next);
            resortIdentityKeys(result.source.index, result.destination?.index);
        },
        [wrapped, resortIdentityKeys],
    );

    return (
        <FusePage current_state={current_state}>
            <div ref={ref} className="relative h-full w-full overflow-hidden">
                <FusePageTransition
                    className="relative flex h-full w-full flex-col items-center justify-center pt-[52px]"
                    setHide={setHide}
                    header={
                        <FunctionHeader
                            title={'Manage Accounts'}
                            onBack={() => goto(-1)}
                            onClose={() => goto('/', { replace: true })}
                        />
                    }
                >
                    <div className="flex h-full w-full flex-col justify-between">
                        <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="droppable">
                                {(provided) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="flex w-full flex-1 flex-col gap-y-3 overflow-y-auto px-5 py-5"
                                    >
                                        {wrapped.map((identity, index) => (
                                            <Draggable key={identity.id} draggableId={identity.id} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className={cn(
                                                            `block w-full cursor-pointer rounded-xl border border-[#181818] bg-[#181818] p-3 duration-300 hover:bg-[#2B2B2B]`,
                                                            snapshot.isDragging && 'border-[#FFCF13]',
                                                        )}
                                                    >
                                                        <AccountItem
                                                            identity={identity}
                                                            current_identity={current_identity}
                                                            switchIdentity={switchIdentity}
                                                        />
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>

                        <AddWalletDrawer
                            trigger={
                                <div className="p-5">
                                    <div className="flex h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-[#FFCF13] text-lg font-semibold text-black">
                                        Add / Connect wallet
                                    </div>
                                </div>
                            }
                            container={ref.current ?? undefined}
                            onAddWalletByMainMnemonic={() => {
                                pushIdentityByMainMnemonic().then((r) => {
                                    if (r === undefined) return;
                                    if (r === false) return;
                                    // notice successful
                                    toast.success('Create Account Success');
                                });
                            }}
                            goto={goto}
                            has_main_mnemonic={!!main_mnemonic_identity}
                            import_prefix={'/home/settings/accounts/import'}
                        />
                    </div>
                </FusePageTransition>
            </div>
        </FusePage>
    );
}

export default FunctionSettingsAccountsPage;
