import { Button } from '@heroui/react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import logo_svg from '~assets/svg/logo.svg';
import InputPassword from '~components/input-password';
import { FusePage } from '~components/layouts/page';
import { useCurrentState } from '~hooks/memo/current_state';
import { useUnlock } from '~hooks/memo/unlock';
import { usePasswordHashed } from '~hooks/store/local';
import { useRestore } from '~hooks/store/session';
import { verify_password } from '~lib/password';
import type { WindowType } from '~types/pages';
import { CurrentState } from '~types/state';

function LockedPage({ wt }: { wt: WindowType }) {
    const current_state = useCurrentState();

    const navigate = useNavigate();

    const [password1, setPassword1] = useState('');
    const [password_hashed] = usePasswordHashed();
    const unlock = useUnlock(current_state, password_hashed);

    const [restore, setRestore] = useRestore();
    useEffect(() => {
        if (restore && wt === 'options') {
            setRestore(false);
            navigate('/initial/restore');
        }
    }, [restore, setRestore, navigate, wt]);

    const [valid, setValid] = useState(false);
    useEffect(() => {
        (async () => {
            if (!password1) return false;
            if (!password_hashed) return false;
            return verify_password(password_hashed, password1);
        })().then(setValid);
    }, [password1, password_hashed]);
    // console.debug(`🚀 ~ valid ~ valid:`, valid);

    const onAlive = useCallback(() => {
        if (!valid) return console.error('do tip error');
        unlock(password1);
    }, [valid, password1, unlock]);

    // Add global keyboard event listener for Enter key
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && valid) {
                onAlive();
            }
        };

        window.addEventListener('keydown', handleKeyPress);

        // Clean up event listener on component unmount
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [valid, onAlive]);

    return (
        <FusePage current_state={current_state} states={CurrentState.LOCKED} replace={true}>
            <div className="flex h-full w-full flex-col items-center justify-center p-5">
                <div className="flex w-full flex-1 flex-col items-center justify-center">
                    <div className="mb-[74px] flex w-full flex-col items-center justify-center">
                        <img src={logo_svg} width={80} />
                        <p className="py-5 text-lg font-semibold text-[#FECE13]">Connect Your On-Chain World</p>
                    </div>

                    <InputPassword
                        placeholder="Password"
                        onChange={setPassword1}
                        errorMessage={!password1 || valid ? undefined : 'password is mismatch'}
                    />
                </div>

                <Button className="h-[48px] w-full bg-[#FFCF13] text-lg font-semibold text-black" onPress={onAlive}>
                    Unlock
                </Button>

                <div
                    onClick={() => {
                        if (wt === 'options') {
                            navigate('/initial/restore');
                        } else {
                            setRestore(true).then(() => {
                                chrome.runtime.openOptionsPage();
                            });
                            // chrome.runtime.openOptionsPage();
                            // chrome.windows.create({
                            //     url: './options.html#/initial/restore',
                            //     focused: true,
                            // });
                        }
                    }}
                    className="mb-[2px] mt-[13px] cursor-pointer text-center text-sm font-normal text-[#999999] duration-300 hover:text-[#EEEEEE]"
                >
                    Forgot Password
                </div>
            </div>
        </FusePage>
    );
}

export default LockedPage;
