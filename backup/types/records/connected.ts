import type { Chain } from '~types/chain';
import type { ConnectedAppState } from '~types/connect';

// connected record
export interface ConnectedRecord {
    type: 'connected';

    created: number;

    chain: Chain;

    origin: string;
    title: string;
    favicon?: string;

    state: ConnectedAppState;
}
