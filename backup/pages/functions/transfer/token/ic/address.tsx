import { Button } from '@heroui/react';
import _ from 'lodash';
import { useMemo, useState } from 'react';

import { useMarkedAddresses, useRecentAddresses } from '~hooks/store/local-secure';
import { check_chain_address, type ChainAddress } from '~types/address';

function FunctionTransferTokenIcAddressPage({ logo, onNext }: { logo?: string; onNext: (to: string) => void }) {
    const [marked] = useMarkedAddresses();
    const [recent] = useRecentAddresses();
    const addresses = useMemo<{ name?: string; address: ChainAddress }[]>(() => {
        const addresses = [];
        // do filter ic address
        for (const m of (marked ?? []).filter((m) => m.address.type === 'ic')) addresses.push(m);
        let _recent = [...(recent ?? [])];
        _recent = _recent.filter((m) => m.address.type === 'ic');
        _recent = _.uniqBy(_recent, (r) => r.address.address);
        _recent = _.reverse(_recent);
        for (const r of _recent) addresses.push(r);
        return addresses;
    }, [marked, recent]);

    const [to, setTo] = useState<string>('');

    return (
        <div className="flex h-full w-full flex-col justify-between">
            <div className="flex w-full flex-1 flex-col">
                <div className="w-full px-5">
                    <div className="mb-8 mt-5 flex w-full justify-center">
                        <img
                            src={logo ?? 'https://metrics.icpex.org/images/ryjl3-tyaaa-aaaaa-aaaba-cai.png'}
                            className="h-[50px] w-[50px] rounded-full"
                        />
                    </div>
                    <input
                        type="text"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        placeholder="Principal ID or Account ID"
                        className="h-[48px] w-full rounded-xl border border-[#333333] bg-transparent px-2 text-sm text-[#EEEEEE] outline-none duration-300 placeholder:text-[#999999] hover:border-[#FFCF13] focus:border-[#FFCF13]"
                    />
                </div>
                <div className="relative w-full flex-1">
                    <h2 className="font-xs px-5 pb-4 pt-3 text-[#999999]">Recent Address</h2>
                    <div className="absolute bottom-0 left-0 top-10 w-full overflow-y-auto">
                        {addresses.map((address, index) => (
                            <div
                                key={index}
                                onClick={() => setTo(address.address.address)}
                                className="block w-full cursor-pointer break-words px-5 py-2 text-xs text-[#EEEEEE] duration-300 hover:bg-[#333333]"
                            >
                                {address.address.address} {address.name && <span>{address.name}</span>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="w-full p-5">
                <Button
                    className="h-[48px] w-full bg-[#FFCF13] text-lg font-semibold text-black"
                    isDisabled={!check_chain_address({ type: 'ic', address: to })}
                    onPress={() => onNext(to)}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}

export default FunctionTransferTokenIcAddressPage;
