import { useState } from 'react';

import Icon from '~components/icon';
import { FusePage } from '~components/layouts/page';
import { FusePageTransition } from '~components/layouts/transition';
import { useCurrentState } from '~hooks/memo/current_state';
import { useGoto } from '~hooks/memo/goto';
import { useSonnerToast } from '~hooks/toast';

import { FunctionHeader } from '../../../components/header';

function FunctionSettingsLanguage() {
    const toast = useSonnerToast();

    const current_state = useCurrentState();

    const { setHide, goto } = useGoto();

    const [selectedId, setSelectedId] = useState(1);
    const customLanguage = [
        { id: 1, name: 'English' },
        { id: 2, name: '简体中文' },
        { id: 3, name: '繁體中文' },
        { id: 4, name: 'Frangais' },
        { id: 5, name: 'PyCCKИЙ' },
        { id: 6, name: 'Tiéng Viet' },
        { id: 7, name: 'Bahasa Indonesia' },
        { id: 8, name: 'Turkge' },
        { id: 9, name: 'Deutsch' },
        { id: 10, name: 'Italiano' },
    ];

    const confirm = (item: { id: any; expired?: string }) => {
        setSelectedId(item.id);
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
                        title={'Currency'}
                        onBack={() => goto(-1)}
                        onClose={() => goto('/', { replace: true })}
                    />
                }
            >
                <div className="h-full w-full overflow-y-auto px-5">
                    <div className="mt-5 w-full overflow-hidden rounded-xl bg-[#181818]">
                        {customLanguage.map((item, index) => (
                            <div
                                key={index}
                                className="flex w-full cursor-pointer items-center justify-between border-b border-[#222222] px-4 py-3 text-sm duration-300 hover:bg-[#333333]"
                                onClick={() => {
                                    confirm(item);
                                }}
                            >
                                <span className="text-sm">{item.name}</span>
                                {selectedId === item.id && <Icon name="icon-ok" className="h-5 w-5 text-[#FFCF13]" />}
                            </div>
                        ))}
                    </div>
                </div>
            </FusePageTransition>
        </FusePage>
    );
}

export default FunctionSettingsLanguage;
