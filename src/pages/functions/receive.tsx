import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';

import ic_svg from '~assets/svg/chains/ic.min.svg';
import Icon from '~components/icon';
import { FusePage } from '~components/layouts/page';
import { FusePageTransition } from '~components/layouts/transition';
import { showToast } from '~components/toast';
import { useCurrentState } from '~hooks/memo/current_state';
import { useGoto } from '~hooks/memo/goto';
import { useCurrentIdentity } from '~hooks/store/local-secure';

import { FunctionHeader } from './components/header';

function FunctionReceivePage() {
    const current_state = useCurrentState();

    const { setHide, goto } = useGoto();

    const { current_identity } = useCurrentIdentity();
    const [activeTab, setActiveTab] = useState<'principal' | 'account'>('principal');
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
                        <div className="flex justify-center py-10">
                            {current_identity?.address?.ic?.owner && (
                                <div className="relative h-[160px] w-[160px] overflow-hidden rounded-xl bg-white">
                                    <img
                                        src={ic_svg}
                                        className="absolute left-1/2 top-1/2 z-10 h-10 w-10 -translate-x-1/2 -translate-y-1/2 transform rounded-full border-[2px] border-white"
                                    />
                                    <div className="flex h-full w-full items-center justify-center">
                                        <QRCodeSVG value={current_identity?.address?.ic?.owner} size={140} />
                                    </div>
                                </div>
                            )}
                        </div>
                        {activeTab === 'principal' ? (
                            <div className="w-full rounded-xl bg-[#181818] px-3">
                                {current_identity?.address?.ic?.owner && (
                                    <div className="w-full py-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-[#999999]">Principal ID</span>
                                            <CopyToClipboard
                                                text={current_identity?.address?.ic?.owner}
                                                onCopy={() => {
                                                    showToast('Copied', 'success');
                                                }}
                                            >
                                                <div className="flex cursor-pointer items-center text-sm text-[#FFCF13] duration-300 hover:opacity-85">
                                                    <Icon name="icon-copy" className="mr-2 h-3 w-3" />
                                                    Copy
                                                </div>
                                            </CopyToClipboard>
                                        </div>
                                        <p className="block w-full break-words py-2 text-sm">
                                            {current_identity?.address?.ic?.owner}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="w-full rounded-xl bg-[#181818] px-3">
                                {current_identity?.address?.ic?.account_id && (
                                    <div className="w-full py-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-[#999999]">Account ID</span>
                                            <CopyToClipboard
                                                text={current_identity?.address?.ic?.account_id}
                                                onCopy={() => {
                                                    showToast('Copied', 'success');
                                                }}
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
