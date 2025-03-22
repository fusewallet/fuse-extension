import { principal2string, unwrapOptionMap, type ConnectedIdentity } from '@choptop/haw';

import { idlFactory } from './candid';
import type { _SERVICE } from './candid.d';

export const list_sns_canisters = async (
    identity: ConnectedIdentity,
    canister_id: string,
): Promise<{
    root?: string;
    swap?: string;
    ledger?: string;
    index?: string;
    governance?: string;
    dapps: string[];
    archives: string[];
}> => {
    const { creator } = identity;
    const actor: _SERVICE = await creator(idlFactory, canister_id);
    const r = await actor.list_sns_canisters({});
    return {
        root: unwrapOptionMap(r.root, principal2string),
        swap: unwrapOptionMap(r.swap, principal2string),
        ledger: unwrapOptionMap(r.ledger, principal2string),
        index: unwrapOptionMap(r.index, principal2string),
        governance: unwrapOptionMap(r.governance, principal2string),
        dapps: r.dapps.map((c) => principal2string(c)),
        archives: r.archives.map((c) => principal2string(c)),
    };
};
