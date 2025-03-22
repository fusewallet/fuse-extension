import { useCallback } from 'react';

import type { SecureStorage } from '@plasmohq/storage/secure';

import { useSecureCachedStoreData0, type SecureDataMetadata0 } from '~hooks/meta/metadata-secure-0';
import { same } from '~lib/utils/same';
import { resort_list, type ResortFunction } from '~lib/utils/sort';
import { check_chain_address, type ChainAddress, type MarkedAddresses } from '~types/address';

import { LOCAL_SECURE_KEY_MARKED_ADDRESSES } from '../../keys';

// ! always try to use this value to avoid BLINK
type DataType = MarkedAddresses;
const get_key = (): string => LOCAL_SECURE_KEY_MARKED_ADDRESSES;
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

// marked addresses ->  // * local secure
export const useMarkedAddressesInner = (
    storage: SecureStorage | undefined,
): [DataType, (value: DataType) => Promise<void>] => useSecureCachedStoreData0(storage, meta);

export const useMarkedAddressesInner2 = (
    storage: SecureStorage | undefined,
): [
    MarkedAddresses,
    {
        pushOrUpdateMarkedAddress: (address: ChainAddress, name: string) => Promise<boolean | undefined>;
        removeMarkedAddress: (address: ChainAddress) => Promise<boolean | undefined>;
        resortMarkedAddresses: ResortFunction;
    },
] => {
    const [marked_addresses, setMarkedAddresses] = useMarkedAddressesInner(storage);

    // push or update
    const pushOrUpdateMarkedAddress = useCallback(
        async (address: ChainAddress, name: string) => {
            if (!storage || !marked_addresses) return undefined;

            if (!check_chain_address(address)) return false;

            name = name.trim();
            if (64 < name.length) return false;

            const now = Date.now();
            const exist = marked_addresses.find((a) => same(a.address, address));
            if (exist) {
                exist.name = name; // update
                exist.updated = now; // update
                await setMarkedAddresses([...marked_addresses]);
            } else {
                marked_addresses.push({ created: now, updated: now, name, address }); // push
                await setMarkedAddresses([...marked_addresses]);
            }

            return true;
        },
        [storage, marked_addresses, setMarkedAddresses],
    );

    // remove
    const removeMarkedAddress = useCallback(
        async (address: ChainAddress) => {
            if (!storage || !marked_addresses) return undefined;

            if (!check_chain_address(address)) return false;

            const exist = marked_addresses.find((a) => same(a.address, address));
            if (!exist) return false;

            const new_marked_addresses = marked_addresses.filter((a) => !same(a.address, address));
            await setMarkedAddresses(new_marked_addresses);

            return true;
        },
        [storage, marked_addresses, setMarkedAddresses],
    );

    // resort
    const resortMarkedAddresses = useCallback(
        async (source_index: number, destination_index: number | undefined) => {
            if (!storage || !marked_addresses) return undefined;

            const next = resort_list(marked_addresses, source_index, destination_index);
            if (typeof next === 'boolean') return next;

            await setMarkedAddresses(next);

            return true;
        },
        [storage, marked_addresses, setMarkedAddresses],
    );

    return [marked_addresses, { pushOrUpdateMarkedAddress, removeMarkedAddress, resortMarkedAddresses }];
};
