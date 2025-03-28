import { isAccountHex, isPrincipalText } from '@choptop/haw';
import { isAddress as isEvmAddress } from 'viem';

export type AddressType = 'ic' | 'evm';

export interface ChainAddress {
    type: AddressType;
    address: string; // principal or account id if ic,
}

export interface RecentAddress {
    created: number;
    address: ChainAddress;
}

export type RecentAddresses = RecentAddress[];

export interface MarkedAddress {
    created: number;
    updated: number;
    name: string;
    address: ChainAddress;
}

export type MarkedAddresses = MarkedAddress[];

export const check_chain_address = (address: ChainAddress): boolean => {
    switch (address.type) {
        case 'ic':
            return isPrincipalText(address.address) || isAccountHex(address.address);
        case 'evm':
            return isEvmAddress(address.address);
        default:
            throw new Error(`Invalid address type: ${address.type}`);
    }
};

export const check_address_type = (address: string): AddressType => {
    if (isPrincipalText(address) || isAccountHex(address)) return 'ic';
    if (isEvmAddress(address)) return 'evm';
    throw new Error(`Invalid address: ${address}`);
};
