import { Storage } from '@plasmohq/storage';

import { useUserSettingsIdleInner } from './user/settings/idle';

// * sync -> sync by google account -> user custom settings
const STORAGE = new Storage(); // sync
// const secure_storage = new SecureStorage(); // sync

// ================ hooks ================

// ############### SYNC ###############

// use settings
export const useUserSettingsIdle = () => useUserSettingsIdleInner(STORAGE); // sync
