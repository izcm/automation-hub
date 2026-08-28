"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { LanguageProvider } from "@/lib/contexts/LanguageContext";

export function Providers({ children }: { children: React.ReactNode }) {
  // useState so the client is created once per component instance, not per render.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // avoid an immediate refetch on the client after SSR
            staleTime: 60 * 1000,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>{children}</LanguageProvider>
    </QueryClientProvider>
  );
}
