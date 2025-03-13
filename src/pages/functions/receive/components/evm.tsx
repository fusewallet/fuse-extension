import { QRCodeSVG } from 'qrcode.react';
import CopyToClipboard from 'react-copy-to-clipboard';

import eth_svg from '~assets/svg/chains/eth.svg';
import Icon from '~components/icon';
import { useCurrentIdentity } from '~hooks/store/local-secure';
import { useSonnerToast } from '~hooks/toast';

export default function EVMReceivePage() {
    const { current_identity } = useCurrentIdentity();
    const toast = useSonnerToast();

    return (
        <div className="h-full w-full flex-1 overflow-y-auto px-5">
            <div className="flex justify-center py-10">
                {current_identity?.address?.evm?.address && (
                    <div className="relative h-[160px] w-[160px] overflow-hidden rounded-xl bg-white">
                        <img
                            src={eth_svg}
                            className="absolute left-1/2 top-1/2 z-10 h-10 w-10 -translate-x-1/2 -translate-y-1/2 transform rounded-full border-[2px] border-white"
                        />
                        <div className="flex h-full w-full items-center justify-center">
                            <QRCodeSVG value={current_identity.address.evm.address} size={140} />
                        </div>
                    </div>
                )}
            </div>
            <div className="w-full rounded-xl bg-[#181818] px-3">
                {current_identity?.address?.evm?.address && (
                    <div className="w-full py-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-[#999999]">Address</span>
                            <CopyToClipboard
                                text={current_identity.address.evm.address}
                                onCopy={() => toast.success('Copied')}
                            >
                                <div className="flex cursor-pointer items-center text-sm text-[#FFCF13] duration-300 hover:opacity-85">
                                    <Icon name="icon-copy" className="mr-2 h-3 w-3" />
                                    Copy
                                </div>
                            </CopyToClipboard>
                        </div>
                        <p className="block w-full break-words py-2 text-sm">{current_identity.address.evm.address}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
