import { FusePage } from '~components/layouts/page';
import { FusePageTransition } from '~components/layouts/transition';
import { useCurrentState } from '~hooks/memo/current_state';
import { useGoto } from '~hooks/memo/goto';
import { useIdentityKeys } from '~hooks/store/local-secure';
import type { Chain } from '~types/chain';
import { DEFAULT_CHAIN_NETWORKS, get_chain_network_logo, is_same_chain_network } from '~types/network';

import { FunctionHeader } from '../components/header';
import ChainItem from './components';

export default function FunctionChainPage() {
    const current_state = useCurrentState();
    const { setHide, goto } = useGoto();
    const { current_identity, switchChainNetwork, current_chain_network } = useIdentityKeys();
    return (
        <FusePage current_state={current_state}>
            <FusePageTransition setHide={setHide}>
                <div className="relative flex h-full w-full flex-col items-center justify-start pt-[52px]">
                    <FunctionHeader title={'Switch Network'} onBack={() => goto(-1)} />
                    <div className="mt-10 flex w-full flex-col gap-[16px] px-5">
                        {Object.entries(DEFAULT_CHAIN_NETWORKS).map(([chain, networks]) => (
                            <div key={chain} className="flex flex-col gap-[16px]">
                                {networks.map((network) => (
                                    <ChainItem
                                        key={`${chain}-${network.name}`}
                                        name={network.name}
                                        logo={get_chain_network_logo(chain as Chain, network)}
                                        active={
                                            !!current_chain_network &&
                                            is_same_chain_network(current_chain_network, network)
                                        }
                                        onClick={() => {
                                            if (!current_identity) return;
                                            switchChainNetwork(current_identity, network);
                                            // back
                                            goto(-1);
                                        }}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </FusePageTransition>
        </FusePage>
    );
}
