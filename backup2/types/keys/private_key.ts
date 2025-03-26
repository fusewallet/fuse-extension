import type { Chain } from '~types/chain';

export interface IdentityKeyPrivate {
    type: 'private_key';
    private_key: string;
    chain: Chain;
    parsed: string; // how to parse
}
