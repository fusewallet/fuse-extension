import { v4 as uuid } from 'uuid';
import { hexToNumber } from 'viem';

import { get_chain_by_chain_id } from '~hooks/evm/viem';
import { relay_message_disconnect } from '~lib/messages/relay/relay-disconnect';
import { relay_message_evm_get_balance } from '~lib/messages/relay/relay-evm-get-balance';
import { relay_message_evm_send_transaction } from '~lib/messages/relay/relay-evm-send-transaction';
import { relay_message_evm_sign_message } from '~lib/messages/relay/relay-evm-sign-message';
import { relay_message_get_address } from '~lib/messages/relay/relay-get-address';
import { relay_message_is_connected } from '~lib/messages/relay/relay-is-connected';
import { relay_message_request_connect } from '~lib/messages/relay/relay-request-connect';
import { isInpageMessage, isProviderEventMessage, type AnyFuseWalletMessage } from '~lib/messages/window';
import type { EvmTransaction } from '~types/actions/approve/evm/send-transaction';
import { validate_payload, type EvmSignMessagePayload } from '~types/actions/approve/evm/sign-message';
import { match_chain } from '~types/chain';

import { DEFAULT_TIMEOUT, get_current_window } from '.';
import { find_favicon } from '../connect';
import { DEFAULT_CURRENT_CHAIN_EVM_NETWORK, type ChainEvmNetwork } from '../network/index';

export interface IsEvmConnectedRequest {
    timeout?: number;
    chainId?: `0x${string}`;
}
export type IsEvmConnectedResponse = boolean;

type EventName =
    | 'fusewallet_connect'
    | 'fusewallet_disconnect'
    | 'fusewallet_chainChanged'
    | 'fusewallet_accountsChanged'
    | 'fusewallet_message';
type EventListener = (payload: any) => void;

/**
 * Multi-chain Fuse Wallet Provider
 *
 */
export class FuseClientByEvm {
    // Identifier
    public readonly isFuseWallet: boolean = true;

    // Compatible with MetaMask
    public readonly isMetaMask: boolean = false;

    // Currently connected accounts (each address can connect to multiple chains)
    private _accounts: Record<string, string[]> = {};

    // List of added chains
    private _chains: Record<string, ChainEvmNetwork> = {
        '0x1': DEFAULT_CURRENT_CHAIN_EVM_NETWORK.ethereum,
        '0xaa36a7': DEFAULT_CURRENT_CHAIN_EVM_NETWORK.ethereum_test_sepolia,
        '0x89': DEFAULT_CURRENT_CHAIN_EVM_NETWORK.polygon,
        '0x13882': DEFAULT_CURRENT_CHAIN_EVM_NETWORK.polygon_test_amoy,
        '0x38': DEFAULT_CURRENT_CHAIN_EVM_NETWORK.bsc,
        '0x61': DEFAULT_CURRENT_CHAIN_EVM_NETWORK.bsc_test,
    };

    // Event listeners storage
    private _eventListeners: Record<string, EventListener[]> = {
        connect: [],
        disconnect: [],
        chainChanged: [],
        accountsChanged: [],
        message: [],
    };

    // (chainId -> address[])
    private _connectedAddresses: Record<`0x${string}`, `0x${string}`> = {};

    constructor() {
        // Initialize empty accounts record
        this._accounts = {};

        // Set up message handlers
        this._setupMessageHandlers();
    }

