import { View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, TextInput } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useCurrentUser } from '@/hooks/useAuth'
import { useMessages } from '@/hooks/useMessages'
import { router, useLocalSearchParams } from 'expo-router'
import { useSocketStore } from '@/lib/socket'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import EmptyChats from '@/components/EmptyChats'
import { MessageSender } from '@/types'
import MessageBubble from '@/components/MessageBubble'

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
      }, 1000)
    }
    else {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      sendTyping(chatId, false)
    }
  }, [chatId, isConnected, sendTyping])

  const handleSend = () => {
    if (!messageText.trim() || isSending || !isConnected || !currentUser) return

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    sendTyping(chatId, false)

    setIsSending(true)
    sendMessage(chatId, messageText.trim(), {
      _id: currentUser._id,
      name: currentUser.name,
      email: currentUser.email,
      avatar: currentUser.avatar
    })
    setMessageText("")
    setIsSending(false)

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true })
    }, 100)
  }

  return (
    <SafeAreaView className='flex-1 bg-surface' edges={["top", "bottom"]}>

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


      {/* Messages and Keyboard Input */}
      <KeyboardAvoidingView className='flex-1'
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <View className='flex-1 bg-surface'>
          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#F4A261" />
            </View>
          ) : !messages || messages.length === 0 ? (
            <EmptyChats
              title="No messages yet"
              subtitle="Start the conversation!"
              iconName="chatbubbles-outline"
              iconColor="#6B6B70"
              iconSize={64}
            />
          ) : (
            <ScrollView
              ref={scrollViewRef}
              contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}
              onContentSizeChange={() => {
                scrollViewRef.current?.scrollToEnd({ animated: false })
              }}
            >
              {
                messages.map((message) => {
                  if (!message.sender) {
                    console.log("NULL SENDER MESSAGE:", message)
                    return null
                  }
                  const senderId = (message.sender as MessageSender)._id
                  const isFromMe = currentUser ? senderId === currentUser._id : false
                  return <MessageBubble key={message._id} message={message} isFromMe={isFromMe} />

                })
              }
            </ScrollView>
          )}

          {/* Input Bar */}
         
            <View className='px-3 pb-3 pt-2 bg-surface border-t border-surface-light'>
              <View className='flex-row items-end bg-surface-card rounded-3xl px-3 py-1.5 gap-2'>
                <Pressable className="w-8 h-8 rounded-full items-center justify-center">
                  <Ionicons name="add" size={22} color="#F4A261" />
                </Pressable>

                <TextInput
                  placeholder="Type a message"
                  placeholderTextColor="#6B6B70"
                  className="flex-1 text-foreground text-sm mb-2"
                  multiline
                  style={{ maxHeight: 100 }}
                  value={messageText}
                  onChangeText={handleTyping}
                  onSubmitEditing={handleSend}
                  editable={!isSending}
                />

                <Pressable
                  className="w-8 h-8 rounded-full items-center justify-center bg-primary"
                  onPress={handleSend}
                  disabled={!messageText.trim() || isSending}
                >
                  {isSending ? (
                    <ActivityIndicator size="small" color="#0D0D0F" />
                  ) : (
                    <Ionicons name="send" size={18} color="#0D0D0F" />
                  )}
                </Pressable>
              </View>
            </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default ChatDetails