import { HttpAgent } from '@dfinity/agent';

import { get_address_by_mnemonic_and_metadata } from '~lib/mnemonic';
import { match_combined_identity_key, type IdentityKey } from '~types/identity';
import type { CurrentChainNetwork } from '~types/network';

// =================== unique ic agent ===================
const UNIQUE_IC_AGENT: { target?: { principal: string; host?: string; agent: HttpAgent } } = {};
const refresh_unique_ic_agent = (
    identity_key: IdentityKey | undefined,
    current_chain_network: CurrentChainNetwork | undefined,
) => {
    const clean = () => (UNIQUE_IC_AGENT.target = undefined);

    if (identity_key === undefined || current_chain_network === undefined) return clean();

    match_combined_identity_key(identity_key.key, {
        mnemonic: (mnemonic) => {
            const [address, { ic }] = get_address_by_mnemonic_and_metadata(mnemonic.mnemonic);
            if (address.ic && ic) {
                const host = current_chain_network.ic.created !== 0 ? current_chain_network.ic.origin : undefined; // check host
                if (UNIQUE_IC_AGENT.target === undefined || UNIQUE_IC_AGENT.target.host !== host) {
                    UNIQUE_IC_AGENT.target = {
                        principal: address.ic.owner,
                        host,
                        agent: HttpAgent.createSync({ host, identity: ic }),
                    };
                }
            } else clean();
        },
        private_key: () => {
            throw new Error(`Unimplemented identity type: private_key`);
        },
    });
};
export const get_unique_ic_agent = () => UNIQUE_IC_AGENT.target?.agent;

// refresh all unique identity
export const agent_refresh_unique_identity = (
    identity_key: IdentityKey | undefined,
    current_chain_network: CurrentChainNetwork | undefined,
) => {
    refresh_unique_ic_agent(identity_key, current_chain_network);
};
