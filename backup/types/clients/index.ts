import type { CurrentWindow } from '~types/window';

const get_current_window = async (window: Window): Promise<CurrentWindow> => {
    return {
        screenX: window.screenX,
        screenY: window.screenY,
        outerWidth: window.outerWidth,
        outerHeight: window.outerHeight,
    };
};
const DEFAULT_TIMEOUT = 60000; // 60s
const DEFAULT_CALL_TIMEOUT = 600000; // 10 min
export { get_current_window, DEFAULT_TIMEOUT, DEFAULT_CALL_TIMEOUT };
