import type { MessageResult } from '~lib/messages';
import type { Chain } from '~types/chain';

// transfer ic token record
export interface TokenTransferredIcRecord {
    type: 'token_transferred_ic';

    created: number;

    chain: Chain;

    canister_id: string;
    method: string;

    from_subaccount?: string;
    to: { owner: string; subaccount?: string } | string;
    amount: string;
    fee?: string;
    memo?: string;
    created_at_time?: string;

    usd?: string;

    state: MessageResult<string, string>; // Too long and it gets truncated
}
