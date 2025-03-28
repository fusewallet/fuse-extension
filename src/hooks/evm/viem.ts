import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
    createPublicClient,
    http,
    zeroAddress,
    type Account,
    type Address,
    type Chain,
    type PublicClient,
    type SendTransactionParameters,
    type SendTransactionRequest,
    type TypedData,
    type TypedDataDefinition,
    type Chain as ViemChain,
} from 'viem';
import { bsc, bscTestnet, mainnet, polygon, polygonAmoy, sepolia } from 'viem/chains';

import { useCurrentChainNetwork, useCurrentIdentity, useEvmWalletClientCreator } from '~hooks/store/local-secure';
import { match_chain, type EvmChain } from '~types/chain';
import {
    DEFAULT_CURRENT_CHAIN_EVM_NETWORK,
    get_default_rpc,
    get_identity_network_key,
    type ChainIcIdentityNetwork,
    type ChainNetwork,
    type IdentityNetwork,
} from '~types/network';
import type { ChainIcNetwork } from '~types/network/ic';

export const SHOULD_DEHYDRATE_QUERY_KEY = 'SHOULD_DEHYDRATE';

export const get_chain_by_chain_id = (chainId: number): EvmChain | undefined => {
    return Object.entries(DEFAULT_CURRENT_CHAIN_EVM_NETWORK).find(([, network]) => network.chain_id === chainId)?.[1]
        .chain;
};
export const get_viem_chain_by_chain = (chain: EvmChain) => {
    return match_chain<ViemChain>(chain, {
        ic: () => {
            throw new Error('IC chain is not supported');
        },
        ethereum: () => mainnet,
        ethereum_test_sepolia: () => sepolia,
        polygon: () => polygon,
        polygon_test_amoy: () => polygonAmoy,
        bsc: () => bsc,
        bsc_test: () => bscTestnet,
    });
};

export const useEvmChainNetworkByChain = (chain: EvmChain) => {
    const current_chain_network = useCurrentChainNetwork();
    return match_chain<Exclude<ChainNetwork, ChainIcNetwork>>(chain, {
        ic: () => {
            throw new Error('IC chain is not supported');
        },
        ethereum: () => current_chain_network.ethereum,
        ethereum_test_sepolia: () => current_chain_network.ethereum_test_sepolia,
        polygon: () => current_chain_network.polygon,
        polygon_test_amoy: () => current_chain_network.polygon_test_amoy,
        bsc: () => current_chain_network.bsc,
        bsc_test: () => current_chain_network.bsc_test,
    });
};

export const useEvmChainIdentityNetworkByChain = (chain: EvmChain) => {
    const { current_identity_network } = useCurrentIdentity();
    if (!current_identity_network) return undefined;
    return match_chain<Exclude<IdentityNetwork, ChainIcIdentityNetwork> | undefined>(chain, {
        ic: () => {
            throw new Error('IC chain is not supported');
        },
        ethereum: () => current_identity_network.ethereum,
        ethereum_test_sepolia: () => current_identity_network.ethereum_test_sepolia,
        polygon: () => current_identity_network.polygon,
        polygon_test_amoy: () => current_identity_network.polygon_test_amoy,
        bsc: () => current_identity_network.bsc,
        bsc_test: () => current_identity_network.bsc_test,
    });
};

export const useEvmChainIdentityNetworkKeyByChain = (chain: EvmChain) => {
    const identity_network = useEvmChainIdentityNetworkByChain(chain);
    if (!identity_network) return undefined;
    return get_identity_network_key(identity_network);
};

// Store clients in a Map with composite key `${chain}-${rpc}`
const clients = new Map<string, PublicClient>();

