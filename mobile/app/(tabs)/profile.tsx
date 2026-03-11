import { View, Text, ScrollView, Pressable } from 'react-native'
import React from 'react'
import { useAuth } from '@clerk/clerk-expo'

const Profile = () => {

  const { signOut } = useAuth()
  return (
    <ScrollView className='bg-surface' contentInsetAdjustmentBehavior='automatic' >
      <Text className='text-white'>Profile</Text>
      <Pressable className='bg-red-600 border rounded-full py-3 px-6 self-start' onPress={() => signOut()}> 
        <Text className='text-lg text-white'>
          Sign Out
        </Text>
      </Pressable>
    </ScrollView>
  )
}

export default Profile