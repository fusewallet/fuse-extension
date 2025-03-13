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
        evm: () => current_identity_network.evm,
    });
    if (!identity_network) return default_value;
    return await callback(identity_network);
};

export const format_record_date = (now: number) => {
    const date = dayjs(now).format('YYYYMMDD');
    return date;
};
