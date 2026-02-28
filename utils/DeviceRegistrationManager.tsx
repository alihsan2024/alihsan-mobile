import { useEffect, useRef } from "react";
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
  const isRegisteringRef = useRef(false);
  const lastRegisteredRef = useRef<string | null>(null);

  async function tryRegister() {
    if (Platform.OS === "web") return;
    if (isRegisteringRef.current) return;

    try {
      isRegisteringRef.current = true;

      const token = await requestUserPermission();
      if (!token) return;

      const guest_id = await getOrCreateGuestId();
      const user_id = user?.id ?? null;
      const platform = Platform.OS;

      const cacheKey = `${token}|${user_id}|${guest_id}|${platform}`;
      if (lastRegisteredRef.current === cacheKey) return;

      const lastInfo = await getLastRegisteredDeviceInfo();

      const changed =
        !lastInfo ||
        lastInfo.token !== token ||
        lastInfo.user_id !== user_id ||
        lastInfo.guest_id !== guest_id ||
        lastInfo.platform !== platform;

      if (!changed) {
        lastRegisteredRef.current = cacheKey;
        return;
      }

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
      lastRegisteredRef.current = cacheKey;
    } catch (e) {
      console.log("[DeviceReg] Registration failed", e);
    } finally {
      isRegisteringRef.current = false;
    }
  }

  useEffect(() => {
    tryRegister();

    const sub = Notifications.addPushTokenListener(() => {
      lastRegisteredRef.current = null;
      tryRegister();
    });

    return () => {
      sub.remove();
    };
  }, [user?.id]);

  return null;
}
