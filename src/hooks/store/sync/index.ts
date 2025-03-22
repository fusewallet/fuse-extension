import { __get_storage } from '~lib/storage';

import { useUserSettingsIdleInner } from './user/settings/idle';

// * sync -> sync by google account -> user custom settings
const STORAGE = __get_storage(); // sync

// ================ hooks ================

// ############### SYNC ###############

// use settings
export const useUserSettingsIdle = () => useUserSettingsIdleInner(STORAGE); // sync
