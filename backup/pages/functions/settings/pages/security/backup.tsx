import { useRef, useState } from 'react';

import Icon from '~components/icon';
import { FusePage } from '~components/layouts/page';
import { FusePageTransition } from '~components/layouts/transition';
import { useCurrentState } from '~hooks/memo/current_state';
import { useGoto } from '~hooks/memo/goto';
import { useIdentityKeys } from '~hooks/store/local-secure';
import type { IdentityId } from '~types/identity';

import { FunctionHeader } from '../../../components/header';
import BackupMnemonicDrawer from '../../components/show-mnemonic-drawer';

function FunctionSettingsSecurityBackupPage() {
    const current_state = useCurrentState();

    const { setHide, goto } = useGoto();

    const { identity_list, showMnemonic } = useIdentityKeys();

    const [mnemonic, setMnemonic] = useState<string>();
    const [identityId, setIdentityId] = useState<IdentityId>();
    const [isOpenSeedPhrase, setIsOpenSeedPhrase] = useState(false);

    const showSeedPhrase = (id: string) => {
        if (id === undefined) return;

        showMnemonic(id, '1111qqqq').then((m) => {
            console.error('show mnemonic', m);
            if (m === undefined) return;
            if (m === false) setMnemonic('wrong password');
            if (typeof m === 'object') setMnemonic(m.mnemonic);
        });
    };

    const ref = useRef<HTMLDivElement>(null);
    return (
        <FusePage current_state={current_state}>
            <FusePageTransition
                className="relative flex h-full w-full flex-col items-center justify-center pt-[52px]"
                setHide={setHide}
                header={
                    <FunctionHeader
                        title={'Backup Seed Phrase'}
                        onBack={() => goto(-1)}
                        onClose={() => goto('/', { replace: true })}
                    />
                }
            >
                <div ref={ref} className="h-full w-full overflow-y-auto px-5">
                    {(identity_list ?? []).map((identity) => (
                        <div
                            key={identity.id}
                            className="mt-3 block w-full cursor-pointer rounded-xl bg-[#181818] p-4 duration-300 hover:bg-[#2B2B2B]"
                            onClick={() => {
                                setIdentityId(identity.id);
                                setIsOpenSeedPhrase(true);
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex cursor-default items-center">
                                    <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#333333] p-2 text-2xl">
                                        {identity.icon}
                                    </div>
                                    <span className="pl-3 text-sm">{identity.name}</span>
                                </div>
                                <Icon name="icon-arrow-right" className="h-3 w-3 cursor-pointer text-[#999999]" />
                            </div>
                        </div>
                    ))}

                    <BackupMnemonicDrawer
                        isOpen={isOpenSeedPhrase}
                        setIsOpen={(isOpen: boolean) => {
                            if (!isOpen) {
                                setIdentityId(undefined);
                                setMnemonic(undefined);
                            }
                            setIsOpenSeedPhrase(isOpen);
                        }}
                        onShowSeed={() => showSeedPhrase(`${identityId}`)}
                        mnemonic={mnemonic}
                        type="seed"
                        container={ref.current ?? undefined}
                    />
                </div>
            </FusePageTransition>
        </FusePage>
    );
}

export default FunctionSettingsSecurityBackupPage;
