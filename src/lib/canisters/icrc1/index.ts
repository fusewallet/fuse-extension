import {
    bigint2string,
    hex2array,
    string2bigint,
    string2principal,
    unwrapRustResultMap,
    unwrapVariantKey,
    wrapOptionMap,
    type ConnectedIdentity,
} from '@choptop/haw';

import { idlFactory } from './candid';
import type { _SERVICE } from './candid.d';

export const icrc1_name = async (identity: ConnectedIdentity, canister_id: string): Promise<string> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, canister_id);
    const name = actor.icrc1_name();
    return name;
};

export const icrc1_symbol = async (identity: ConnectedIdentity, canister_id: string): Promise<string> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, canister_id);
    const symbol = await actor.icrc1_symbol();
    return symbol;
};

export const icrc1_decimals = async (identity: ConnectedIdentity, canister_id: string): Promise<number> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, canister_id);
    const decimals = await actor.icrc1_decimals();
    return decimals;
};

export const icrc1_fee = async (identity: ConnectedIdentity, canister_id: string): Promise<string> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, canister_id);
    const fee = await actor.icrc1_fee();
    return bigint2string(fee);
};

export const icrc1_balance_of = async (
    identity: ConnectedIdentity,
    canister_id: string,
    arg: {
        owner: string;
        subaccount?: string;
    },
): Promise<string> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, canister_id);
    const balance = await actor.icrc1_balance_of({
        owner: string2principal(arg.owner),
        subaccount: wrapOptionMap(arg.subaccount, hex2array),
    });
    return bigint2string(balance);
};

export const icrc1_transfer = async (
    identity: ConnectedIdentity,
    canister_id: string,
    arg: {
        from_subaccount?: string;
        to: {
            owner: string;
            subaccount?: string;
        };
        amount: string;
        fee?: string;
        memo?: string;
        created_at_time?: string;
    },
): Promise<string> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, canister_id);
    const r = await actor.icrc1_transfer({
        from_subaccount: wrapOptionMap(arg.from_subaccount, hex2array),
        to: {
            owner: string2principal(arg.to.owner),
            subaccount: wrapOptionMap(arg.to.subaccount, hex2array),
        },
        amount: string2bigint(arg.amount),
        fee: wrapOptionMap(arg.fee, string2bigint),
        memo: wrapOptionMap(arg.memo, hex2array),
        created_at_time: wrapOptionMap(arg.created_at_time, string2bigint),
    });
    return unwrapRustResultMap(r, bigint2string, (e) => {
        console.error(`call ic ${canister_id}.icrc1_transfer failed`, arg, e);
        throw new Error(unwrapVariantKey(e));
    });
};

export const transfer = async (
    identity: ConnectedIdentity,
    canister_id: string,
    arg: {
        from_subaccount?: string;
        to: string;
        amount: string;
        fee: string;
        memo: string;
        created_at_time?: string;
    },
): Promise<string> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, canister_id);
    const r = await actor.transfer({
        from_subaccount: wrapOptionMap(arg.from_subaccount, hex2array),
        to: hex2array(arg.to),
        amount: { e8s: string2bigint(arg.amount) },
        fee: { e8s: string2bigint(arg.fee) },
        memo: string2bigint(arg.memo),
        created_at_time: wrapOptionMap(arg.created_at_time, (t) => ({ timestamp_nanos: string2bigint(t) })),
    });
    return unwrapRustResultMap(r, bigint2string, (e) => {
        console.error(`call ic ${canister_id}.transfer failed`, arg, e);
        throw new Error(unwrapVariantKey(e));
    });
};

export const icrc1_logo = async (identity: ConnectedIdentity, canister_id: string): Promise<string | undefined> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, canister_id);
    const metadata = await actor.icrc1_metadata();
    const logo = metadata.find(([name]) => name === 'icrc1:logo');
    if (logo === undefined) return undefined;
    const data = logo[1];
    if ('Text' in data) return data.Text;
    return undefined;
};
