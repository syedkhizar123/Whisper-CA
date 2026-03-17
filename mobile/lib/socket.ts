import { create } from "zustand"
import { io, Socket } from "socket.io-client"
import { QueryClient } from "@tanstack/react-query";
import { Chat, Message, MessageSender } from "@/types";
import * as Sentry from '@sentry/react-native';


const SOCKET_URL = "https://interclub-adelaida-dextrocardial.ngrok-free.dev"

interface SocketState {
    socket: Socket | null;
    isConnected: boolean;
    onlineUsers: Set<string>;
    typingUsers: Map<string, string>; // chatId -> userId
    unreadChats: Set<string>;
    currentChatId: string | null;
    queryClient: QueryClient | null;

    connect: (token: string, queryClient: QueryClient) => void;
    disconnect: () => void;
    joinChat: (chatId: string) => void;
    leaveChat: (chatId: string) => void;
    sendMessage: (chatId: string, text: string, currentUser: MessageSender) => void;
    sendTyping: (chatId: string, isTyping: boolean) => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
    socket: null,
    isConnected: false,
    onlineUsers: new Set(),
    typingUsers: new Map(),
    unreadChats: new Set(),
    currentChatId: null,
    queryClient: null,

    connect: (token, queryClient) => {
        const existingSocket = get().socket
        if (existingSocket?.connected) return

        if (existingSocket) existingSocket.disconnect()

        const socket = io(SOCKET_URL, { auth: { token } })

        socket.on("connect", () => {
            console.log("Socket Connected", { socketID: socket.id })
            set({ isConnected: true })
        })

        socket.on("disconnect", () => {
            console.log("Socket disconnected", { socketID: socket.id })
            set({ isConnected: false })
        })

        socket.on("online-users", ({ userIds }: { userIds: string[] }) => {
            console.log("Recieved online users", userIds)
            set({ onlineUsers: new Set(userIds) })
        })

        socket.on("user-online", ({ userId }: { userId: string }) => {
            set((state) => ({
                onlineUsers: new Set([...state.onlineUsers, userId])
            }))
        })

        socket.on("user-offline", ({ userId }: { userId: string }) => {
            set((state) => {
                const onlineUsers = new Set(state.onlineUsers)
                onlineUsers.delete(userId)
                return { onlineUsers: onlineUsers }
            })
        })

        socket.on("socket-error", (error: { message: string }) => {
            console.log("Socket error", error.message)
            Sentry.logger.error("Socket error occured", {
                message: error.message
            })
        })

        socket.on("new-message", (msg: Message) => {
            const senderId = (msg.sender as MessageSender)._id
            const { currentChatId } = get()

            queryClient.setQueryData<Message[]>(["messages", msg.chat], (old) => {
                if (!old) return []
                const filtered = old.filter((msg) => !msg._id.startsWith("temp-"))
                if (filtered.some((m) => m._id === msg._id)) return filtered
                return [...filtered, msg]
            })

            queryClient.setQueryData<Chat[]>([" chats"], (oldChats) => {
                return oldChats?.map((chat) => {
                    if (chat._id === msg.chat) {
                        return {
                            ...chat,
                            lastMessage: {
                                _id: msg._id,
                                text: msg.text,
                                sender: senderId,
                                createdAt: msg.createdAt,
                            },
                            lastMessageAt: msg.createdAt
                        }
                    }
                    return chat
                })
            })

            if (currentChatId !== msg.chat) {
                const chats = queryClient.getQueryData<Chat[]>(["chats"])
                const chat = chats?.find((c) => c._id === msg.chat)
                if (chat?.participant && senderId === chat.participant._id) {
                    set((state) => ({
                        unreadChats: new Set([...state.unreadChats, msg.chat])
                    }))
                }
            }

            set((state) => {
                const typingUsers = new Map(state.typingUsers)
                typingUsers.delete(msg.chat)
                return { typingUsers: typingUsers }
            })
        })

        socket.on("typing" , ({ userId , chatId , isTyping} : {userId: string , chatId: string , isTyping: boolean}) => {

            set((state) => {
                const typingUsers = new Map(state.typingUsers)
                if (isTyping) typingUsers.set(chatId , userId)
                else typingUsers.delete(chatId)
                return { typingUsers: typingUsers}
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
                isConnected: false,
                onlineUsers: new Set(),
                typingUsers: new Map(),
                unreadChats: new Set(),
                currentChatId: null,
                queryClient: null
            })
        }
    },
    joinChat: (chatId) => {
        const socket = get().socket
        set((state) => {
            const unreadChats = new Set(state.unreadChats)
            unreadChats.delete(chatId)
            return { currentChatId: chatId, unreadChats }
        })

        if (socket?.connected) {
            socket.emit("join-chat", chatId)
        }
    },
    leaveChat: (chatId) => {
        const socket = get().socket
        set({ currentChatId: null })
        if (socket?.connected) {
            socket.emit("leave-chat", chatId)
        }
    },
    sendMessage: (chatId, text, currentUser) => {
        const { socket, queryClient } = get()
        if (!socket?.connected || !queryClient) return

        const tempId = `temp-${Date.now()}`
        const optimisticMsg: Message = {
            _id: tempId,
            chat: chatId,
            sender: currentUser,
            text,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }

        queryClient.setQueryData<Message[]>(["messages", chatId], (old) => {
            if (!old) return [optimisticMsg]
            return [...old, optimisticMsg]
        })

        socket.emit("send-message", { chatId, text })

        Sentry.logger.info("Message sent successfully", { chatId, messageLength: text.length })

        const errorHandler = (error: { message: string }) => {
            Sentry.logger.error("Failed to send message", {
                chatId,
                error: error.message
            })
            queryClient.setQueryData<Message[]>(["messages", chatId], (old) => {
                if (!old) return []
                return old.filter((msg) => msg._id !== tempId)
            })
            socket.off("socket-error", errorHandler)
        }
        socket.once("socket-error", errorHandler)
    },
    sendTyping: () => { }
}))