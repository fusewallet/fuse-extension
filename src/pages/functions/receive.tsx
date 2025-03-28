import { isCanisterIdText } from '@choptop/haw';
import CHAIN_BSC_SVG from 'data-base64:~assets/svg/chains/bsc.min.svg';
import CHAIN_ETH_SVG from 'data-base64:~assets/svg/chains/eth.min.svg';
import CHAIN_IC_SVG from 'data-base64:~assets/svg/chains/ic.min.svg';
import CHAIN_POL_SVG from 'data-base64:~assets/svg/chains/pol.min.svg';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useMemo, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { useLocation } from 'react-router-dom';

// import ic_svg from '~assets/svg/chains/ic.min.svg';
import Icon from '~components/icon';
import { FusePage } from '~components/layouts/page';
import { FusePageTransition } from '~components/layouts/transition';
import { useCurrentState } from '~hooks/memo/current_state';
import { useGoto } from '~hooks/memo/goto';
import { useCurrentIdentity } from '~hooks/store/local-secure';
import { useSonnerToast } from '~hooks/toast';
import TokenLogo from '~pages/home/components/token-logo';
import { match_chain, type Chain } from '~types/chain';

import { FunctionHeader } from './components/header';

function FunctionReceivePage() {
    const toast = useSonnerToast();
    const location = useLocation();
    const current_state = useCurrentState();

    const { setHide, goto } = useGoto();
    const [, setCanisterId] = useState<string>('');
    const [chain, setChain] = useState<Chain>();
    const [address, setAddress] = useState<`0x${string}`>();

    useEffect(() => {
        const address = location.state.address;
        const chain = location.state.chain;

        if (chain === 'ic') {
            if (!address || !isCanisterIdText(address)) return goto('/', { replace: true });

            setCanisterId(address);
            setChain(chain);
            return;
        }

        setAddress(address);
        setChain(chain);
    }, [goto, location]);

    const { current_identity } = useCurrentIdentity();
    const [activeTab, setActiveTab] = useState<'principal' | 'account'>('principal');

    const chain_address = useMemo(() => {
        const address = current_identity?.address;
        if (!address || !chain) return;

        return match_chain(chain, {
            ic: () => address.ic?.owner,
            ethereum: () => address.ethereum?.address,
            ethereum_test_sepolia: () => address.ethereum_test_sepolia?.address,
            polygon: () => address.polygon?.address,
            polygon_test_amoy: () => address.polygon_test_amoy?.address,
            bsc: () => address.bsc?.address,
            bsc_test: () => address.bsc_test?.address,
        });
    }, [chain, current_identity?.address]);

    const chain_name = useMemo(() => {
        if (!chain) return;

        return match_chain(chain, {
            ic: () => 'IC',
            ethereum: () => 'ETH',
            ethereum_test_sepolia: () => 'ETH Sepolia',
            polygon: () => 'POL',
            polygon_test_amoy: () => 'POL Amoy',
            bsc: () => 'BSC',
            bsc_test: () => 'BSC Test',
        });
    }, [chain]);

    const isIc = useMemo(() => chain === 'ic', [chain]);

    if (!chain) return null;

    const getLogo = (chain: Chain) => {
        if (chain === 'ic') return CHAIN_IC_SVG;
        if (chain.indexOf('ethereum') >= 0) return CHAIN_ETH_SVG;
        if (chain.indexOf('pol') >= 0) return CHAIN_POL_SVG;
        if (chain.indexOf('bsc') >= 0) return CHAIN_BSC_SVG;
    };

    return (
        <FusePage current_state={current_state}>
            <FusePageTransition setHide={setHide}>
                <div className="relative flex h-full w-full flex-col items-center justify-start pt-[52px]">
                    <FunctionHeader
                        title={'Receive'}
                        onBack={() => goto(-1)}
                        onClose={() => goto('/', { replace: true })}
                    />

                    <div className="h-full w-full flex-1 overflow-y-auto px-5">
                        {isIc && (
                            <div className="mx-auto mt-5 grid w-[220px] grid-cols-2 rounded-full bg-[#181818] p-1">
                                <span
                                    className={`w-full cursor-pointer rounded-full py-2 text-center text-sm transition-all duration-300 ${activeTab === 'principal' ? 'bg-[#333333]' : 'text-[#999999]'}`}
                                    onClick={() => setActiveTab('principal')}
                                >
                                    Principal ID
                                </span>
                                <span
                                    className={`w-full cursor-pointer rounded-full py-2 text-center text-sm transition-all duration-300 ${activeTab === 'account' ? 'bg-[#333333]' : 'text-[#999999]'}`}
                                    onClick={() => setActiveTab('account')}
                                >
                                    Account ID
                                </span>
                            </div>
                        )}
                        <div className="flex flex-col items-center justify-center py-10">
                            <div className="relative h-[160px] w-[160px] overflow-hidden rounded-xl bg-white">
                                {isIc && (
                                    <>
                                        <img
                                            src={getLogo(chain)}
                                            className="absolute left-1/2 top-1/2 z-10 h-10 w-10 -translate-x-1/2 -translate-y-1/2 transform rounded-full border-[2px] border-white"
                                        />
                                        <div className="flex h-full w-full items-center justify-center">
                                            {activeTab === 'principal' && current_identity?.address?.ic?.owner && (
                                                <QRCodeSVG value={current_identity?.address?.ic?.owner} size={140} />
                                            )}
                                            {activeTab === 'account' && current_identity?.address?.ic?.account_id && (
                                                <QRCodeSVG
                                                    value={current_identity?.address?.ic?.account_id}
                                                    size={140}
                                                />
                                            )}
                                        </div>
                                    </>
                                )}

                                {!isIc && chain_address && (
                                    <>
                                        <div className="absolute left-1/2 top-1/2 z-10 h-10 w-10 -translate-x-1/2 -translate-y-1/2 transform rounded-full border-white">
                                            <TokenLogo address={`${address}`} chain={chain} />
                                        </div>
                                        <div className="flex h-full w-full items-center justify-center">
                                            <QRCodeSVG value={chain_address} size={140} />
                                        </div>
                                    </>
                                )}
                            </div>

                            {!isIc && (
                                <div className="mt-4 text-sm text-[#999]">
                                    Only supports <span className="text-[#eee]">{chain_name} Chain</span> assets
                                </div>
                            )}
                        </div>

                        {!isIc && (
                            <>
                                <div className="w-full rounded-xl bg-[#181818] px-3">
                                    {chain_address && (
                                        <div className="w-full py-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-[#999999]">Address</span>
                                                <CopyToClipboard
                                                    text={chain_address}
                                                    onCopy={() => toast.success('Copied')}
                                                >
                                                    <div className="flex cursor-pointer items-center text-sm text-[#FFCF13] duration-300 hover:opacity-85">
                                                        <Icon name="icon-copy" className="mr-2 h-3 w-3" />
                                                        Copy
                                                    </div>
                                                </CopyToClipboard>
                                            </div>
                                            <p className="block w-full break-words py-2 text-sm">{chain_address}</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {isIc && activeTab === 'principal' && (
                            <div className="w-full rounded-xl bg-[#181818] px-3">
                                {chain_address && (
                                    <div className="w-full py-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-[#999999]">Principal ID</span>
                                            <CopyToClipboard
                                                text={chain_address}
                                                onCopy={() => toast.success('Copied')}
                                            >
                                                <div className="flex cursor-pointer items-center text-sm text-[#FFCF13] duration-300 hover:opacity-85">
                                                    <Icon name="icon-copy" className="mr-2 h-3 w-3" />
                                                    Copy
                                                </div>
                                            </CopyToClipboard>
                                        </div>
                                        <p className="block w-full break-words py-2 text-sm">{chain_address}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {isIc && activeTab === 'account' && (
                            <div className="w-full rounded-xl bg-[#181818] px-3">
                                {current_identity?.address?.ic?.account_id && (
                                    <div className="w-full py-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-[#999999]">Account ID</span>
                                            <CopyToClipboard
                                                text={current_identity?.address?.ic?.account_id}
                                                onCopy={() => toast.success('Copied')}
                                            >
                                                <div className="flex cursor-pointer items-center text-sm text-[#FFCF13] duration-300 hover:opacity-85">
                                                    <Icon name="icon-copy" className="mr-2 h-3 w-3" />
                                                    Copy
                                                </div>
                                            </CopyToClipboard>
                                        </div>
                                        <p className="block w-full break-words py-2 text-sm">
                                            {current_identity?.address?.ic?.account_id}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </FusePageTransition>
        </FusePage>
    );
}

export default FunctionReceivePage;
