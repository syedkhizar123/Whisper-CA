import { View, Text, Pressable, TextInput, ActivityIndicator, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useUsers } from '@/hooks/useUsers'
import { useGetOrCreateChat } from '@/hooks/useChats'
import { User } from '@/types'

const NewChatScreen = () => {

  const [search, setSearch] = useState('')
  const { data: allUsers, isLoading } = useUsers()
  const { mutate: getOrCreateChat, isPending: isCreatingChat } = useGetOrCreateChat()

  const users = allUsers?.filter((u) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return u.name?.toLowerCase().includes(query) || u.email?.toLowerCase().includes(query);
  });

  const handleUserSelect = (user: User) => {
    getOrCreateChat(user._id, {
      onSuccess: (chat) => {
        // router.push(`/chat/[id]`)
      }
    })
  }

  return (
    <SafeAreaView className='flex-1 bg-black' edges={["top"]}>
      <View className='flex-1 bg-black/40 justify-end'>
        <View className='bg-surface rounded-t-3xl h-[95%] overflow-hidden '>
          <View className='px-5 py-5 bg-surface border-b border-surface-light flex-row items-center'>
            <Pressable
              className='size-9 rounded-full items-center justify-center mr-2 bg-surface-card'
              onPress={() => router.back()}
            >
              <Ionicons name='close' size={20} color="#F4A261" />
            </Pressable>

            <View className="flex-1 ml-5">
              <Text className="text-foreground text-xl font-semibold">New chat</Text>
              <Text className="text-muted-foreground text-xs mt-0.5">
                Search for a user to start chatting
              </Text>
            </View>
          </View>

          {/* Search Bar */}
          <View className="px-5 pt-3 pb-2 bg-surface">
            <View className="flex-row items-center bg-surface-card rounded-full px-3 py-1.5 gap-2 border border-surface-light">
              <Ionicons name="search" size={18} color="#6B6B70" />
              <TextInput
                placeholder="Search users"
                placeholderTextColor="#6B6B70"
                className="flex-1 text-foreground text-sm"
                value={search}
                onChangeText={setSearch}
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Users List */}
          <View className='flex-1 bg-surface'>
            {isCreatingChat || isLoading ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#F4A261" />
              </View>
            ) : (
              !users || users.length === 0 ? (
                <View className="flex-1 items-center justify-center px-5">
                  <Ionicons name="person-outline" size={64} color="#6B6B70" />
                  <Text className="text-muted-foreground text-lg mt-4">No users found</Text>
                  <Text className="text-subtle-foreground text-sm mt-1 text-center">
                    Try a different search term
                  </Text>
                </View>
              ) : (
                <ScrollView
                  className='flex-1 px-5 pt-4'
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 24 }}
                >
                  <Text className="text-muted-foreground text-xs mb-3">USERS</Text>
                  {users.map((user) => (
                   <Text key={user._id}> {user.name} </Text>
                  ))}
                </ScrollView>
              )
            )}
          </View>


        </View>
      </View>
    </SafeAreaView>
  )
}

export default NewChatScreen