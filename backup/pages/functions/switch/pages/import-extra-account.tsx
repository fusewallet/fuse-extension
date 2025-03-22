import { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { FusePage } from '~components/layouts/page';
import { useCurrentState } from '~hooks/memo/current_state';
import { useIdentityKeys } from '~hooks/store/local-secure';
import { useSonnerToast } from '~hooks/toast';
import { validate_mnemonic } from '~lib/mnemonic';
import RestoreMnemonicPage from '~pages/initial/pages/restore_mnemonic';
import RestorePrivateKeyPage from '~pages/initial/pages/restore_private_key';
import type { CombinedIdentityKey } from '~types/identity';
import { CurrentState } from '~types/state';

type State = 'mnemonic' | 'private_key';

function ImportExtraAccountPage() {
    const toast = useSonnerToast();
    const current_state = useCurrentState();

    const navigate = useNavigate();
    const { type } = useParams<{ type: State }>();

    const { isKeyExist, pushIdentity } = useIdentityKeys();

    const [loading, setLoading] = useState<boolean>(false);

    const [mnemonic, setMnemonic] = useState('');

    const onMnemonicCompleted = useCallback(async () => {
        if (loading) return;

        if (!mnemonic || !validate_mnemonic(mnemonic)) return;

        const key: CombinedIdentityKey = {
            mnemonic: {
                type: 'mnemonic',
                mnemonic,
                subaccount: 0,
            },
        };

        if (await isKeyExist(key)) return toast.error('key already exists');

        setLoading(true);
        pushIdentity(key)
            .then((r) => {
                if (r === undefined) throw Error('push identity failed');
                if (r === false) throw new Error('push identity failed');
                navigate(-1); // back 3 pages
            })
            .finally(() => setLoading(false));
    }, [mnemonic, isKeyExist, pushIdentity, navigate, loading, toast]);

    const onPrivateKeyCompleted = useCallback(async () => {
        throw new Error('Come soon');
    }, []);

    return (
        <FusePage current_state={current_state} states={CurrentState.ALIVE}>
            {/* Import wallet - Mnemonics */}
            {type === 'mnemonic' && (
                <RestoreMnemonicPage
                    onBack={() => navigate(-1)}
                    mnemonic={mnemonic}
                    setMnemonic={setMnemonic}
                    onNext={onMnemonicCompleted}
                    isLoading={loading}
                />
            )}

            {/* Import the wallet - private key */}
            {type === 'private_key' && (
                <RestorePrivateKeyPage
                    onBack={() => navigate(-1)}
                    onNext={() => onPrivateKeyCompleted()}
                    isLoading={loading}
                />
            )}
        </FusePage>
    );
}

export default ImportExtraAccountPage;
