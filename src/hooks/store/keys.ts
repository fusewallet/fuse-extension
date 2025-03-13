import type { IdentityId } from '~types/identity';
import { get_identity_network_key, type IdentityNetwork } from '~types/network';

// prefix
const LOCAL_SECURE_KEY_PREFIX = ':fuse:secure';
const SYNC_KEY_PREFIX = ':fuse';
const LOCAL_KEY_PREFIX = ':fuse';
const SESSION_KEY_PREFIX = ':fuse';

// ############### LOCAL SECURE ###############

export const LOCAL_SECURE_KEY_PRIVATE_KEYS = `${LOCAL_SECURE_KEY_PREFIX}:private_keys`; // * local secure
export const LOCAL_SECURE_KEY_CHAIN_NETWORKS = `${LOCAL_SECURE_KEY_PREFIX}:chain:networks`; // * local secure
export const LOCAL_SECURE_KEY_CURRENT_CHAIN_NETWORK = (id: IdentityId) =>
    `${LOCAL_SECURE_KEY_PREFIX}:${id}:chain:network`; // * local secure
export const LOCAL_SECURE_KEY_CURRENT_CONNECTED_APPS = (identity_network: IdentityNetwork) =>
    `${LOCAL_SECURE_KEY_PREFIX}:${get_identity_network_key(identity_network)}:connected:apps`; // * local secure
// local secure, once use granted/denied local, there is somewhere catch this result, and BGSW cloud find it
export const LOCAL_SECURE_KEY_APPROVED = (identity_network: IdentityNetwork, origin: string, request_hash: string) =>
    `${LOCAL_SECURE_KEY_PREFIX}:${get_identity_network_key(identity_network)}:app:${origin}:${request_hash}:approved`; // * local secure // make local

export const LOCAL_SECURE_KEY_RECENT_ADDRESSES = `${LOCAL_SECURE_KEY_PREFIX}:recent:addresses`; // * local secure
export const LOCAL_SECURE_KEY_MARKED_ADDRESSES = `${LOCAL_SECURE_KEY_PREFIX}:marked:addresses`; // * local secure

// ############### SYNC ###############

// user settings
const SYNC_KEY_PREFIX_USER_SETTINGS = `${SYNC_KEY_PREFIX}:user:settings`;
export const SYNC_KEY_USER_SETTINGS_IDLE = `${SYNC_KEY_PREFIX_USER_SETTINGS}:idle`; // * sync

// ############### LOCAL ###############

export const LOCAL_KEY_WELCOMED = `${LOCAL_KEY_PREFIX}:welcomed`; // * local
export const LOCAL_KEY_PASSWORD_HASHED = `${LOCAL_KEY_PREFIX}:password_hashed`; // * local

const LOCAL_KEY_PREFIX_CACHED = `${LOCAL_KEY_PREFIX}:cached`;
export const LOCAL_KEY_CACHED_KEY = (key: string) => `${LOCAL_KEY_PREFIX_CACHED}:${key}`; // * local

const LOCAL_KEY_PREFIX_TOKEN = `${LOCAL_KEY_PREFIX}:token`;
export const LOCAL_KEY_TOKEN_INFO_IC = `${LOCAL_KEY_PREFIX_TOKEN}:info:ic`; // * local
export const LOCAL_KEY_TOKEN_INFO_IC_UPDATED = `${LOCAL_KEY_PREFIX_TOKEN}:info:ic:updated`; // * local
export const LOCAL_KEY_TOKEN_BALANCE_IC = (principal: string) => `${LOCAL_KEY_PREFIX_TOKEN}:balance:ic:${principal}`; // * local
export const LOCAL_KEY_TOKEN_INFO_CUSTOM = (identity_network: IdentityNetwork): string =>
    `${LOCAL_KEY_PREFIX_TOKEN}:info:custom:${get_identity_network_key(identity_network)}`; // * local
export const LOCAL_KEY_TOKEN_INFO_CURRENT = (identity_network: IdentityNetwork): string =>
    `${LOCAL_KEY_PREFIX_TOKEN}:info:current:${get_identity_network_key(identity_network)}`; // * local
