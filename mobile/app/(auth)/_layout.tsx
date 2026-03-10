import { Redirect, Stack } from 'expo-router'
import { View, Text } from 'react-native'

const AuthLayout = () => {

    const isAuth = false
    if(isAuth) return <Redirect href={"/(tabs)"} />
  return (
    <Stack screenOptions={{ headerShown: false }} />
  )
}

export default AuthLayout