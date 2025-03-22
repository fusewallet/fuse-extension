import type { PlasmoMessaging } from '@plasmohq/messaging';

import { __inner_get_password } from '~background/session/unlocked';
import { get_client_by_chain_cache_key } from '~hooks/evm/viem';
import { get_current_info } from '~hooks/store/local-secure';
import type { MessageResult } from '~lib/messages';
import { match_chain, type EvmChain } from '~types/chain';
import { get_default_rpc } from '~types/network';
import type { CurrentWindow } from '~types/window';

export interface RequestBody {
    message_id: string;
    window?: CurrentWindow;
    timeout: number;
    chain: EvmChain;
    origin: string;
}

export type ResponseBody = MessageResult<string, string>;

const handler: PlasmoMessaging.MessageHandler<RequestBody, ResponseBody> = async (req, res) => {
    if (!req.body) return res.send({ err: 'request body is undefined' });
    const body: RequestBody = req.body;

    const current_info = await get_current_info(__inner_get_password);
    if (!current_info) return res.send({ err: 'Wallet is locked or not initialized' });
    const identity_network = current_info.current_identity_network;
    const address = match_chain(body.chain, {
        ic: () => {
            throw new Error('IC chain is not supported');
        },
        ethereum: () => identity_network.ethereum?.address,
        ethereum_test_sepolia: () => identity_network.ethereum_test_sepolia?.address,
        polygon: () => identity_network.polygon?.address,
        polygon_test_amoy: () => identity_network.polygon_test_amoy?.address,
        bsc: () => identity_network.bsc?.address,
        bsc_test: () => identity_network.bsc_test?.address,
    });
    if (!address) return res.send({ err: 'address not found' });
    const client = match_chain(body.chain, {
        ic: () => {
            throw new Error('IC chain is not supported');
        },
        ethereum: () => {
            const network = identity_network.ethereum?.network;
            if (!network) return undefined;
            const rpc = network?.rpc === 'mainnet' ? get_default_rpc('ethereum') : network?.rpc;
            return get_client_by_chain_cache_key(body.chain, rpc);
        },
        ethereum_test_sepolia: () => {
            const network = identity_network.ethereum_test_sepolia?.network;
            if (!network) return undefined;
            const rpc = network?.rpc === 'mainnet' ? get_default_rpc('ethereum') : network?.rpc;
            return get_client_by_chain_cache_key(body.chain, rpc);
        },
        polygon: () => {
            const network = identity_network.polygon?.network;
            if (!network) return undefined;
            const rpc = network?.rpc === 'mainnet' ? get_default_rpc('polygon') : network?.rpc;
            return get_client_by_chain_cache_key(body.chain, rpc);
        },
        polygon_test_amoy: () => {
            const network = identity_network.polygon_test_amoy?.network;
            if (!network) return undefined;
            const rpc = network?.rpc === 'mainnet' ? get_default_rpc('polygon') : network?.rpc;
            return get_client_by_chain_cache_key(body.chain, rpc);
        },
        bsc: () => {
            const network = identity_network.bsc?.network;
            if (!network) return undefined;
            const rpc = network?.rpc === 'mainnet' ? get_default_rpc('bsc') : network?.rpc;
            return get_client_by_chain_cache_key(body.chain, rpc);
        },
        bsc_test: () => {
            const network = identity_network.bsc_test?.network;
            if (!network) return undefined;
            const rpc = network?.rpc === 'mainnet' ? get_default_rpc('bsc') : network?.rpc;
            return get_client_by_chain_cache_key(body.chain, rpc);
        },
    });

    if (!client) return res.send({ err: 'client not found' });

    const balance = await client.getBalance({ address });
    return res.send({ ok: balance.toString() });
};

export default handler;
