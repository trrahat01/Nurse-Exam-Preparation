import { QueryClient } from '@tanstack/react-query';

/**
 * Singleton QueryClient instance shared across the app.
 * Used by both the React Query provider and standalone functions
 * that need to invalidate queries outside of component lifecycle.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 * 5, refetchOnWindowFocus: false },
  },
});