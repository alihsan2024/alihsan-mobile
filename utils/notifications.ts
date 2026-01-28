import { Platform } from "react-native";

// Lazy load messaging to avoid native module initialization errors
let messaging: any = null;
let messagingLoadAttempted = false;
let messagingLoadFailed = false;

function isNativeEnvironment(): boolean {
  // Check if we're in a native environment (iOS or Android, not web)
  if (Platform.OS === "web") {
    return false;
  }

  // Check if we're in Expo Go (which might have limited native module support)
  try {
    const { Constants } = require("expo-constants");
    // In Expo Go, some native modules might not be fully available
    if (Constants?.executionEnvironment === "storeClient") {
      // This is Expo Go - be more cautious
      // Only proceed if we're sure Firebase is properly configured
    }
  } catch {
    // Constants not available, continue with check
  }

  // Check if native modules are available
  try {
    const { NativeModules } = require("react-native");
    // If we're in a web environment, NativeModules might be empty or unavailable
    if (!NativeModules) {
      return false;
    }
    // Check if we have any native modules (web typically has very few or none)
    const moduleKeys = Object.keys(NativeModules);
    // Web environments typically have very few native modules
    // Native environments have many modules
    // Also check for specific Firebase-related modules
    const hasFirebaseModules = moduleKeys.some(
      (key) => key.includes("Firebase") || key.includes("RNFB")
    );
    return moduleKeys.length > 10 || hasFirebaseModules;
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
    // Check if we're in Expo Go or a development environment
    // where native modules might not be fully available
    const { Constants } = require("expo-constants");
    if (Constants?.executionEnvironment === "storeClient" || Constants?.executionEnvironment === "standalone") {
      // Only try to load in production builds
    } else if (__DEV__) {
      // In development, be more cautious
      // Check if Firebase is actually available
      try {
        // Try to require react-native-firebase to see if it's available
        require.resolve("@react-native-firebase/messaging");
      } catch {
        messagingLoadFailed = true;
        return null;
      }
    }

    // Use a more defensive import approach with error boundary
    let messagingModule: any;
    try {
      messagingModule = await import("@react-native-firebase/messaging");
    } catch (importError: any) {
      // If import fails due to native module issues, mark as failed
      if (importError?.message?.includes("NativeEventEmitter") || 
          importError?.message?.includes("PushNotificationIOS")) {
        messagingLoadFailed = true;
        return null;
      }
      throw importError; // Re-throw other errors
    }
    
    if (!messagingModule || !messagingModule.default) {
      throw new Error("Firebase messaging module not properly exported");
    }
    
    messaging = messagingModule.default;
    return messaging;
  } catch (error: any) {
    // Silently fail - don't log errors that are expected in web/dev environments
    if (Platform.OS !== "web" && !error?.message?.includes("NativeEventEmitter")) {
      console.warn("[Notifications] Failed to load Firebase messaging:", error?.message || error);
    }
    messagingLoadFailed = true;
    return null;
  }
}

// Request notification permissions and get FCM token
export async function requestUserPermission(): Promise<string | null> {
  if (Platform.OS === "web") {
    return null;
  }

  try {
    const messagingInstance = await getMessaging();
    if (!messagingInstance) {
      return null;
    }

    const authStatus = await messagingInstance().requestPermission();
    const enabled =
      authStatus === messagingInstance.AuthorizationStatus.AUTHORIZED ||
      authStatus === messagingInstance.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      const token = await messagingInstance().getToken();
      return token;
    }
    return null;
  } catch (error) {
    console.warn("[Notifications] Failed to request permission:", error);
    return null;
  }
}

// Listen for foreground messages
export function onMessageListener(callback: (remoteMessage: any) => void) {
  if (Platform.OS === "web") {
    return () => {}; // Return no-op unsubscribe
  }

  getMessaging().then((messagingInstance) => {
    if (messagingInstance) {
      messagingInstance().onMessage(async (remoteMessage: any) => {
        callback(remoteMessage);
      });
    }
  });

  return () => {}; // Return no-op unsubscribe
}

// Listen for background/quit state messages (Android)
export function setBackgroundMessageHandler(
  callback: (remoteMessage: any) => void
) {
  if (Platform.OS === "web") {
    return;
  }

  getMessaging().then((messagingInstance) => {
    if (messagingInstance) {
      messagingInstance().setBackgroundMessageHandler(
        async (remoteMessage: any) => {
          callback(remoteMessage);
        }
      );
    }
  });
}
