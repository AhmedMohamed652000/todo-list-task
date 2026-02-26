import { useMutation, useQueryClient } from "@tanstack/react-query";
import baseUrl from "../api/config";

function useDeleteTask(endPoint: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await baseUrl.delete(`${endPoint}/${id}`);
        },

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["fetchTaks"] });
        },
    });
}

export default useDeleteTask;