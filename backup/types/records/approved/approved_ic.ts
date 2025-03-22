import type { MessageResult } from '~lib/messages';
import type { Chain } from '~types/chain';

// approved ic record
export interface ApprovedIcRecord {
    type: 'approved_ic';

    created: number;

    chain: Chain;

    origin: string;
    title: string;
    favicon?: string;

    canister_id: string;
    method: string;

    func_text: string; // candid display // Too long and it gets truncated
    args_text: string; // Too long and it gets truncated
    args_json: string; // Too long and it gets truncated

    state: MessageResult<string, string>; // Too long and it gets truncated
}
