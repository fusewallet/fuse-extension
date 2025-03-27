import { cachedFuseSecureData0, type FuseSecureDataMetadata0 } from '~background/meta/fuse-metadata-secure-0';
import type { KeyRings } from '~types/identity';

import { $bgsw_get_password } from '../session/password';
import { LOCAL_SECURE_KEY_KEY_RINGS } from './storage/keys';

type DataType = KeyRings | undefined;
const get_key = (): string => LOCAL_SECURE_KEY_KEY_RINGS;
const default_value: DataType = undefined;
let cached_value: DataType | null = default_value;
const get_cached_value = async (): Promise<DataType | null> => cached_value;
const set_cached_value = async (value: DataType): Promise<DataType> => (cached_value = value);
const meta: FuseSecureDataMetadata0<DataType> = {
    get_key,
    default_value,
    get_password: $bgsw_get_password,
    get_cached_value,
    set_cached_value,
    callback: undefined,
};

const { get, set } = cachedFuseSecureData0<DataType>(meta);

export const $bgsw_get_key_rings = get;
export const $bgsw_set_key_rings = set;
