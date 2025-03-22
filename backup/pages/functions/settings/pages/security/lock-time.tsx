import { useEffect, useState } from 'react';

import Icon from '~components/icon';
import { FusePage } from '~components/layouts/page';
import { FusePageTransition } from '~components/layouts/transition';
import { useCurrentState } from '~hooks/memo/current_state';
import { useGoto } from '~hooks/memo/goto';
import { useUserSettingsIdle } from '~hooks/store/sync';
import { useSonnerToast } from '~hooks/toast';

import { FunctionHeader } from '../../../components/header';

interface LockTimeItem {
    id: number;
    expired: string;
    value: number;
}

const customTimes: LockTimeItem[] = [
    { id: 1, expired: '5 minutes', value: 5 * 60 * 1000 },
    { id: 2, expired: '10 minutes', value: 10 * 60 * 1000 },
    { id: 3, expired: '30 minutes', value: 30 * 60 * 1000 },
    { id: 4, expired: '60 minutes', value: 60 * 60 * 1000 },
    // { id: 5, expired: '4 hours', value: 4 * 60 * 60 * 1000 },
    // { id: 6, expired: '8 hours', value: 8 * 60 * 60 * 1000 },
    // { id: 7, expired: '12 hours', value: 12 * 60 * 60 * 1000 },
];

function FunctionSettingsSecurityLockTimePage() {
    const toast = useSonnerToast();
    const current_state = useCurrentState();
    const { setHide, goto } = useGoto();

    const [idle, setIdle] = useUserSettingsIdle();
    const [selectedId, setSelectedId] = useState<number>();

    useEffect(() => {
        const item = customTimes.find((item) => item.value === idle);
        if (item) {
            setSelectedId(item.id);
        }
    }, [idle]);

    const confirm = (item: LockTimeItem) => {
        setSelectedId(item.id);
        setIdle(item.value);
        toast.success('Successfully set');
        goto(-1);
    };
    return (
        <FusePage current_state={current_state}>
            <FusePageTransition
                className="relative flex h-full w-full flex-col items-center justify-center pt-[52px]"
                setHide={setHide}
                header={
                    <FunctionHeader
                        title={'Screen Lock'}
                        onBack={() => goto(-1)}
                        onClose={() => goto('/', { replace: true })}
                    />
                }
            >
                <div className="w-full px-5">
                    <div className="mt-8 w-full overflow-hidden rounded-xl bg-[#181818]">
                        {customTimes.map((item, index) => (
                            <div
                                key={index}
                                className="flex w-full cursor-pointer items-center justify-between border-b border-[#222222] px-4 py-3 text-sm duration-300 hover:bg-[#333333]"
                                onClick={() => confirm(item)}
                            >
                                <span className="text-sm">{item.expired}</span>
                                {selectedId === item.id && <Icon name="icon-ok" className="h-5 w-5 text-[#FFCF13]" />}
                            </div>
                        ))}
                    </div>
                </div>
            </FusePageTransition>
        </FusePage>
    );
}

export default FunctionSettingsSecurityLockTimePage;
