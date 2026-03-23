import { useAuth } from "@clerk/react"
import { useQuery } from "@tanstack/react-query"
import api from "../lib/axios"


export const useMessages = (chaId) => {

    const { getToken } = useAuth()

    return useQuery({
        queryKey: ["messages", chaId],
        queryFn: async () => {
            const token = await getToken()
            const res = await api.get(`/messages/chat/${chaId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "ngrok-skip-browser-warning": "true",
                }
            })
            return res.data
        },
        enabled: !!chaId
    })
}