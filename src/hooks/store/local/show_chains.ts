import type { Storage } from '@plasmohq/storage';

import { useCachedStoreData0, type DataMetadata0 } from '~hooks/meta/metadata-0';
import { LOCAL_KEY_SHOW_CHAINS } from '~lib/storage/keys';
import type { Chain } from '~types/chain';

type DataType = Chain[];
const get_key = (): string => LOCAL_KEY_SHOW_CHAINS;
const get_default_value = (): DataType => ['ic', 'ethereum', 'bsc', 'polygon'];
let cached_value = get_default_value();
const get_cached_value = (): DataType => cached_value;
const set_cached_value = (value: DataType): DataType => (cached_value = value);
const meta: DataMetadata0<DataType> = {
    get_key,
    get_default_value,
    get_cached_value,
    set_cached_value,
};

// show chains ->  // * local secure
export const useShowChainsInner = (storage: Storage): [DataType, (value: DataType) => Promise<void>] =>
    useCachedStoreData0(storage, meta);
