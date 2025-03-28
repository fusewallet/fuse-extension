import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { Address } from 'viem';

import { FusePage } from '~components/layouts/page';
import { FusePageTransition } from '~components/layouts/transition';
import { useCurrentState } from '~hooks/memo/current_state';
import { useGoto } from '~hooks/memo/goto';
import { useTokenInfoCustom } from '~hooks/store/local';
import { MILLISECOND, MINUTE } from '~lib/utils/datetime';
import { FunctionHeader } from '~pages/functions/components/header';
import type { EvmChain } from '~types/chain';
import { match_combined_token_info, type CurrentTokenShowInfo } from '~types/tokens';
import { get_token_logo, PRESET_ALL_TOKEN_INFO } from '~types/tokens/preset';

import FunctionTransferTokenEvmAddressPage from './address';
import FunctionTransferTokenEvmAmountPage from './amount';

type PageState = 'address' | 'amount';

function FunctionTransferTokenEvmPage() {
    const current_state = useCurrentState();
    const { setHide, goto: _goto } = useGoto();
    const location = useLocation();
    const { address, chain, info } = location.state as {
        chain: EvmChain;
        address: Address;
        info: CurrentTokenShowInfo;
    };

    const [state, setState] = useState<PageState>('address');

    const [to, setTo] = useState<Address>();
    const [logo, setLogo] = useState<string>();

    useEffect(() => {
        get_token_logo(info.token.info).then(setLogo);
    }, [info.token]);

    if (!address || !chain) return <></>;

    return (
        <FusePage
            current_state={current_state}
            options={{ refresh_token_info_ic_sleep: MINUTE * 5, refresh_token_price_ic_sleep: MILLISECOND * 15 }}
        >
            <FusePageTransition setHide={setHide}>
                <div className="relative flex h-full w-full flex-col items-center justify-start overflow-hidden pt-[52px]">
                    <FunctionHeader
                        title={'Send'}
                        onBack={() => (state === 'amount' ? setState('address') : _goto(-1))}
                        onClose={() => _goto('/')}
                    />

                    {state === 'address' && (
                        <FunctionTransferTokenEvmAddressPage
                            logo={logo}
                            chain={chain}
                            onNext={(to: Address) => {
                                setTo(to);
                                setState('amount');
                            }}
                        />
                    )}
                    {state === 'amount' && (
                        <FunctionTransferTokenEvmAmountPage logo={logo} to={to} goto={_goto} info={info} />
                    )}
                </div>
            </FusePageTransition>
        </FusePage>
    );
}

export default FunctionTransferTokenEvmPage;
