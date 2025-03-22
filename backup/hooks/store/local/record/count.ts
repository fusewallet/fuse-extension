import type { Storage } from '@plasmohq/storage';

import { useCachedStoreData1, type DataMetadata1 } from '~hooks/meta/metadata-1';
import type { IdentityNetwork } from '~types/network';

import { LOCAL_KEY_RECORD_COUNT } from '../../keys';

// ! always try to use this value to avoid BLINK
type DataType = number;
const get_key = (identity_network: IdentityNetwork): string => LOCAL_KEY_RECORD_COUNT(identity_network);
const get_default_value = (): DataType => 0;
let cached_value = get_default_value();
const get_cached_value = (): DataType => cached_value;
const set_cached_value = (value: DataType): DataType => (cached_value = value);
const meta: DataMetadata1<DataType, IdentityNetwork> = {
    get_key,
    get_default_value,
    get_cached_value,
    set_cached_value,
};

// record count -> // * local
export const useRecordCountInner = (
    storage: Storage,
    identity_network: IdentityNetwork,
): [DataType, (value: DataType) => Promise<void>] => useCachedStoreData1(storage, meta, identity_network);
