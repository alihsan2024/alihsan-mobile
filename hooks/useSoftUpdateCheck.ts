import { useCallback, useEffect, useState } from "react";
import { Linking, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { fetchMobileAppConfig, type MobileAppConfig } from "@/utils/api";
import { isVersionLessThan } from "@/utils/versionCompare";

const DISMISSED_VERSION_KEY = "@alihsan:soft_update_dismissed_version";

type SoftUpdateState = {
  visible: boolean;
  config: MobileAppConfig | null;
};

/**
 * Checks backend for a newer app version and shows a dismissible update prompt.
 * Dismissal is remembered per `latestVersion` until the backend bumps it again.
 */
export function useSoftUpdateCheck(enabled: boolean) {
  const [state, setState] = useState<SoftUpdateState>({
    visible: false,
    config: null,
  });

  useEffect(() => {
    if (!enabled || Platform.OS === "web") return;

    let cancelled = false;

    const check = async () => {
      try {
        const config = await fetchMobileAppConfig();
        if (cancelled || !config?.softUpdateEnabled) return;

        const currentVersion = Constants.expoConfig?.version || "1.0.0";
        const { latestVersion } = config;

        if (!latestVersion || !isVersionLessThan(currentVersion, latestVersion)) {
          return;
        }

        const dismissedFor = await AsyncStorage.getItem(DISMISSED_VERSION_KEY);
        if (dismissedFor === latestVersion) return;

        if (!cancelled) {
          setState({ visible: true, config });
        }
      } catch {
        // Fail silently — app works without update check
      }
    };

    check();
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  const dismiss = useCallback(async () => {
    const latestVersion = state.config?.latestVersion;
    if (latestVersion) {
      await AsyncStorage.setItem(DISMISSED_VERSION_KEY, latestVersion);
    }
    setState((prev) => ({ ...prev, visible: false }));
  }, [state.config?.latestVersion]);

  const openStore = useCallback(async () => {
    const url =
      Platform.OS === "ios"
        ? state.config?.iosStoreUrl
        : state.config?.androidStoreUrl;

    if (!url) return;

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
    } catch {
      // ignore
    }
    await dismiss();
  }, [state.config, dismiss]);

  return {
    visible: state.visible,
    message: state.config?.updateMessage,
    latestVersion: state.config?.latestVersion,
    dismiss,
    openStore,
  };
}
