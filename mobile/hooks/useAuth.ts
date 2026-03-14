import { useApi } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import type { User } from "@/types";

export const useAuthCallback = () => {
    const { apiWithAuth } = useApi()

    const result = useMutation<User , Error , void>({
        mutationFn: async() => {
            const { data } = await apiWithAuth({ method: "POST" , url: "/auth/callback"})
            return data as User
        }
    })

    return result
}
