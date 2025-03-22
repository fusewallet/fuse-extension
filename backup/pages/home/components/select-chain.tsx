import { Switch } from '@heroui/react';
import CHAIN_BSC_SVG from 'data-base64:~assets/svg/chains/bsc.min.svg';
import CHAIN_ETH_SVG from 'data-base64:~assets/svg/chains/eth.min.svg';
import CHAIN_IC_SVG from 'data-base64:~assets/svg/chains/ic.min.svg';
import CHAIN_POL_SVG from 'data-base64:~assets/svg/chains/pol.min.svg';
import { useMemo, useState } from 'react';

import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '~components/ui/drawer';
import { useCurrentChainNetwork, useShowNetworks } from '~hooks/store/local-secure';
import { cn } from '~lib/utils/cn';
import { type Chain } from '~types/chain';

interface ChainItem {
    id: Chain;
    name: string;
    logo: string | undefined;
}

interface SelectChainProps {
    trigger?: React.ReactNode;
    container?: HTMLElement | null;
    // onSelectChain?: (chain: string | undefined) => void;
}

const SelectChain = ({ trigger, container }: SelectChainProps) => {
    const [open, setOpen] = useState(false);

    const current_chain_network = useCurrentChainNetwork();

    const [
        { chains: current_show_networks, showTestNetworks },
        { pushOrUpdateShowNetworks, setShowTestNetworks },
        test_networks,
    ] = useShowNetworks();

    const getLogo = (chain: Chain) => {
        if (chain === 'ic') return CHAIN_IC_SVG;
        if (chain.indexOf('ethereum') >= 0) return CHAIN_ETH_SVG;
        if (chain.indexOf('pol') >= 0) return CHAIN_POL_SVG;
        if (chain.indexOf('bsc') >= 0) return CHAIN_BSC_SVG;
    };

    const chains = useMemo(() => {
        const chains: ChainItem[] = [];

        Object.entries(current_chain_network).map(([, value]) => {
            chains.push({
                id: value.chain,
                name: value.name,
                logo: getLogo(value.chain),
            });
        });

        const show_chains = chains.filter((c) => !test_networks.includes(c.id));

        return showTestNetworks ? chains : show_chains;
    }, [current_chain_network, showTestNetworks, test_networks]);

    // const handleSelectChain = (chainItem: ChainItem) => {
    //     const chain = chainItem.id;

    //     onSelectChain?.(chain);
    // };

    return (
        <Drawer open={open} onOpenChange={setOpen} container={container}>
            <DrawerTrigger className="">{trigger}</DrawerTrigger>
            <DrawerContent className="!h-full">
                <DrawerHeader className="border-t border-[#333333] bg-[#0a0600] text-left">
                    <DrawerTitle>
                        <div className="flex justify-between items-center w-full text-white">
                            <span className="text-sm">Select Chain</span>
                            <span
                                className="cursor-pointer text-sm text-[#FFCF13] transition duration-300 hover:opacity-85"
                                onClick={() => setOpen(false)}
                            >
                                Close
                            </span>
                        </div>
                    </DrawerTitle>
                    <DrawerDescription />
                </DrawerHeader>
                <div className="w-full flex-1 overflow-y-auto bg-[#0a0600] px-5 pb-3">
                    {chains.map((item) => (
                        <div
                            key={item.id}
                            className={cn(
                                'my-2 flex w-full cursor-pointer items-center justify-between rounded-xl border border-[#333333] bg-[#0a0600] p-4 transition duration-300 hover:border-[#FFCF13]',
                            )}
                        >
                            <div className="flex items-center">
                                <div className="flex relative justify-center items-center mr-3 w-10 h-10 rounded-full">
                                    {typeof item.logo === 'string' && (
                                        <img src={item.logo} alt={item.name} className="w-10 h-10" />
                                    )}
                                    {typeof item.logo === 'object' && (
                                        <div className="h-10 w-10 rounded-full bg-[#FFCF13] p-2">{item.logo}</div>
                                    )}
                                </div>
                                <span className="text-base text-white">{item.name}</span>
                            </div>
                            <Switch
                                isSelected={current_show_networks.includes(item.id)}
                                onValueChange={(s) => pushOrUpdateShowNetworks(item.id, s)}
                                color="success"
                                size="sm"
                            />
                        </div>
                    ))}
                </div>
                <DrawerFooter className="bg-[#0a0600] py-2">
                    <div
                        className={cn(
                            'flex w-full cursor-pointer items-center justify-between rounded-xl border border-[#333333] bg-[#0a0600] px-4 py-3 transition duration-300 hover:border-[#FFCF13]',
                        )}
                    >
                        <div className="flex items-center">
                            <span className="text-base text-white">Testnet Mode</span>
                        </div>
                        <Switch
                            isSelected={showTestNetworks}
                            onValueChange={(s) => setShowTestNetworks(s)}
                            color="success"
                            size="sm"
                        />
                    </div>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
};

export default SelectChain;
