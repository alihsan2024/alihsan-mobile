import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../context/AuthContext";
import { BasketProvider } from "../context/BasketContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <BasketProvider>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="signup" options={{ headerShown: false }} />
            <Stack.Screen
              name="campaign/[slug]"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="zakat-calculator"
              options={{ headerShown: false }}
            />
          </Stack>
          <StatusBar style="auto" />
        </BasketProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
