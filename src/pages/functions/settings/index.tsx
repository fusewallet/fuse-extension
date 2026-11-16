import Icon from '~components/icon';
import { FusePage } from '~components/layouts/page';
import { FusePageTransition } from '~components/layouts/transition';
import { useCurrentState } from '~hooks/memo/current_state';
import { useGoto } from '~hooks/memo/goto';
import { useLock } from '~hooks/memo/lock';
import { useCurrentConnectedApps, useIdentityKeysCount, useMarkedAddresses } from '~hooks/store/local-secure';

import { FunctionHeader } from '../components/header';
import { SettingsGroup } from './components/group';
import { SettingsItem } from './components/item';

export type SettingPageState = 'home';

function FunctionSettingsPage() {
    const current_state = useCurrentState();
    const { setHide, goto } = useGoto();

    const account_count = useIdentityKeysCount();
    const [markedAddresses] = useMarkedAddresses();
    const [apps] = useCurrentConnectedApps();
    const lock = useLock();

    return (
        <FusePage current_state={current_state}>
            <FusePageTransition setHide={setHide}>
                <div className="relative flex h-full w-full flex-col items-center justify-start pt-[52px]">
                    <FunctionHeader title={'Settings'} onBack={() => goto('/')} onClose={() => goto('/')} />

                    <SettingsGroup className="mt-6 w-full px-5">
                        <SettingsItem
                            icon={<Icon name="icon-wallet" className="h-4 w-4 cursor-pointer text-[#FFCF13]" />}
                            path={'/home/settings/accounts'}
                            title="Manage Account"
                            tip={`${account_count}`}
                        />

                        <SettingsItem
                            icon={<Icon name="icon-security" className="h-4 w-4 cursor-pointer text-[#FFCF13]" />}
                            path={'/home/settings/security'}
                            title="Security & Privacy"
                        />

                        <SettingsItem
                            icon={<Icon name="icon-preferences" className="h-4 w-4 cursor-pointer text-[#FFCF13]" />}
                            path={'/home/settings/preferences'}
                            title="Preferences Settings"
                        />
                    </SettingsGroup>

                    <SettingsGroup>
                        <SettingsItem
                            icon={<Icon name="icon-address" className="h-4 w-4 cursor-pointer text-[#FFCF13]" />}
                            path={'/home/settings/addresses'}
                            title="Address Book"
                            tip={`${markedAddresses.length}`}
                        />

                        <SettingsItem
                            icon={<Icon name="icon-dapps" className="h-4 w-4 cursor-pointer text-[#FFCF13]" />}
                            path={'/home/settings/connected'}
                            title="Linked Applications"
                            tip={apps.ic.length}
                        />
                    </SettingsGroup>

                    <SettingsGroup>
                        <SettingsItem
                            icon={<Icon name="icon-locked" className="h-4 w-4 cursor-pointer text-[#FFCF13]" />}
                            path={() => lock()}
                            title="Lock Wallet"
                            arrow={false}
                        />
                    </SettingsGroup>

                    <SettingsGroup>
                        <SettingsItem
                            icon={<Icon name="icon-tips" className="h-4 w-4 cursor-pointer text-[#FFCF13]" />}
                            path={'/home/settings/about'}
                            title="About Fuse"
                            tip="V1.0.0"
                        />
                    </SettingsGroup>
                </div>
            </FusePageTransition>
        </FusePage>
    );
}

export default FunctionSettingsPage;
