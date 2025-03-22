import { useEffect, useState } from 'react';

import type { SecureStorage } from '@plasmohq/storage/secure';

import { __get_password } from '../session';

const CACHED: Record<string, SecureStorage> = {};

export const useSecureStorageInner = (
    unlocked: string,
    new_secure_storage: () => SecureStorage,
): SecureStorage | undefined => {
    const [storage, setStorage] = useState<SecureStorage | undefined>(CACHED[unlocked]);

    useEffect(() => {
        if (!unlocked) return setStorage(undefined);
        if (storage !== undefined) return; // ? already had
        const new_storage = new_secure_storage();
        __get_password(unlocked).then((password) => {
            if (!password) return;
            new_storage.setPassword(password).then(() => setStorage((CACHED[unlocked] = new_storage)));
        });
    }, [new_secure_storage, unlocked, storage]);

    return storage;
};
