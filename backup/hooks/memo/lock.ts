import { useCallback } from 'react';

import { lockDirectly } from '~hooks/store/session';

export const useLock = (): ((tips?: string) => Promise<void>) => {
    const lock = useCallback(async (tips?: string) => {
        console.error(`do lock`, tips);
        await lockDirectly();
    }, []);

    return lock;
};
