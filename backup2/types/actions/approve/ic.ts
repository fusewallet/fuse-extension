export interface ApproveIcAction {
    type: 'approve_ic';
    message_id: string;

    origin: string; // window.location.origin
    canister_id: string;
    method: string;

    func_text: string; // candid display
    args_text: string; // args display
    args_json: string; // args display

    request_hash: string;
}
