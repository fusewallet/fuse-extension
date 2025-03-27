import type { ResponseBody } from '~background/ports/direct-popup-actions';
import { useFusePort, type PortDataMetadata0 } from '~hooks/meta/port-0';
import { DIRECT_PORT_POPUP_ACTIONS } from '~lib/messages';

type DataType = ResponseBody;
const get_key = (): string => DIRECT_PORT_POPUP_ACTIONS;
const get_default_value = (): DataType => [];
let cached_value: DataType = get_default_value();
const get_cached_value = (): DataType => cached_value;
const set_cached_value = (value: DataType): DataType => (cached_value = value);
const meta: PortDataMetadata0<DataType> = {
    get_key,
    get_default_value,
    get_cached_value,
    set_cached_value,
};

export const usePopupActions = (): DataType => useFusePort<DataType>(meta);
