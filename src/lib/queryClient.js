import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // 즉시 stale로 처리하여 항상 최신 데이터 가져오기
      gcTime: 1000 * 60 * 5, // 5분
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});
