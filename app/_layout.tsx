import "react-native-get-random-values";
import { Stack } from "expo-router";
// import useNotificationNavigation from "../hooks/useNotificationNavigation";
import React, { useEffect, useContext } from "react";
import IntroSlide from "../components/ui/sliders/IntroSlide";

// import {
//   requestUserPermission,
//   onMessageListener,
//   setBackgroundMessageHandler,
// } from "@/utils/notifications";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { Platform } from "react-native";
// import {
//   getOrCreateGuestId,
//   getLastRegisteredDeviceInfo,
//   setLastRegisteredDeviceInfo,
// } from "@/utils/deviceRegistration";
// import { registerDeviceToken } from "@/utils/api";
import { BasketProvider } from "../context/BasketContext";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { Alert, View, Text, TextInput } from "react-native";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useFonts,
  AlbertSans_100Thin,
  AlbertSans_200ExtraLight,
  AlbertSans_300Light,
  AlbertSans_400Regular,
  AlbertSans_500Medium,
  AlbertSans_600SemiBold,
  AlbertSans_700Bold,
  AlbertSans_800ExtraBold,
  AlbertSans_900Black,
  AlbertSans_100Thin_Italic,
  AlbertSans_200ExtraLight_Italic,
  AlbertSans_300Light_Italic,
  AlbertSans_400Regular_Italic,
  AlbertSans_500Medium_Italic,
  AlbertSans_600SemiBold_Italic,
  AlbertSans_700Bold_Italic,
  AlbertSans_800ExtraBold_Italic,
  AlbertSans_900Black_Italic,
} from "@expo-google-fonts/albert-sans";

function DeviceRegistrationManager() {
  const { user } = useAuth();
  // useEffect(() => {
  //   let isMounted = true;
  //   async function registerDeviceIfNeeded() {
  //     // const token = await requestUserPermission();
  //     // if (!token) return;
  //     const guest_id = await getOrCreateGuestId();
  //     const user_id = user?.id || null;
  //     const platform = Platform.OS;
  //     const lastInfo = await getLastRegisteredDeviceInfo();
  //     // Only register if any value changed
  //     if (
  //       !lastInfo ||
  //       lastInfo.token !== token ||
  //       lastInfo.user_id !== user_id ||
  //       lastInfo.guest_id !== guest_id ||
  //       lastInfo.platform !== platform
  //     ) {
  //       try {
  //         await registerDeviceToken({ token, user_id, guest_id, platform });
  //         await setLastRegisteredDeviceInfo({
  //           token,
  //           user_id,
  //           guest_id,
  //           platform,
  //         });
  //       } catch (e) {
  //         console.log("Device registration failed", e);
  //       }
  //     }
  //   }
  //   registerDeviceIfNeeded();
  //   return () => {
  //     isMounted = false;
  //   };
  // }, [user]);
  return null;
}

import SplashScreen from "../components/ui/SplashScreen";

const introSlides = [
  {
    title: "Kindness at Your Fingertips.",
    description: "Easily calculate and manage your zakat in one place.",
    background: require("../assets/intro-1.png"),
  },
  {
    title: "Stay Organized",
    description: "All your records are safe and accessible anytime.",
    background: require("../assets/intro-1.png"),
  },
];

const INTRO_STORAGE_KEY = "@alihsan:intro_completed";
const INTRO_VERSION_KEY = "@alihsan:intro_version";

