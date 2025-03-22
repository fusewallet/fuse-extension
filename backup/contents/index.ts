import type { PlasmoCSConfig } from 'plasmo';

import { relayMessage } from '@plasmohq/messaging';

import type { RequestBody as RelayMessageDisconnectRequestBody } from '~background/messages/relay-disconnect';
import type { RequestBody as RelayMessageEvmGetBalanceRequestBody } from '~background/messages/relay-evm-get-balance';
import type { RequestBody as RelayMessageEvmSendTransactionRequestBody } from '~background/messages/relay-evm-send-transaction';
import type { RequestBody as RelayMessageEvmSignMessageRequestBody } from '~background/messages/relay-evm-sign-message';
import type { RequestBody as RelayMessageGetAddressRequestBody } from '~background/messages/relay-get-address';
import type { RequestBody as RelayMessageGetFaviconRequestBody } from '~background/messages/relay-get-favicon';
import type { RequestBody as RelayMessageIcProxyAgentRequestBody } from '~background/messages/relay-ic-proxy-agent';
import type { RequestBody as RelayMessageIsConnectedRequestBody } from '~background/messages/relay-is-connected';
import type { RequestBody as RelayMessagePingRequestBody } from '~background/messages/relay-ping';
import type { RequestBody as RelayMessageRequestConnectRequestBody } from '~background/messages/relay-request-connect';
import {
    RELAY_MESSAGE_DISCONNECT,
    RELAY_MESSAGE_EVM_GET_BALANCE,
    RELAY_MESSAGE_EVM_SEND_TRANSACTION,
    RELAY_MESSAGE_EVM_SIGN_MESSAGE,
    RELAY_MESSAGE_GET_ADDRESS,
    RELAY_MESSAGE_GET_FAVICON,
    RELAY_MESSAGE_IC_PROXY_AGENT,
    RELAY_MESSAGE_IS_CONNECTED,
    RELAY_MESSAGE_PING,
    RELAY_MESSAGE_REQUEST_CONNECT,
} from '~lib/messages';
import { isInpageMessage } from '~lib/messages/window';

export const config: PlasmoCSConfig = {
    matches: [
        // '<all_urls>',
        'file://*/*',
        'http://*/*',
        'https://*/*',
    ],
};

// The Relay Flow enables communication between a target webpage and a background service worker using a lightweight message handler called a relay.
// This relay is registered with the relayMessage function in a content script.

// The relayMessage function abstracts the window.postMessage mechanism,
// registering a listener that checks for messages matching the same origin and forwards them to the background service worker.
// These messages are then processed by the appropriate message flow handlers registered under background/messages.

// The sendToBackgroundViaRelay function sends messages through the relay and waits for a response.
// It generates a unique instance ID for each message to ensure proper handling and response tracking.

// You may view the implementation of these functions in the GitHub repository(opens in a new tab).

// This method provides an alternative to the "externally_connectable"(opens in a new tab) method described in the Chrome extension documentation.

// Setting Up a Relay
// To set up a relay, use the relayMessage function in a content script.
// A content script can have multiple relays.
// Given the ping message handler from the previous example, and the website www.plasmo.com:

// relay message
relayMessage<RelayMessagePingRequestBody>({ name: RELAY_MESSAGE_PING as never });
relayMessage<RelayMessageGetFaviconRequestBody>({ name: RELAY_MESSAGE_GET_FAVICON as never });
relayMessage<RelayMessageRequestConnectRequestBody>({ name: RELAY_MESSAGE_REQUEST_CONNECT as never });
relayMessage<RelayMessageIsConnectedRequestBody>({ name: RELAY_MESSAGE_IS_CONNECTED as never });
relayMessage<RelayMessageDisconnectRequestBody>({ name: RELAY_MESSAGE_DISCONNECT as never });
relayMessage<RelayMessageGetAddressRequestBody>({ name: RELAY_MESSAGE_GET_ADDRESS as never });
relayMessage<RelayMessageIcProxyAgentRequestBody>({ name: RELAY_MESSAGE_IC_PROXY_AGENT as never });
relayMessage<RelayMessageEvmSendTransactionRequestBody>({ name: RELAY_MESSAGE_EVM_SEND_TRANSACTION as never });
relayMessage<RelayMessageEvmGetBalanceRequestBody>({ name: RELAY_MESSAGE_EVM_GET_BALANCE as never });
relayMessage<RelayMessageEvmSignMessageRequestBody>({ name: RELAY_MESSAGE_EVM_SIGN_MESSAGE as never });
// listen message from extension-pages/BGSW
chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
    const messageData = message.body;
    console.debug('🚀 ~ chrome.runtime.onMessage.addListener ~ messageData:', message);
    if (isInpageMessage(messageData)) {
        window.postMessage(messageData);
    }
    sendResponse({ ok: true });
    // If the response is asynchronous, return true to keep the message channel open.
    return true;
});
