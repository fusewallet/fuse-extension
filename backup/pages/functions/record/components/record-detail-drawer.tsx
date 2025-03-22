import { useDisclosure } from '@heroui/react';
import dayjs from 'dayjs';
import CopyToClipboard from 'react-copy-to-clipboard';
import { toast } from 'sonner';

import Icon from '~components/icon';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from '~components/ui/drawer';
import { truncate_principal } from '~lib/utils/text';
import { match_fuse_record, type FuseRecord } from '~types/records';
import type { ApprovedIcRecord } from '~types/records/approved/approved_ic';
import type { ConnectedRecord } from '~types/records/connected';
import type { TokenTransferredIcRecord } from '~types/records/token/transferred_ic';

const RecordDetailConnected = ({ value }: { value: ConnectedRecord }) => {
    return (
        <>
            <div className="flex w-full items-center justify-between border-b border-[#222222] p-3">
                <span className="text-sm text-[#999999]">title</span>
                <span className="flex items-center text-sm">
                    {value?.favicon ? (
                        <img src={value.favicon} className="mr-1 h-[18px] w-[18px] rounded-full" />
                    ) : (
                        <Icon name="icon-web" className="mr-1 h-[18px] w-[18px] rounded-full"></Icon>
                    )}
                    <p className="max-w-[220px] truncate">{value.title}</p>
                </span>
            </div>
            <div className="flex w-full items-center justify-between border-b border-[#222222] p-3">
                <span className="text-sm text-[#999999]">Chain</span>
                <span className="text-sm">{value.chain}</span>
            </div>
            <div className="flex w-full items-center justify-between border-b border-[#222222] p-3">
                <span className="text-sm text-[#999999]">Origin</span>
                <span className="max-w-[220px] truncate text-sm">{value.origin}</span>
            </div>
            <div className="flex w-full items-center justify-between border-b border-[#222222] p-3">
                <span className="text-sm text-[#999999]">Created Time</span>
                <span className="text-sm">{dayjs(value.created).format('MM/DD/YYYY HH:mm:ss')}</span>
            </div>
            <div className="flex w-full items-center justify-between border-b border-[#222222] p-3">
                <span className="text-sm text-[#999999]">Type</span>
                <span className="text-sm">{value.type}</span>
            </div>
            <div className="flex w-full items-center justify-between border-b border-[#222222] p-3">
                <span className="text-sm text-[#999999]">State</span>
                <span className="text-sm">
                    {typeof value.state === 'string' ? value.state : Object.keys(value.state)}
                </span>
            </div>
        </>
    );
};

const RecordDetailApproved = ({ value }: { value: ApprovedIcRecord }) => {
    console.log('🚀 ~ RecordDetailApproved ~ value:', value);
    return (
        <>
            <div className="flex w-full items-center justify-between border-b border-[#222222] p-3">
                <span className="text-sm text-[#999999]">Type</span>
                <span className="text-sm">{value.type}</span>
            </div>
            <div className="flex w-full items-center justify-between border-b border-[#222222] p-3">
                <span className="text-sm text-[#999999]">Chain</span>
                <span className="text-sm">{value.chain}</span>
            </div>
            <div className="flex w-full items-center justify-between border-b border-[#222222] p-3">
                <span className="text-sm text-[#999999]">Canister id</span>
                <span className="flex items-center text-sm">
                    {value.canister_id}
                    <CopyToClipboard text={value.canister_id} onCopy={() => toast.success('Copied')}>
                        <div>
                            <Icon
                                name="icon-copy"
                                className="ml-2 h-3 w-3 cursor-pointer text-[#EEEEEE] duration-300 hover:text-[#FFCF13]"
                            />
                        </div>
                    </CopyToClipboard>
                </span>
            </div>
            <div className="flex w-full items-center justify-between border-b border-[#222222] p-3">
                <span className="text-sm text-[#999999]">Method</span>
                <span className="text-sm">{value.method}</span>
            </div>
            <div className="flex w-full items-center justify-between border-b border-[#222222] p-3">
                <span className="text-sm text-[#999999]">Created Time</span>
                <span className="text-sm">{dayjs(value.created).format('MM/DD/YYYY HH:mm:ss')}</span>
            </div>
        </>
    );
};

