import { anonymous } from '@choptop/haw';
import { useEffect, useState } from 'react';

import type { Storage } from '@plasmohq/storage';

import { useCachedStoreData0, type DataMetadata0 } from '~hooks/meta/metadata-0';
import { icrc1_decimals, icrc1_fee, icrc1_name, icrc1_symbol } from '~lib/canisters/icrc1';
import { get_canister_standards } from '~lib/canisters/standards';
import { get_canister_status } from '~lib/canisters/status';
import { same } from '~lib/utils/same';
import { IcTokenStandard, type IcTokenInfo } from '~types/tokens/chain/ic';

import { LOCAL_KEY_TOKEN_INFO_IC } from '../../../keys';
import { useTokenInfoUpdatedIcInner } from './info_updated';

// ! always try to use this value to avoid BLINK
type DataType = Record<string, IcTokenInfo>; // <prefix>:token:info:ic => [canister_id => info]
const get_key = (): string => LOCAL_KEY_TOKEN_INFO_IC;
const get_default_value = (): DataType => ({});
let cached_value = get_default_value();
const get_cached_value = (): DataType => cached_value;
const set_cached_value = (value: DataType): DataType => (cached_value = value);
const meta: DataMetadata0<DataType> = {
    get_key,
    get_default_value,
    get_cached_value,
    set_cached_value,
};

// token info ic -> // * local
export const useTokenInfoIcInner = (storage: Storage): [DataType, (value: DataType) => Promise<void>] =>
    useCachedStoreData0(storage, meta);

export const useTokenInfoIcByInitialInner = (storage: Storage, canister_id: string): IcTokenInfo | undefined => {
    const [token_info, setTokenInfo] = useTokenInfoIcInner(storage);

    const [token, setToken] = useState<IcTokenInfo | undefined>(token_info[canister_id]);

    // init
    useEffect(() => {
        if (!storage) return;
        if (canister_id === undefined) return;
        if (token !== undefined) return;
        get_token_info_ic(canister_id).then((token) => {
            if (token !== undefined) {
                setToken(token);
                const next = { ...token_info };
                next[canister_id] = token;
                if (same(token_info, next)) return;
                setTokenInfo(next);
            }
        });
    }, [storage, token, token_info, setTokenInfo, canister_id]);

    return token;
};

export const useTokenInfoIcByRefreshingInner = (storage: Storage, sleep: number) => {
    const [token_info, setTokenInfo] = useTokenInfoIcInner(storage);
    const [token_info_updated, setTokenInfoUpdated] = useTokenInfoUpdatedIcInner(storage);

    // do refresh once
    useEffect(() => {
        if (!storage) return;
        if (sleep <= 0) return; // do nothing
        const now = Date.now();
        if (now < token_info_updated + sleep) return; // sleep
        setTokenInfoUpdated(now);
        (async () => {
            const next: DataType = { ...token_info };
            for (const canister_id in token_info) {
                const token = await get_token_info_ic(canister_id);
                if (token !== undefined) next[canister_id] = token;
            }
            if (same(token_info, next)) return;
            setTokenInfo(next);
        })();
    }, [storage, sleep, token_info_updated, setTokenInfoUpdated, token_info, setTokenInfo]);
};

// ================ utils ================

export const get_token_info_ic = async (canister_id: string): Promise<IcTokenInfo | undefined> => {
    const { candid } = await get_canister_status(canister_id);
    if (candid === undefined) return;
    const standards = await get_canister_standards(candid);

    if (standards.includes(IcTokenStandard.ICRC1)) {
        const name = await icrc1_name(anonymous, canister_id);
        const symbol = await icrc1_symbol(anonymous, canister_id);
        const decimals = await icrc1_decimals(anonymous, canister_id);
        const fee = await icrc1_fee(anonymous, canister_id);
        const token: IcTokenInfo = { canister_id, standards, name, symbol, decimals, fee };
        return token;
    } else {
        console.error(`🚀 ~ canister ${canister_id} standards is not match icrc1`, standards);
    }
    return undefined;
};