    /**
     * Core EIP-1193 method: Send request to wallet
     * Supports specifying target chain via optional chainId parameter
     */
    public async request(args: {
        method: string;
        params?: any[];
        chainId: `0x${string}`; // Extended parameter: specify target chain ID
    }): Promise<any> {
        const { method, params = [], chainId } = args;

        // Check if specified chain is added
        if (chainId && !this._chains[chainId]) {
            throw new Error(`Chain ${args.chainId} not supported. Please add it first.`);
        }
        // Handle various methods
        switch (method) {
            case 'eth_requestAccounts':
                return this._handleRequestAccounts(chainId);

            case 'eth_accounts':
                return this._handleEthAccounts(chainId);

            case 'eth_getBalance':
                return this._handleEthBalance(chainId);

            case 'eth_sendTransaction':
                return this._handleSendTransaction(params[0], chainId);

            case 'eth_sign':
            case 'personal_sign':
            case 'eth_signTypedData':
            case 'eth_signTypedData_v3':
            case 'eth_signTypedData_v4':
                const payload = { method, params } as EvmSignMessagePayload;
                if (!validate_payload(payload)) {
                    throw new Error('Invalid payload');
                }
                return this._handleSign(payload.method, payload.params, chainId);
            case 'disconnect':
                return this._handleDisconnect(chainId);
            case 'wallet_addEthereumChain':
                return this._handleAddChain(params[0]);

            case 'fusewallet_getChainList':
                return this._getChainList();

            default:
                throw new Error(`Method ${method} not supported`);
        }
    }

    /**
     * Add event listener
     */
    public on(eventName: string, listener: EventListener): void {
        if (!this._eventListeners[eventName]) {
            this._eventListeners[eventName] = [];
        }
        this._eventListeners[eventName].push(listener);
    }

    /**
     * Remove event listener
     */
    public removeListener(eventName: string, listener: EventListener): void {
        if (!this._eventListeners[eventName]) return;

        this._eventListeners[eventName] = this._eventListeners[eventName].filter(
            (registeredListener) => registeredListener !== listener,
        );
    }

    /**
     * Emit event
     */
    private _emitEvent(eventName: EventName, payload: any): void {
        if (!this._eventListeners[eventName]) return;

        for (const listener of this._eventListeners[eventName]) {
            try {
                listener(payload);
            } catch (error) {
                console.error(`Error in ${eventName} event listener:`, error);
            }
        }
    }

    /**
     * Set up message handlers
     */
    private _setupMessageHandlers(): void {
        window.addEventListener('message', (event) => {
            console.debug('🚀 ~ FuseClientByEvm ~ window.addEventListener ~ event:', event);
            if (event.source !== window) return;
            if (!event.data || !event.data.target) return;
            if (isInpageMessage(event.data)) {
                this._handleIncomingMessage(event.data);
            }
        });
    }

    /**
     * Handle incoming messages
     */
    private _handleIncomingMessage(message: AnyFuseWalletMessage): void {
        if (isInpageMessage(message)) {
            if (isProviderEventMessage(message.data.data)) {
                const { method, params } = message.data.data;
                this._emitEvent(method, params);
            }
        }
    }

    /**
     * Handle request accounts (supports specified chain)
     */
    private async _handleRequestAccounts(chainId: `0x${string}`): Promise<string[]> {
        const message_id = uuid();
        const chain = get_chain_by_chain_id(hexToNumber(chainId));
        if (!chain) throw new Error(`Chain ${chainId} not supported`);
        const connected = await relay_message_request_connect({
            message_id,
            window: await get_current_window(window),
            timeout: 60000,
            popup: true,
            chain,
            origin: window.location.origin,
            title: document.title,
            favicon: await find_favicon(document, window.location.origin),
        });

        if (!connected) {
            throw new Error('User rejected connection request');
        }

        const accounts = await this.request({ method: 'eth_accounts', chainId });
        const address = accounts[0];
        const chains = this._accounts[address];
        if (!chains) {
            this._accounts[address] = [chain];
        } else {
            const index = chains.findIndex((c) => c === chainId);
            if (index === -1) {
                chains.push(chainId);
            }
        }
        this._emitEvent('fusewallet_connect', { chainId, address });
        this._connectedAddresses[chainId] = address;
        this._emitEvent('fusewallet_accountsChanged', this._connectedAddresses);
        return [address];
    }

