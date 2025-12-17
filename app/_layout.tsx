import { Stack } from "expo-router";
import React, { useEffect } from "react";
import {
  requestUserPermission,
  onMessageListener,
  setBackgroundMessageHandler,
} from "@/utils/notifications";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../context/AuthContext";
import { BasketProvider } from "../context/BasketContext";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { Alert } from "react-native";

export default function RootLayout() {
  useEffect(() => {
    requestUserPermission().then((token) => {
      if (token) {
        // Send token to your backend for notification targeting
        console.log("FCM Token:", token);
      }
    });

    const unsubscribe = onMessageListener((message) => {
      // Handle foreground notification
      Alert.alert("Notification received: " + JSON.stringify(message));
    });

    // Optional: handle background notifications (Android)
    setBackgroundMessageHandler((message) => {
      // You can process background notifications here
      console.log("Background notification:", message);
    });

    return unsubscribe;
  }, []);
  return (
    <SafeAreaProvider>
      <Provider store={store}>
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
                name="user-donations"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="project-status"
                options={{ headerShown: false }}
              />
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
      </Provider>
    </SafeAreaProvider>
  );
}
