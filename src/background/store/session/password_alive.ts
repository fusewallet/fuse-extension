import { cachedFuseData0, type FuseDataMetadata0 } from '~background/meta/fuse-metadata-0';

type DataType = number;
const get_default_value = (): DataType => Date.now();
let cached_value: DataType = get_default_value();
const get_cached_value = async (): Promise<DataType> => cached_value;
const set_cached_value = async (value: DataType): Promise<DataType> => (cached_value = value);
const meta: FuseDataMetadata0<DataType> = {
    get_default_value,
    get_cached_value,
    set_cached_value,
    callback: undefined,
};

const { get, set } = cachedFuseData0<DataType>(meta);

export const $bgsw_get_password_alive = get;
export const $bgsw_set_password_alive = set;
