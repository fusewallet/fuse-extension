/* eslint-disable @typescript-eslint/no-explicit-any */
import type { PlasmoCSConfig } from 'plasmo';

import { FuseClientByEvm } from '~types/clients/evm';
import { FuseClientByIc } from '~types/clients/ic';

export const config: PlasmoCSConfig = {
    matches: [
        // '<all_urls>',
        'file://*/*',
        'http://*/*',
        'https://*/*',
    ],
    world: 'MAIN', // main world can find
};

// check page visible
const [hidden, visibilityChange] = (() => {
    if (typeof document.hidden !== 'undefined') {
        return ['hidden', 'visibilitychange'];
    } else if (typeof (document as any).msHidden !== 'undefined') {
        return ['msHidden', 'msvisibilitychange']; // cspell: disable-line
    } else if (typeof (document as any).webkitHidden !== 'undefined') {
        return ['webkitHidden', 'webkitvisibilitychange']; // cspell: disable-line
    }
    return [];
})();

let is_page_visible = hidden ? !(document as any)[hidden] : false;
// console.debug(`🚀 ~ is_page_visible:`, is_page_visible);
if (hidden && visibilityChange) {
    document.addEventListener(visibilityChange, () => (is_page_visible = !(document as any)[hidden]), false);
}

// inject
const name = 'fuse'; // export name
const ic_client = new FuseClientByIc(() => is_page_visible);
const evm_client = new FuseClientByEvm();
if (typeof window !== 'undefined') {
    const w = window as any;
    if (w.ic === undefined) w.ic = {};
    w.ic[name] = ic_client;
    if (w.fusewallet === undefined) {
        w.fusewallet = {
            ic: ic_client,
            evm: evm_client,
        };
    }
}
