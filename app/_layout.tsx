import "react-native-get-random-values";
import { Stack } from "expo-router";
import useNotificationNavigation from "../hooks/useNotificationNavigation";
import React, { useEffect, useContext } from "react";
import {
  requestUserPermission,
  onMessageListener,
  setBackgroundMessageHandler,
} from "@/utils/notifications";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import {
  getOrCreateGuestId,
  getLastRegisteredDeviceInfo,
  setLastRegisteredDeviceInfo,
} from "@/utils/deviceRegistration";
import { registerDeviceToken } from "@/utils/api";
import { BasketProvider } from "../context/BasketContext";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { Alert } from "react-native";

function DeviceRegistrationManager() {
  const { user } = useAuth();
  useEffect(() => {
    let isMounted = true;
    async function registerDeviceIfNeeded() {
      const token = await requestUserPermission();
      if (!token) return;
      const guest_id = await getOrCreateGuestId();
      const user_id = user?.id || null;
      const platform = Platform.OS;
      const lastInfo = await getLastRegisteredDeviceInfo();
      // Only register if any value changed
      if (
        !lastInfo ||
        lastInfo.token !== token ||
        lastInfo.user_id !== user_id ||
        lastInfo.guest_id !== guest_id ||
        lastInfo.platform !== platform
      ) {
        try {
          await registerDeviceToken({ token, user_id, guest_id, platform });
          await setLastRegisteredDeviceInfo({
            token,
            user_id,
            guest_id,
            platform,
          });
        } catch (e) {
          console.log("Device registration failed", e);
        }
      }
    }
    registerDeviceIfNeeded();
    return () => {
      isMounted = false;
    };
  }, [user]);
  return null;
}

export default function RootLayout() {
  useNotificationNavigation();
  useEffect(() => {
    const unsubscribe = onMessageListener((message) => {
      Alert.alert("Notification received: " + JSON.stringify(message));
    });
    setBackgroundMessageHandler((message) => {
      console.log("Background notification:", message);
    });
    return unsubscribe;
  }, []);
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <AuthProvider>
          <DeviceRegistrationManager />
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
