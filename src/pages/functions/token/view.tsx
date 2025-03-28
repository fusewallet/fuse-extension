import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd';
import { Switch } from '@heroui/react';
import BigNumber from 'bignumber.js';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
// import { AiOutlineMinusCircle } from 'react-icons/ai';
import { BsArrowsMove } from 'react-icons/bs';
import { GrSort } from 'react-icons/gr';

import Icon from '~components/icon';
import { FusePage } from '~components/layouts/page';
import { FusePageTransition } from '~components/layouts/transition';
// import { ConfirmModal } from '~components/modals/confirm';
import { useCurrentState } from '~hooks/memo/current_state';
import { useGoto } from '~hooks/memo/goto';
import { useMounted } from '~hooks/memo/mounted';
import { useTokenInfoCurrent, useTokenInfoCustom } from '~hooks/store/local';
import { useCurrentIdentity } from '~hooks/store/local-secure';
import { get_balance_by_identity_canister_id } from '~hooks/store/local/token/ic/balance';
import { get_token_price_ic_by_canister_id } from '~hooks/store/local/token/ic/price';
import { cn } from '~lib/utils/cn';
import { resort_list } from '~lib/utils/sort';
import type { Chain } from '~types/chain';
import {
    get_token_name,
    get_token_symbol,
    get_token_unique_id,
    is_same_token_info,
    match_combined_token_info,
    search_tokens,
    // TokenTag,
    type TokenInfo,
} from '~types/tokens';
import { get_token_logo, PRESET_ALL_TOKEN_INFO } from '~types/tokens/preset';

import { FunctionHeader } from '../components/header';
import CustomTokenDrawer from './components/custom-token-drawer';

type Tab = 'current' | 'all';
// const TabNames: Record<Tab, string> = {
//     current: 'Current',
//     all: 'All',
// };
// const TABS: Tab[] = ['current', 'all'];