export default function RootLayout() {
  // Load fonts including Guthen
  const [fontsLoaded] = useFonts({
    AlbertSans_100Thin,
    AlbertSans_200ExtraLight,
    AlbertSans_300Light,
    AlbertSans_400Regular,
    AlbertSans_500Medium,
    AlbertSans_600SemiBold,
    AlbertSans_700Bold,
    AlbertSans_800ExtraBold,
    AlbertSans_900Black,
    AlbertSans_100Thin_Italic,
    AlbertSans_200ExtraLight_Italic,
    AlbertSans_300Light_Italic,
    AlbertSans_400Regular_Italic,
    AlbertSans_500Medium_Italic,
    AlbertSans_600SemiBold_Italic,
    AlbertSans_700Bold_Italic,
    AlbertSans_800ExtraBold_Italic,
    AlbertSans_900Black_Italic,
    "Guthen Bloots": require("../assets/fonts/GuthenBloots.ttf"),
  });

  // Set Albert Sans as the main font for Text and TextInput components
  // Matching the Next.js app configuration (weights: 300, 400, 500, 600, 700)
  React.useEffect(() => {
    if (fontsLoaded) {
      // Set default font for Text component - Albert Sans Regular (400) as main font
      if (!Text.defaultProps) Text.defaultProps = {};
      Text.defaultProps.style = { 
        fontFamily: "AlbertSans_400Regular",
        ...Text.defaultProps.style 
      };

      // Set default font for TextInput component - Albert Sans Regular (400) as main font
      if (!TextInput.defaultProps) TextInput.defaultProps = {};
      TextInput.defaultProps.style = { 
        fontFamily: "AlbertSans_400Regular",
        ...TextInput.defaultProps.style 
      };
    }
  }, [fontsLoaded]);

  // useNotificationNavigation();
  // useEffect(() => {
  //   const unsubscribe = onMessageListener((message) => {
  //     Alert.alert("Notification received: " + JSON.stringify(message));
  //   });
  //   setBackgroundMessageHandler((message) => {
  //     console.log("Background notification:", message);
  //   });
  //   return unsubscribe;
  // }, []);
  const [showIntro, setShowIntro] = React.useState<boolean | null>(null);
  const [showSplash, setShowSplash] = React.useState(true);

  // Check if intro has been completed for current app version
  React.useEffect(() => {
    const checkIntroStatus = async () => {
      try {
        const currentVersion = Constants.expoConfig?.version || "1.0.0";
        const storedVersion = await AsyncStorage.getItem(INTRO_VERSION_KEY);
        const introCompleted = await AsyncStorage.getItem(INTRO_STORAGE_KEY);
        // Show intro if:
        // 1. It hasn't been completed, OR
        // 2. The app version has changed (new update)
        if (introCompleted !== "true" || storedVersion !== currentVersion) {
          setShowIntro(true);
        } else {
          setShowIntro(true);
        }
      } catch (error) {
        console.error("Error checking intro status:", error);
        // On error, show intro to be safe
        setShowIntro(true);
      }
    };

    checkIntroStatus();
  }, []);

  // Handle splash screen timer - hide after splash finishes (5 seconds total)
  React.useEffect(() => {
    if (showIntro !== null && showIntro) {
      // Wait 5 seconds for splash, then hide it (intro is already rendered behind)
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 5000);
      return () => clearTimeout(timer);
    } else if (showIntro === false) {
      // If intro is not needed, hide splash immediately
      setShowSplash(false);
    }
  }, [showIntro]);

  // Save intro completion status
  const handleIntroFinish = async () => {
    try {
      const currentVersion = Constants.expoConfig?.version || "1.0.0";
      await AsyncStorage.setItem(INTRO_STORAGE_KEY, "true");
      await AsyncStorage.setItem(INTRO_VERSION_KEY, currentVersion);
      setShowIntro(false);
    } catch (error) {
      console.error("Error saving intro status:", error);
      setShowIntro(false);
    }
  };

  // Wait for fonts to load
  if (!fontsLoaded) {
    return null;
  }

  // Wait for intro status check to complete
  if (showIntro === null) {
    return (
      <SafeAreaProvider>
        <View style={{ backgroundColor: "#000", flex: 1 }}>
          <SplashScreen />
        </View>
      </SafeAreaProvider>
    );
  }

  // Render splash first, then transition to intro
  if (showSplash && showIntro) {
    return (
      <SafeAreaProvider>
        <View style={{ backgroundColor: "#000", flex: 1 }}>
          <SplashScreen />
        </View>
      </SafeAreaProvider>
    );
  }

  if (showIntro) {
    return (
      <SafeAreaProvider>
        <View style={{ backgroundColor: "#000", flex: 1 }}>
          <IntroSlide onFinish={handleIntroFinish} />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <AuthProvider>
          {/* <DeviceRegistrationManager /> */}
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
