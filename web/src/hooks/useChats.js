import { useAuth } from "@clerk/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import api from "../lib/axios"



export const useChats = () => {
    const { getToken, isLoaded } = useAuth()

    return useQuery({
        queryKey: ["chats"],
        queryFn: async () => {
            try {
                const token = await getToken()
                const res = await api.get("/chats", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "ngrok-skip-browser-warning": "true",
                    }
                })
                return res.data
            } catch (error) {
                console.log("Error Message :-", error.message)
                throw error
            }
        }
    })
}

export const useGetOrCreateChat = () => {
    const { getToken } = useAuth()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (participantId) => {
            const token = await getToken()
            const res = await api.post(
                `/chats/with/${participantId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "ngrok-skip-browser-warning": "true"
                    }
                }
            )
            return res.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["chats"] })
        }
    })
}