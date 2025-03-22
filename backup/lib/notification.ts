import type { CurrentWindow } from '~types/window';

let unique_tab_id: number | undefined = undefined;

const HEIGHT = 600; // Same as popup page
const WIDTH = 360; // Same as popup page

export const get_current_notification = async (focus = false): Promise<chrome.windows.Window | undefined> => {
    if (unique_tab_id === undefined) return undefined;

    const window = await new Promise<chrome.windows.Window | undefined>((resolve) => {
        chrome.windows
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            .get(unique_tab_id!)
            .then(resolve)
            .catch(() => resolve(undefined));
    });

    if (focus && window && window.id && !window.focused) await chrome.windows.update(window.id, { focused: true });

    return window;
};

export const open_notification = async (current_window?: CurrentWindow) => {
    if (unique_tab_id !== undefined) {
        const window = await get_current_notification(true);
        if (window?.id) return;
        unique_tab_id = undefined;
    }

    const left =
        current_window?.screenX !== undefined && current_window?.outerWidth !== undefined
            ? current_window.screenX + current_window.outerWidth - WIDTH
            : undefined;

    const window = await chrome.windows.create({
        tabId: unique_tab_id,
        url: './tabs/notification.html',
        top: 0,
        left,
        height: HEIGHT,
        width: WIDTH,
        focused: true,
        type: 'popup',
    });
    // console.debug(`🚀 ~ const open_notification= ~ window:`, window);
    unique_tab_id = window.id;
};
