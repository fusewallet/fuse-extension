import type { Storage } from '@plasmohq/storage';

import { useCachedStoreData0, type DataMetadata0 } from '~hooks/meta/metadata-0';

import { LOCAL_KEY_TOKEN_METADATA_IC_UPDATED } from '../../../keys';

// ! always try to use this value to avoid BLINK
type DataType = number;
const get_key = (): string => LOCAL_KEY_TOKEN_METADATA_IC_UPDATED;
const get_default_value = (): DataType => 0;
let cached_value = get_default_value();
const get_cached_value = (): DataType => cached_value;
const set_cached_value = (value: DataType): DataType => (cached_value = value);
const meta: DataMetadata0<DataType> = {
    get_key,
    get_default_value,
    get_cached_value,
    set_cached_value,
};

// token metadata updated ic -> // * local
export const useTokenMetadataUpdatedIcInner = (storage: Storage): [DataType, (value: DataType) => Promise<void>] =>
    useCachedStoreData0(storage, meta);
