import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from "uuid";
import * as Notifications from "expo-notifications";

const GUEST_ID_KEY = "@alihsan:guest_id";
const LAST_DEVICE_INFO_KEY = "@alihsan:last_device_info";
const LAST_ATTEMPT_KEY = "@alihsan:last_device_attempt";

const RETRY_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export async function getOrCreateGuestId(): Promise<string> {
  let guestId = await AsyncStorage.getItem(GUEST_ID_KEY);

  if (!guestId) {
    guestId = uuidv4();
    await AsyncStorage.setItem(GUEST_ID_KEY, guestId);
  }

  return guestId;
}

export async function getLastRegisteredDeviceInfo(): Promise<any> {
  const data = await AsyncStorage.getItem(LAST_DEVICE_INFO_KEY);
  return data ? JSON.parse(data) : null;
}

export async function setLastRegisteredDeviceInfo(info: any): Promise<void> {
  await AsyncStorage.setItem(LAST_DEVICE_INFO_KEY, JSON.stringify(info));
}

async function shouldRetry(): Promise<boolean> {
  const lastAttempt = await AsyncStorage.getItem(LAST_ATTEMPT_KEY);
  if (!lastAttempt) return true;

  return Date.now() - Number(lastAttempt) > RETRY_INTERVAL_MS;
}

async function markAttempt() {
  await AsyncStorage.setItem(LAST_ATTEMPT_KEY, Date.now().toString());
}