    private async _handleEthAccounts(chainId: `0x${string}`) {
        const chain = get_chain_by_chain_id(hexToNumber(chainId));
        if (!chain) throw new Error(`Chain ${chainId} not supported`);
        const result = await relay_message_get_address({
            message_id: uuid(),
            timeout: 60000,
        });
        if (!result) throw new Error('Failed to retrieve address');
        const address = match_chain(chain, {
            ic: () => {
                throw new Error('IC chain is not supported');
            },
            ethereum: () => result.ethereum?.address,
            ethereum_test_sepolia: () => result.ethereum_test_sepolia?.address,
            polygon: () => result.polygon?.address,
            polygon_test_amoy: () => result.polygon_test_amoy?.address,
            bsc: () => result.bsc?.address,
            bsc_test: () => result.bsc_test?.address,
        });
        if (!address) {
            throw new Error('Failed to retrieve address');
        }
        return [address];
    }

    private async _handleDisconnect(chain_id: `0x${string}`) {
        this._emitEvent('fusewallet_disconnect', chain_id);
        const message_id = uuid();
        const timeout = DEFAULT_TIMEOUT;
        const chain = get_chain_by_chain_id(hexToNumber(chain_id));
        if (!chain) throw new Error(`Chain ${chain_id} not supported`);
        // which origin request
        const origin = window.location.origin;
        await relay_message_disconnect(
            {
                message_id,
                window: await get_current_window(window),
                timeout,
                chain,
                origin,
            },
            timeout,
        );
    }

    private async _handleEthBalance(chainId: `0x${string}`) {
        const chain = get_chain_by_chain_id(hexToNumber(chainId));
        if (!chain) throw new Error(`Chain ${chainId} not supported`);
        const result = await relay_message_evm_get_balance({
            message_id: uuid(),
            timeout: 60000,
            chain,
            origin: window.location.origin,
        });
        return result;
    }

    /**
     * Handle send transaction (supports specified chain)
     */
    private async _handleSendTransaction(txParams: EvmTransaction, chainId: `0x${string}`): Promise<string> {
        // Validate transaction parameters
        if (!txParams.from) {
            throw new Error('Transaction requires a from address');
        }

        const hash = await relay_message_evm_send_transaction({
            chainId,
            message_id: uuid(),
            timeout: DEFAULT_TIMEOUT,
            origin: window.location.origin,
            transaction: txParams,
        });
        return hash;
    }

    /**
     * Handle sign request (supports specified chain)
     */
    private async _handleSign(
        method: EvmSignMessagePayload['method'],
        params: EvmSignMessagePayload['params'],
        chainId: `0x${string}`,
    ): Promise<string> {
        const hash = await relay_message_evm_sign_message({
            message_id: uuid(),
            timeout: DEFAULT_TIMEOUT,
            origin: window.location.origin,
            chainId,
            payload: {
                method,
                params,
            } as EvmSignMessagePayload,
        });
        return hash;
    }

    /**
     * Handle adding chain
     */
    private async _handleAddChain(params: any): Promise<null> {
        throw new Error('Not support yet');
    }

    /**
     * Get list of all added chains
     */
    private _getChainList() {
        return this._chains;
    }

    async isConnected(request?: IsEvmConnectedRequest): Promise<IsEvmConnectedResponse> {
        const message_id = uuid();
        // args
        let { timeout } = request ?? {};
        const chain_id = request?.chainId ?? '0x1';
        const chain = get_chain_by_chain_id(hexToNumber(chain_id));
        if (!chain) throw new Error(`Chain ${chain_id} not supported`);
        if (timeout === undefined) timeout = DEFAULT_TIMEOUT;

        // get current origin
        const origin = window.location.origin;

        const connected = await relay_message_is_connected(
            {
                message_id,
                window: await get_current_window(window),
                timeout,
                chain,
                origin,
            },
            timeout,
        );

        return connected;
    }
}
