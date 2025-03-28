import type { GotoFunction } from '~hooks/memo/goto';
import { match_combined_token_info, type TokenInfo } from '~types/tokens';
import type { TokenPrices } from '~types/tokens/price';

import { TransferShowTokenEvm, TransferShowTokenIc } from './show/token';

export const TransferShowToken = ({
    goto,
    token,
    type = 'transfer',
    token_prices,
    ic_balances,
    evm_balances,
}: {
    goto: GotoFunction;
    token: TokenInfo;
    type: 'transfer' | 'receive';
    token_prices: TokenPrices;
    ic_balances: Record<string, string>;
    evm_balances: Record<`0x${string}`, bigint>;
}) => {
    return match_combined_token_info(token.info, {
        ic: (ic) => (
            <TransferShowTokenIc
                goto={goto}
                type={type}
                token={token}
                ic={ic}
                token_prices={token_prices}
                balances={ic_balances}
            />
        ),
        ethereum: (eth) => (
            <TransferShowTokenEvm
                goto={goto}
                token={token}
                data={eth}
                type={type}
                chain="ethereum"
                token_prices={token_prices}
                balances={evm_balances}
            />
        ),
        ethereum_test_sepolia: (sepolia) => (
            <TransferShowTokenEvm
                goto={goto}
                token={token}
                data={sepolia}
                type={type}
                chain="ethereum-test-sepolia"
                token_prices={token_prices}
                balances={evm_balances}
            />
        ),
        polygon: (pol) => (
            <TransferShowTokenEvm
                goto={goto}
                token={token}
                data={pol}
                type={type}
                chain="polygon"
                token_prices={token_prices}
                balances={evm_balances}
            />
        ),
        polygon_test_amoy: (amoy) => (
            <TransferShowTokenEvm
                goto={goto}
                token={token}
                data={amoy}
                type={type}
                chain="polygon-test-amoy"
                token_prices={token_prices}
                balances={evm_balances}
            />
        ),
        bsc: (bsc) => (
            <TransferShowTokenEvm
                goto={goto}
                token={token}
                data={bsc}
                type={type}
                chain="bsc"
                token_prices={token_prices}
                balances={evm_balances}
            />
        ),
        bsc_test: (bsc_test) => (
            <TransferShowTokenEvm
                goto={goto}
                token={token}
                data={bsc_test}
                type={type}
                chain="bsc-test"
                token_prices={token_prices}
                balances={evm_balances}
            />
        ),
    });
};
