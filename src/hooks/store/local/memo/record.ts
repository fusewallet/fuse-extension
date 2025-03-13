import _ from 'lodash';
import { useCallback, useEffect, useState } from 'react';

import { format_record_date } from '~hooks/store/common';
import { DAY } from '~lib/utils/datetime';
import {
    get_identity_network_key,
    type ChainIcIdentityNetwork,
    type CurrentIdentityNetwork,
    type IdentityNetwork,
} from '~types/network';
import { get_fuse_record_created, type FuseRecordList } from '~types/records';

import { get_local_record_count, get_local_record_list, get_local_record_started } from '..';

interface SingleIdentityNetworkResult {
    started: number;
    count: number;
    list: FuseRecordList;
}

export const useFuseRecordList = (
    current_identity_network: CurrentIdentityNetwork | undefined,
): [FuseRecordList, { done: boolean; load: (target: number) => Promise<void> }] => {
    const [list, setList] = useState<FuseRecordList>([]);
    const [done, setDone] = useState(false);

    const [next, setNext] = useState(Date.now());

    const load = useCallback(
        async (target: number) => {
            if (!current_identity_network) return;

            let _next = next;
            const done: SingleIdentityNetworkResult[] = [];
            let temp: SingleIdentityNetworkResult[] = [];
            let identity_networks = [...(current_identity_network.ic ? [current_identity_network.ic] : [])];
            while (
                0 < identity_networks.length && // empty
                [...done, ...temp].map((r) => r.list.length).reduce((a, b) => a + b, 0) < target // too less
            ) {
                const all_records: [IdentityNetwork, SingleIdentityNetworkResult][] = await Promise.all(
                    identity_networks.map(async (identity_network) => [
                        identity_network,
                        await query_local_record(identity_network, _next),
                    ]),
                );
                temp = [];
                identity_networks = [];
                for (const [identity_network, result] of all_records) {
                    if (next < result.started - DAY || result.count <= result.list.length) {
                        done.push(result);
                    } else {
                        temp.push(result);
                        identity_networks.push(identity_network as ChainIcIdentityNetwork);
                    }
                }
                _next -= DAY;
            }

            setNext(_next);
            let total = 0;
            let _list: FuseRecordList = [];
            for (const r of [...done, ...temp]) {
                total += r.count;
                _list.push(...r.list);
            }
            _list = _.sortBy(_list, (r) => -get_fuse_record_created(r));
            setDone(total <= _list.length);
            setList(_list);
        },
        [current_identity_network, next],
    );

    useEffect(() => {
        if (!current_identity_network) return;
        if (done) return;
        if (list.length) return;
        load(10);
    }, [current_identity_network, load, list, done]);

    return [list, { done, load }];
};

const CACHED: Record<string, FuseRecordList> = {};
const query_local_record_by_date = async (identity_network: IdentityNetwork, now: number): Promise<FuseRecordList> => {
    const key = `${get_identity_network_key(identity_network)}#${format_record_date(now)}`;
    let cached = CACHED[key];
    if (cached === undefined) {
        cached = await get_local_record_list(identity_network, now);
        CACHED[key] = cached;
    }
    return cached;
};
const query_local_record = async (
    identity_network: IdentityNetwork,
    next: number,
): Promise<{
    started: number;
    count: number;
    list: FuseRecordList;
}> => {
    const started = await get_local_record_started(identity_network);
    if (started === 0) return { started, count: 0, list: [] };
    const count = await get_local_record_count(identity_network);
    let now = Date.now();
    const list: FuseRecordList = [];
    while (started <= now + DAY && next < now) {
        const next_list = await query_local_record_by_date(identity_network, now);
        list.push(...next_list);
        now = now - DAY;
    }
    return {
        started,
        count: count < list.length ? list.length : count,
        list,
    };
};
