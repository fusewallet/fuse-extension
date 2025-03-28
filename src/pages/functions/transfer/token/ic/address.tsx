import { Button } from '@heroui/react';
import _ from 'lodash';
import { useEffect, useMemo, useRef, useState } from 'react';

import Icon from '~components/icon';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '~components/ui/accordion';
import { useIdentityKeys, useMarkedAddresses, useRecentAddresses } from '~hooks/store/local-secure';
import { AddAddressDrawer } from '~pages/functions/settings/pages/address/components/drawer';
import { check_chain_address, type ChainAddress } from '~types/address';
import { match_chain, type Chain } from '~types/chain';
import type { IdentityAddress } from '~types/identity';

interface AddressItem {
    name?: string;
    address: ChainAddress;
}

function FunctionTransferTokenIcAddressPage({ logo, onNext }: { logo?: string; onNext: (to: string) => void }) {
    const [marked, { pushOrUpdateMarkedAddress }] = useMarkedAddresses();
    const [recent] = useRecentAddresses();
    const { current_identity, identity_list } = useIdentityKeys();

    const getChainAddress = (chain: Chain, address: IdentityAddress) => {
        if (!address) return;
        return match_chain(chain, {
            ic: () => address.ic?.owner,
            ethereum: () => address.ethereum?.address,
            ethereum_test_sepolia: () => address.ethereum_test_sepolia?.address,
            polygon: () => address.polygon?.address,
            polygon_test_amoy: () => address.polygon_test_amoy?.address,
            bsc: () => address.bsc?.address,
            bsc_test: () => address.bsc_test?.address,
        });
    };

    const [openAccordionItems, setOpenAccordionItems] = useState<string[]>(['1', '2', '3']);
    // const
    const markedAddresses = useMemo<AddressItem[]>(() => {
        const addresses = [];
        // do filter ic address
        for (const m of (marked ?? []).filter((m) => m.address.type === 'ic')) addresses.push(m);
        return addresses;
    }, [marked]);

    const recentAddresses = useMemo<AddressItem[]>(() => {
        const addresses = [];
        let _recent = [...(recent ?? [])];
        _recent = _recent.filter((m) => m.address.type === 'ic');
        _recent = _.uniqBy(_recent, (r) => r.address.address);
        _recent = _.reverse(_recent);
        for (const r of _recent) addresses.push(r);
        return addresses;
    }, [recent]);

    const wallets = useMemo<AddressItem[]>(() => {
        const addresses = [];
        // do filter ic address
        if (identity_list && identity_list.length > 0) {
            for (const i of identity_list) {
                const address = getChainAddress('ic', i.address);
                if (i.id !== current_identity && address) {
                    addresses.push({ name: i.name, address: { address } });
                }
            }
        }
        return addresses as unknown as AddressItem[];
    }, [current_identity, identity_list]);

    const [to, setTo] = useState<string>('');
    const [noAddressBook, setNoAddressBook] = useState<boolean>(false);

    useEffect(() => {
        if (!to) return setNoAddressBook(false);

        const allAddress = [...recentAddresses, ...markedAddresses, ...wallets];
        const _allAddress = _.uniqBy(allAddress, (a) => a.address.address);
        const had_address = _allAddress.find((a) => a.address.address === to);
        if (!had_address) {
            setNoAddressBook(true);
        } else {
            setNoAddressBook(false);
        }
    }, [markedAddresses, recentAddresses, to, wallets]);

    const ref = useRef<HTMLDivElement>(null);

    return (
        <div ref={ref} className="flex h-full w-full flex-col justify-between">
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
                {noAddressBook && (
                    <div className="mt-2 px-5 text-left text-sm text-[#999]">
                        <span>Not in address book</span>

                        <AddAddressDrawer
                            trigger={
                                <span className="ml-2 flex items-center text-[#FFCF13]">
                                    Add Now
                                    <Icon name="icon-arrow-right" className="h-3 w-3 cursor-pointer" />
                                </span>
                            }
                            container={ref.current ?? undefined}
                            onAddAddress={pushOrUpdateMarkedAddress}
                            address={to}
                        />
                    </div>
                )}
                <div className="relative w-full flex-1 px-5">
                    <Accordion
                        type="multiple"
                        defaultValue={openAccordionItems}
                        onValueChange={(vals) => setOpenAccordionItems(vals)}
                    >
                        {recentAddresses && recentAddresses.length > 0 && (
                            <AccordionItem value="1" className="border-[#333]">
                                <AccordionTrigger className="text-xs text-[#999]">Recent Address</AccordionTrigger>
                                <AccordionContent>
                                    {recentAddresses.map((address, index) => (
                                        <div
                                            key={index}
                                            onClick={() => setTo(address.address.address)}
                                            className="block w-full cursor-pointer break-words py-2 text-xs text-[#EEEEEE] duration-300 hover:bg-[#333333]"
                                        >
                                            {address.address.address} {address.name && <span>{address.name}</span>}
                                        </div>
                                    ))}
                                </AccordionContent>
                            </AccordionItem>
                        )}
                        {markedAddresses && markedAddresses.length > 0 && (
                            <AccordionItem value="2" className="border-[#333]">
                                <AccordionTrigger className="text-xs text-[#999]">Address Book</AccordionTrigger>
                                <AccordionContent>
                                    {markedAddresses.map((address, index) => (
                                        <div
                                            key={index}
                                            onClick={() => setTo(address.address.address)}
                                            className="block w-full cursor-pointer break-words py-2 text-xs text-[#EEEEEE] duration-300 hover:bg-[#333333]"
                                        >
                                            <div>{address.name && <span>{address.name}</span>}</div>
                                            {address.address.address}
                                        </div>
                                    ))}
                                </AccordionContent>
                            </AccordionItem>
                        )}
                        {wallets && wallets.length > 0 && (
                            <AccordionItem value="3" className="border-[#333]">
                                <AccordionTrigger className="text-xs text-[#999]">Wallets</AccordionTrigger>
                                <AccordionContent>
                                    {wallets.map((address, index) => (
                                        <div
                                            key={index}
                                            onClick={() => setTo(address.address.address)}
                                            className="block w-full cursor-pointer break-words py-2 text-xs text-[#EEEEEE] duration-300 hover:bg-[#333333]"
                                        >
                                            <div>{address.name && <span>{address.name}</span>}</div>
                                            {address.address.address}
                                        </div>
                                    ))}
                                </AccordionContent>
                            </AccordionItem>
                        )}
                    </Accordion>
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
