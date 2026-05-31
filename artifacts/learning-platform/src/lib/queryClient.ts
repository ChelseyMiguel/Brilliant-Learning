import { QueryClient } from "@tanstack/react-query";

// On static hosts (Surge, Netlify) there's no /api backend.
// Return null instead of throwing so pages render with empty data.
async function safeFetch(url: string) {
  try {
    const res = await fetch(url as string);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: false,
      queryFn: ({ queryKey }) => safeFetch(queryKey[0] as string),
    },
  },
});
