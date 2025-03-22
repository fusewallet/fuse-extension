import type { Storage } from '@plasmohq/storage';
import { useStorage } from '@plasmohq/storage/hook';

import { SYNC_KEY_USER_SETTINGS_IDLE } from '../../../keys';

// user settings idle -> // * sync
export const useUserSettingsIdleInner = (storage: Storage) => {
    return useStorage<number>(
        { key: SYNC_KEY_USER_SETTINGS_IDLE, instance: storage },
        1000 * 60 * 5, // default 5 min
    );
};
