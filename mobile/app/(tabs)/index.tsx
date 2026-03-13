import { View, Text, ScrollView } from 'react-native'
import { useUsersync } from '@/hooks/useUserSync'
import * as Sentry from '@sentry/react-native';

const Chats = () => {

  useUsersync()
  return (
    <ScrollView className='bg-surface' contentInsetAdjustmentBehavior='automatic'>
      <Text className='text-white'>Chats</Text>
    </ScrollView>
  )
}

export default Chats
