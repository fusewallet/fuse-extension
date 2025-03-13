import { isCanisterIdText } from '@choptop/haw';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { FusePage } from '~components/layouts/page';
import { FusePageTransition } from '~components/layouts/transition';
import { useCurrentState } from '~hooks/memo/current_state';
import { useGoto } from '~hooks/memo/goto';
import { useTokenInfoCustom } from '~hooks/store/local';
import { MILLISECOND, MINUTE } from '~lib/utils/datetime';
import { FunctionHeader } from '~pages/functions/components/header';
import { match_combined_token_info } from '~types/tokens';
import { get_token_logo, PRESET_IC_ALL_TOKEN_INFO } from '~types/tokens/preset';

import FunctionTransferTokenIcAddressPage from './address';
import FunctionTransferTokenIcAmountPage from './amount';

type PageState = 'address' | 'amount';

function FunctionTransferTokenIcPage() {
    const current_state = useCurrentState();

    const { setHide, goto: _goto } = useGoto();
    const [custom] = useTokenInfoCustom();

    const allTokens = useMemo(() => [...PRESET_IC_ALL_TOKEN_INFO, ...custom.map((t) => t.token)], [custom]);
    const location = useLocation();
    const [canister_id, setCanisterId] = useState<string>();

    useEffect(() => {
        const canister_id = location.state.canister_id;
        if (!canister_id || !isCanisterIdText(canister_id)) return _goto('/', { replace: true });
        setCanisterId(canister_id);
    }, [_goto, location]);

    const [state, setState] = useState<PageState>('address');

    const [to, setTo] = useState<string>('');
    const [logo, setLogo] = useState<string>();

    useEffect(() => {
        if (!canister_id) return;

        const token = allTokens.find((t) =>
            match_combined_token_info(t.info, {
                ic: (ic) => ic.canister_id === canister_id,
                evm: (evm) => evm.address === canister_id,
            }),
        );

        if (!token) throw new Error('Unknown token info');

        get_token_logo(token.info).then(setLogo);
    }, [allTokens, canister_id]);

    if (!canister_id) return <></>;
    return (
        <FusePage
            current_state={current_state}
            options={{ refresh_token_info_ic_sleep: MINUTE * 5, refresh_token_price_ic_sleep: MILLISECOND * 15 }}
        >
            <FusePageTransition setHide={setHide}>
                <div className="relative flex h-full w-full flex-col items-center justify-start pt-[52px]">
                    <FunctionHeader
                        title={'Send'}
                        onBack={() => (state === 'amount' ? setState('address') : _goto(-1))}
                        onClose={() => _goto('/')}
                    />

                    {state === 'address' && (
                        <FunctionTransferTokenIcAddressPage
                            logo={logo}
                            onNext={(to: string) => {
                                setTo(to);
                                setState('amount');
                            }}
                        />
                    )}
                    {state === 'amount' && (
                        <FunctionTransferTokenIcAmountPage logo={logo} canister_id={canister_id} to={to} goto={_goto} />
                    )}
                </div>
            </FusePageTransition>
        </FusePage>
    );
}

export default FunctionTransferTokenIcPage;
