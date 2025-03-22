import { Button } from '@heroui/react';
import { useMemo } from 'react';
import { LuUnlink } from 'react-icons/lu';

import { FusePage } from '~components/layouts/page';
import { FusePageTransition } from '~components/layouts/transition';
import { useCurrentState } from '~hooks/memo/current_state';
import { useGoto } from '~hooks/memo/goto';
import { useCurrentConnectedApps } from '~hooks/store/local-secure';

import { FunctionHeader } from '../../../components/header';

function FunctionSettingsConnectedAppPage() {
    const current_state = useCurrentState();

    const { setHide, goto } = useGoto();

    const [apps, , { removeConnectedApp, removeAllConnectedApps }] = useCurrentConnectedApps();

    // sort by updated
    const sortedApps = useMemo(() => {
        const today = new Date();
        const groups: Record<string, typeof apps.ic> = {
            Today: [],
            Yesterday: [],
            'Last Week': [],
            Older: [],
        };

        apps.ic.forEach((app) => {
            const updatedDate = new Date(app.updated);
            const diffTime = today.getTime() - updatedDate.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 0) {
                groups['Today'].push(app);
            } else if (diffDays === 1) {
                groups['Yesterday'].push(app);
            } else if (diffDays <= 7) {
                groups['Last Week'].push(app);
            } else {
                groups['Older'].push(app);
            }
        });

        return Object.entries(groups)
            .filter(([, items]) => items.length > 0)
            .map(([label, items]) => ({
                label,
                items: items.sort((a, b) => b.updated - a.updated),
            }));
    }, [apps]);

    return (
        <FusePage current_state={current_state}>
            <FusePageTransition
                className="relative flex h-full w-full flex-col items-center justify-center pt-[52px]"
                setHide={setHide}
                header={
                    <FunctionHeader
                        title={'Linked Applications'}
                        onBack={() => goto(-1)}
                        onClose={() => goto('/', { replace: true })}
                    />
                }
            >
                <div className="flex h-full flex-col justify-between">
                    <div className="flex-1 overflow-y-auto px-5">
                        {sortedApps.map((group, index) => (
                            <div key={index} className="mt-3 w-full">
                                <div className="pb-2 text-sm text-[#999999]">{group.label}</div>
                                {group.items.map((app, i) => (
                                    <div
                                        key={i}
                                        className="mb-3 block w-full cursor-pointer rounded-xl bg-[#181818] px-4 py-[10px] duration-300 hover:bg-[#2B2B2B]"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <img src={app.favicon} className="h-10 w-10 rounded-full" />
                                                <span className="pl-3 text-base">{app.title}</span>
                                            </div>
                                            <div
                                                onClick={() => {
                                                    removeConnectedApp('ic', app);
                                                }}
                                            >
                                                <LuUnlink className="h-[18px] w-[18px] cursor-pointer text-[#999999] duration-300 hover:text-[#FFCF13]" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                    {1 <= apps.ic.length && (
                        <div className="w-full p-5">
                            <Button
                                className="h-[48px] w-full bg-[#FFCF13] text-lg font-semibold text-black"
                                onPress={() => removeAllConnectedApps('ic')}
                            >
                                Disconnect All
                            </Button>
                        </div>
                    )}
                </div>
            </FusePageTransition>
        </FusePage>
    );
}

export default FunctionSettingsConnectedAppPage;
