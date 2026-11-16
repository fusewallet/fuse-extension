import { FusePage } from '~components/layouts/page';
import { FusePageTransition } from '~components/layouts/transition';
import { useCurrentState } from '~hooks/memo/current_state';
import { useGoto } from '~hooks/memo/goto';

import { FunctionHeader } from '../components/header';

function FunctionSwapPage() {
    const current_state = useCurrentState();

    const { setHide, goto } = useGoto();
    return (
        <FusePage current_state={current_state}>
            <FusePageTransition setHide={setHide}>
                <div className="relative flex h-full w-full flex-col items-center justify-start pt-[52px]">
                    <FunctionHeader title={'Swap'} onBack={() => goto('/')} onClose={() => goto('/')} />

                    <div className="w-full">Swap</div>
                </div>
            </FusePageTransition>
        </FusePage>
    );
}

export default FunctionSwapPage;
