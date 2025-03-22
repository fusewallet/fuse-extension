// FIXME
// import type { FuseWalletInpageMessage } from './window';

export type MessageResult<T, E> = { ok: T; err?: undefined } | { ok?: undefined; err: E };

// Message Flow
// * Extension-Pages/CS	-> BGSW
export const MESSAGE_PING = 'ping';
export const DIRECT_MESSAGE_INITIALIZED = 'direct-initialized'; // Extension-Pages/CS -> BGSW // ? one-time
export const DIRECT_MESSAGE_UNLOCKED = 'direct-unlocked';

// Relay Flow via relay
// * Website -> CS/BGSW
export const RELAY_MESSAGE_PING = 'relay-ping';
export const RELAY_MESSAGE_GET_FAVICON = 'relay-get-favicon'; // Website -> BGSW // ? one-time
export const RELAY_MESSAGE_REQUEST_CONNECT = 'relay-request-connect'; // Website -> BGSW // ? one-time
export const RELAY_MESSAGE_IS_CONNECTED = 'relay-is-connected'; // Website -> BGSW // ? one-time
export const RELAY_MESSAGE_DISCONNECT = 'relay-disconnect'; // Website -> BGSW // ? one-time
export const RELAY_MESSAGE_GET_ADDRESS = 'relay-get-address'; // Website -> BGSW // ? one-time
export const RELAY_MESSAGE_IC_PROXY_AGENT = 'relay-ic-proxy-agent'; // Website -> BGSW // ? one-time
// FIXME
// export const RELAY_MESSAGE_EVM_SEND_TRANSACTION = 'relay-evm-send-transaction'; // Website -> BGSW // ? one-time
// export const RELAY_MESSAGE_EVM_GET_BALANCE = 'relay-evm-get-balance'; // Website -> BGSW // ? one-time
// export const RELAY_MESSAGE_EVM_SIGN_MESSAGE = 'relay-evm-sign-message'; // Website -> BGSW // ? one-time

// Ports
// * Extension-Pages/CS	<-> BGSW
// * BGSW <-> Extension-Pages/CS
export const PORT_MAIL = 'mail';
export const DIRECT_PORT_INITIALIZED = 'direct-initialized'; // BGSW -> Extension-Pages // ? long-lived

// Ports + Relay
// * BGSW -> WebPage

// FIXME
// * Extension-Pages/BGSW -> CS
// export type NotificationMessage = FuseWalletInpageMessage;
