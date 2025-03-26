import type { Chain } from '~types/chain';

export interface ConnectAction {
    type: 'connect';
    message_id: string;

    chain: Chain;

    origin: string; // window.location.origin
    title: string; // window.document.title
    favicon?: string; // find_favicon
}
