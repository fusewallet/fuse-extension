import { useEffect, useState } from 'react';

import type { Storage } from '@plasmohq/storage';

import { useCachedStoreData0, type DataMetadata0 } from '~hooks/meta/metadata-0';
import { same } from '~lib/utils/same';
import type { IcTokenMetadata } from '~types/tokens/chain/ic';

import { LOCAL_KEY_TOKEN_METADATA_IC } from '../../../keys';
import { useTokenMetadataUpdatedIcInner } from './metadata_updated';

// ! always try to use this value to avoid BLINK
type DataType = Record<string, IcTokenMetadata>; // <prefix>:token:info:ic => [canister_id => info]
const get_key = (): string => LOCAL_KEY_TOKEN_METADATA_IC;
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
export const useTokenMetadataIcInner = (storage: Storage): [DataType, (value: DataType) => Promise<void>] =>
    useCachedStoreData0(storage, meta);

export const useTokenMetadataIcByInitialInner = (
    storage: Storage,
    canister_id: string,
): IcTokenMetadata | undefined => {
    const [token_metadata, setTokenMetadata] = useTokenMetadataIcInner(storage);

    const [token, setToken] = useState<IcTokenMetadata | undefined>(token_metadata[canister_id]);

    // init
    useEffect(() => {
        if (!storage) return;
        if (canister_id === undefined) return;
        if (token !== undefined) return;
        get_token_base_info_ic(canister_id).then((token) => {
            if (token !== undefined) {
                setToken(token);
                const next = { ...token_metadata };
                next[canister_id] = token;
                if (same(token_metadata, next)) return;
                setTokenMetadata(next);
            }
        });
    }, [storage, token, token_metadata, setTokenMetadata, canister_id]);

    return token;
};

export const useTokenMetadataIcByRefreshingInner = (storage: Storage, sleep: number) => {
    const [token_metadata, setTokenMetadata] = useTokenMetadataIcInner(storage);
    const [token_metadata_updated, setTokenMetadataUpdated] = useTokenMetadataUpdatedIcInner(storage);

    // do refresh once
    useEffect(() => {
        if (!storage) return;
        if (sleep <= 0) return; // do nothing
        const now = Date.now();
        if (now < token_metadata_updated + sleep) return; // sleep
        setTokenMetadataUpdated(now);
        (async () => {
            const next: DataType = { ...token_metadata };
            for (const canister_id in token_metadata) {
                const token = await get_token_base_info_ic(canister_id);
                if (token !== undefined) next[canister_id] = token;
            }
            if (same(token_metadata, next)) return;
            setTokenMetadata(next);
        })();
    }, [storage, sleep, token_metadata_updated, setTokenMetadataUpdated, token_metadata, setTokenMetadata]);
};

// ================ utils ================

export const get_token_base_info_ic = async (canister_id: string): Promise<IcTokenMetadata | undefined> => {
    const response = await fetch('https://api.icexplorer.io/api/token/detail', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ledgerId: canister_id }),
    });
    const json = await response.json();

    const item = json.data as IcTokenMetadata | undefined;

    if (!item) return undefined;

    // special case ICP
    if (canister_id === 'ryjl3-tyaaa-aaaaa-aaaba-cai') {
        item.description =
            'The Internet Computer is a public blockchain network enabled by new science from first principles. It is millions of times more powerful and can replace clouds and traditional IT. The network – created by ICP, or Internet Computer Protocol – is orchestrated by permissionless decentralized governance and is hosted on sovereign hardware devices run by independent parties. Its purpose is to extend the public internet with native cloud computing functionality.';
        item.tokenDetail = {
            Website: 'https://internetcomputer.org/',
            Github: 'https://github.com/dfinity',
            Twitter: 'https://twitter.com/dfinity',
            Discord: 'https://discord.internetcomputer.org',
            Telegram: 'https://t.me/+m8tiEFaaNR8xNjNl',
        };
    }

    return {
        ledgerId: item.ledgerId,
        marketCap: item.marketCap,
        // FDV
        fullyDilutedMarketCap: item.fullyDilutedMarketCap,
        name: item.name,
        source: item.source,
        symbol: item.symbol,
        tokenDecimal: item.tokenDecimal,
        supplyCap: item.supplyCap,
        totalSupply: item.totalSupply,
        description: item.description,
        tokenDetail: item.tokenDetail && {
            Website: item.tokenDetail.Website,
            Github: item.tokenDetail.Github,
            Twitter: item.tokenDetail.Twitter,
            Discord: item.tokenDetail.Discord,
            Telegram: item.tokenDetail.Telegram,
            Medium: item.tokenDetail.Medium,
        },
    };
};
