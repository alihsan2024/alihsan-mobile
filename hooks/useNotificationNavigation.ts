import { useEffect } from "react";
import { useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HANDLED_KEY = "@alihsan:last_handled_notification";
import { Linking, Platform } from "react-native";
import type * as Notifications from "expo-notifications";

export default function useNotificationNavigation() {
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    async function handle(response: any, source: "cold" | "tap") {
      const url = response?.notification?.request?.content?.data?.url;

      if (typeof url !== "string") return;

      const lastHandled = await AsyncStorage.getItem(HANDLED_KEY);

      // Prevent infinite loop for same notification
      if (lastHandled === url) {
        return;
      }

      console.log(`[NotificationNav] ${source} ->`, url);

      await AsyncStorage.setItem(HANDLED_KEY, url);

      if (isMounted) {
        router.replace(url); // 🔥 replace avoids stacking routes
      }
    }

    // Cold start
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) handle(response, "cold");
    });

    // Background / foreground tap
    const sub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        handle(response, "tap");
      },
    );

    return () => {
      isMounted = false;
      sub.remove();
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
