'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from 'sonner';
import { dashboardApi } from '@/lib/dashboardApi';
import { useAuthStore } from '@/stores/authStore';
import { useEffect } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      })
  );

  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshToken = useAuthStore((state) => state.refreshToken);

  useEffect(() => {
    // Initialize dashboardApi with tokens from store
    if (accessToken && refreshToken) {
      dashboardApi.setTokens({ access: accessToken, refresh: refreshToken });
    }
  }, [accessToken, refreshToken]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
        <Toaster position="top-right" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
