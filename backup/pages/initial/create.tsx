import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { FusePage } from '~components/layouts/page';
import { useCurrentState } from '~hooks/memo/current_state';
import { useRestoreAccount } from '~hooks/memo/restore_account';
import { useIdentityKeys } from '~hooks/store/local-secure';
import { random_mnemonic, validate_mnemonic } from '~lib/mnemonic';
import type { CombinedIdentityKey } from '~types/identity';
import type { WindowType } from '~types/pages';
import { CurrentState } from '~types/state';

import CreateMnemonicPage from './pages/create_mnemonic';
import CreateVerificationPage from './pages/create_verification';
import InputPasswordPage from './pages/password';

type CreateState = 'password' | 'mnemonic' | 'verification';

function InnerCreatePage({ wt, extra }: { wt: WindowType; extra?: boolean }) {
    const current_state = useCurrentState();

    const navigate = useNavigate();

    const { restoreAccountByMnemonic } = useRestoreAccount(current_state);
    const { pushIdentity } = useIdentityKeys();

    const [state, setState] = useState<CreateState>(extra ? 'mnemonic' : 'password');

    const [password1, setPassword1] = useState('');
    const [password2, setPassword2] = useState('');

    const [mnemonic12, setMnemonic12] = useState(random_mnemonic(12));
    const [mnemonic24, setMnemonic24] = useState(random_mnemonic(24));

    const [current_mnemonic, setCurrentMnemonic] = useState('');

    const onCompleted = useCallback(async () => {
        if (!current_mnemonic || !validate_mnemonic(current_mnemonic)) return;

        // ! extra account
        if (extra) {
            // push new account by mnemonic
            const key: CombinedIdentityKey = {
                mnemonic: {
                    type: 'mnemonic',
                    mnemonic: current_mnemonic,
                    subaccount: 0,
                },
            };
            pushIdentity(key).then((r) => {
                if (r === undefined) throw Error('push identity failed');
                if (r === false) throw Error('push identity failed');
                navigate(-2); // back 2 pages
            });
            return;
        }

        await restoreAccountByMnemonic(password1, current_mnemonic);
        if (wt === 'options') {
            await chrome.action.openPopup();
            // window.close(); // close window if current window is individual page
        }
    }, [extra, password1, current_mnemonic, restoreAccountByMnemonic, pushIdentity, wt, navigate]);

    const [password_class, setPasswordClass] = useState<'slide-in-right' | 'slide-in-left'>('slide-in-right');
    const [mnemonic_class, setMnemonicClass] = useState<'slide-in-right' | 'slide-in-left'>('slide-in-right');
    const [verification_class, setVerificationClass] = useState<'slide-in-right' | 'slide-in-left'>('slide-in-right');

    return (
        <FusePage current_state={current_state} states={extra ? CurrentState.ALIVE : CurrentState.INITIAL}>
            {state === 'password' && (
                <InputPasswordPage
                    className={password_class}
                    onBack={() => navigate(-1)}
                    password1={password1}
                    setPassword1={setPassword1}
                    password2={password2}
                    setPassword2={setPassword2}
                    onNext={() => {
                        setMnemonicClass('slide-in-right');
                        setState('mnemonic');
                    }}
                />
            )}
            {state === 'mnemonic' && (
                <CreateMnemonicPage
                    className={mnemonic_class}
                    onBack={() => {
                        if (extra) {
                            navigate(-1);
                        } else {
                            setPasswordClass('slide-in-left');
                            setState('password');
                        }
                    }}
                    mnemonic12={mnemonic12}
                    setMnemonic12={setMnemonic12}
                    mnemonic24={mnemonic24}
                    setMnemonic24={setMnemonic24}
                    onNext={(mnemonic) => {
                        setCurrentMnemonic(mnemonic);
                        setVerificationClass('slide-in-right');
                        setState('verification');
                    }}
                />
            )}
            {state === 'verification' && (
                <CreateVerificationPage
                    className={verification_class}
                    onBack={() => {
                        setMnemonicClass('slide-in-left');
                        setState('mnemonic');
                    }}
                    mnemonic={current_mnemonic}
                    onNext={onCompleted}
                />
            )}
        </FusePage>
    );
}

export default InnerCreatePage;
