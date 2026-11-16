import { anonymous } from '@choptop/haw';
import { useEffect, useState } from 'react';

import Icon from '~components/icon';
import { icrc1_logo } from '~lib/canisters/icrc1';
import { cn } from '~lib/utils/cn';
import { truncate_text } from '~lib/utils/text';
import { match_fuse_record, type FuseRecord } from '~types/records';
import type { ApprovedIcRecord } from '~types/records/approved/approved_ic';
import type { ConnectedRecord } from '~types/records/connected';
import type { TokenTransferredIcRecord } from '~types/records/token/transferred_ic';

export const RecordNoData = () => {
    return (
        <div className="flex h-full w-full flex-col items-center justify-center">
            <Icon name="icon-empty" className="h-[70px] w-[70px] text-[#999999]" />
            <p className="text-sm text-[#999999]">No data found</p>
        </div>
    );
};

const RecordItemConnected = ({ value }: { value: ConnectedRecord }) => {
    return (
        <>
            <div className="flex items-center">
                {value?.favicon ? (
                    <img src={value.favicon} className="h-10 w-10 rounded-full" />
                ) : (
                    <Icon name="icon-web" className="h-10 w-10 rounded-full"></Icon>
                )}
                <div className="ml-[10px]">
                    <strong className="block text-base text-[#EEEEEE]">Connected</strong>
                    <p className="max-w-[150px] truncate text-xs text-[#999999]">To {value.title}</p>
                </div>
            </div>
            <p className="max-w-[150px] truncate text-base font-semibold text-[#EEEEEE]">{value.origin}</p>
        </>
    );
};

const RecordItemApprovedIc = ({ value }: { value: ApprovedIcRecord }) => {
    const [logo, setLogo] = useState<string>();

    useEffect(() => {
        icrc1_logo(anonymous, value.canister_id).then((logo) => {
            if (logo) {
                setLogo(logo);
            }
        });
    }, [value]);

    return (
        <>
            <div className="flex items-center">
                {logo ? (
                    <img src={logo} className="h-10 w-10 rounded-full" />
                ) : (
                    <Icon name="icon-defaultImg" className="h-10 w-10"></Icon>
                )}

                <div className="ml-[10px]">
                    <strong className="block text-base text-[#EEEEEE]">{value.method}</strong>
                    <span className="text-xs text-[#999999]">To {value.canister_id}</span>
                </div>
            </div>
        </>
    );
};

const RecordItemTokenTransferredIc = ({ value }: { value: TokenTransferredIcRecord }) => {
    console.log('🚀 ~ RecordItemTokenTransferredIc ~ value:', value);

    return (
        <>
            <div className="flex items-center">
                <img
                    src="https://metrics.icpex.org/images/ryjl3-tyaaa-aaaaa-aaaba-cai.png"
                    className="h-10 w-10 rounded-full"
                />
                <div className="ml-[10px]">
                    <strong className="block text-base text-[#EEEEEE]">Send</strong>
                    <span className="text-xs text-[#999999]">
                        To {truncate_text(typeof value.to === 'string' ? value.to : value.to.owner)}
                    </span>
                </div>
            </div>
            <div className={cn('text-base font-semibold text-[#EEEEEE]')}>
                {value.amount ? Number(value.amount) / 10 ** 8 : '--'} ICP
            </div>
        </>
    );
};

export const RecordItem = ({
    itemData,
    handleOpenDetail,
}: {
    itemData: FuseRecord;
    handleOpenDetail: (itemData: FuseRecord) => void;
}) => {
    return (
        <>
            <div
                className="flex w-full cursor-pointer items-center justify-between px-5 py-[10px] transition duration-300 hover:bg-[#333333]"
                onClick={() => handleOpenDetail(itemData)}
            >
                {match_fuse_record(itemData, {
                    connected: (connected) => <RecordItemConnected value={connected} />,
                    token_transferred_ic: (token_transferred_ic) => (
                        <RecordItemTokenTransferredIc value={token_transferred_ic} />
                    ),
                    approved_ic: (approved_ic) => <RecordItemApprovedIc value={approved_ic} />,
                })}
            </div>
        </>
    );
};
