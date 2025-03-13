import { Storage } from '@plasmohq/storage';

import { get_current_identity_network, type CurrentIdentityNetwork, type IdentityNetwork } from '~types/network';
import type { FuseRecord, FuseRecordList } from '~types/records';

import { format_record_date } from '../common';
import {
    LOCAL_KEY_CACHED_KEY,
    LOCAL_KEY_PASSWORD_HASHED,
    LOCAL_KEY_RECORD_COUNT,
    LOCAL_KEY_RECORD_DATE,
    LOCAL_KEY_RECORD_STARTED,
} from '../keys';
import { useCurrentIdentity } from '../local-secure';
import { usePasswordHashedInner } from './password_hashed';
import { useTokenInfoCurrentInner, useTokenInfoCurrentInner2 } from './token/current';
import { useTokenInfoCustomInner2 } from './token/custom';
import { useTokenBalanceIcByRefreshingInner } from './token/ic/balance';
import { useTokenInfoIcByInitialInner, useTokenInfoIcByRefreshingInner } from './token/ic/info';
import {
    useTokenPriceIcByInitialInner,
    useTokenPriceIcByRefreshingInner,
    useTokenPriceIcInner,
} from './token/ic/price';
import { useWelcomedInner } from './welcome';

// * local -> current browser
const LOCAL_STORAGE = new Storage({ area: 'local' }); // local
// const LOCAL_SECURE_STORAGE = new SecureStorage({ area: 'local' }); // local
export const __get_local_storage = () => LOCAL_STORAGE;

// ================ hooks ================

// ############### LOCAL ###############
export const useWelcomed = () => useWelcomedInner(LOCAL_STORAGE); // local
export const usePasswordHashed = () => usePasswordHashedInner(LOCAL_STORAGE); // local

// token/custom
export const useTokenInfoCustom = () => {
    const { current_identity_network, current_chain_network } = useCurrentIdentity();
    const current = get_current_identity_network(
        current_chain_network?.chain ?? 'ic',
        current_identity_network as CurrentIdentityNetwork,
    );
    return useTokenInfoCustomInner2(LOCAL_STORAGE, current);
}; // local
// token/current
export const useTokenInfoCurrentRead = () => {
    const { current_identity_network, current_chain_network } = useCurrentIdentity();
    const current = get_current_identity_network(
        current_chain_network?.chain ?? 'ic',
        current_identity_network as CurrentIdentityNetwork,
    );
    return useTokenInfoCurrentInner(LOCAL_STORAGE, current)[0]; // local
}; // local
export const useTokenInfoCurrent = () => {
    const { current_identity_network, current_chain_network } = useCurrentIdentity();
    const current = get_current_identity_network(
        current_chain_network?.chain ?? 'ic',
        current_identity_network as CurrentIdentityNetwork,
    );
    return useTokenInfoCurrentInner2(LOCAL_STORAGE, current); // local
}; // local
// token/ic/info
export const useTokenInfoIcByInitial = (canister_id: string) =>
    useTokenInfoIcByInitialInner(LOCAL_STORAGE, canister_id); // local
export const useTokenInfoIcByRefreshing = (sleep: number) => useTokenInfoIcByRefreshingInner(LOCAL_STORAGE, sleep); // local
// token/ic/balance
export const useTokenBalanceIcByRefreshing = (principal: string | undefined, canisters: string[], sleep: number) =>
    useTokenBalanceIcByRefreshingInner(LOCAL_STORAGE, principal, canisters, sleep); // local
// token/ic/price
export const useTokenPriceIcRead = () => useTokenPriceIcInner(LOCAL_STORAGE)[0]; // local
export const useTokenPriceIcByInitial = (canister_id: string) =>
    useTokenPriceIcByInitialInner(LOCAL_STORAGE, canister_id); // local
export const useTokenPriceIcByRefreshing = (sleep: number) => useTokenPriceIcByRefreshingInner(LOCAL_STORAGE, sleep); // local

// ================ set directly by storage ================

// ############### LOCAL ###############

export const setPasswordHashedDirectly = async (password_hashed: string) => {
    await LOCAL_STORAGE.set(LOCAL_KEY_PASSWORD_HASHED, password_hashed);
};

// current status
export const is_current_initial = async (): Promise<boolean> => {
    const password_hashed = await LOCAL_STORAGE.get<string>(LOCAL_KEY_PASSWORD_HASHED);
    return !!password_hashed;
};

// cached data
export const get_cached_data = async (
    key: string,
    produce: () => Promise<string | undefined>,
    alive = 86400000,
): Promise<string | undefined> => {
    const cache_key = LOCAL_KEY_CACHED_KEY(key);
    let cached = await LOCAL_STORAGE.get<{
        value: string;
        created: number;
    }>(cache_key);
    const now = Date.now();
    if (!cached || cached.created + alive < now) {
        const value = await produce();
        if (value === undefined) return undefined;
        cached = { value, created: now };
        await LOCAL_STORAGE.set(cache_key, cached);
    }
    return cached.value;
};

// ---------- record ----------
export const get_local_record_started = async (identity_network: IdentityNetwork): Promise<number> => {
    const key = LOCAL_KEY_RECORD_STARTED(identity_network);
    const value = (await LOCAL_STORAGE.get<number>(key)) ?? 0;
    return value;
};
export const get_local_record_count = async (identity_network: IdentityNetwork): Promise<number> => {
    const key = LOCAL_KEY_RECORD_COUNT(identity_network);
    const value = (await LOCAL_STORAGE.get<number>(key)) ?? 0;
    return value;
};
export const get_local_record_list = async (
    identity_network: IdentityNetwork,
    now: number,
): Promise<FuseRecordList> => {
    const date = format_record_date(now);
    const key = LOCAL_KEY_RECORD_DATE(identity_network, date);
    const value = (await LOCAL_STORAGE.get<FuseRecordList>(key)) ?? [];
    return value;
};
export const assure_local_record_started = async (identity_network: IdentityNetwork, now: number) => {
    const key = LOCAL_KEY_RECORD_STARTED(identity_network);
    const value = await LOCAL_STORAGE.get<number>(key);
    if (value !== undefined && 0 < value) return;
    await LOCAL_STORAGE.set(key, now);
};
export const increment_local_record_count = async (identity_network: IdentityNetwork) => {
    const key = LOCAL_KEY_RECORD_COUNT(identity_network);
    const value = (await LOCAL_STORAGE.get<number>(key)) ?? 0;
    await LOCAL_STORAGE.set(key, value + 1);
};
export const push_local_record = async (identity_network: IdentityNetwork, now: number, record: FuseRecord) => {
    const date = format_record_date(now);
    const key = LOCAL_KEY_RECORD_DATE(identity_network, date);
    const value = (await LOCAL_STORAGE.get<FuseRecordList>(key)) ?? [];
    const next = [...value, record];
    await LOCAL_STORAGE.set(key, next);
    await increment_local_record_count(identity_network);
    await assure_local_record_started(identity_network, now);
};
