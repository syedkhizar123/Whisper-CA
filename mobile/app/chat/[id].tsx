import { View, Text, Pressable } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ScrollView } from 'react-native-reanimated/lib/typescript/Animated'
import { useCurrentUser } from '@/hooks/useAuth'
import { useMessages } from '@/hooks/useMessages'
import { router, useLocalSearchParams } from 'expo-router'
import { useSocketStore } from '@/lib/socket'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'

type ChatParams = {
  id: string,
  participantId: string,
  name: string,
  avatar: string
}

const ChatDetails = () => {

  const { id: chatId, participantId, name, avatar } = useLocalSearchParams<ChatParams>()
  const [messageText, setMessageText] = useState("")
  const [isSending, setIsSending] = useState(false)
  const scrollViewRef = useRef<ScrollView>(null)

  const { data: currentUser } = useCurrentUser()
  const { data: messages, isLoading } = useMessages(chatId)

  const { joinChat, leaveChat, sendMessage, sendTyping, isConnected, onlineUsers, typingUsers } = useSocketStore()

  const isUserOnline = participantId ? onlineUsers.has(participantId) : true
  const isUserTyping = typingUsers.get(chatId) === participantId

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (chatId && isConnected) joinChat(chatId)

    return () => {
      if (chatId) leaveChat(chatId)
    }
  }, [chatId, isConnected, joinChat, leaveChat])

  useEffect(() => {
    if (messages && messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true })
      }, 100)
    }
  }, [messages])

  const handleTyping = useCallback((text: string) => {
    setMessageText(text)

    if (!isConnected || !chatId) return

    if (text.length > 0) {
      sendTyping(chatId, true)

      // clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      // Stop typing indicator after 2 seconds of no input
      typingTimeoutRef.current = setTimeout(() => {
        sendTyping(chatId, false)
      }, 2000)
    }
    else {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      sendTyping(chatId, false)
    }
  } , [chatId , isConnected , sendTyping])

  const handelSend = () => {
    if(!messageText.trim() || isSending || !isConnected || !currentUser) return 

     if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      sendTyping(chatId, false)

      setIsSending(true)
      sendMessage(chatId , messageText.trim() , {
        _id: currentUser._id,
        name: currentUser.name,
        email: currentUser.email,
        avatar: currentUser.avatar
      })
      setMessageText("")
      setIsSending(false)

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true})
      } , 100)
  }

  return (
    <SafeAreaView className='flex-1 bg-surface' edges={["top" , "bottom"]}>

       {/* Header */}
      <View className="flex-row items-center px-4 py-2 bg-surface border-b border-surface-light">
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#F4A261" />
        </Pressable>
        <View className="flex-row items-center flex-1 ml-2">
          {avatar && <Image source={avatar} style={{ width: 40, height: 40, borderRadius: 999 }} />}
          <View className="ml-3">
            <Text className="text-foreground font-semibold text-base" numberOfLines={1}>
              {name}
            </Text>
            <Text className={`text-xs ${isUserTyping ? "text-primary" : "text-muted-foreground"}`}>
              {isUserTyping ? "typing..." : isUserOnline ? "Online" : "Offline"}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center gap-3">
          <Pressable className="w-9 h-9 rounded-full items-center justify-center">
            <Ionicons name="call-outline" size={20} color="#A0A0A5" />
          </Pressable>
          <Pressable className="w-9 h-9 rounded-full items-center justify-center">
            <Ionicons name="videocam-outline" size={20} color="#A0A0A5" />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default ChatDetails