import { create } from "zustand"
import { io } from "socket.io-client"

const SOCKET_URL = "https://interclub-adelaida-dextrocardial.ngrok-free.dev"

export const useSocketStore = create((set, get) => ({

    socket: null,
    onlineUsers: new Set(),
    typingUsers: new Map(),
    queryClient: null,

    connect: (token, queryClient) => {
        const existingSocket = get().socket
        if (existingSocket?.connected || !queryClient) return

        if (existingSocket) existingSocket.disconnect()

        const socket = io(SOCKET_URL, { auth: { token } })

        socket.on("connect", () => {
            console.log("Socket Connected", { socketID: socket.id })
        })

        socket.on("connect_error", (error) => {
            console.log("Socket connection error: ".error.message)
        })

        socket.on("socket-error", (error) => {
            console.log("Socket error: ", error)
        })

        socket.on("online-users", ({ userIds }) => {
            set({ onlineUsers: new Set(userIds) })
        })

        socket.on("user-online", ({ userId }) => {
            set((state) => ({
                onlineUsers: new Set([...state.onlineUsers, userId])
            }))
        })

        socket.on("user-offline", ({ userId }) => {
            set((state) => {
                const onlineUsers = new Set(state.onlineUsers)
                onlineUsers.delete(userId)
                return { onlineUsers }
            })
        })

        socket.on("typing", ({ userId, chatId, isTyping }) => {
            set((state) => {
                const typingUsers = new Map(state.typingUsers)
                if (isTyping) typingUsers.set(chatId, userId)
                else typingUsers.delete(chatId)
                return { typingUsers }
            })
        })

        socket.on("new-message", (message) => {
            const senderId = message.sender?._id

            queryClient.setQueryData(["messages", message.chat], (old) => {
                if (!old) return [message]

                const filtered = old.filter((m) => !m._id.startsWith("-temp"))
                const exists = filtered.some((m) => m._id === message._id)
                return exists ? filtered : [...filtered, message]
            })

            queryClient.setQueryData(["chats"], (oldChats) => {
                return oldChats?.map((chat) => {
                    if (chat._id === message.chat) {
                        return {
                            ...chat,
                            lastMessage: {
                                id: message._id,
                                text: message.text,
                                sender: senderId,
                                createdAt: message.createdAt
                            },
                            lastMessageAt: message.createdAt
                        }
                    }
                    return chat
                })
            })

            set((state) => {
                const typingUsers = new Map(state.typingUsers)
                typingUsers.delete(message.chat)
                return { typingUsers }
            })
        })

        set({ socket, queryClient })
    },

    disconnect: () => {
        const socket = get().socket
        if (socket) {
            socket.disconnect()
            set({
                socket: null,
                onlineUsers: new Set(),
                typingUsers: new Map(),
                queryClient: null
            })
        }
    },

    joinChat: (chatId) => {
        get().socket?.emit("join-chat", chatId)
    },

    leaveChat: (chatId) => {
        get().socket?.emit("leave-chat", chatId)
    },

    sendMessage: (chatId, text, currentUser) => {
        const { socket, queryClient } = get()
        if (!socket?.connected || !queryClient) return

        const optimisticMsg = {
            _id: tempId,
            chat: chatId,
            sender: currentUser,
            text,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }

        queryClient.setQueryData(["messages", chatId], (old) => {
            if (!old) return [optimisticMsg]
            return [...old, optimisticMsg]
        })

        socket.emit("send-message" , { chatId , text })

        socket.once("socket-error" , () => {
            queryClient.setQueryData([ "messages" , chatId] , (old) => {
                if (!old) return []
                return old.filter((m) => m._id !== tempId)
            })
        })

    },

    setTyping: (chatId, isTyping) => {
        get().socket?.emit("typing", { chatId, isTyping })
    }
})) 