import type { UseQueryOptions } from '@tanstack/react-query';
import { useCallback } from 'react';
import {
    decodeAbiParameters,
    encodeFunctionData,
    erc20Abi,
    isAddress,
    multicall3Abi,
    type Address,
    type ContractFunctionArgs,
    type ContractFunctionName,
} from 'viem';

import { useReadContract } from '~hooks/evm/contracts';
import { useCurrentIdentity } from '~hooks/store/local-secure';
import { isEvmNetwork } from '~types/network';

/**
 * Hook for reading from Multicall3 contract
 */
export function useMulticallReadContract<
    TFunctionName extends ContractFunctionName<typeof multicall3Abi, 'view' | 'pure'>,
>(
    address: Address,
    functionName: TFunctionName,
    args?: ContractFunctionArgs<typeof multicall3Abi, 'view' | 'pure', TFunctionName>,
    queryOptions?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>,
) {
    return useReadContract<typeof multicall3Abi, TFunctionName>({
        address,
        abi: multicall3Abi,
        functionName,
        args,
        queryOptions: {
            ...queryOptions,
            enabled: !!address && queryOptions?.enabled !== false,
        },
    });
}

/**
 * Hook specifically for Multicall3's aggregate3 function
 */
export function useMulticallReadContractAggregate3(
    address: Address | undefined,
    args: ContractFunctionArgs<typeof multicall3Abi, 'view' | 'pure', 'aggregate3'>,
    queryOptions?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>,
) {
    return useMulticallReadContract<'aggregate3'>(address as Address, 'aggregate3', args, {
        ...queryOptions,
        enabled: !!address && queryOptions?.enabled !== false,
    });
}

/**
 * Token metadata interface
 */
interface TokenMetadataChain {
    name: string;
    symbol: string;
    decimals: number;
    logo?: string;
    address: string;
}

/**
 * Hook to fetch ERC20 token metadata using multicall
 * @param address ERC20 token address
 * @returns Token metadata and status
 */
export function useERC20Metadata(address?: Address) {
    const { current_chain_network } = useCurrentIdentity();
    const is_evm = isEvmNetwork(current_chain_network);
    const enabled = !!address && isAddress(address) && is_evm;
    const multicall_address = is_evm ? current_chain_network.viemChain.contracts?.multicall3?.address : undefined;
    // Prepare calls for name, symbol, and decimals
    const calls = address
        ? [
              {
                  target: address,
                  allowFailure: true,
                  callData: encodeFunctionData({
                      abi: erc20Abi,
                      functionName: 'name',
                  }),
              },
              {
                  target: address,
                  allowFailure: true,
                  callData: encodeFunctionData({
                      abi: erc20Abi,
                      functionName: 'symbol',
                  }),
              },
              {
                  target: address,
                  allowFailure: true,
                  callData: encodeFunctionData({
                      abi: erc20Abi,
                      functionName: 'decimals',
                  }),
              },
          ]
        : [];

    // Execute multicall
    const { data: results, isError } = useMulticallReadContractAggregate3(multicall_address, [calls], {
        enabled: enabled && !!multicall_address,
    });

    const isSuccess = !isError && results?.every((result) => result.success);

    // Parse metadata from results
    const getMetadata = useCallback((): TokenMetadataChain | null => {
        if (!address || !isSuccess || !results) return null;

        const [nameResult, symbolResult, decimalsResult] = results;
        if (!nameResult.success || !symbolResult.success || !decimalsResult.success) {
            return null;
        }

        try {
            const name = decodeAbiParameters([{ type: 'string' }], nameResult.returnData)[0];
            const symbol = decodeAbiParameters([{ type: 'string' }], symbolResult.returnData)[0];
            const decimals = decodeAbiParameters([{ type: 'uint8' }], decimalsResult.returnData)[0];

            return {
                address,
                name,
                symbol,
                decimals: Number(decimals),
                logo: '',
            };
        } catch (error) {
            console.error('Error decoding token metadata:', error);
            return null;
        }
    }, [address, results, isSuccess]);

    return {
        metadata: getMetadata(),
        isError,
        isSuccess,
    };
}

/**
 * Hook to batch fetch multiple ERC20 token balances using multicall
 * @param owner Address to check balances for
 * @param tokenAddresses Array of token addresses
 * @returns Object with token balances and status
 */
export function useERC20Balances(owner?: Address, tokenAddresses?: Address[]) {
    const { current_chain_network } = useCurrentIdentity();
    const is_evm = isEvmNetwork(current_chain_network);
    const multicall_address = is_evm ? current_chain_network.viemChain.contracts?.multicall3?.address : undefined;
    // Prepare calls for balanceOf for each token
    const calls =
        owner && tokenAddresses?.length
            ? tokenAddresses.map((tokenAddress) => ({
                  target: tokenAddress,
                  allowFailure: true,
                  callData: encodeFunctionData({
                      abi: erc20Abi,
                      functionName: 'balanceOf',
                      args: [owner],
                  }),
              }))
            : [];

    // Execute multicall
    const { data: results, isError } = useMulticallReadContractAggregate3(multicall_address as Address, [calls], {
        enabled: !!owner && !!tokenAddresses?.length && !!multicall_address,
    });

    const isSuccess = !isError && results?.every((result) => result.success);

    // Parse balances from results
    const getBalances = useCallback(() => {
        if (!tokenAddresses || !isSuccess || !results) return {};

        const balances: Record<string, bigint> = {};

        results.forEach((result, index) => {
            if (result.success && tokenAddresses[index]) {
                try {
                    const balance = decodeAbiParameters([{ type: 'uint256' }], result.returnData)[0];
                    balances[tokenAddresses[index]] = balance;
                } catch (error) {
                    console.error(`Error decoding balance for token ${tokenAddresses[index]}:`, error);
                }
            }
        });

        return balances;
    }, [tokenAddresses, results, isSuccess]);

    return {
        balances: getBalances(),
        isError,
        isSuccess,
    };
}
