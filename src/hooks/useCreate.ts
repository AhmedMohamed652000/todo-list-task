import { useMutation, useQueryClient } from "@tanstack/react-query";
import baseUrl from "../api/config";

interface CreateParams<T> {
    endpoint: string;
    data: T;
}

export function useCreate<T = any>(queryKey: string | string[]) {
    const queryClient = useQueryClient();
    const keys = Array.isArray(queryKey) ? queryKey : [queryKey];

    return useMutation({
        mutationFn: ({ endpoint, data }: CreateParams<T>) =>
            baseUrl.post(endpoint, data),
        onSuccess: () => {
            keys.forEach((k) => {
                queryClient.invalidateQueries({ queryKey: [k] });

            });
        },
    });
}