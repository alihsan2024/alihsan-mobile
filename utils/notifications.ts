import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import Constants from "expo-constants";
import type { Notification } from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestUserPermission(): Promise<string | null> {
  if (!Device.isDevice) return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  const token = await Notifications.getExpoPushTokenAsync();

  return token.data;
}

export function onMessageListener(
  callback: (notification: Notifications.Notification) => void,
) {
  const sub = Notifications.addNotificationReceivedListener(callback);
  return () => sub.remove();
}

export function onNotificationResponse(
  callback: (response: Notifications.NotificationResponse) => void,
) {
  const sub = Notifications.addNotificationResponseReceivedListener(callback);
  return () => sub.remove();
}
