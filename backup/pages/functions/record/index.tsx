import { Button } from '@heroui/react';
import dayjs from 'dayjs';
import { useMemo, useRef, useState } from 'react';

import { FusePage } from '~components/layouts/page';
import { FusePageTransition } from '~components/layouts/transition';
import { useCurrentState } from '~hooks/memo/current_state';
import { useGoto } from '~hooks/memo/goto';
import { useCurrentIdentity } from '~hooks/store/local-secure';
import { useFuseRecordList } from '~hooks/store/local/memo/record';
import { get_fuse_record_created, type FuseRecord } from '~types/records';

import { FunctionHeader } from '../components/header';
import RecordDetailDrawer from './components/record-detail-drawer';
import { RecordItem, RecordNoData } from './components/record-list';

const getDateString = (timestamp: number) => dayjs(timestamp).format('MM/DD/YYYY');

function FunctionRecordsPage() {
    const current_state = useCurrentState();
    const { setHide, goto } = useGoto();
    const { current_identity_network } = useCurrentIdentity();

    const [list, { done, load }] = useFuseRecordList(current_identity_network);
    // console.debug(`🚀 ~ RecordPage ~ list:`, list, done, load);

    const [currentDetail, setCurrentDetail] = useState<FuseRecord | undefined>(undefined);

    const groupedRecords = useMemo(() => {
        return list.reduce<Record<string, FuseRecord[]>>((acc, item) => {
            const created = get_fuse_record_created(item);
            const dateKey = getDateString(created);

            (acc[dateKey] ||= []).push(item);

            return acc;
        }, {});
    }, [list]);

    const loadMore = () => {
        load(list.length + 10);
    };

    const ref = useRef<HTMLDivElement>(null);

    return (
        <FusePage current_state={current_state}>
            <FusePageTransition setHide={setHide}>
                <div ref={ref} className="relative flex h-full w-full flex-col items-center justify-start pt-[52px]">
                    <FunctionHeader title="History" onBack={() => goto('/')} />

                    <div className="w-full flex-1 overflow-y-auto">
                        {!list || list.length === 0 ? (
                            <RecordNoData />
                        ) : (
                            <div className="flex flex-col">
                                {Object.entries(groupedRecords).map(([date, records]) => (
                                    <div key={date} className="flex flex-col">
                                        <div className="px-5 py-[5px] text-xs text-[#999999]">{date}</div>
                                        {records.map((record, idx) => (
                                            <RecordItem
                                                key={idx}
                                                itemData={record}
                                                handleOpenDetail={() => setCurrentDetail(record)}
                                            />
                                        ))}
                                    </div>
                                ))}

                                {done && (
                                    <div className="px-5 pb-[15px]">
                                        <Button
                                            className="h-12 w-full rounded-xl bg-[#FFCF13] text-lg font-semibold text-black"
                                            onPress={loadMore}
                                        >
                                            Load More
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {currentDetail && (
                        <RecordDetailDrawer
                            container={ref.current ?? undefined}
                            handleCloseDetail={() => setCurrentDetail(undefined)}
                            currentDetail={currentDetail}
                        />
                    )}
                </div>
            </FusePageTransition>
        </FusePage>
    );
}

export default FunctionRecordsPage;
