import { Button } from '@heroui/react';
import { useCallback, useState } from 'react';

import InputPassword from '~components/input-password';
import { FusePage } from '~components/layouts/page';
import { FusePageTransition } from '~components/layouts/transition';
import { useCurrentState } from '~hooks/memo/current_state';
import { useGoto } from '~hooks/memo/goto';
import { usePasswordHashed } from '~hooks/store/local';
import { useChangePassword } from '~hooks/store/local-secure';
import { lockDirectly } from '~hooks/store/session';
import { useSonnerToast } from '~hooks/toast';
import { verify_password } from '~lib/password';

import { FunctionHeader } from '../../../components/header';

function FunctionSettingsSecurityChangePasswordPage() {
    const toast = useSonnerToast();
    const current_state = useCurrentState();

    const changePassword = useChangePassword();
    const [password_hashed] = usePasswordHashed();

    const { setHide, goto } = useGoto();
    const [old_password, setOldPassword] = useState('');
    const [new_password, setNewPassword] = useState('');
    const [new_confirm_password, setNewConfirmPassword] = useState('');

    const confirm = useCallback(async () => {
        // old pwd is not true
        const isCheck = await verify_password(password_hashed, old_password);
        if (!isCheck) {
            toast.error('Old password is not correct');
            return;
        }

        if (old_password === '') {
            toast.error('Old password is empty');
            return;
        }
        if (new_password === '') {
            toast.error('New password is empty');
            return;
        }
        if (old_password === new_password) {
            toast.error('Same password');
            return;
        }
        changePassword(old_password, new_password).then((r) => {
            if (r === undefined) return;
            if (r === false) return;
            // notice successful
            toast.success('Successfully set');
            goto(-1);
            lockDirectly();
        });
    }, [changePassword, old_password, new_password, toast, goto]);

    return (
        <FusePage current_state={current_state}>
            <FusePageTransition
                className="relative flex h-full w-full flex-col items-center justify-center pt-[52px]"
                setHide={setHide}
                header={
                    <FunctionHeader
                        title={'Change Password'}
                        onBack={() => goto(-1)}
                        onClose={() => goto('/', { replace: true })}
                    />
                }
            >
                <div className="flex flex-col justify-between px-5 w-full h-full">
                    <div className="flex-1">
                        <div className="mt-5 w-full">
                            <label className="block my-3 text-sm">Old Password</label>
                            <InputPassword placeholder="Enter old password" onChange={(val) => setOldPassword(val)} />
                        </div>
                        <div className="mt-5 w-full">
                            <label className="block my-3 text-sm">New Password</label>
                            <InputPassword
                                placeholder="At least 8 characters"
                                onChange={(val) => setNewPassword(val)}
                            />
                        </div>
                        <div className="mt-5 w-full">
                            <label className="block my-3 text-sm">Confirm New Password</label>
                            <InputPassword
                                placeholder="Confirm Password"
                                onChange={(val) => setNewConfirmPassword(val)}
                            />
                        </div>
                    </div>
                    <div className="py-5">
                        <Button
                            className="h-[48px] w-full bg-[#FFCF13] text-lg font-semibold text-black"
                            isDisabled={
                                !old_password ||
                                !new_password ||
                                !new_confirm_password ||
                                new_confirm_password !== new_password
                            }
                            onPress={confirm}
                        >
                            Confirm
                        </Button>
                    </div>
                </div>
            </FusePageTransition>
        </FusePage>
    );
}

export default FunctionSettingsSecurityChangePasswordPage;
