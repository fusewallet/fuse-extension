import type { Address, Hex } from 'viem';

import type { EvmChain } from '~types/chain';

export interface TypedData {
    types: {
        EIP712Domain: Array<{ name: string; type: string }>;
        [additionalTypes: string]: Array<{ name: string; type: string }>;
    };
    primaryType: string;
    domain: Record<string, any>;
    message: Record<string, any>;
}
export type PersonalSignParams = [string, Address];
export type EthSignParams = [Address, Hex];
export type TypedDataV1Params = [TypedData, Address];
export type TypedDataV3Params = [Address, string];
export type TypedDataV4Params = [Address, string];

export type EvmSignMessagePayload =
    | { method: 'personal_sign'; params: PersonalSignParams }
    | { method: 'eth_sign'; params: EthSignParams }
    | { method: 'eth_signTypedData'; params: TypedDataV1Params }
    | { method: 'eth_signTypedData_v3'; params: TypedDataV3Params }
    | { method: 'eth_signTypedData_v4'; params: TypedDataV4Params };

export interface ApproveEvmSignMessageAction {
    type: 'approve_evm_sign_message';
    id: string;
    chain: EvmChain;
    origin: string;
    payload: EvmSignMessagePayload;
}

export const validate_payload = (payload: EvmSignMessagePayload): boolean => {
    // 1. Validate payload structure
    if (!payload || typeof payload !== 'object' || !('method' in payload) || !('params' in payload)) {
        return false;
    }

    // 2. Validate method name
    const validMethods = [
        'personal_sign',
        'eth_sign',
        'eth_signTypedData',
        'eth_signTypedData_v3',
        'eth_signTypedData_v4',
    ];
    if (!validMethods.includes(payload.method)) {
        return false;
    }

    // 3. Validate params is an array with length 2
    if (!Array.isArray(payload.params) || payload.params.length !== 2) {
        return false;
    }

    // 4. Validate parameter types based on different methods
    switch (payload.method) {
        case 'personal_sign': {
            // [message, address]
            const [message, address] = payload.params;
            return typeof message === 'string' && typeof address === 'string' && address.startsWith('0x');
        }

        case 'eth_sign': {
            // [address, messageHash]
            const [address, messageHash] = payload.params;
            return (
                typeof address === 'string' &&
                address.startsWith('0x') &&
                typeof messageHash === 'string' &&
                messageHash.startsWith('0x')
            );
        }

        case 'eth_signTypedData': {
            // [typedData, address]
            const [typedData, address] = payload.params;
            // Validate typedData structure
            const isValidTypedData =
                typeof typedData === 'object' &&
                typedData !== null &&
                'types' in typedData &&
                'primaryType' in typedData &&
                'domain' in typedData &&
                'message' in typedData;

            return isValidTypedData && typeof address === 'string' && address.startsWith('0x');
        }

        case 'eth_signTypedData_v3':
        case 'eth_signTypedData_v4': {
            // [address, jsonStringTypedData]
            const [address, jsonString] = payload.params;
            // Validate address format
            const isValidAddress = typeof address === 'string' && address.startsWith('0x');

            // Validate JSON string
            let isValidJson = false;
            if (typeof jsonString === 'string') {
                try {
                    const parsed = JSON.parse(jsonString);
                    isValidJson =
                        typeof parsed === 'object' &&
                        parsed !== null &&
                        'types' in parsed &&
                        'primaryType' in parsed &&
                        'domain' in parsed &&
                        'message' in parsed;
                } catch {
                    isValidJson = false;
                }
            }

            return isValidAddress && isValidJson;
        }

        default:
            return false;
    }
};
