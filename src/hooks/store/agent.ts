import { HttpAgent } from '@dfinity/agent';
import {
    bytesToHex,
    createWalletClient,
    http,
    type Account,
    type Chain,
    type Transport,
    type WalletClient,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import { get_address_by_mnemonic_and_metadata } from '~lib/mnemonic';
import { match_combined_identity_key, type IdentityKey } from '~types/identity';
import type { ChainEvmNetwork, ChainIcNetwork } from '~types/network';

// =================== unique ic agent ===================
const UNIQUE_IC_AGENT: { target?: { principal: string; host?: string; agent: HttpAgent } } = {};
const refresh_unique_ic_agent = (
    identity_key: IdentityKey | undefined,
    current_chain_network: ChainIcNetwork | undefined,
) => {
    const clean = () => (UNIQUE_IC_AGENT.target = undefined);

    if (identity_key === undefined || current_chain_network === undefined) return clean();

    match_combined_identity_key(identity_key.key, {
        mnemonic: (mnemonic) => {
            const [address, { ic }] = get_address_by_mnemonic_and_metadata(mnemonic.mnemonic, mnemonic.subaccount);
            if (address.ic && ic) {
                const host = current_chain_network.created !== 0 ? current_chain_network.origin : undefined; // check host
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
    current_chain_network: ChainIcNetwork | undefined,
) => {
    refresh_unique_ic_agent(identity_key, current_chain_network);
};

// =================== unique evm wallet client ===================
const UNIQUE_EVM_WALLET_CLIENT: { target?: WalletClient<Transport, Chain, Account> } = {};
export const refresh_unique_evm_wallet_client = (
    identity_key: IdentityKey | undefined,
    current_chain_network: ChainEvmNetwork | undefined,
) => {
    const clean = () => (UNIQUE_EVM_WALLET_CLIENT.target = undefined);

    if (identity_key === undefined || current_chain_network === undefined) return clean();

    match_combined_identity_key(identity_key.key, {
        mnemonic: (mnemonic) => {
            const [, { evm }] = get_address_by_mnemonic_and_metadata(mnemonic.mnemonic, mnemonic.subaccount);
            const private_key = evm?.privateKey;
            if (private_key === undefined) return clean();
            const walletClient = createWalletClient({
                account: privateKeyToAccount(bytesToHex(private_key)),
                chain: current_chain_network.viemChain,
                transport: http(),
            });
            UNIQUE_EVM_WALLET_CLIENT.target = walletClient;
        },
        private_key: (private_key) => {
            const walletClient = createWalletClient({
                account: privateKeyToAccount(private_key.private_key as `0x${string}`),
                chain: current_chain_network.viemChain,
                transport: http(),
            });
            UNIQUE_EVM_WALLET_CLIENT.target = walletClient;
        },
    });
};
export const get_unique_evm_wallet_client = () => UNIQUE_EVM_WALLET_CLIENT.target;
