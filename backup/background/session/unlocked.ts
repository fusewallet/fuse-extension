const CACHED_UNLOCKED_PASSWORD: Record<string, string> = {};
export const __set_unlocked = (unlocked: string, password: string) => (CACHED_UNLOCKED_PASSWORD[unlocked] = password);
export const __get_unlocked = (unlocked: string) => CACHED_UNLOCKED_PASSWORD[unlocked] ?? '';
export const __inner_get_password = async (unlocked: string) => __get_unlocked(unlocked);
