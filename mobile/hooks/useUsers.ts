import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { User , Chat} from "@/types"
import { useApi } from "@/lib/axios";

export const useUsers = () => {

    const { apiWithAuth } = useApi()

    return useQuery({ 
        queryKey: ["users"],
        queryFn: async () => {
            const { data } = await apiWithAuth<User []>({ method: "GET" , url: "/users"})
            return data
        }
    })
}
