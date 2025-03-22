import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { persistQueryClient } from '@tanstack/query-persist-client-core';
import { QueryClient } from '@tanstack/react-query';
import { stringify } from 'viem';

import { SHOULD_DEHYDRATE_QUERY_KEY } from '~hooks/evm/viem';
import { LOCAL_KEY_REACT_QUERY_CACHE } from '~hooks/store/keys';
import { __get_local_storage } from '~hooks/store/local';

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
    storage: __get_local_storage(),
    key: LOCAL_KEY_REACT_QUERY_CACHE,
    throttleTime: 2000, // avoid frequent updates
    serialize: (data) => stringify(data),
    deserialize: (data) => JSON.parse(data),
});

// Configure query client persistence
persistQueryClient({
    queryClient,
    persister: asyncStoragePersister,
    // Optional: Configure which queries to persist
    dehydrateOptions: {
        shouldDehydrateQuery: (query) => {
            // Only persist successful queries that are marked for dehydration
            return query.queryKey.includes(SHOULD_DEHYDRATE_QUERY_KEY) && query.state.status === 'success';
        },
    },
});
