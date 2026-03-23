import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import api from "../lib/axios";

export const useUsers = () => {
    const { getToken } = useAuth()

    return useQuery({
        queryKey: ["users"],
        queryFn: async () => {
            try {
                const token = await getToken()
                const res = await api.get("/users", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "ngrok-skip-browser-warning": "true"
                    }
                })
                return res.data
            } catch (error) {
                console.log("Error fetching users:", error.message)
                throw error
            }
        }
    })
}