export const get_client_by_chain_cache_key = (chain: EvmChain, rpc: string): PublicClient => {
    const cacheKey = `${chain}-${rpc}`;
    const existingClient = clients.get(cacheKey);
    if (existingClient) return existingClient;

    // Get chain configuration
    const viem_chain = get_viem_chain_by_chain(chain);

    // Create a new client with the current RPC
    const newClient = createPublicClient({
        chain: viem_chain,
        transport: http(rpc),
    });

    // Update cache with new client
    clients.set(cacheKey, newClient);

    return newClient;
};
export const usePublicClientByChain = (chain: EvmChain): PublicClient => {
    const chain_network = useEvmChainNetworkByChain(chain);
    const rpc = chain_network.rpc === 'mainnet' ? get_default_rpc(chain) : chain_network.rpc;
    const client = useMemo(() => {
        return get_client_by_chain_cache_key(chain, rpc);
    }, [chain, rpc]);
    return client;
};

// ! send transaction
export const useSendTransaction = <
    TChain extends Chain = Chain,
    TAccount extends Account = Account,
    TChainOverride extends Chain | undefined = undefined,
    TRequest extends SendTransactionRequest<TChain, TChainOverride> = SendTransactionRequest<TChain, TChainOverride>,
>(
    chain: EvmChain,
) => {
    const create_wallet_client = useEvmWalletClientCreator(chain);
    const identity_network = useEvmChainIdentityNetworkByChain(chain);
    const identity_key = identity_network && get_identity_network_key(identity_network);
    const mutationKey = useMemo(() => {
        if (!identity_key) return [];
        return [identity_key, 'transaction', 'send'];
    }, [identity_key]);

    return useMutation({
        mutationKey,
        mutationFn: async (params: SendTransactionParameters<TChain, TAccount, TChainOverride, TRequest>) => {
            const client = create_wallet_client();
            if (!client) throw new Error('Client is required');
            return client.sendTransaction(params);
        },
    });
};

export const useSignMessage = <TAccount extends Account | undefined = undefined>(chain: EvmChain) => {
    const create_wallet_client = useEvmWalletClientCreator(chain);
    const identity_network = useEvmChainIdentityNetworkByChain(chain);
    const identity_key = identity_network && get_identity_network_key(identity_network);

    return useMutation({
        mutationKey: [identity_key, 'message', 'sign'],
        mutationFn: async ({ message, account }: { message: string; account?: TAccount }) => {
            const client = create_wallet_client();
            if (!client) throw new Error('Client is required');

            return client.signMessage({
                message,
                account: account || undefined,
            });
        },
    });
};

export const useSignTypedData = <
    const typedData extends TypedData | Record<string, unknown>,
    primaryType extends keyof typedData | 'EIP712Domain' = keyof typedData,
>(
    chain: EvmChain,
) => {
    const create_wallet_client = useEvmWalletClientCreator(chain);
    const identity_network = useEvmChainIdentityNetworkByChain(chain);
    const identity_key = identity_network && get_identity_network_key(identity_network);

    return useMutation({
        mutationKey: [identity_key, 'message', 'signTypedData'],
        mutationFn: async (args: TypedDataDefinition<typedData, primaryType>) => {
            const client = create_wallet_client();
            if (!client) throw new Error('Client is required');
            return client.account.signTypedData(args);
        },
    });
};

export const useEstimateNativeTransferGas = (
    chain: EvmChain,
    args: {
        data?: `0x${string}`;
    },
    options?: {
        enabled: boolean;
    },
) => {
    const publicClient = usePublicClientByChain(chain);
    const identity_network = useEvmChainIdentityNetworkByChain(chain);
    const identity_key = identity_network && get_identity_network_key(identity_network);
    const { data } = args;
    const enabled = !!publicClient && !!identity_key && !!(!options || options?.enabled);
    return useQuery({
        queryKey: [identity_key, 'estimate_native_transfer_gas_fee'],
        queryFn: async () => {
            const gasLimit = await publicClient.estimateGas({
                account: identity_network?.address,
                to: zeroAddress,
                value: 0n,
                data,
            });
            const eip1559 = await publicClient.estimateFeesPerGas();
            const worse_case_gas_price = eip1559.maxFeePerGas;
            const estimatedFee = gasLimit * worse_case_gas_price;
            return {
                gasLimit,
                eip1559,
                estimatedFee,
            };
        },
        enabled,
        refetchInterval: 5_000,
    });
};
