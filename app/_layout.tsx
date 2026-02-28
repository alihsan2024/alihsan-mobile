import "react-native-get-random-values";
import { Stack, usePathname } from "expo-router";
import React from "react";
import { Platform, View, Text, TextInput, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

import IntroSlide from "../components/ui/sliders/IntroSlide";
import SplashScreen from "../components/ui/SplashScreen";

import { AuthProvider } from "../context/AuthContext";
import { BasketProvider } from "../context/BasketContext";
import { ToastProvider } from "../context/ToastContext";
import { NetworkProvider } from "../context/NetworkContext";
import OfflineBanner from "../components/ui/OfflineBanner";
import { Provider } from "react-redux";
import { store } from "@/store/store";

import useNotificationNavigation from "../hooks/useNotificationNavigation";
import {
  requestUserPermission,
  onMessageListener,
} from "@/utils/notifications";

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
import DeviceRegistrationManager from "@/utils/DeviceRegistrationManager";
import { DonationAppealModal } from "../components/ui/Modals/DonationAppealModal";
import { fetchFeaturedCampaigns } from "@/utils/api";
import AuthGate from "../components/AuthGate";

const introSlides = [
  {
    title: "Kindness at Your Fingertips.",
    description: "Easily calculate and manage your zakat in one place.",
    background: require("../assets/intro-1.png"),
  },

];

const INTRO_STORAGE_KEY = "@alihsan:intro_completed";
const INTRO_VERSION_KEY = "@alihsan:intro_version";

export default function RootLayout() {
  // 🔔 Enable navigation from notification taps
  useNotificationNavigation();

  // 🔔 Ask for push permission + listen for foreground notifications
  React.useEffect(() => {
    if (Platform.OS === "web") return;

    requestUserPermission();

    const unsubscribe = onMessageListener((notification: any) => {
      const title = notification.request.content.title;
      const body = notification.request.content.body;

      if (title || body) {
        Alert.alert(title || "Notification", body || "");
      }
    });

    return unsubscribe;
  }, []);

  // Load fonts
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

  // Set default font
  React.useEffect(() => {
    if (fontsLoaded) {
      if (!Text.defaultProps) Text.defaultProps = {};
      Text.defaultProps.style = {
        fontFamily: "AlbertSans_400Regular",
        ...Text.defaultProps.style,
      };

      if (!TextInput.defaultProps) TextInput.defaultProps = {};
      TextInput.defaultProps.style = {
        fontFamily: "AlbertSans_400Regular",
        ...TextInput.defaultProps.style,
      };
    }
  }, [fontsLoaded]);

  const [showIntro, setShowIntro] = React.useState<boolean | null>(null);
  const [showSplash, setShowSplash] = React.useState(true);
  const [showGazaModal, setShowGazaModal] = React.useState(false);
  const [splashFinished, setSplashFinished] = React.useState(false);
  const [gazaCampaignData, setGazaCampaignData] = React.useState<{
    raised: number;
    goal: number;
  } | null>(null);
  const [hasNavigatedToAuth, setHasNavigatedToAuth] = React.useState(false);
  const pathname = usePathname();
  
  // Check if we're on login or signup route
  const isOnAuthRoute = pathname === "/login" || pathname === "/signup" || hasNavigatedToAuth;
  
  // Update hasNavigatedToAuth when pathname changes to auth route
  React.useEffect(() => {
    if (pathname === "/login" || pathname === "/signup") {
      setHasNavigatedToAuth(true);
    }
  }, [pathname]);

  // Check intro status
  React.useEffect(() => {
    const checkIntroStatus = async () => {
      try {
        const currentVersion = Constants.expoConfig?.version || "1.0.0";
        const storedVersion = await AsyncStorage.getItem(INTRO_VERSION_KEY);
        const introCompleted = await AsyncStorage.getItem(INTRO_STORAGE_KEY);

        if (introCompleted !== "true" || storedVersion !== currentVersion) {
          setShowIntro(true);
        } else {
          setShowIntro(false);
        }
      } catch {
        setShowIntro(true);
      }
    };

    checkIntroStatus();
  }, []);

  // Handle splash screen - show it first, then load featured campaigns (same as home) and show Gaza modal when Gaza Ramadan 2026 is in the list
  React.useEffect(() => {
    if (showIntro === false && !splashFinished) {
      // Show splash for 2.8 seconds (matching SplashScreen component duration)
      const timer = setTimeout(() => {
        setSplashFinished(true);
        setShowSplash(false);
        // Use same API as home (featured campaigns) so modal shows when Gaza Ramadan 2026 is loaded
        fetchFeaturedCampaigns()
          .then((campaigns) => {
            const gaza = campaigns.find(
              (c: any) =>
                (c.slug && c.slug === "gaza-ramadan") ||
                (c.name && String(c.name).toLowerCase().includes("gaza") && String(c.name).toLowerCase().includes("ramadan"))
            );
            if (gaza) {
              const raised = Number(
                (gaza as any).amount_donated ?? (gaza as any).amountDonated ?? 0
              );
              const goal = Number(
                (gaza as any).fundraiserGoal ??
                  (gaza as any).mobileGoalAmount ??
                  (gaza as any).fundraiser_goal ??
                  0
              );
              if (goal > 0) {
                setGazaCampaignData({ raised, goal });
                setShowGazaModal(true);
              }
            }
          })
          .catch(() => {
            // Don't show modal if featured campaigns failed to load
          });
      }, 2800);
      return () => clearTimeout(timer);
    } else if (showIntro !== null && showIntro) {
      // If intro is needed, handle splash normally
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showIntro, splashFinished]);

  const handleIntroFinish = async () => {
    try {
      const currentVersion = Constants.expoConfig?.version || "1.0.0";
      await AsyncStorage.setItem(INTRO_STORAGE_KEY, "true");
      await AsyncStorage.setItem(INTRO_VERSION_KEY, currentVersion);
      setShowIntro(false);
    } catch {
      setShowIntro(false);
    }
  };

  if (!fontsLoaded) return null;

  if (showIntro === null) {
    return (
      <SafeAreaProvider>
        <View style={{ backgroundColor: "#000", flex: 1 }}>
          <SplashScreen />
        </View>
      </SafeAreaProvider>
    );
  }

  if (showSplash && showIntro && !isOnAuthRoute) {
    return (
      <SafeAreaProvider>
        <View style={{ backgroundColor: "#000", flex: 1 }}>
          <SplashScreen />
        </View>
      </SafeAreaProvider>
    );
  }

  // Allow navigation to login/signup even if intro is showing
  if (showIntro && !isOnAuthRoute) {
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
        <AuthGate>
        <NetworkProvider>
          <AuthProvider>
            <DeviceRegistrationManager />
            <BasketProvider>
              <ToastProvider>
                {/* Offline Banner - App Wide */}
                <View style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 99999, pointerEvents: "box-none" }}>
                  <OfflineBanner />
                </View>
                
                {/* Show splash screen first */}
                {showSplash && !showIntro && (
                  <View style={{ backgroundColor: "#000", flex: 1, position: "absolute", width: "100%", height: "100%", zIndex: 9999 }}>
                    <SplashScreen />
                  </View>
                )}
                
                {/* Show Gaza modal only when campaign data is loaded */}
                {showGazaModal && gazaCampaignData && (
                  <DonationAppealModal
                    visible={showGazaModal}
                    onClose={() => setShowGazaModal(false)}
                    image={require("../assets/modal-image.png")}
                    title="Help Children in Need"
                    raised={gazaCampaignData.raised}
                    goal={gazaCampaignData.goal}
                  />
                )}
                
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
                  name="zakat-calculator"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="checkout"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="thank-you"
                  options={{ headerShown: false }}
                />
              </Stack>
              <StatusBar style="auto" />
              </ToastProvider>
            </BasketProvider>
          </AuthProvider>
        </NetworkProvider>
        </AuthGate>
      </Provider>
    </SafeAreaProvider>
  );
}
