import type { Storage } from '@plasmohq/storage';

import { useCachedStoreData0, type DataMetadata0 } from '~hooks/meta/metadata-0';
import { SESSION_KEY_POPUP_ACTIONS_LENGTH } from '~lib/storage/keys';

// ! always try to use this value to avoid BLINK
type DataType = number;
const get_key = (): string => SESSION_KEY_POPUP_ACTIONS_LENGTH;
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

// popup actions length -> // * session
export const usePopupActionsLengthInner = (storage: Storage): [DataType, (value: DataType) => Promise<void>] =>
    useCachedStoreData0(storage, meta);
