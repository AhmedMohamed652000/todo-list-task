import { useMutation, useQueryClient } from "@tanstack/react-query";
import baseUrl from "../api/config";

interface UpdateTaskParams<T> {
    id: string;
    data: T;
}

export function useUpdateTask(queryKey: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: UpdateTaskParams<any>) =>
            baseUrl.put(`tasks/${id}`, data),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [queryKey],
            });
        },
    });
}
