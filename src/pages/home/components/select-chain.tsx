import { Switch } from '@heroui/switch';
import { useCallback, useEffect, useMemo, useState } from 'react';

import CHAIN_BSC_SVG from 'data-base64:~assets/svg/chains/bsc.min.svg';
import CHAIN_ETH_SVG from 'data-base64:~assets/svg/chains/eth.min.svg';
import CHAIN_IC_SVG from 'data-base64:~assets/svg/chains/ic.min.svg';
import CHAIN_POLYGON_SVG from 'data-base64:~assets/svg/chains/pol.min.svg';

import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '~components/ui/drawer';
import { useShowChains } from '~hooks/store/local';
import { cn } from '~lib/utils/cn';
import { type Chain } from '~types/chain';
import { DEFAULT_CURRENT_CHAIN_NETWORK } from '~types/network';

interface ChainItem {
    chain: Chain;
    name: string;
    logo: string | undefined;
}

interface SelectChainProps {
    trigger?: React.ReactNode;
    container?: HTMLElement | null;
}

const getLogo = (chain: Chain) => {
    if (chain === 'ic') return CHAIN_IC_SVG;
    if (chain.indexOf('ethereum') >= 0) return CHAIN_ETH_SVG;
    if (chain.indexOf('polygon') >= 0) return CHAIN_POLYGON_SVG;
    if (chain.indexOf('bsc') >= 0) return CHAIN_BSC_SVG;
};

const SelectChain = ({ trigger, container }: SelectChainProps) => {
    const [open, setOpen] = useState(false);

    const [show_chains, setShowChains] = useShowChains();

    const [test, setTest] = useState(false);
    useEffect(() => {
        setTest(!!show_chains.find((chain) => 0 <= chain.indexOf('test')));
    }, [show_chains]);

    const chains = useMemo<ChainItem[]>(() => {
        return Object.entries(DEFAULT_CURRENT_CHAIN_NETWORK).map(([, value]) => ({
            chain: value.chain,
            name: value.name,
            logo: getLogo(value.chain),
        }));
    }, []);

    const switchChain = useCallback(
        (chain: Chain, show: boolean) => {
            if (show && !show_chains.includes(chain)) {
                setShowChains([...show_chains, chain]);
            } else if (!show && show_chains.includes(chain)) {
                setShowChains(show_chains.filter((c) => c !== chain));
            }
        },
        [show_chains, setShowChains],
    );

    return (
        <Drawer open={open} onOpenChange={setOpen} container={container}>
            <DrawerTrigger className="">{trigger}</DrawerTrigger>
            <DrawerContent className="!h-full">
                <DrawerHeader className="border-t border-[#333333] bg-[#0a0600] text-left">
                    <DrawerTitle>
                        <div className="flex w-full items-center justify-between text-white">
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
                    {chains
                        .filter((c) => (test ? true : c.chain.indexOf('test') < 0))
                        .map((item) => (
                            <div
                                key={item.chain}
                                className={cn(
                                    'my-2 flex w-full cursor-pointer items-center justify-between rounded-xl border border-[#333333] bg-[#0a0600] p-4 transition duration-300 hover:border-[#FFCF13]',
                                )}
                            >
                                <div className="flex items-center">
                                    <div className="relative mr-3 flex h-10 w-10 items-center justify-center rounded-full">
                                        {typeof item.logo === 'string' && (
                                            <img src={item.logo} alt={item.name} className="h-10 w-10" />
                                        )}
                                        {typeof item.logo === 'object' && (
                                            <div className="h-10 w-10 rounded-full bg-[#FFCF13] p-2">{item.logo}</div>
                                        )}
                                    </div>
                                    <span className="text-base text-white">{item.name}</span>
                                </div>
                                <Switch
                                    isSelected={show_chains.includes(item.chain)}
                                    onValueChange={(show) => switchChain(item.chain, show)}
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
                        <Switch isSelected={test} onValueChange={(test) => setTest(test)} color="success" size="sm" />
                    </div>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
};

export default SelectChain;
