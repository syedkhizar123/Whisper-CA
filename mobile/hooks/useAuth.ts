import { useApi } from "@/lib/axios";
import { useMutation, useQuery } from "@tanstack/react-query";
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

export const useCurrentUser = () => {

    const { apiWithAuth } = useApi()

    return useQuery({
        queryKey: ["currentUser"],
        queryFn: async () => {
            const { data } = await apiWithAuth<User>({ method: "GET" , url: "/auth/me"})
            return data
        }
    })
}