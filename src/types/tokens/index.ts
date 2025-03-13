import type { EvmTokenInfo } from './evm';
import type { IcTokenInfo } from './ic';

export enum TokenTag {
    // ic
    ChainIc = 'chain-ic',
    ChainIcSns = 'chain-ic-sns',
    ChainIcCk = 'chain-ic-ck',
    ChainIcCustom = 'chain-ic-custom',

    // evm
    ChainEvm = 'chain-evm',
    ChainEvmCustom = 'chain-evm-custom',
}

export type CombinedTokenInfo =
    | {
          ic: IcTokenInfo;
      }
    | {
          evm: EvmTokenInfo;
      };

export const match_combined_token_info = <T>(
    self: CombinedTokenInfo,
    { ic, evm }: { ic: (ic: IcTokenInfo) => T; evm: (evm: EvmTokenInfo) => T },
): T => {
    if ('ic' in self) return ic(self.ic);
    if ('evm' in self) return evm(self.evm);
    throw new Error('Unknown token info');
};
export const match_combined_token_info_async = async <T>(
    self: CombinedTokenInfo,
    { ic, evm }: { ic: (ic: IcTokenInfo) => Promise<T>; evm: (evm: EvmTokenInfo) => Promise<T> },
): Promise<T> => {
    if ('ic' in self) return ic(self.ic);
    if ('evm' in self) return evm(self.evm);
    throw new Error('Unknown token info');
};

export interface TokenInfo {
    info: CombinedTokenInfo;
    tags: TokenTag[];
}

export const is_same_token_info = (a: TokenInfo, b: TokenInfo): boolean => {
    return match_combined_token_info(a.info, {
        ic: (ic) =>
            match_combined_token_info(b.info, {
                ic: (ic2) => ic.canister_id === ic2.canister_id,
                evm: () => false,
            }),
        evm: (evm) =>
            match_combined_token_info(b.info, {
                ic: () => false,
                evm: (evm2) => evm.address === evm2.address && evm.chainId === evm2.chainId,
            }),
    });
};
export const get_token_unique_id = (token: TokenInfo): string => {
    return match_combined_token_info(token.info, {
        ic: (ic) => `ic#${ic.canister_id}`,
        evm: (evm) => `evm#${evm.chainId}#${evm.address}`,
    });
};
export const get_token_name = (token: TokenInfo): string => {
    return match_combined_token_info(token.info, {
        ic: (ic) => ic.name,
        evm: (evm) => evm.name,
    });
};
export const get_token_symbol = (token: TokenInfo): string => {
    return match_combined_token_info(token.info, {
        ic: (ic) => ic.symbol,
        evm: (evm) => evm.symbol,
    });
};

export interface CustomToken {
    created: number;
    updated: number;
    token: TokenInfo;
}

// <prefix>:token:info:custom => TokenInfo[]
export type CustomTokens = CustomToken[];

// <prefix>:token:info:current => TokenInfo[]
export type CurrentTokens = TokenInfo[];
