import { useEffect, useState } from 'react';

import type { Storage } from '@plasmohq/storage';

import { useCachedStoreData0, type DataMetadata0 } from '~hooks/meta/metadata-0';
import { same } from '~lib/utils/same';
import { type IcTokenPrice } from '~types/tokens/chain/ic';

import { LOCAL_KEY_TOKEN_PRICE_IC } from '../../../keys';
import { useTokenPriceUpdatedIcInner } from './price_updated';

// ! always try to use this value to avoid BLINK
type DataType = Record<string, IcTokenPrice>; // <prefix>:token:price:ic => [canister_id => price]
const get_key = (): string => LOCAL_KEY_TOKEN_PRICE_IC;
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

// token price ic -> // * local
export const useTokenPriceIcInner = (storage: Storage): [DataType, (value: DataType) => Promise<void>] =>
    useCachedStoreData0(storage, meta);

export const useTokenPriceIcByInitialInner = (storage: Storage, canister_id: string): IcTokenPrice | undefined => {
    const [token_price, setTokenPrice] = useTokenPriceIcInner(storage);

    const [price, setPrice] = useState<IcTokenPrice | undefined>(token_price[canister_id]);

    // init
    useEffect(() => {
        if (!storage) return;
        if (canister_id === undefined) return;
        if (price !== undefined) return;
        get_token_price_ic().then((prices) => {
            const p = prices.find((p) => p.canister_id === canister_id);
            setPrice(p);
            const next = { ...token_price };
            for (const p of prices) next[p.canister_id] = p;
            if (same(token_price, next)) return;
            setTokenPrice(next);
        });
    }, [storage, price, token_price, setTokenPrice, canister_id]);

    return price;
};

export const useTokenPriceIcByRefreshingInner = (storage: Storage, sleep: number) => {
    const [token_price, setTokenPrice] = useTokenPriceIcInner(storage);
    const [token_price_updated, setTokenPriceUpdated] = useTokenPriceUpdatedIcInner(storage);

    // do refresh once
    useEffect(() => {
        if (!storage) return;
        if (sleep <= 0) return; // do nothing
        const now = Date.now();
        if (now < token_price_updated + sleep) return; // sleep
        setTokenPriceUpdated(now);
        (async () => {
            const next: DataType = { ...token_price };
            const prices = await get_token_price_ic();
            for (const p of prices) next[p.canister_id] = p;
            if (same(token_price, next)) return;
            setTokenPrice(next);
        })();
    }, [storage, sleep, token_price_updated, setTokenPriceUpdated, token_price, setTokenPrice]);
};

// ================ utils ================

const get_token_price_ic = async (): Promise<IcTokenPrice[]> => {
    const response = await fetch('https://api.kongswap.io/api/tokens?page=1&limit=1000');
    const json = await response.json();
    const items = json.items as {
        canister_id: string;
        metrics: {
            price: string;
            price_change_24h: string | null;
        };
    }[];
    return items.map((item) => ({
        canister_id: item.canister_id,
        price: item.metrics.price,
        price_change_24h: item.metrics.price_change_24h ?? undefined,
    }));
};

export const get_token_price_ic_by_canister_id = async (canister_id: string): Promise<IcTokenPrice | undefined> => {
    const response = await fetch('https://api.kongswap.io/api/tokens/by_canister', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ canister_ids: [canister_id] }),
    });
    const json = await response.json();

    const item = json.items[0] as
        | {
              canister_id: string;
              metrics: {
                  price: string;
                  price_change_24h: string | null;
              };
          }
        | undefined;

    if (!item) return undefined;
    return {
        canister_id: item.canister_id,
        price: item.metrics.price,
        price_change_24h: item.metrics.price_change_24h ?? undefined,
    };
};
