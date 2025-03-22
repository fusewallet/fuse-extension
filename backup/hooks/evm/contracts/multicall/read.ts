import type { UseQueryOptions } from '@tanstack/react-query';
import { useCallback } from 'react';
import {
    decodeAbiParameters,
    encodeFunctionData,
    erc20Abi,
    multicall3Abi,
    type Address,
    type ContractFunctionArgs,
    type ContractFunctionName,
} from 'viem';

import { useReadContract } from '~hooks/evm/contracts';
import type { EvmChain } from '~types/chain';

const MULTICALL_ADDRESS: Record<EvmChain, Address> = {
    ethereum: '0xcA11bde05977b3631167028862bE2a173976CA11',
    polygon: '0xcA11bde05977b3631167028862bE2a173976CA11',
    bsc: '0xcA11bde05977b3631167028862bE2a173976CA11',
    'ethereum-test-sepolia': '0xcA11bde05977b3631167028862bE2a173976CA11',
    'polygon-test-amoy': '0xcA11bde05977b3631167028862bE2a173976CA11',
    'bsc-test': '0xcA11bde05977b3631167028862bE2a173976CA11',
};

/**
 * Hook for reading from Multicall3 contract
 */
export function useMulticallReadContract<
    TFunctionName extends ContractFunctionName<typeof multicall3Abi, 'view' | 'pure'>,
>(
    chain: EvmChain,
    address: Address,
    functionName: TFunctionName,
    args?: ContractFunctionArgs<typeof multicall3Abi, 'view' | 'pure', TFunctionName>,
    queryOptions?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>,
) {
    return useReadContract<typeof multicall3Abi, TFunctionName>({
        chain,
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
    chain: EvmChain,
    address: Address,
    args: ContractFunctionArgs<typeof multicall3Abi, 'view' | 'pure', 'aggregate3'>,
    queryOptions?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>,
) {
    return useMulticallReadContract<'aggregate3'>(chain, address, 'aggregate3', args, {
        ...queryOptions,
        enabled: !!address && queryOptions?.enabled !== false,
    });
}

/**
 * Token metadata interface
 */
interface TokenMetadataChain {
    address: Address;
    name: string;
    symbol: string;
    decimals: number;
}

/**
 * Hook to fetch ERC20 token metadata using multicall
 * @param address ERC20 token address
 * @returns Token metadata and status
 */
export function useERC20Metadata(chain: EvmChain, target?: Address) {
    const multicall_address = MULTICALL_ADDRESS[chain];
    const enabled = !!(target && multicall_address);
    // Prepare calls for name, symbol, and decimals
    const calls = target
        ? [
              {
                  target,
                  allowFailure: true,
                  callData: encodeFunctionData({
                      abi: erc20Abi,
                      functionName: 'name',
                  }),
              },
              {
                  target,
                  allowFailure: true,
                  callData: encodeFunctionData({
                      abi: erc20Abi,
                      functionName: 'symbol',
                  }),
              },
              {
                  target,
                  allowFailure: true,
                  callData: encodeFunctionData({
                      abi: erc20Abi,
                      functionName: 'decimals',
                  }),
              },
          ]
        : [];

    // Execute multicall
    const { data: results, isError } = useMulticallReadContractAggregate3(chain, multicall_address, [calls], {
        enabled: enabled && !!multicall_address,
    });

    const isSuccess = !isError && results?.every((result) => result.success);

    // Parse metadata from results
    const getMetadata = useCallback((): TokenMetadataChain | null => {
        if (!target || !isSuccess || !results) return null;

        const [nameResult, symbolResult, decimalsResult] = results;
        if (!nameResult.success || !symbolResult.success || !decimalsResult.success) {
            return null;
        }

        try {
            const name = decodeAbiParameters([{ type: 'string' }], nameResult.returnData)[0];
            const symbol = decodeAbiParameters([{ type: 'string' }], symbolResult.returnData)[0];
            const decimals = decodeAbiParameters([{ type: 'uint8' }], decimalsResult.returnData)[0];

            return {
                address: target,
                name,
                symbol,
                decimals: Number(decimals),
            };
        } catch (error) {
            console.error('Error decoding token metadata:', error);
            return null;
        }
    }, [target, results, isSuccess]);

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
export function useERC20Balances(chain: EvmChain, owner?: Address, tokenAddresses?: Address[]) {
    const multicall_address = MULTICALL_ADDRESS[chain];
    const enabled = !!(owner && tokenAddresses?.length && multicall_address);
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
    const { data: results, isError } = useMulticallReadContractAggregate3(chain, multicall_address, [calls], {
        enabled,
    });

    const isSuccess = !isError && results?.every((result) => result.success);

    // Parse balances from results
    const getBalances = useCallback(() => {
        if (!tokenAddresses || !isSuccess || !results) return {};

        const balances: Record<Address, bigint> = {};

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
