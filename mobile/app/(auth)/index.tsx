import { Ionicons } from '@expo/vector-icons';
import { View, Text, Image, Dimensions, Pressable, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useSocialAuth } from '@/hooks/useSocialAuth';

const AuthScreen = () => {

  const { width, height } = Dimensions.get("window");
  const { handleSocialAuth, loading } = useSocialAuth()
  return (
    <View className='flex-1 bg-surface-dark'>
      <View className='absolute inset-0 overflow-hidden'></View>
      <SafeAreaView className='flex-1 '>

        {/* Top Section */}
        <View className='items-center pt-10'>
          <Image
            source={require("../../assets/images/logo.png")}
            style={{ width: 100, height: 100, marginVertical: -20 }}
            resizeMode='contain'
          />
          <Text className='text-4xl font-bold text-primary font-serif tracking-wider uppercase'>
            Whisper
          </Text>

        </View>

        {/* Center Section */}
        <View className='flex-1 justify-center items-center px-6'>
          <Image
            source={require('../../assets/images/auth.png')}
            style={{
              width: width - 48,
              height: height * 0.3
            }}
            resizeMode='contain'
          />

          {/* Headline */}
          <View className='mt-6 items-center'>
            <Text className='text-5xl font-bold text-foreground text-center font-sans'>
              Connect & Chat
            </Text>
            <Text className='text-3xl font-bold text-primary font-mono'>
              Seamlessly
            </Text>
          </View>

          {/* Auth Buttons */}
          <View className='flex-row gap-4 mt-10'>
            <Pressable className='flex-1 flex-row items-center justify-center gap-2 bg-white/10 py-4 rounded-2xl border border-white/20~ active:scale-[0.97]'
              disabled={loading === "oauth_google"}
              onPress={() => handleSocialAuth("oauth_google")}
            >
              {
                loading === "oauth_google" ? (
                  <ActivityIndicator size="small" color="#FFFF" />
                ) : (
                  <>
                    <Image
                      source={require('../../assets/images/google.png')}
                      style={{ height: 20, width: 20 }}
                      resizeMode='contain'
                    />
                    <Text className='text-foreground font-semibold text-sm'>Google</Text>
                  </>
                )
              }
            </Pressable>
            <Pressable className='flex-1 flex-row items-center justify-center gap-2 bg-white/10 py-4 rounded-2xl border border-white/20 active:scale-[0.97]'
              disabled={loading === "oauth_apple"}
              onPress={() => handleSocialAuth("oauth_apple")}
            >
              {
                loading === "oauth_apple" ? (
                  <ActivityIndicator size='small' color='#FFFFFF' />
                ) : (
                  <>
                    <Ionicons name='logo-apple' size={20} color="#FFFFFF" />
                    <Text className='text-foreground font-semibold text-sm'>Apple</Text>
                  </>
                )
              }
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  )
}

export default AuthScreen