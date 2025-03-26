// import { useEffect, useState } from 'react';
// import { useLocation } from 'react-router-dom';

// import { usePort } from '@plasmohq/messaging/hook';

// import type { RequestBody, ResponseBody } from '~background/ports/direct-initialized';
// import { DIRECT_PORT_INITIALIZED } from '~lib/messages';

// let cached_initialized: boolean | undefined = undefined;
// export const useInitialized = (): boolean => {
//     const port = usePort<RequestBody, ResponseBody>(DIRECT_PORT_INITIALIZED as never);

//     const [data, setData] = useState(port.data ?? cached_initialized);

//     const location = useLocation();
//     console.error(`🚀 ~ useInitialized ~ port:`, location.pathname, port, data);

//     useEffect(() => {
//         if (data !== undefined) return;
//         port.send(undefined);
//     }, [data, port]);

//     useEffect(() => {
//         if (port.data !== undefined) setData((cached_initialized = port.data));
//     }, [port]);

//     return !!data;
// };
