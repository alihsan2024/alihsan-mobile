import messaging from "@react-native-firebase/messaging";

// Request notification permissions and get FCM token
export async function requestUserPermission(): Promise<string | null> {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    const token = await messaging().getToken();
    return token;
  }
  return null;
}

// Listen for foreground messages
export function onMessageListener(callback: (remoteMessage: any) => void) {
  return messaging().onMessage(async (remoteMessage) => {
    callback(remoteMessage);
  });
}

// Listen for background/quit state messages (Android)
export function setBackgroundMessageHandler(
  callback: (remoteMessage: any) => void
) {
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    callback(remoteMessage);
  });
}
