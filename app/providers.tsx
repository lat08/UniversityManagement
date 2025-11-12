'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { ThemeProvider } from './providers/ThemeProvider';
import { ToastProvider } from './components/ui/toaster';


export default function AppProviders({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh longer
        gcTime: 10 * 60 * 1000, // 10 minutes cache (renamed from cacheTime)
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors
          if (error instanceof Error && 'status' in error) {
            const status = (error as { status?: number }).status;
            if (status && status >= 400 && status < 500) return false;
          }
          return failureCount < 2;
        },
        refetchOnWindowFocus: true, // Enable for real-time feel
        refetchOnReconnect: true,
        refetchInterval: false, // Disable polling by default
      },
      mutations: { 
        retry: 0,
        onError: () => {
          // Global mutation error handler - can add logging service here
        },
      },
    },
  }));

  return (
    <QueryClientProvider client={client}>
      <ThemeProvider>
        <ToastProvider />
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}