const RecordDetailTransferred = ({ value }: { value: TokenTransferredIcRecord }) => {
    console.log('🚀 ~ RecordDetailTransferred ~ value:', value);

    return (
        <>
            <div className="flex w-full items-center justify-between border-b border-[#222222] p-3">
                <span className="text-sm text-[#999999]">Type</span>
                <span className="text-sm">{value.type}</span>
            </div>
            <div className="flex w-full items-center justify-between border-b border-[#222222] p-3">
                <span className="text-sm text-[#999999]">Chain</span>
                <span className="text-sm">{value.chain}</span>
            </div>
            <div className="flex w-full items-center justify-between border-b border-[#222222] p-3">
                <span className="text-sm text-[#999999]">Owner</span>
                <span className="flex items-center text-sm">
                    {typeof value.to === 'string' ? truncate_principal(value.to) : truncate_principal(value.to.owner)}
                    <CopyToClipboard text={value.canister_id} onCopy={() => toast.success('Copied')}>
                        <div>
                            <Icon
                                name="icon-copy"
                                className="ml-2 h-3 w-3 cursor-pointer text-[#EEEEEE] duration-300 hover:text-[#FFCF13]"
                            />
                        </div>
                    </CopyToClipboard>
                </span>
            </div>
            <div className="flex w-full items-center justify-between border-b border-[#222222] p-3">
                <span className="text-sm text-[#999999]">Amount</span>
                <span className="text-sm">{value.amount ? Number(value.amount) / 10 ** 8 : '--'} ICP</span>
            </div>
            <div className="flex w-full items-center justify-between border-b border-[#222222] p-3">
                <span className="text-sm text-[#999999]">Canister id</span>
                <span className="flex items-center text-sm">
                    {value.canister_id}
                    <CopyToClipboard text={value.canister_id} onCopy={() => toast.success('Copied')}>
                        <div>
                            <Icon
                                name="icon-copy"
                                className="ml-2 h-3 w-3 cursor-pointer text-[#EEEEEE] duration-300 hover:text-[#FFCF13]"
                            />
                        </div>
                    </CopyToClipboard>
                </span>
            </div>
            <div className="flex w-full items-center justify-between border-b border-[#222222] p-3">
                <span className="text-sm text-[#999999]">Method</span>
                <span className="text-sm">{value.method}</span>
            </div>
            <div className="flex w-full items-center justify-between border-b border-[#222222] p-3">
                <span className="text-sm text-[#999999]">Created Time</span>
                <span className="text-sm">{dayjs(value.created).format('MM/DD/YYYY HH:mm:ss')}</span>
            </div>
            {value.state.ok && (
                <div className="flex w-full items-center justify-between border-b border-[#222222] p-3">
                    <span className="text-sm text-[#999999]">Height</span>
                    <span className="text-sm">{value.state.ok}</span>
                </div>
            )}
        </>
    );
};

const RecordDetailDrawer = ({
    container,
    handleCloseDetail,
    currentDetail,
}: {
    container?: HTMLElement | null;
    handleCloseDetail: () => void;
    currentDetail: FuseRecord;
}) => {
    const { onOpenChange } = useDisclosure();

    return (
        <Drawer open={!!currentDetail} onOpenChange={onOpenChange} container={container}>
            <DrawerContent
                className="flex h-full !max-h-full w-full flex-col items-center justify-between border-0 bg-transparent pt-[50px]"
                overlayClassName="bg-black/50"
            >
                <DrawerHeader className="w-full shrink-0 border-t border-[#333333] bg-[#0a0600] px-5 pb-0 pt-1 text-left">
                    <DrawerTitle>
                        <div className="flex w-full items-center justify-between py-3">
                            <span className="text-sm text-white">
                                {match_fuse_record(currentDetail, {
                                    connected: () => `Connected`,
                                    token_transferred_ic: () => `Transferred`,
                                    approved_ic: () => `Approved`,
                                })}
                            </span>
                            <DrawerClose>
                                <span
                                    onClick={handleCloseDetail}
                                    className="cursor-pointer text-sm text-[#FFCF13] transition duration-300 hover:opacity-85"
                                >
                                    Close
                                </span>
                            </DrawerClose>
                        </div>
                    </DrawerTitle>
                    <DrawerDescription className="hidden" />
                </DrawerHeader>

                <div className="flex h-full w-full flex-col bg-[#0a0600] px-5 pb-5">
                    {match_fuse_record(currentDetail, {
                        connected: (connected) => <RecordDetailConnected value={connected} />,
                        token_transferred_ic: (token_transferred_ic) => (
                            <RecordDetailTransferred value={token_transferred_ic} />
                        ),
                        approved_ic: (approved_ic) => <RecordDetailApproved value={approved_ic} />,
                    })}
                </div>
            </DrawerContent>
        </Drawer>
    );
};

export default RecordDetailDrawer;
