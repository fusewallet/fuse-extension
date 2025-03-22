import { FusePage } from '~components/layouts/page';
import { FusePageTransition } from '~components/layouts/transition';
import { useCurrentState } from '~hooks/memo/current_state';
import { useGoto } from '~hooks/memo/goto';
import { useIdentityKeys } from '~hooks/store/local-secure';
import { useUserSettingsIdle } from '~hooks/store/sync';

import { FunctionHeader } from '../../../components/header';
import { SettingsGroup } from '../../components/group';
import { SettingsItem } from '../../components/item';

function FunctionSettingsSecurityPage() {
    const current_state = useCurrentState();
    const { setHide, goto } = useGoto();

    const [idle] = useUserSettingsIdle();

    const { main_mnemonic_identity } = useIdentityKeys();

    const idleMinutes = Math.floor(idle / 1000 / 60);

    return (
        <FusePage current_state={current_state}>
            <FusePageTransition
                className="relative flex h-full w-full flex-col items-center justify-center pt-[52px]"
                setHide={setHide}
                header={
                    <FunctionHeader
                        title={'Security & Privacy'}
                        onBack={() => goto(-1)}
                        onClose={() => goto('/', { replace: true })}
                    />
                }
            >
                <SettingsGroup className="mt-6 w-full px-5">
                    <SettingsItem path={'/home/settings/security/password'} title="Change Password" />
                    <SettingsItem
                        path={'/home/settings/security/lock-time'}
                        title="Screen Lock"
                        tip={`${idleMinutes} minutes`}
                    />
                </SettingsGroup>

                {main_mnemonic_identity && (
                    <SettingsGroup>
                        <SettingsItem path={'/home/settings/security/backup'} title="Backup Seed Phrase" />
                    </SettingsGroup>
                )}
            </FusePageTransition>
        </FusePage>
    );
}

export default FunctionSettingsSecurityPage;
