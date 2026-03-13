import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Stack } from "expo-router";
import { View, ActivityIndicator, Text } from "react-native";

export const options = {
    headerShown: false
}

export default function SSOCallback() {
    const { isLoaded, isSignedIn } = useAuth();

    if (!isLoaded) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#1DA1F2" />
            </View>
        );
    }

    if (isSignedIn) {
        return <Redirect href="/(tabs)" />;
    }

    else {
        return null
    }

}