import { useCallback } from 'react';

import type { SecureStorage } from '@plasmohq/storage/secure';

import { useSecureCachedStoreData0, type SecureDataMetadata0 } from '~hooks/meta/metadata-secure-0';
import { same } from '~lib/utils/same';
import { check_chain_address, type ChainAddress, type RecentAddresses } from '~types/address';

import { LOCAL_SECURE_KEY_RECENT_ADDRESSES } from '../../keys';

// ! always try to use this value to avoid BLINK
type DataType = RecentAddresses;
const get_key = (): string => LOCAL_SECURE_KEY_RECENT_ADDRESSES;
const get_default_value = (): DataType => [];
let cached_value = get_default_value();
const get_cached_value = (): DataType => cached_value;
const set_cached_value = (value: DataType): DataType => (cached_value = value);
const meta: SecureDataMetadata0<DataType> = {
    get_key,
    get_default_value,
    get_cached_value,
    set_cached_value,
};

// recent addresses ->  // * local secure
export const useRecentAddressesInner = (
    storage: SecureStorage | undefined,
): [DataType, (value: DataType) => Promise<void>] => useSecureCachedStoreData0(storage, meta);

export const useRecentAddressesInner2 = (
    storage: SecureStorage | undefined,
): [RecentAddresses, { pushRecentAddress: (address: ChainAddress) => Promise<boolean | undefined> }] => {
    const [recent_addresses, setRecentAddresses] = useRecentAddressesInner(storage);

    // push
    const pushRecentAddress = useCallback(
        async (address: ChainAddress) => {
            if (!storage || !recent_addresses) return undefined;

            if (!check_chain_address(address)) return false;

            const new_recent_addresses = recent_addresses.filter((a) => !same(a.address, address));
            new_recent_addresses.push({ created: Date.now(), address });

            // ? Remove previous addresses

            await setRecentAddresses(new_recent_addresses);
            return true;
        },
        [storage, recent_addresses, setRecentAddresses],
    );

    return [recent_addresses, { pushRecentAddress }];
};
