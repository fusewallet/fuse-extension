import { useEffect, useState } from 'react';

import { usePort } from '@plasmohq/messaging/hook';

import { usePortUpdated } from '~hooks/store/session';
import { same } from '~lib/utils/same';

export interface PortDataMetadata0<T> {
    get_key: () => string;
    get_default_value: () => T;
    get_cached_value: () => T;
    set_cached_value: (value: T) => T; // also return new value
}

export const useFusePort = <T>(meta: PortDataMetadata0<T>): T => {
    const port = usePort<undefined, T>(meta.get_key() as never);

    const [data, setData] = useState(port.data ?? meta.get_cached_value() ?? meta.get_default_value());

    // assure initial
    useEffect(() => {
        if (data !== undefined) return;
        port.send(undefined);
    }, [data, port]);

    // always update
    useEffect(() => {
        // console.warn(`1 set port data: ${meta.get_key()}`, port.data);
        if (port.data !== undefined && !same(data, port.data)) {
            // console.error(`set port data: ${meta.get_key()}`, port.data);
            setData(meta.set_cached_value(port.data));
        }
    }, [meta, port, data]);

    // listen changed
    const [sent, setSent] = useState<number>(-1);
    const [updated] = usePortUpdated();
    useEffect(() => {
        if (sent !== updated) {
            setSent(updated);
            port.send(undefined);
        }
    }, [port, sent, updated]);

    return data;
};
