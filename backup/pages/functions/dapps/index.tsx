import { FusePage } from '~components/layouts/page';
import { FusePageTransition } from '~components/layouts/transition';
import { useCurrentState } from '~hooks/memo/current_state';
import type { WindowType } from '~types/pages';

function FunctionDappsPage({ wt }: { wt: WindowType }) {
    const current_state = useCurrentState();
    console.debug(`🚀 ~ FunctionDappsPage ~ wt:`, wt);
    return (
        <FusePage current_state={current_state}>
            <FusePageTransition>
                <div className="w-full">Dapps</div>
            </FusePageTransition>
        </FusePage>
    );
}

export default FunctionDappsPage;
