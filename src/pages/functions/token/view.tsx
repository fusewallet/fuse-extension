import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd';
import { Switch } from '@heroui/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AiOutlineMinusCircle } from 'react-icons/ai';
import { BsArrowsMove } from 'react-icons/bs';
import { GrSort } from 'react-icons/gr';

import Icon from '~components/icon';
import { FusePage } from '~components/layouts/page';
import { FusePageTransition } from '~components/layouts/transition';
import { ConfirmModal } from '~components/modals/confirm';
import { useCurrentState } from '~hooks/memo/current_state';
import { useGoto } from '~hooks/memo/goto';
import { useMounted } from '~hooks/memo/mounted';
import { useTokenInfoCurrent, useTokenInfoCustom } from '~hooks/store/local';
import { useCurrentIdentity } from '~hooks/store/local-secure';
import { cn } from '~lib/utils/cn';
import { resort_list } from '~lib/utils/sort';
import {
    get_token_name,
    get_token_symbol,
    get_token_unique_id,
    is_same_token_info,
    match_combined_token_info,
    TokenTag,
    type TokenInfo,
} from '~types/tokens';
import { get_preset_all_token_info, get_token_logo } from '~types/tokens/preset';

import { FunctionHeader } from '../components/header';
import CustomTokenDrawer from './components/custom-token-drawer';

type Tab = 'current' | 'all' | 'ck' | 'sns' | 'custom';
const TabNames: Record<Tab, string> = {
    current: '⭐️',
    all: 'All',
    ck: 'CK',
    sns: 'SNS',
    custom: 'Custom',
};
const TABS: Tab[] = ['current', 'all', 'ck', 'sns', 'custom'];

