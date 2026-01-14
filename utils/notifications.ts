// Safely import Firebase messaging
let messaging: any = null;
try {
  messaging = require("@react-native-firebase/messaging").default;
} catch (error) {
  console.warn("Firebase messaging module not available:", error);
}

// Check if Firebase messaging is available
const isFirebaseMessagingAvailable = (): boolean => {
  try {
    if (!messaging) {
      return false;
    }
    const messagingInstance = messaging();
    return messagingInstance !== null && messagingInstance !== undefined;
  } catch (error) {
    console.warn("Firebase messaging not available:", error);
    return false;
  }
};

// Request notification permissions and get FCM token
export async function requestUserPermission(): Promise<string | null> {
  try {
    // Check if Firebase messaging module is loaded
    if (!messaging) {
      console.warn(
        "Firebase messaging module not loaded, skipping token request"
      );
      return null;
    }

    // Check if Firebase messaging is available
    if (!isFirebaseMessagingAvailable()) {
      console.warn(
        "Firebase messaging not initialized, skipping token request"
      );
      return null;
    }

    const messagingInstance = messaging();
    if (!messagingInstance) {
      console.warn("Firebase messaging instance is null");
      return null;
    }

    const authStatus = await messagingInstance.requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      const token = await messagingInstance.getToken();
      return token;
    }
    return null;
  } catch (error: any) {
    console.error(
      "Error requesting notification permission:",
      error?.message || error
    );
    // Return null instead of throwing to prevent login failure
    return null;
  }
}

// Listen for foreground messages
export function onMessageListener(callback: (remoteMessage: any) => void) {
  try {
    if (!isFirebaseMessagingAvailable()) {
      console.warn("Firebase messaging not available for onMessage listener");
      return () => {}; // Return empty unsubscribe function
    }

    const messagingInstance = messaging();
    if (!messagingInstance) {
      console.warn("Firebase messaging instance is null");
      return () => {};
    }

    return messagingInstance.onMessage(
      async (remoteMessage: any): Promise<void> => {
        callback(remoteMessage);
      }
    );
  } catch (error) {
    console.error("Error setting up message listener:", error);
    return () => {}; // Return empty unsubscribe function
  }
}

// Listen for background/quit state messages (Android)
export function setBackgroundMessageHandler(
  callback: (remoteMessage: any) => void
) {
  try {
    if (!isFirebaseMessagingAvailable()) {
      console.warn("Firebase messaging not available for background handler");
      return;
    }

    const messagingInstance = messaging();
    if (!messagingInstance) {
      console.warn("Firebase messaging instance is null");
      return;
    }

    messagingInstance.setBackgroundMessageHandler(
      async (remoteMessage: any): Promise<void> => {
        callback(remoteMessage);
      }
    );
  } catch (error) {
    console.error("Error setting up background message handler:", error);
  }
}