function FunctionTokenViewPage() {
    const current_state = useCurrentState();

    const { setHide, goto: _goto } = useGoto();

    const [custom, { pushCustomIcToken, pushCustomToken, removeCustomToken }] = useTokenInfoCustom();
    const [current, { pushToken, removeToken, resortToken }] = useTokenInfoCurrent();

    const [search, setSearch] = useState('');

    const currentTokens = useMemo(() => current, [current]);

    const allTokens = useMemo(() => [...PRESET_ALL_TOKEN_INFO, ...custom.map((t) => t.token)], [custom]);
    // const ckTokens = useMemo(() => PRESET_ALL_TOKEN_INFO.filter((t) => t.tags.includes(TokenTag.ChainIcCk)), []);
    // const snsTokens = useMemo(() => PRESET_ALL_TOKEN_INFO.filter((t) => t.tags.includes(TokenTag.ChainIcSns)), []);
    // const customTokens = useMemo(() => custom.map((t) => t.token), [custom]);

    const [tab] = useState<Tab>('current');

    const tokens = useMemo<(TokenInfo & { id: string; current: boolean })[]>(() => {
        const tokens: Record<Tab, TokenInfo[]> = {
            current: currentTokens,
            all: allTokens,
            // ck: ckTokens,
            // sns: snsTokens,
            // custom: customTokens,
        };
        const tokens_list = search ? tokens.all : tokens.current;
        return search_tokens(tokens_list, search).map((t) => ({
            ...t,
            id: get_token_unique_id(t),
            current: !!currentTokens.find((c) => is_same_token_info(c, t)),
        }));
    }, [search, currentTokens, allTokens]);

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
        (token: { chain: Chain; address: string }) => {
            const found = allTokens.find((t) =>
                match_combined_token_info<boolean>(t.info, {
                    ic: (ic) => token.address === ic.canister_id,
                    ethereum: (t) => token.address === t.address,
                    ethereum_test_sepolia: (t) => token.address === t.address,
                    polygon: (t) => token.address === t.address,
                    polygon_test_amoy: (t) => token.address === t.address,
                    bsc: (t) => token.address === t.address,
                    bsc_test: (t) => token.address === t.address,
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

                        <div className="flex w-full items-center justify-between px-5 pt-3">
                            <div className="flex items-center text-sm text-[#eee] hover:text-[#FFCF13]">
                                Custom Token
                            </div>
                            <CustomTokenDrawer
                                trigger={
                                    <div className="flex cursor-pointer items-center text-sm text-[#eee] hover:text-[#FFCF13]">
                                        <Icon name="icon-arrow-right" className="h-3 w-3" />
                                    </div>
                                }
                                container={ref.current ?? undefined}
                                isTokenExist={isTokenExist}
                                pushIcToken={async (ic_token) => {
                                    pushCustomIcToken(ic_token).then((token) => {
                                        if (token) pushToken(token);
                                    });
                                }}
                                pushCustomToken={async (token, chain) => {
                                    pushCustomToken(token, chain).then((token) => {
                                        if (token) pushToken(token);
                                    });
                                }}
                            />
                        </div>

                        <div className="flex w-full items-center justify-between px-5 py-3">
                            <div className="flex items-center text-sm">Tokens</div>

                            <GrSort
                                className={cn('cursor-pointer text-sm', sort ? 'text-[#FFCF13]' : 'text-[#999999]')}
                                onClick={() => setSort((s) => !s)}
                            />
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

                                                    <CustomTokenDrawer
                                                        trigger={
                                                            <span className="mt-3 flex cursor-pointer items-center rounded-full bg-[#222222] px-3 py-2 text-sm duration-300 hover:bg-[#333333]">
                                                                <Icon
                                                                    name="icon-add"
                                                                    className="mr-2 h-4 w-4 text-[#FFCF13]"
                                                                />
                                                                Add
                                                            </span>
                                                        }
                                                        container={ref.current ?? undefined}
                                                        isTokenExist={isTokenExist}
                                                        pushIcToken={async (ic_token) => {
                                                            pushCustomIcToken(ic_token).then((token) => {
                                                                if (token) pushToken(token);
                                                            });
                                                        }}
                                                        pushCustomToken={async (token, chain) => {
                                                            pushCustomToken(token, chain).then((token) => {
                                                                if (token) pushToken(token);
                                                            });
                                                        }}
                                                    />
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
    // onDeleteCustomToken,
    // container,
}: {
    tab: Tab;
    sort: boolean;
    token: TokenInfo & { id: string; current: boolean };
    onSwitchToken: (token: TokenInfo & { current: boolean }, selected: boolean) => void;
    onDeleteCustomToken: (token: TokenInfo) => void;
    container?: HTMLElement | null;
}) => {
    const { current_identity } = useCurrentIdentity();
    const [logo, setLogo] = useState<string>();
    const [balance, setBalance] = useState<string>('0.00');
    const [usd, setUsd] = useState<string>('0.00');

    // token balance and usd
    const getBalance = useCallback(() => {
        match_combined_token_info(token.info, {
            ic: async (ic) => {
                if (!current_identity || !current_identity.address.ic) return;

                const balance = await get_balance_by_identity_canister_id(ic.canister_id, current_identity.address);
                if (!balance) return;

                setBalance(BigNumber(balance).div(BigNumber(10).pow(ic.decimals)).toFormat(2));
                // get price
                const price_info = await get_token_price_ic_by_canister_id(ic.canister_id);
                if (!price_info || !price_info?.price) return;

                setUsd(
                    price_info?.price &&
                        BigNumber(balance).div(BigNumber(10).pow(ic.decimals)).times(price_info?.price).toFormat(2),
                );
            },
            // TODO: other chain
            ethereum: () => undefined,
            ethereum_test_sepolia: () => undefined,
            polygon: () => undefined,
            polygon_test_amoy: () => undefined,
            bsc: () => undefined,
            bsc_test: () => undefined,
        });
    }, [current_identity, token.info]);

    useEffect(() => {
        get_token_logo(token.info).then(setLogo);

        getBalance();
    }, [getBalance, token]);

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
                <div className="mr-2 flex flex-col">
                    <strong className="text-sm text-[#EEEEEE]">{balance}</strong>
                    <span className="text-xs text-[#999999]">${usd}</span>
                </div>
                {tab === 'current' && sort ? (
                    <BsArrowsMove size={16} className="mr-2" />
                ) : (
                    <>
                        {/* {tab === 'custom' && (
                            <ConfirmModal
                                container={container}
                                trigger={<AiOutlineMinusCircle size={14} className="text-[#FF0000]" />}
                                title={'Delete this token?'}
                                description={
                                    'Once the Token is removed, it must be added again in order to be displayed.'
                                }
                                confirm={
                                    <div className="w-full h-full" onClick={() => onDeleteCustomToken(token)}>
                                        <span>Confirm</span>
                                    </div>
                                }
                            />
                        )} */}
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
