import type { SecureStorage } from '@plasmohq/storage/secure';

import { useSecureCachedStoreData0, type SecureDataMetadata0 } from '~hooks/meta/metadata-secure-0';
import { DEFAULT_CHAIN_NETWORKS, type ChainNetworks } from '~types/network';

import { LOCAL_SECURE_KEY_CHAIN_NETWORKS } from '../keys';

// ! always try to use this value to avoid BLINK
type DataType = ChainNetworks;
const get_key = (): string => LOCAL_SECURE_KEY_CHAIN_NETWORKS;
const get_default_value = (): DataType => [...DEFAULT_CHAIN_NETWORKS];
let cached_value = get_default_value();
const get_cached_value = (): DataType => cached_value;
const set_cached_value = (value: DataType): DataType => (cached_value = value);
const meta: SecureDataMetadata0<DataType> = {
    get_key,
    get_default_value,
    get_cached_value,
    set_cached_value,
};

// chain networks ->  // * local secure
export const useChainNetworksInner = (
    storage: SecureStorage | undefined,
): [DataType, (value: DataType) => Promise<void>] => useSecureCachedStoreData0(storage, meta);