export const LOCAL_KEY_TOKEN_PRICE_IC = `${LOCAL_KEY_PREFIX_TOKEN}:price:ic`; // * local
export const LOCAL_KEY_TOKEN_PRICE_IC_UPDATED = `${LOCAL_KEY_PREFIX_TOKEN}:price:ic:updated`; // * local

export const LOCAL_KEY_PREFIX_CURRENT_CHAIN_NETWORK = `${LOCAL_KEY_PREFIX}:current_chain_network`;

const LOCAL_KEY_PREFIX_RECORD = `${LOCAL_KEY_PREFIX}:record`;
export const LOCAL_KEY_RECORD_STARTED = (identity_network: IdentityNetwork) =>
    `${LOCAL_KEY_PREFIX_RECORD}:${get_identity_network_key(identity_network)}:started`; // * local
export const LOCAL_KEY_RECORD_COUNT = (identity_network: IdentityNetwork) =>
    `${LOCAL_KEY_PREFIX_RECORD}:${get_identity_network_key(identity_network)}:count`; // * local
export const LOCAL_KEY_RECORD_DATE = (identity_network: IdentityNetwork, date: string) =>
    `${LOCAL_KEY_PREFIX_RECORD}:${get_identity_network_key(identity_network)}:date:${date}`; // * local
// !react query
export const LOCAL_KEY_REACT_QUERY_CACHE = `${LOCAL_KEY_PREFIX}:react:query:cache`; // * local
// ############### SESSION ###############

export const SESSION_KEY_PASSWORD = `${SESSION_KEY_PREFIX}:password`; // * session
export const SESSION_KEY_PASSWORD_ALIVE = `${SESSION_KEY_PREFIX}:password:alive`; // * session
export const SESSION_KEY_RESTORE = `${SESSION_KEY_PREFIX}:restore`; // * session
export const SESSION_KEY_POPUP_ACTIONS = `${SESSION_KEY_PREFIX}:popup:actions`; // * session
export const SESSION_KEY_PATHNAME = `${SESSION_KEY_PREFIX}:pathname`; // * session

// session, once user connect app, is_connected always cloud be true // ? true => connected, false => disconnected
export const SESSION_KEY_CURRENT_SESSION_CONNECTED_APP = (identity_network: IdentityNetwork, origin: string) =>
    `${SESSION_KEY_PREFIX}:${get_identity_network_key(identity_network)}:app:${origin}:connected`; // * session // mark current connected
// session, once use granted/denied once, there is somewhere catch this result, and BGSW cloud find it // ? true => granted, false => denied
export const SESSION_KEY_CURRENT_SESSION_CONNECTED_APP_ONCE = (
    identity_network: IdentityNetwork,
    origin: string,
    message_id: string,
) =>
    `${SESSION_KEY_PREFIX}:${get_identity_network_key(identity_network)}:app:${origin}:message:${message_id}:connected`; // * session // mark once // temp
// session, once use granted/denied this session, there is somewhere catch this result, and BGSW cloud find it // ? true => granted, false => denied
export const SESSION_KEY_CURRENT_SESSION_CONNECTED_APP_SESSION = (identity_network: IdentityNetwork, origin: string) =>
    `${SESSION_KEY_PREFIX}:${get_identity_network_key(identity_network)}:app:${origin}:session:connected`; // * session // mark session // temp
// session, once use granted/denied once, there is somewhere catch this result, and BGSW cloud find it // ? true => granted, false => denied
export const SESSION_KEY_CURRENT_SESSION_APPROVE_ONCE = (
    identity_network: IdentityNetwork,
    origin: string,
    approve_id: string,
) => `${SESSION_KEY_PREFIX}:${get_identity_network_key(identity_network)}:app:${origin}:approve:${approve_id}:approved`; // * session // make once // temp
// session, once use granted/denied session, there is somewhere catch this result, and BGSW cloud find it // ? true => granted, false => denied
export const SESSION_KEY_CURRENT_SESSION_APPROVE_SESSION = (
    identity_network: IdentityNetwork,
    origin: string,
    request_hash: string,
) => `${SESSION_KEY_PREFIX}:${get_identity_network_key(identity_network)}:app:${origin}:${request_hash}:approved`; // * session // make session // temp
