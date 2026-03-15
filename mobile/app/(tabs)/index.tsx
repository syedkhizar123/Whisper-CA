import { View, Text,  ActivityIndicator, FlatList, Pressable } from 'react-native'
import { useUsersync } from '@/hooks/useUserSync'
import * as Sentry from '@sentry/react-native';
import { useRouter } from 'expo-router';
import { useChats } from '@/hooks/useChats';
import { Ionicons } from '@expo/vector-icons';
import EmptyChats from '../components/EmptyChats';
import ChatItem from '../components/ChatItem';
import { Chat } from '@/types';

const Chats = () => {

  const router = useRouter()
  const { data: chats, isLoading, error , refetch} = useChats()

  useUsersync()

  const handleChatPress = (chat: Chat) => {
    router.push({
      pathname: "/chat/[id]" as any,
      params: {
        id: chat._id,
        participantId : chat.participant._id,
        name: chat.participant.name,
        avatar: chat.participant.avatar
      }
    })
  }

  if (isLoading) {
    return (
      <View className='flex-1 items-center justify-center bg-surface'>
        <ActivityIndicator size={'large'} color={'#f4A261'} />
      </View>
    )
  }

  if (error) {
    return (
      <View className='flex-1 items-center justify-center bg-surface'>
        <Text className='text-gray-300 text-2xl font-bold'>Failed to load Chats</Text>
        <Pressable onPress={() => refetch()} className='mt-4 px-4 py-2 bg-primary rounded-lg'>
          <Text className='text-foreground text-xl font-semibold'>Retry</Text>
        </Pressable>
      </View>
    )
  }
  return (
    <View className='flex-1 bg-surface'>
      <FlatList
        data={chats}
        keyExtractor={(item) => item._id}
        renderItem={({item}) => <ChatItem chat={item} onPress={() => handleChatPress(item)}  />}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior='automatic'
        contentContainerStyle={{ paddingHorizontal: 20 , paddingTop: 16, paddingBottom: 24}}
        ListHeaderComponent={<Header />}
        ListEmptyComponent={<EmptyChats
          title='No chats yet'
          subtitle='Start a conversation!'
          iconName='chatbubbles-outline'
          iconColor='#6B6B70'
          iconSize={64}
          buttonLabel='New Chat'
          onPressButton={() => console.log("Pressed")}
          />}
      />
    </View>
  )
}


export default Chats

function Header() {
  return (
    <View className='px-5 pt-2 pb-4'>
      <View className='flex-row items-center justify-between'>
        <Text className='text-2xl font-bold text-foreground'>Chats</Text>
        <Pressable className='size-10 bg-primary rounded-full items-center justify-center'>
          <Ionicons name='create-outline' size={20} color="#0D0D0F" />
        </Pressable>
      </View>
    </View>
  )
}
