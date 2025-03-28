import { FuseLock } from '~background/meta/fuse-lock';
import { cachedFuseSecureData1, type FuseSecureDataMetadata1 } from '~background/meta/fuse-metadata-secure-1';
import type { IdentityId } from '~types/identity';
import { DEFAULT_CURRENT_CHAIN_NETWORK, type CurrentChainNetwork } from '~types/network';

import { $bgsw_get_password } from '../../session/password';
import { LOCAL_SECURE_KEY_CURRENT_CHAIN_NETWORK } from '../storage/keys';

type DataType = CurrentChainNetwork;
const get_key = (id: IdentityId): string => LOCAL_SECURE_KEY_CURRENT_CHAIN_NETWORK(id);
const get_default_value = (): DataType => DEFAULT_CURRENT_CHAIN_NETWORK;
const cached_value: Record<IdentityId, DataType> = {};
const get_cached_value = async (id: IdentityId | undefined): Promise<DataType> => cached_value[id ?? ''] ?? null;
const set_cached_value = async (value: DataType, id: IdentityId | undefined): Promise<DataType> =>
    (cached_value[id ?? ''] = value);
const meta: FuseSecureDataMetadata1<DataType, IdentityId> = {
    lock: new FuseLock(),
    get_password: $bgsw_get_password,
    get_key,
    get_default_value,
    get_cached_value,
    set_cached_value,
    callback: undefined,
};

export const $bgsw_current_chain_network = (id: IdentityId) => cachedFuseSecureData1<DataType, IdentityId>(meta, id);
