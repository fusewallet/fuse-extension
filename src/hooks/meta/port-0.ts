import { useEffect, useState } from 'react';

import { usePort } from '@plasmohq/messaging/hook';

export interface PortDataMetadata0<T> {
    get_key: () => string;
    get_default_value: () => T;
    get_cached_value: () => T;
    set_cached_value: (value: T) => T; // also return new value
}

export const useFusePort = <T>(meta: PortDataMetadata0<T>): T => {
    const port = usePort<undefined, T>(meta.get_key() as never);

    const [data, setData] = useState(port.data ?? meta.get_cached_value() ?? meta.get_default_value());

    useEffect(() => {
        if (data !== undefined) return;
        port.send(undefined);
    }, [data, port]);

    useEffect(() => {
        if (port.data !== undefined) setData(meta.set_cached_value(port.data));
    }, [meta, port]);

    return data;
};
