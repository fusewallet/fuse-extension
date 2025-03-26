export type WindowType = 'popup' | 'options' | 'sidepanel' | 'notification';

export interface CurrentWindow {
    screenX?: number;
    screenY?: number;
    outerWidth?: number;
    outerHeight?: number;
}
