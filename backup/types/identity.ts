import type { Address as EvmAddress } from 'viem';

import { inner_get_identity_address } from '~lib/address';
import { same } from '~lib/utils/same';

import type { Chain } from './chain';
import type { IdentityKeyMnemonic, MnemonicParsed } from './keys/mnemonic';
import type { IdentityKeyPrivate } from './keys/private_key';

export type IdentityId = string; // uuid

export type CombinedIdentityKey = { mnemonic: IdentityKeyMnemonic } | { private_key: IdentityKeyPrivate };

export interface IdentityKey {
    id: IdentityId; // uuid
    created: number; // ms
    updated: number; // ms
    name: string; // show identity name
    icon: string;
    key: CombinedIdentityKey;
    address: IdentityAddress;
}

export interface IdentityAddress {
    ic?: {
        owner: string;
        account_id: string;
    };
    ethereum?: { address: EvmAddress };
    ethereum_test_sepolia?: { address: EvmAddress };
    polygon?: { address: EvmAddress };
    polygon_test_amoy?: { address: EvmAddress };
    bsc?: { address: EvmAddress };
    bsc_test?: { address: EvmAddress };
}

export interface KeyRings {
    mnemonic: string | undefined; // could not produce new wallet if not exist
    keys: IdentityKey[];
    current: IdentityId; // current identity // uuid
}

export const match_combined_identity_key = <T>(
    self: CombinedIdentityKey,
    {
        mnemonic,
        private_key,
    }: { mnemonic: (mnemonic: IdentityKeyMnemonic) => T; private_key: (private_key: IdentityKeyPrivate) => T },
): T => {
    if ('mnemonic' in self) return mnemonic(self.mnemonic);
    if ('private_key' in self) return private_key(self.private_key);
    throw new Error(`Unknown identity type: ${Object.keys(self)[0]}`);
};

export const match_combined_identity_key_async = <T>(
    self: CombinedIdentityKey,
    {
        mnemonic,
        private_key,
    }: {
        mnemonic: (mnemonic: IdentityKeyMnemonic) => Promise<T>;
        private_key: (private_key: IdentityKeyPrivate) => Promise<T>;
    },
): Promise<T> => {
    if ('mnemonic' in self) return mnemonic(self.mnemonic);
    if ('private_key' in self) return private_key(self.private_key);
    throw new Error(`Unknown identity type: ${Object.keys(self)[0]}`);
};

export const is_same_combined_identity_key = (a: CombinedIdentityKey, b: CombinedIdentityKey): boolean => {
    const a_address = inner_get_identity_address(a);
    const b_address = inner_get_identity_address(b);
    return same(a_address, b_address);
};

// show identity

export type CombinedShowIdentityKey =
    | { type: 'mnemonic'; subaccount: number; parsed?: MnemonicParsed }
    | { type: 'private_key'; chain: Chain; parsed: string };
export interface ShowIdentityKey {
    id: IdentityId; // uuid
    created: number; // ms
    name: string; // show identity name
    icon: string;
    key: CombinedShowIdentityKey;
    address: IdentityAddress;

    deletable: boolean;
}
