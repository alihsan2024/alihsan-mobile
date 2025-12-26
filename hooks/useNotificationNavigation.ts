import messaging from "@react-native-firebase/messaging";
import { useEffect } from "react";
import { useRouter } from "expo-router"; // or useNavigation if using React Navigation
import { Linking } from "react-native";

export default function useNotificationNavigation() {
  const router = useRouter();

  useEffect(() => {
    console.log("[NotificationNav] Hook mounted");

    // When app is opened from a notification
    const unsubscribe = messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log(
        "[NotificationNav] onNotificationOpenedApp fired",
        remoteMessage
      );
      console.log("remote messsage", remoteMessage?.data);
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
    });

    // If app was opened from a quit state
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
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

    return unsubscribe;
  }, []);
}
