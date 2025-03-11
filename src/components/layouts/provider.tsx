import { QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode } from 'react';

import { queryClient } from '~lib/react-query';

interface QueryProviderProps {
    children: ReactNode;
}

export function ReactQueryProvider({ children }: QueryProviderProps) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
