import { useEffect } from "react";
import { useRouter } from "expo-router";
import { Linking, Platform } from "react-native";
import type * as Notifications from "expo-notifications";

export default function useNotificationNavigation() {
  const router = useRouter();

  useEffect(() => {
    // Skip on web platform
    if (Platform.OS === "web") {
      return;
    }

    console.log("[NotificationNav] Hook mounted");

    let NotificationsModule: typeof import("expo-notifications") | null = null;
    try {
      NotificationsModule = require("expo-notifications");
    } catch (error) {
      console.warn(
        "[NotificationNav] expo-notifications unavailable:",
        error
      );
      return;
    }

    const handleResponse = (response: Notifications.NotificationResponse) => {
      const data = response?.notification?.request?.content?.data as {
        url?: string;
      };
      const url = data?.url;
      if (typeof url === "string") {
        console.log("[NotificationNav] Redirecting to:", url);
        Linking.openURL(url).catch((err) => {
          console.warn("[NotificationNav] Failed to open URL:", url, err);
        });
      } else if (data) {
        console.log("[NotificationNav] No valid url in notification data:", data);
      }
    };

    const subscription =
      NotificationsModule.addNotificationResponseReceivedListener(handleResponse);

    NotificationsModule.getLastNotificationResponseAsync().then(
      (response: Notifications.NotificationResponse | null) => {
      if (response) {
        console.log("[NotificationNav] getLastNotificationResponse fired");
        handleResponse(response);
      }
      }
    );

    return () => subscription.remove();
  }, [router]);
}
