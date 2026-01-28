import { useEffect } from "react";
import { useRouter } from "expo-router";
import { Linking, Platform } from "react-native";

// Lazy load messaging to avoid native module initialization errors
let messaging: any = null;
let messagingLoadAttempted = false;
let messagingLoadFailed = false;

function isNativeEnvironment(): boolean {
  // Check if we're in a native environment (iOS or Android, not web)
  if (Platform.OS === "web") {
    return false;
  }

  // Check if native modules are available
  try {
    const { NativeModules } = require("react-native");
    if (!NativeModules) {
      return false;
    }
    const moduleKeys = Object.keys(NativeModules);
    // Native environments have many modules, web has few
    return moduleKeys.length > 10;
  } catch {
    return false;
  }
}

async function getMessaging() {
  // Return cached instance if available
  if (messaging) return messaging;
  
  // Return null if we've already tried and failed
  if (messagingLoadFailed) return null;
  
  // Check if we're in a native environment before attempting import
  if (!isNativeEnvironment()) {
    messagingLoadFailed = true;
    return null;
  }

  // Prevent multiple simultaneous load attempts
  if (messagingLoadAttempted) {
    // Wait a bit and check again
    await new Promise((resolve) => setTimeout(resolve, 100));
    if (messaging) return messaging;
    if (messagingLoadFailed) return null;
  }

  messagingLoadAttempted = true;

  try {
    // Use a more defensive import approach
    const messagingModule = await Promise.resolve().then(() =>
      import("@react-native-firebase/messaging")
    );
    
    if (!messagingModule || !messagingModule.default) {
      throw new Error("Firebase messaging module not properly exported");
    }
    
    messaging = messagingModule.default;
    return messaging;
  } catch (error: any) {
    // Silently fail - don't log errors that are expected in web/dev environments
    if (Platform.OS !== "web") {
      console.warn("[NotificationNav] Failed to load Firebase messaging:", error?.message || error);
    }
    messagingLoadFailed = true;
    return null;
  }
}

export default function useNotificationNavigation() {
  const router = useRouter();

  useEffect(() => {
    // Skip on web platform
    if (Platform.OS === "web") {
      return;
    }

    console.log("[NotificationNav] Hook mounted");

    let unsubscribe: (() => void) | null = null;

    // Initialize messaging and set up listeners
    getMessaging().then((messagingInstance) => {
      if (!messagingInstance) {
        console.warn("[NotificationNav] Messaging not available");
        return;
      }

      // When app is opened from a notification
      unsubscribe = messagingInstance().onNotificationOpenedApp(
        (remoteMessage: any) => {
          console.log(
            "[NotificationNav] onNotificationOpenedApp fired",
            remoteMessage
          );
          console.log("remote message", remoteMessage?.data);
          const url = remoteMessage?.data?.url;
          if (typeof url === "string") {
            console.log("[NotificationNav] Redirecting to:", url);
            Linking.openURL(url).catch((err) => {
              console.warn("[NotificationNav] Failed to open URL:", url, err);
            });
          } else {
            console.log(
              "[NotificationNav] No valid url in notification data:",
              remoteMessage?.data
            );
          }
        }
      );

      // If app was opened from a quit state
      messagingInstance()
        .getInitialNotification()
        .then((remoteMessage: any) => {
          console.log(
            "[NotificationNav] getInitialNotification fired",
            remoteMessage
          );
          const url = remoteMessage?.data?.url;
          if (typeof url === "string") {
            console.log("[NotificationNav] Redirecting to (initial):", url);
            router.push(url);
          } else if (remoteMessage) {
            console.log(
              "[NotificationNav] No valid url in initial notification data:",
              remoteMessage?.data
            );
          }
        });
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [router]);
}
