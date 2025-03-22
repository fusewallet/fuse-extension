import { sha256_hash } from '~lib/utils/hash';

export interface ApproveIcAction {
    type: 'approve_ic';
    id: number;

    origin: string; // window.location.origin
    canister_id: string;
    method: string;

    func_text: string; // candid display
    args_text: string; // args display
    args_json: string; // args display

    request_hash: string;
}

export const hash_approve_ic_action = async (self: ApproveIcAction): Promise<string> =>
    sha256_hash(`${self.type}:${self.origin}:${self.canister_id}:${self.method}`);
