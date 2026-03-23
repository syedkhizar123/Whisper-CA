import { useAuth } from "@clerk/react";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import api from "../lib/axios";


export const useUserSync = () => {

    const { isSignedIn, getToken } = useAuth()
    const { mutate: syncUser, isPending, isSuccess } = useMutation({
        mutationFn: async () => {
            const token = await getToken()
            const res = await api.post(
                "/auth/callback",
                {},
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            )
            return res.data
        },
        onSuccess: () => {
            console.log("User synced with backend")
        },
        onError: () => {
            console.log("Failed to sync user with backend")
        }
    })

    useEffect(() => {
        if (isSignedIn && !isPending && !isSuccess) {
            syncUser()
        }
    }, [isSignedIn , syncUser , isPending , isSuccess])
    return {
        isSynced: isSuccess,
        isSyncing: isPending
    }
}

