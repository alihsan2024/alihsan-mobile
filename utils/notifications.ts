import { Platform } from "react-native";
import Constants from "expo-constants";
import type { Notification } from "expo-notifications";

type NotificationsModule = typeof import("expo-notifications");

const getNotificationsModule = (): NotificationsModule | null => {
  if (Platform.OS === "web") {
    return null;
  }
  try {
    // Use lazy require to avoid runtime crashes if the native module is missing
    return require("expo-notifications");
  } catch (error) {
    console.warn("[Notifications] expo-notifications unavailable:", error);
    return null;
  }
};

// Request notification permissions and get FCM token
export async function requestUserPermission(): Promise<string | null> {
  const Notifications = getNotificationsModule();
  if (!Notifications) {
    return null;
  }

  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      return null;
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ||
      Constants.easConfig?.projectId;

    if (!projectId) {
      console.warn("[Notifications] Missing EAS projectId for push tokens");
      return null;
    }

    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    return token?.data || null;
  } catch (error) {
    console.warn("[Notifications] Failed to request permission:", error);
    return null;
  }
}

// Listen for foreground messages
export function onMessageListener(
  callback: (notification: Notification) => void
) {
  const Notifications = getNotificationsModule();
  if (!Notifications) {
    return () => {};
  }

  const subscription =
    Notifications.addNotificationReceivedListener(callback);
  return () => subscription.remove();
}

// Listen for background/quit state messages (Android)
export function setBackgroundMessageHandler(
  callback: (remoteMessage: any) => void
) {
  if (Platform.OS === "web") {
    return;
  }
  // Expo Notifications doesn't support a JS background handler in the same way.
  // Keep this as a no-op to avoid crashes.
  void callback;
}
