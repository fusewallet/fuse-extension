import { anonymous } from '@choptop/haw';
import { useCallback, useEffect, useState } from 'react';
import { useInterval } from 'usehooks-ts';

import type { Storage } from '@plasmohq/storage';

import { useCachedStoreData1, type DataMetadata1 } from '~hooks/meta/metadata-1';
import { icrc1_balance_of } from '~lib/canisters/icrc1';
import type { IdentityAddress } from '~types/identity';

import { LOCAL_KEY_TOKEN_BALANCE_IC } from '../../../keys';

// ! always try to use this value to avoid BLINK
type DataType = Record<string, string>; // <prefix>:balance:ic:address => [canister_id => balance]
const get_key = (principal: string): string => LOCAL_KEY_TOKEN_BALANCE_IC(principal);
const get_default_value = (): DataType => ({});
const cached_value: Record<string, DataType> = {};
const get_cached_value = (principal: string): DataType => cached_value[principal] ?? get_default_value();
const set_cached_value = (value: DataType, principal: string): DataType => (cached_value[principal] = value);
const meta: DataMetadata1<DataType, string> = {
    get_key,
    get_default_value,
    get_cached_value,
    set_cached_value,
};

// token balance ic -> // * local
export const useTokenBalanceIcInner = (
    storage: Storage,
    principal: string,
): [DataType, (value: DataType) => Promise<void>] => useCachedStoreData1(storage, meta, principal);

export const useTokenBalanceIcByRefreshingInner = (
    storage: Storage,
    principal: string | undefined,
    canisters: string[],
    sleep: number,
): [Record<string, string>, { refreshBalance: () => void }] => {
    const [balances, setBalances] = useTokenBalanceIcInner(storage, principal ?? '');

    const [balance, setBalance] = useState<Record<string, string>>(get_balance_from_balances(canisters, balances));

    // init
    useEffect(() => {
        if (!storage) return;
        if (principal === undefined || principal === '') return;
        if (!canisters.length) return;
        if (Object.keys(balance).length !== canisters.length)
            return setBalance(get_balance_from_balances(canisters, balances));
        if (canisters.find((canister_id) => !balance[canister_id] && balances[canister_id]))
            return setBalance(get_balance_from_balances(canisters, balances));
        if (Object.values(balance).some((b) => b !== undefined)) return;
        update_token_balance(principal, canisters, setBalance, balances, setBalances);
    }, [storage, balance, balances, setBalances, canisters, principal]);

    // refresh
    const refreshBalance = useCallback(() => {
        if (!storage) return;
        if (principal === undefined || principal === '') return;
        if (!canisters.length) return;
        update_token_balance(principal, canisters, setBalance, balances, setBalances);
    }, [storage, principal, balances, setBalances, canisters]);

    // schedule
    useInterval(() => refreshBalance(), sleep);

    return [balance, { refreshBalance }];
};

const update_token_balance = (
    principal: string,
    canisters: string[],
    setBalance: (balance: Record<string, string>) => void,
    balances: DataType,
    setBalances: (balances: DataType) => void,
) => {
    Promise.all(
        canisters.map(
            async (canister_id): Promise<[string, string]> => [
                canister_id,
                await icrc1_balance_of(anonymous, canister_id, { owner: principal }),
            ],
        ),
    ).then((balance) => {
        const _balance: Record<string, string> = {};
        for (const [canister_id, b] of balance) _balance[canister_id] = b;
        setBalance(_balance);
        const bs = { ...balances };
        for (const [canister_id, b] of balance) bs[canister_id] = b;
        setBalances(bs);
    });
};

const get_balance_from_balances = (canisters: string[], balances: DataType) => {
    const balance: Record<string, string> = {};
    canisters.map((canister_id) => (balance[canister_id] = balances[canister_id]));
    return balance;
};

export const get_balance_by_identity_canister_id = async (
    canister_id: string,
    identity: IdentityAddress,
): Promise<string> => {
    if (!identity.ic) return '0';
    return await icrc1_balance_of(anonymous, canister_id, identity.ic);
};
