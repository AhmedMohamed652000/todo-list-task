import { useQuery, type QueryKey } from "@tanstack/react-query";
import baseUrl from "../api/config";

function useFetch<T>(endPoint: string, queryKey?: QueryKey) {
    const query = useQuery<T>({
        queryKey: queryKey ?? ["fetch", endPoint],
        queryFn: async () => {
            const response = await baseUrl.get(endPoint);
            return response.data;
        },
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    });

    return {
        data: query.data ?? null,
        loading: query.isLoading,
        error: query.error,
    };
}

export default useFetch;