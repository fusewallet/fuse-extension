import { string2principal } from '@choptop/haw';
import { CanisterStatus, HttpAgent } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';

export const get_canister_status = async (
    canister_id: string,
): Promise<{
    time: number;
    controllers: string[];
    subnet: { nodeKeys: Map<string, ArrayBuffer>; subnetId: string } | undefined;
    module_hash: string | undefined;
    candid: string | undefined;
}> => {
    const map = await CanisterStatus.request({
        canisterId: string2principal(canister_id),
        agent: HttpAgent.createSync(),
        paths: ['time', 'controllers', 'subnet', 'module_hash', 'candid'],
    });

    const time: Date = (map.get('time') as Date) ?? new Date();
    const controllers: Principal[] = (map.get('controllers') as Principal[]) ?? [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subnet: { nodeKeys: Map<string, ArrayBuffer>; subnetId: string } | undefined = map.get('subnet') as any;
    const module_hash: string | undefined = map.get('module_hash') as string;
    const candid: string | undefined = map.get('candid') as string;

    return {
        time: time.getTime(),
        controllers: controllers.map((c) => c.toText()),
        subnet,
        module_hash,
        candid,
    };
};
