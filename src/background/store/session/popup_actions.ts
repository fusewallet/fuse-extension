import { cachedFuseData0, type FuseDataMetadata0 } from '~background/meta/fuse-metadata-0';
import { __get_session_storage } from '~lib/storage';
import { SESSION_KEY_POPUP_ACTIONS_LENGTH } from '~lib/storage/keys';
import type { PopupActions } from '~types/actions';

type DataType = PopupActions;
const get_default_value = (): DataType => [];
let cached_value: DataType = get_default_value();
const get_cached_value = async (): Promise<DataType> => cached_value;
const set_cached_value = async (value: DataType): Promise<DataType> => (cached_value = value);
const meta: FuseDataMetadata0<DataType> = {
    get_default_value,
    get_cached_value,
    set_cached_value,
    callback: async (value) => {
        await __get_session_storage().setItem(SESSION_KEY_POPUP_ACTIONS_LENGTH, value.length);
    },
};

const { get, set } = cachedFuseData0<DataType>(meta);

export const $bgsw_get_popup_actions = get;
export const $bgsw_set_popup_actions = set;