function FunctionTokenViewPage() {
    const current_state = useCurrentState();
    const { current_chain_network } = useCurrentIdentity();
    const { setHide, goto: _goto } = useGoto();

    const [custom, { pushCustomToken, removeCustomToken }] = useTokenInfoCustom();
    const [current, { pushToken, removeToken, resortToken }] = useTokenInfoCurrent();

    const [search, setSearch] = useState('');
    const ALL_TOKEN_INFO = useMemo(() => get_preset_all_token_info(current_chain_network), [current_chain_network]);
    const currentTokens = useMemo(() => current, [current]);
    const allTokens = useMemo(() => [...ALL_TOKEN_INFO, ...custom.map((t) => t.token)], [ALL_TOKEN_INFO, custom]);
    const ckTokens = useMemo(() => ALL_TOKEN_INFO.filter((t) => t.tags.includes(TokenTag.ChainIcCk)), [ALL_TOKEN_INFO]);
    const snsTokens = useMemo(
        () => ALL_TOKEN_INFO.filter((t) => t.tags.includes(TokenTag.ChainIcSns)),
        [ALL_TOKEN_INFO],
    );
    const customTokens = useMemo(() => custom.map((t) => t.token), [custom]);

    const [tab, setTab] = useState<Tab>('current');

    const tokens = useMemo<(TokenInfo & { id: string; current: boolean })[]>(() => {
        return (() => {
            const tokens: Record<Tab, TokenInfo[]> = {
                current: currentTokens,
                all: allTokens,
                ck: ckTokens,
                sns: snsTokens,
                custom: customTokens,
            };
            return tokens[tab].map((t) => ({
                ...t,
                id: get_token_unique_id(t),
                current: !!currentTokens.find((c) => is_same_token_info(c, t)),
            }));
        })().filter((t) => {
            const s = search.trim().toLowerCase();
            if (!s) return true;
            return match_combined_token_info(t.info, {
                ic: (ic) => 0 <= ic.name.toLowerCase().indexOf(s) || 0 <= ic.symbol.toLowerCase().indexOf(s),
                evm: (evm) => 0 <= evm.name.toLowerCase().indexOf(s) || 0 <= evm.symbol.toLowerCase().indexOf(s),
            });
        });
    }, [search, tab, currentTokens, allTokens, ckTokens, snsTokens, customTokens]);

    const [sort, setSort] = useState(false);

    const onSwitchToken = useCallback(
        (token: TokenInfo & { current: boolean }, selected: boolean) => {
            if (token.current === selected) return;
            if (selected) pushToken({ info: token.info, tags: token.tags });
            else removeToken(token);
        },
        [pushToken, removeToken],
    );

    const [wrapped, setWrapped] = useState<(TokenInfo & { id: string; current: boolean })[]>([]);
    useEffect(() => setWrapped([...tokens]), [tokens]);
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
            resortToken(result.source.index, result.destination?.index);
        },
        [wrapped, resortToken],
    );

    // ! Switch has this problem.
    // ! Can't perform a React state update on a component that hasn't mounted yet
    const mounted = useMounted();

    const isTokenExist = useCallback(
        (token: { ic: string } | { evm: string }) => {
            const found = allTokens.find((t) =>
                match_combined_token_info(t.info, {
                    ic: (ic) => {
                        if ('ic' in token) return ic.canister_id === token.ic;
                        return false;
                    },
                    evm: (evm) => {
                        if ('evm' in token) return evm.address === token.evm;
                        return false;
                    },
                }),
            );
            return found !== undefined;
        },
        [allTokens],
    );

    const ref = useRef<HTMLDivElement>(null);
    return (
        <FusePage current_state={current_state} options={{ refresh_token_info_ic_sleep: 1000 * 60 * 5 }}>
            <div ref={ref} className="relative h-full w-full overflow-hidden">
                <FusePageTransition setHide={setHide}>
                    <div className="relative flex h-full w-full flex-col items-center justify-start pt-[52px]">
                        <FunctionHeader title={'Search'} onBack={() => _goto('/')} onClose={() => _goto('/')} />

                        <div className="w-full px-5">
                            <div className="flex h-12 w-full items-center rounded-xl border border-[#333333] px-3 transition duration-300 hover:border-[#FFCF13]">
                                <Icon name="icon-search" className="h-[16px] w-[16px] text-[#999999]" />
                                <input
                                    type="text"
                                    className="h-full w-full border-transparent bg-transparent pl-3 text-base outline-none placeholder:text-sm"
                                    placeholder="Search token or canister"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex w-full items-center justify-between px-5 py-3">
                            <div className="flex items-center text-sm">
                                {TABS.map((t) => (
                                    <span
                                        key={t}
                                        className={cn(
                                            'cursor-pointer rounded-full px-3 py-1',
                                            tab === t ? 'bg-[#333333] text-[#EEEEEE]' : 'text-[#999999]',
                                        )}
                                        onClick={() => {
                                            setSort(false);
                                            setTab(t);
                                        }}
                                    >
                                        {TabNames[t]}
                                    </span>
                                ))}
                            </div>

                            {tab === 'current' ? (
                                <GrSort
                                    className={cn('cursor-pointer text-sm', sort ? 'text-[#FFCF13]' : 'text-[#999999]')}
                                    onClick={() => setSort((s) => !s)}
                                />
                            ) : (
                                <CustomTokenDrawer
                                    trigger={
                                        <div className="flex cursor-pointer items-center text-sm text-[#FFCF13] transition duration-300 hover:opacity-85">
                                            <span className="pr-1">Add</span>
                                            <Icon name="icon-arrow-right" className="h-3 w-3 text-[#FFCF13]" />
                                        </div>
                                    }
                                    container={ref.current ?? undefined}
                                    isTokenExist={isTokenExist}
                                    pushIcToken={async (ic_token) => {
                                        pushCustomToken({
                                            info: { ic: ic_token },
                                            tags: [TokenTag.ChainIcCustom],
                                        }).then((token) => {
                                            if (token) pushToken(token);
                                        });
                                    }}
                                />
                            )}
                        </div>

                        {mounted && (
                            <DragDropContext onDragEnd={onDragEnd}>
                                <Droppable droppableId="droppable">
                                    {(provided) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className="flex w-full flex-1 flex-col gap-y-[10px] overflow-y-auto px-5 pb-5"
                                        >
                                            {wrapped.length === 0 && (
                                                <div className="flex h-full w-full flex-col items-center justify-center">
                                                    <Icon
                                                        name="icon-empty"
                                                        className="h-[70px] w-[70px] text-[#999999]"
                                                    />
                                                    <p className="text-sm text-[#999999]">No data found</p>
                                                    <span className="mt-6 flex cursor-pointer items-center rounded-full bg-[#222222] px-3 py-2 text-sm duration-300 hover:bg-[#333333]">
                                                        <Icon name="icon-add" className="mr-2 h-4 w-4 text-[#FFCF13]" />
                                                        Add
                                                    </span>
                                                </div>
                                            )}
                                            {wrapped.map((token, index) => (
                                                <Draggable
                                                    key={token.id}
                                                    draggableId={token.id}
                                                    index={index}
                                                    isDragDisabled={tab !== 'current' || !sort}
                                                >
                                                    {(provided) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className="h-auto w-full"
                                                        >
                                                            <ShowTokenItem
                                                                tab={tab}
                                                                sort={sort}
                                                                token={token}
                                                                onSwitchToken={onSwitchToken}
                                                                onDeleteCustomToken={(token) => {
                                                                    if (
                                                                        currentTokens.find((t) =>
                                                                            is_same_token_info(t, token),
                                                                        )
                                                                    ) {
                                                                        removeToken(token);
                                                                    }
                                                                    removeCustomToken(token);
                                                                }}
                                                                container={ref.current ?? undefined}
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
                        )}
                    </div>
                </FusePageTransition>
            </div>
        </FusePage>
    );
}

export default FunctionTokenViewPage;

const ShowTokenItem = ({
    tab,
    sort,
    token,
    onSwitchToken,
    onDeleteCustomToken,
    container,
}: {
    tab: Tab;
    sort: boolean;
    token: TokenInfo & { id: string; current: boolean };
    onSwitchToken: (token: TokenInfo & { current: boolean }, selected: boolean) => void;
    onDeleteCustomToken: (token: TokenInfo) => void;
    container?: HTMLElement | null;
}) => {
    const [logo, setLogo] = useState<string>();
    useEffect(() => {
        get_token_logo(token.info).then(setLogo);
    }, [token]);
    return (
        <div className="flex w-full cursor-pointer items-center justify-between rounded-xl bg-[#181818] p-[10px] transition duration-300 hover:bg-[#2B2B2B]">
            <div className="flex items-center">
                <img src={logo} className="h-10 w-10 rounded-full" />
                <div className="ml-[10px]">
                    <strong className="block text-base text-[#EEEEEE]">{get_token_symbol(token)}</strong>
                    <span className="text-xs text-[#999999]"> {get_token_name(token)}</span>
                </div>
            </div>
            <div className="flex items-center">
                {tab === 'current' && sort ? (
                    <BsArrowsMove size={16} className="mr-2" />
                ) : (
                    <>
                        {tab === 'custom' && (
                            <ConfirmModal
                                container={container}
                                trigger={<AiOutlineMinusCircle size={14} className="text-[#FF0000]" />}
                                title={'Delete this token?'}
                                description={
                                    'Once the Token is removed, it must be added again in order to be displayed.'
                                }
                                confirm={
                                    <div className="h-full w-full" onClick={() => onDeleteCustomToken(token)}>
                                        <span>Confirm</span>
                                    </div>
                                }
                            />
                        )}
                        <div className="scale-[0.6]">
                            <Switch
                                isSelected={token.current}
                                onValueChange={(s) => onSwitchToken(token, s)}
                                color="success"
                                size="sm"
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
