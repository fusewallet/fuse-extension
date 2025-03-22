import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { persistQueryClient } from '@tanstack/query-persist-client-core';
import { QueryClient } from '@tanstack/react-query';

import { Storage } from '@plasmohq/storage';

import { parse_factory, stringify_factory } from './utils/json';

// import { SHOULD_DEHYDRATE_QUERY_KEY } from '~hooks/evm/viem';
// import { LOCAL_KEY_REACT_QUERY_CACHE } from '~hooks/store/keys';
// import { __get_local_storage } from '~hooks/store/local';

const stringify = stringify_factory(JSON.stringify);
const parse = parse_factory(JSON.parse);

// Create QueryClient instance
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Browser extension optimization configuration
            refetchOnWindowFocus: false,
            refetchOnMount: true,
            retry: 1,
            staleTime: 5 * 60 * 1000, // 5 minutes
        },
    },
});

// Create storage persistence
const asyncStoragePersister = createAsyncStoragePersister({
    // FIXME
    // storage: __get_local_storage(),
    storage: new Storage({ area: 'local' }),
    // FIXME
    // key: LOCAL_KEY_REACT_QUERY_CACHE,
    key: 'cache',
    throttleTime: 2000, // avoid frequent updates
    serialize: stringify,
    deserialize: parse,
});

// Configure query client persistence
persistQueryClient({
    queryClient,
    persister: asyncStoragePersister,
    // Optional: Configure which queries to persist
    dehydrateOptions: {
        shouldDehydrateQuery: (query) => {
            // Only persist successful queries that are marked for dehydration
            // FIXME
            // return query.queryKey.includes(SHOULD_DEHYDRATE_QUERY_KEY) && query.state.status === 'success';
            return query.queryKey.includes('2123') && query.state.status === 'success';
        },
    },
});
