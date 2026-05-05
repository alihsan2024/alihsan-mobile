import { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  Alert,
} from "react-native";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import StoryViewer from "./StoryViewer";
import { getRecentStories, type Story } from "./mockStories";
import { fetchStories } from "@/utils/api";
import { apiToStory } from "./storyUtils";
import { prefetchVideoThumbnail } from "./videoThumbnailCache";
import { prepareStoryMediaReady } from "./prepareStoryMedia";
import { StoryIconLoadingRing } from "./StoryIconLoadingRing";

const SEEN_KEY = "seen_story_ids";
const SIZE = 50;
const INNER = SIZE - 6;

type Props = {
  /** Window in hours for the Featured feed. Default 24h. */
  hours?: number;
  style?: StyleProp<ViewStyle>;
  /** Increment when `/stories` should refetch (version poll or pull-to-refresh). */
  refreshSignal?: number;
};

/**
 * Compact story bubble that lives next to the search bar in the home banner.
 * Opens the StoryViewer with every story published in the last `hours` window,
 * regardless of category. Shares the same AsyncStorage "seen" set as the
 * category rings below, so viewing here also greys out the ring.
 *
 * Fetches from `/stories`; refetches when `refreshSignal` increments (cheap version poll).
 */
export default function FeaturedStoryBubble({
  hours = 24,
  style,
  refreshSignal = 0,
}: Props) {
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
  const [fetched, setFetched] = useState<Story[]>([]);
  const [open, setOpen] = useState(false);
  const [preparingOpen, setPreparingOpen] = useState(false);
  /** Stories with measured duration for the viewer (set after prepare completes). */
  const [viewerStories, setViewerStories] = useState<Story[] | null>(null);

  const stories = useMemo(() => getRecentStories(fetched, hours), [fetched, hours]);

  // Fetch on mount and whenever refreshSignal bumps (version poll).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const forceFullFetch = refreshSignal > 0;
        const res = await fetchStories(forceFullFetch);
        if (!cancelled) setFetched(res.map(apiToStory));
      } catch {
        if (!cancelled) setFetched([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshSignal]);

  // Prefetch all image URLs and generate first-frame thumbnails for videos
  // as soon as the list lands — well before the viewer opens.
  useEffect(() => {
    if (!fetched.length) return;
    const imageUrls = fetched
      .flatMap((s) => [
        s.media_type === "image" ? s.media_url : null,
        s.thumbnail_url ?? null,
      ])
      .filter((u): u is string => !!u);
    if (imageUrls.length) ExpoImage.prefetch(imageUrls);
    fetched
      .filter((s) => s.media_type === "video")
      .forEach((s) => prefetchVideoThumbnail(s.media_url));
  }, [fetched]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(SEEN_KEY);
        if (raw) setSeenIds(new Set(JSON.parse(raw)));
      } catch {
        // Ignore.
      }
    })();
  }, []);

  const markSeen = useCallback((story: Story) => {
    setSeenIds((prev) => {
      if (prev.has(story.id)) return prev;
      const next = new Set(prev);
      next.add(story.id);
      AsyncStorage.setItem(SEEN_KEY, JSON.stringify([...next])).catch(() => {});
      return next;
    });
  }, []);

  const allSeen = stories.length > 0 && stories.every((s) => seenIds.has(s.id));

  // Resume from the first story that hasn't been seen yet. Falls back to 0
  // if somehow every story is already seen (wraps around to the beginning).
  const initialIndex = useMemo(() => {
    const firstUnseen = stories.findIndex((s) => !seenIds.has(s.id));
    return firstUnseen === -1 ? 0 : firstUnseen;
  }, [stories, seenIds]);

  const handleOpen = async () => {
    if (!stories.length || preparingOpen) return;
    const first = stories[initialIndex];
    setPreparingOpen(true);
    try {
      const meta = await prepareStoryMediaReady(first);
      const augmented = stories.map((s, i) =>
        i === initialIndex ? { ...s, duration_ms: meta.durationMs } : s
      );
      setViewerStories(augmented);
      setOpen(true);
    } catch {
      Alert.alert(
        "Couldn't open story",
        "Please check your connection and try again.",
        [{ text: "OK" }]
      );
    } finally {
      setPreparingOpen(false);
    }
  };

  const closeViewer = () => {
    setOpen(false);
    setViewerStories(null);
  };

  // Hide the bubble entirely when the last-N-hours window is empty.
  if (!stories.length) return null;

  return (
    <>
      <TouchableOpacity
        onPress={handleOpen}
        activeOpacity={0.85}
        style={[styles.container, style]}
        accessibilityRole="button"
        accessibilityLabel="Latest stories"
        accessibilityHint="Opens the latest Al-Ihsan stories from the last 24 hours"
        disabled={preparingOpen}
      >
        {preparingOpen ? (
          <View style={[styles.ring, styles.ringLoading]} />
        ) : allSeen ? (
          <View style={[styles.ring, styles.ringSeen]} />
        ) : (
          <LinearGradient
            colors={["#F58529", "#DD2A7B", "#8134AF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ring}
          />
        )}
        {preparingOpen && (
          <View style={styles.loadingRingOverlay} pointerEvents="none">
            <StoryIconLoadingRing size={SIZE} strokeWidth={2.5} />
          </View>
        )}
        <View style={styles.innerMask}>
          <ExpoImage
            source={require("../../assets/app-icon.png")}
            style={styles.icon}
            contentFit="cover"
          />
        </View>
      </TouchableOpacity>

      <StoryViewer
        visible={open}
        stories={viewerStories ?? stories}
        initialIndex={initialIndex}
        onClose={closeViewer}
        onStoryViewed={markSeen}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SIZE,
    height: SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
  },
  ringSeen: {
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  ringLoading: {
    backgroundColor: "#E8E8EA",
  },
  loadingRingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },

  innerMask: {
    width: INNER,
    height: INNER,
    borderRadius: INNER / 2,
    backgroundColor: "#fff",
    padding: 2,
    overflow: "hidden",
  },
  icon: {
    width: "100%",
    height: "100%",
    borderRadius: INNER / 2,
  },
});
