import type { SecureStorage } from '@plasmohq/storage/secure';

import { useSecureCachedStoreData1, type SecureDataMetadata1 } from '~hooks/meta/metadata-secure-1';
import type { IdentityId } from '~types/identity';
import { DEFAULT_CURRENT_CHAIN_NETWORK, type CurrentChainNetwork } from '~types/network';

import { LOCAL_SECURE_KEY_CURRENT_CHAIN_NETWORK } from '../../keys';

// ! always try to use this value to avoid BLINK
type DataType = CurrentChainNetwork;
const get_key = (id: IdentityId): string => LOCAL_SECURE_KEY_CURRENT_CHAIN_NETWORK(id);
const get_default_value = (): DataType => DEFAULT_CURRENT_CHAIN_NETWORK;
let cached_value = get_default_value();
const get_cached_value = (): DataType => cached_value;
const set_cached_value = (value: DataType): DataType => (cached_value = value);
const meta: SecureDataMetadata1<DataType, IdentityId> = {
    get_key,
    get_default_value,
    get_cached_value,
    set_cached_value,
};

// current chain network ->  // * local secure
export const useCurrentChainNetworkInner = (
    storage: SecureStorage | undefined,
    current_identity: IdentityId | undefined,
): [DataType, (value: DataType) => Promise<void>] => useSecureCachedStoreData1(storage, meta, current_identity);
