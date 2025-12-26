import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from "uuid";

export async function getOrCreateGuestId(): Promise<string> {
  let guestId = await AsyncStorage.getItem("guest_id");
  if (!guestId) {
    guestId = uuidv4();
    await AsyncStorage.setItem("guest_id", guestId);
  }
  return guestId;
}

export async function getLastRegisteredDeviceInfo(): Promise<any> {
  const data = await AsyncStorage.getItem("last_registered_device_info");
  return data ? JSON.parse(data) : null;
}

export async function setLastRegisteredDeviceInfo(info: any): Promise<void> {
  await AsyncStorage.setItem(
    "last_registered_device_info",
    JSON.stringify(info)
  );
}
