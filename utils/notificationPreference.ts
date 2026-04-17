import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Local opt-out for push notifications.
 *
 * The mobile client treats this as the source of truth: when false,
 * `utils/notifications.ts`'s notification handler suppresses alerts,
 * banners, sounds, and list entries.
 *
 * Once the backend adds a `PATCH /app-notifications/opted-in` endpoint
 * (mirroring `device_tokens.opted_in` from create-stories.sql), extend
 * `setNotificationsEnabled` to sync to the server alongside the local
 * write. Keeping the local write first means the UI stays responsive
 * even on flaky networks.
 */
const KEY = "notifications_enabled";

export async function getNotificationsEnabled(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw === null) return true; // default opted-in
    return raw === "true";
  } catch {
    return true;
  }
}

export async function setNotificationsEnabled(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, enabled ? "true" : "false");
  } catch {
    // Silently ignore — state will reset to default on next read.
  }
}
