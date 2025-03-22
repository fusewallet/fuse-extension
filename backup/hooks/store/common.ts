import dayjs from 'dayjs';

import { match_chain, type Chain } from '~types/chain';
import type { CurrentIdentityNetwork, IdentityNetwork } from '~types/network';

export const identity_network_callback = async <T>(
    chain: Chain,
    current_identity_network: CurrentIdentityNetwork,
    default_value: T,
    callback: (identity_network: IdentityNetwork) => Promise<T>,
): Promise<T> => {
    const identity_network = match_chain<IdentityNetwork | undefined>(chain, {
        ic: () => current_identity_network.ic,
        ethereum: () => current_identity_network.ethereum,
        ethereum_test_sepolia: () => current_identity_network.ethereum_test_sepolia,
        polygon: () => current_identity_network.polygon,
        polygon_test_amoy: () => current_identity_network.polygon_test_amoy,
        bsc: () => current_identity_network.bsc,
        bsc_test: () => current_identity_network.bsc_test,
    });
    if (!identity_network) return default_value;
    return await callback(identity_network);
};

export const format_record_date = (now: number) => {
    const date = dayjs(now).format('YYYYMMDD');
    return date;
};
