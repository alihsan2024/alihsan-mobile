import { useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  fetchStoriesVersion,
  invalidateStoriesCache,
} from "@/utils/api";

const STORAGE_KEY = "@alihsan_stories_feed_version";
/** Poll interval — version endpoint is tiny (~aggregate query only). */
const POLL_INTERVAL_MS = 60_000;

/**
 * Polls GET /stories/version on an interval and when the app returns to the foreground.
 * When the fingerprint changes, clears the full stories cache and calls `onStoriesMayHaveChanged`
 * so UI can refetch GET /stories (StoryRing / Featured bubble).
 */
export function useStoriesVersionPoll(
  onStoriesMayHaveChanged: () => void,
): void {
  const lastVersionRef = useRef<string | null>(null);
  const callbackRef = useRef(onStoriesMayHaveChanged);
  callbackRef.current = onStoriesMayHaveChanged;

  useEffect(() => {
    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const tick = async () => {
      try {
        const v = await fetchStoriesVersion();
        if (cancelled) return;

        const prev = lastVersionRef.current;
        lastVersionRef.current = v;

        try {
          await AsyncStorage.setItem(STORAGE_KEY, v);
        } catch {
          /* ignore */
        }

        if (prev !== null && prev !== v) {
          invalidateStoriesCache();
          callbackRef.current();
        }
      } catch {
        /* offline / server error — skip until next tick */
      }
    };

    const run = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (!cancelled && stored) {
          lastVersionRef.current = stored;
        }
      } catch {
        /* ignore */
      }
      await tick();
      if (!cancelled) {
        intervalId = setInterval(tick, POLL_INTERVAL_MS);
      }
    };

    void run();

    const onAppState = (next: AppStateStatus) => {
      if (next === "active") {
        void tick();
      }
    };
    const sub = AppState.addEventListener("change", onAppState);

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
      sub.remove();
    };
  }, []);
}
