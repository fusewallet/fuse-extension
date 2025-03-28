import { FuseLock } from '~background/meta/fuse-lock';
import { cachedFuseSecureData0, type FuseSecureDataMetadata0 } from '~background/meta/fuse-metadata-secure-0';
import { DEFAULT_CHAIN_NETWORKS, type ChainNetworks } from '~types/network';

import { $bgsw_get_password } from '../session/password';
import { LOCAL_SECURE_KEY_CHAIN_NETWORKS } from './storage/keys';

type DataType = ChainNetworks;
const get_key = (): string => LOCAL_SECURE_KEY_CHAIN_NETWORKS;
const get_default_value = (): DataType => [...DEFAULT_CHAIN_NETWORKS];
let cached_value: DataType | null = null;
const get_cached_value = async (): Promise<DataType | null> => cached_value;
const set_cached_value = async (value: DataType): Promise<DataType> => (cached_value = value);
const meta: FuseSecureDataMetadata0<DataType> = {
    lock: new FuseLock(),
    get_password: $bgsw_get_password,
    get_key,
    get_default_value,
    get_cached_value,
    set_cached_value,
    callback: undefined,
};

const { get, set } = cachedFuseSecureData0<DataType>(meta);

export const $bgsw_get_chain_networks = get;
export const $bgsw_set_chain_networks = set;
