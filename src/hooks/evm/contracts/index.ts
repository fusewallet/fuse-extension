import { useMutation, useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
    decodeEventLog,
    erc20Abi,
    type Abi,
    type Account,
    type Address,
    type Chain,
    type ContractFunctionArgs,
    type ContractFunctionName,
    type Hash,
    type Log,
    type TransactionReceipt,
    type WriteContractParameters,
} from 'viem';

import { useEvmWalletClientCreator } from '~hooks/store/local-secure';
import type { EvmChain } from '~types/chain';
import { get_identity_network_key } from '~types/network';

import { SHOULD_DEHYDRATE_QUERY_KEY, useEvmChainIdentityNetworkByChain, usePublicClientByChain } from '../viem';

export interface UseReadContractConfig<
    TAbi extends Abi | readonly unknown[],
    TFunctionName extends ContractFunctionName<TAbi, 'pure' | 'view'>,
> {
    chain: EvmChain;
    address: Address;
    abi: TAbi;
    functionName: TFunctionName;
    args?: ContractFunctionArgs<TAbi, 'pure' | 'view', TFunctionName>;
    queryOptions?: Omit<UseQueryOptions, 'queryFn' | 'queryKey'>;
}
// need to de-hydrate query
const SHOULD_DEHYDRATE_QUERY_FUNCTION_NAME = ['balanceOf', 'aggregate3'];
export const useReadContract = <
    TAbi extends Abi | readonly unknown[],
    TFunctionName extends ContractFunctionName<TAbi, 'pure' | 'view'>,
>(
    config: UseReadContractConfig<TAbi, TFunctionName>,
) => {
    const { chain, address, abi, functionName, args, queryOptions } = config;
    const client = usePublicClientByChain(chain);
    const identity_network = useEvmChainIdentityNetworkByChain(chain);
    const identity_key = identity_network && get_identity_network_key(identity_network);
    const queryKey = identity_key
        ? [
              identity_key,
              'contract',
              address,
              functionName,
              args,
              SHOULD_DEHYDRATE_QUERY_FUNCTION_NAME.includes(functionName) ? SHOULD_DEHYDRATE_QUERY_KEY : undefined,
          ]
        : [];
    const enabled = !!client && !!(!queryOptions || queryOptions.enabled);
    return useQuery({
        queryKey,
        queryFn: async () => {
            if (!client) throw new Error('Client is required');
            return client.readContract({
                address,
                abi,
                functionName,
                args,
            });
        },
        enabled,
    });
};
type TransactionDetail = {
    hash: Hash;
    from: Address;
    to?: Address | null;
    value: bigint;
    gasPrice?: bigint;
    gasLimit: bigint;
    nonce: number;
    data: string;
    status: 'pending' | 'success' | 'reverted';
    gasUsed?: bigint;
    logs?: Log[];
    contractAddress?: Address | null;
};
export function parseTransferLogs(logs: Log[]) {
    return logs
        .map((log) => {
            try {
                const decoded = decodeEventLog({
                    abi: erc20Abi,
                    data: log.data,
                    topics: log.topics,
                });
                if (decoded.eventName === 'Transfer') {
                    return {
                        from: decoded.args.from,
                        to: decoded.args.to,
                        amount: decoded.args.value,
                        tokenAddress: log.address,
                    };
                }

                return null;
            } catch (error) {
                return null;
            }
        })
        .filter(Boolean);
}
export const useTransactionDetail = ({ chain, hash }: { chain: EvmChain; hash?: Hash }) => {
    const identity_network = useEvmChainIdentityNetworkByChain(chain);
    const identity_key = identity_network && get_identity_network_key(identity_network);
    const client = usePublicClientByChain(chain);
    const queryKey = identity_key ? [identity_key, 'transaction_detail', hash] : [];
    const enabled = !!client && !!hash;
    return useQuery<TransactionDetail, Error>({
        queryKey,
        queryFn: async () => {
            if (!client) throw new Error('Client is required');
            if (!hash) throw new Error('Hash is required');
            const transaction = await client.getTransaction({
                hash,
            });
            let receipt: TransactionReceipt | undefined;
            try {
                receipt = await client.getTransactionReceipt({
                    hash,
                });
            } catch (error) {
                receipt = undefined;
            }
            if (!receipt) {
                return {
                    hash: transaction.hash,
                    from: transaction.from,
                    to: transaction.to,
                    value: transaction.value,
                    gasPrice: transaction.gasPrice,
                    gasLimit: transaction.gas,
                    nonce: transaction.nonce,
                    data: transaction.input,
                    status: 'pending',
                    gasUsed: undefined,
                    logs: undefined,
                    contractAddress: undefined,
                };
            } else {
                parseTransferLogs(receipt.logs);
                return {
                    hash: transaction.hash,
                    from: transaction.from,
                    to: transaction.to,
                    value: transaction.value,
                    gasPrice: transaction.gasPrice,
                    gasLimit: transaction.gas,
                    nonce: transaction.nonce,
                    data: transaction.input,
                    status: receipt.status,
                    gasUsed: receipt.gasUsed,
                    logs: receipt.logs,
                    contractAddress: receipt.contractAddress,
                };
            }
        },
        enabled,
        refetchInterval: 10 * 60 * 60,
    });
};

export const useWriteContract = <
    TAbi extends Abi | readonly unknown[],
    TFunctionName extends ContractFunctionName<TAbi, 'payable' | 'nonpayable'>,
    TArgs extends ContractFunctionArgs<TAbi, 'payable' | 'nonpayable', TFunctionName>,
    TChainOverride extends Chain | undefined = undefined,
>(
    chain: EvmChain,
) => {
    const create_wallet_client = useEvmWalletClientCreator(chain);
    const identity_network = useEvmChainIdentityNetworkByChain(chain);
    const identity_key = identity_network && get_identity_network_key(identity_network);
    const mutationKey = useMemo(() => {
        if (!identity_key) return [];
        return [identity_key, 'contract', 'write'];
    }, [identity_key]);

    return useMutation({
        mutationKey,
        mutationFn: async (
            params: WriteContractParameters<TAbi, TFunctionName, TArgs, Chain, Account, TChainOverride>,
        ) => {
            const client = create_wallet_client();
            if (!client) throw new Error('Client is required');
            return client.writeContract(params);
        },
    });
};
