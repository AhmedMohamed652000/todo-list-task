import { useMutation, useQueryClient } from "@tanstack/react-query";
import baseUrl from "../api/config";

interface EditParams<T> {
    endpoint: string;
    id: string;
    data: T;
}

export function useEdit<T = any>(queryKey: string | string[]) {
    const queryClient = useQueryClient();

    const keys = Array.isArray(queryKey) ? queryKey : [queryKey];

    return useMutation({
        mutationFn: ({ endpoint, id, data }: EditParams<T>) =>
            baseUrl.put(`${endpoint}/${id}`, data),

        onSuccess: () => {
            keys.forEach((k) => {
                queryClient.invalidateQueries({ queryKey: [k] });
            });
        },
    });
}