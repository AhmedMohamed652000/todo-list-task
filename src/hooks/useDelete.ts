import { useMutation, useQueryClient } from "@tanstack/react-query";
import baseUrl from "../api/config";

interface DeleteParams {
    endpoint: string;
    id: string;
}

export function useDelete(queryKey: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ endpoint, id }: DeleteParams) =>
            baseUrl.delete(`${endpoint}/${id}`),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [queryKey],
            });
        },
    });
}