import { useEffect } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { useAuth } from "../context/AuthContext";
import {
  getOrCreateGuestId,
  getLastRegisteredDeviceInfo,
  setLastRegisteredDeviceInfo,
} from "@/utils/deviceRegistration";
import { requestUserPermission } from "@/utils/notifications";
import { registerDeviceToken } from "@/utils/api";

export default function DeviceRegistrationManager() {
  const { user } = useAuth();

  async function tryRegister() {
    if (Platform.OS === "web") return;

    try {
      const token = await requestUserPermission();
      if (!token) return;

      const guest_id = await getOrCreateGuestId();
      const user_id = user?.id || null;
      const platform = Platform.OS;

      const lastInfo = await getLastRegisteredDeviceInfo();

      const changed =
        !lastInfo ||
        lastInfo.token !== token ||
        lastInfo.user_id !== user_id ||
        lastInfo.guest_id !== guest_id ||
        lastInfo.platform !== platform;

      if (!changed) return;

      await registerDeviceToken({
        token,
        user_id,
        guest_id,
        platform,
      });

      await setLastRegisteredDeviceInfo({
        token,
        user_id,
        guest_id,
        platform,
      });
    } catch (e) {
      console.log("[DeviceReg] Registration failed", e);
    }
  }

  useEffect(() => {
    // Run on app start & login change
    tryRegister();

    // Listen for Expo token refresh
    const sub = Notifications.addPushTokenListener(() => {
      tryRegister();
    });

    return () => {
      sub.remove();
    };
  }, [user]);

  return null;
}
