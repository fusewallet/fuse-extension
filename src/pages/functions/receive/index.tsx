import { FusePage } from '~components/layouts/page';
import { FusePageTransition } from '~components/layouts/transition';
import { useCurrentState } from '~hooks/memo/current_state';
import { useGoto } from '~hooks/memo/goto';
import { useCurrentIdentity } from '~hooks/store/local-secure';
import { match_chain } from '~types/chain';

import { FunctionHeader } from '../components/header';
import EVMReceivePage from './components/evm';
import ICReceivePage from './components/ic';

function FunctionReceivePage() {
    const current_state = useCurrentState();

    const { setHide, goto } = useGoto();
    const { current_chain_network } = useCurrentIdentity();
    return (
        <FusePage current_state={current_state}>
            <FusePageTransition setHide={setHide}>
                <div className="relative flex h-full w-full flex-col items-center justify-start pt-[52px]">
                    <FunctionHeader
                        title={'Receive'}
                        onBack={() => goto(-1)}
                        onClose={() => goto('/', { replace: true })}
                    />
                    {current_chain_network &&
                        match_chain(current_chain_network.chain, {
                            ic: () => <ICReceivePage />,
                            evm: () => <EVMReceivePage />,
                        })}
                </div>
            </FusePageTransition>
        </FusePage>
    );
}

export default FunctionReceivePage;
