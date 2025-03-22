import type { IdentityAddress } from '~types/identity';

// Message targets
export type MessageTarget = 'fusewallet-inpage' | 'fusewallet-contentscript';

// Message names
export type MessageName = 'fusewallet-provider';

// Base message interface for all message types
export interface BaseMessage<T extends MessageTarget, N extends MessageName, D> {
    target: T;
    data: {
        name: N;
        data: D;
    };
}

// Inpage specific message
export type FuseWalletInpageMessage = BaseMessage<'fusewallet-inpage', 'fusewallet-provider', ProviderMessage>;

// Content Script specific message
export type FuseWalletContentScriptMessage = BaseMessage<
    'fusewallet-contentscript',
    'fusewallet-provider',
    ProviderMessage
>;

// Union type for all message types
export type AnyFuseWalletMessage = FuseWalletInpageMessage | FuseWalletContentScriptMessage;

// Provider message types
export type ProviderMessage = JsonRpcMessage | ProviderEventMessage;

// JSON-RPC message interface
export interface JsonRpcMessage {
    id: number;
    jsonrpc: '2.0';
    result?: unknown;
    error?: JsonRpcError;
}

// JSON-RPC error interface
export interface JsonRpcError {
    code: number;
    message: string;
    data?: unknown;
}

// Provider event message interface
export interface ProviderEventMessage {
    method: ProviderEventMethod;
    params: ProviderEventParams;
}

// Event method types
export type ProviderEventMethod =
    | 'fusewallet_accountsChanged'
    | 'fusewallet_chainChanged'
    | 'fusewallet_connect'
    | 'fusewallet_disconnect'
    | 'fusewallet_message';

// Generic message data type
export interface MessageData {
    type: string;
    data: unknown;
}

// Event parameters mapping
export type ProviderEventParams = {
    fusewallet_accountsChanged: IdentityAddress; // Array of addresses ["0x1234..."]
    fusewallet_chainChanged: string; // Chain ID in hex format "0x1"
    fusewallet_connect: { chainId: string }; // Connection info with chain ID
    fusewallet_disconnect: { code: number; message: string };
    fusewallet_message: MessageData;
}[ProviderEventMethod];

// Type guard functions
export function isInpageMessage(message: AnyFuseWalletMessage): message is FuseWalletInpageMessage {
    return message.target === 'fusewallet-inpage';
}

export function isContentScriptMessage(message: AnyFuseWalletMessage): message is FuseWalletContentScriptMessage {
    return message.target === 'fusewallet-contentscript';
}

export function isJsonRpcMessage(message: ProviderMessage): message is JsonRpcMessage {
    return 'jsonrpc' in message;
}

export function isProviderEventMessage(message: ProviderMessage): message is ProviderEventMessage {
    return 'method' in message;
}
