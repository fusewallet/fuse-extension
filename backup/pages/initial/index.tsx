import { Button } from '@heroui/react';
import { useNavigate } from 'react-router-dom';

import logo_svg from '~assets/svg/logo.svg';
import Icon from '~components/icon';
import { FusePage } from '~components/layouts/page';
import { useCurrentState } from '~hooks/memo/current_state';
import { useNavigatePages } from '~hooks/navigate';
import { CurrentState } from '~types/state';

function InitialPage({ extra }: { extra?: boolean }) {
    const current_state = useCurrentState();
    useNavigatePages(current_state, false); // can go back

    const navigate = useNavigate();

    return (
        <FusePage current_state={current_state} states={extra ? CurrentState.ALIVE : CurrentState.INITIAL}>
            <div className={'flex h-full w-full items-center justify-center'}>
                <div className="relative h-full w-full">
                    {/* extra account */}
                    {extra && (
                        <div className="absolute left-5 top-5 flex items-center" onClick={() => navigate(-1)}>
                            <Icon
                                name="icon-arrow-left"
                                className="h-[14px] w-[19px] cursor-pointer text-[#FFCF13] duration-300 hover:opacity-85"
                            />
                        </div>
                    )}

                    <div className="flex h-full flex-col justify-between px-5 pb-5">
                        <div className="flex w-full flex-1 flex-col items-center justify-center">
                            <img src={logo_svg} width={80} />
                            <p className="py-5 text-lg font-semibold text-[#FECE13]">Connect Your On-Chain World</p>
                        </div>

                        <div className="flex w-full flex-col gap-y-5">
                            <Button
                                className="h-[48px] w-full bg-[#FFCF13] text-lg font-semibold text-black"
                                onPress={() =>
                                    navigate(extra ? '/home/settings/accounts/extra/create' : '/initial/create')
                                }
                            >
                                Create a new wallet
                            </Button>
                            <Button
                                className="h-[48px] w-full border border-[#FFCF13] bg-transparent text-lg font-semibold text-yellow-500 hover:bg-yellow-300 hover:text-black"
                                onPress={() =>
                                    navigate(extra ? '/home/settings/accounts/extra/restore' : '/initial/restore')
                                }
                            >
                                Import an existing wallet
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </FusePage>
    );
}

export default InitialPage;
