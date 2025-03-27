import type { IdentityId } from '~types/identity';

// prefix
const LOCAL_SECURE_KEY_PREFIX = ':fuse:secure';

// ############### LOCAL SECURE ###############

export const LOCAL_SECURE_KEY_KEY_RINGS = `${LOCAL_SECURE_KEY_PREFIX}:key:rings`; // * local secure
export const LOCAL_SECURE_KEY_CHAIN_NETWORKS = `${LOCAL_SECURE_KEY_PREFIX}:chain:networks`; // * local secure
export const LOCAL_SECURE_KEY_CURRENT_CHAIN_NETWORK = (id: IdentityId) =>
    `${LOCAL_SECURE_KEY_PREFIX}:${id}:chain:network`; // * local secure
// export const LOCAL_SECURE_KEY_CURRENT_CONNECTED_APPS = (identity_network: IdentityNetwork) =>
//     `${LOCAL_SECURE_KEY_PREFIX}:${get_identity_network_key(identity_network)}:connected:apps`; // * local secure
// // local secure, once use granted/denied local, there is somewhere catch this result, and BGSW cloud find it
// export const LOCAL_SECURE_KEY_APPROVED = (identity_network: IdentityNetwork, origin: string, request_hash: string) =>
//     `${LOCAL_SECURE_KEY_PREFIX}:${get_identity_network_key(identity_network)}:app:${origin}:${request_hash}:approved`; // * local secure // make local

// export const LOCAL_SECURE_KEY_RECENT_ADDRESSES = `${LOCAL_SECURE_KEY_PREFIX}:recent:addresses`; // * local secure
// export const LOCAL_SECURE_KEY_MARKED_ADDRESSES = `${LOCAL_SECURE_KEY_PREFIX}:marked:addresses`; // * local secure

// // current show network
// export const LOCAL_SECURE_KEY_CURRENT_SHOW_NETWORK = `${LOCAL_SECURE_KEY_PREFIX}:current:show:network`; // * local secure
