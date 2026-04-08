'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  PersistQueryClientProvider,
  type Persister,
} from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { useState, useEffect, type ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            gcTime: 24 * 60 * 60 * 1000, // 24 hours
            staleTime: 60 * 60 * 1000, // 1 hour fresh
            refetchOnWindowFocus: false, // Don't refetch on focus by default
            retry: 1, // Only retry once
          },
        },
      }),
  );

  const [persister, setPersister] = useState<Persister | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPersister(
        createSyncStoragePersister({
          storage: window.localStorage,
          key: 'KINKO_REACT_QUERY_OFFLINE_CACHE',
        }),
      );
    }
  }, []);

  if (!persister) {
    // SSR or Initial Render before hydration
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
