import { useState, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import baseUrl from "../api/config";
import type { ApiResponse } from "../types/apiResponse";
import type { Task } from "../types/task";

interface UseInfiniteScrollProps {
  endpoint: string;
  queryKey: (string | number)[];
  limit?: number;
}

export const useInfiniteScroll = ({
  endpoint,
  queryKey,
  limit = 10,
}: UseInfiniteScrollProps) => {
  const [allTasks, setAllTasks] = useState<Task[]>([]);

  const query = useInfiniteQuery<ApiResponse<Task[]>>({
    queryKey,
    queryFn: async ({ pageParam = 1 }) => {
      const response = await baseUrl.get(
        `${endpoint}&page=${pageParam}&limit=${limit}`
      );
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  // Combine all pages data
  useEffect(() => {
    if (query.data) {
      const combined = query.data.pages.flatMap((page) => page.data);
      setAllTasks(combined);
    }
  }, [query.data]);

  return {
    tasks: allTasks,
    hasMore: query.hasNextPage ?? false,
    isLoadingMore: query.isFetchingNextPage,
    loadMore: query.fetchNextPage,
    total: query.data?.pages[0]?.total ?? 0,
    isLoading: query.isLoading,
    error: query.error,
  };
};
