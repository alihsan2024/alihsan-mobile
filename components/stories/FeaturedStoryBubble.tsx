import { useCallback, useEffect, useMemo, useState } from "react";
import { View, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from "react-native";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import StoryViewer from "./StoryViewer";
import { getRecentStories, type Story } from "./mockStories";
import { fetchStories, type StoryPayload } from "@/utils/api";

const SEEN_KEY = "seen_story_ids";
const SIZE = 50;
const INNER = SIZE - 6;

type Props = {
  /** Window in hours for the Featured feed. Default 24h. */
  hours?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Compact story bubble that lives next to the search bar in the home banner.
 * Opens the StoryViewer with every story published in the last `hours` window,
 * regardless of category. Shares the same AsyncStorage "seen" set as the
 * category rings below, so viewing here also greys out the ring.
 *
 * Fetches from `/stories` (cached 5 min via fetchStories) on mount.
 */
export default function FeaturedStoryBubble({ hours = 24, style }: Props) {
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
  const [fetched, setFetched] = useState<Story[]>([]);
  const [open, setOpen] = useState(false);

  const stories = useMemo(() => getRecentStories(fetched, hours), [fetched, hours]);

  // Fetch once on mount; the API layer caches so this is cheap even if
  // the category ring below also fetches.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetchStories();
        if (!cancelled) setFetched(res.map(apiToStory));
      } catch {
        if (!cancelled) setFetched([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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

  // Hide the bubble entirely when the last-N-hours window is empty.
  if (!stories.length) return null;

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        activeOpacity={0.85}
        style={[styles.container, style]}
        accessibilityRole="button"
        accessibilityLabel="Latest stories"
        accessibilityHint="Opens the latest Al-Ihsan stories from the last 24 hours"
      >
        {allSeen ? (
          <View style={[styles.ring, styles.ringSeen]} />
        ) : (
          <LinearGradient
            colors={["#F58529", "#DD2A7B", "#8134AF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ring}
          />
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
        stories={stories}
        initialIndex={0}
        onClose={() => setOpen(false)}
        onStoryViewed={markSeen}
      />
    </>
  );
}

function apiToStory(s: StoryPayload): Story {
  return {
    id: s.id,
    title: s.title,
    caption: s.caption,
    media_url: s.media_url,
    media_type: s.media_type,
    thumbnail_url: s.thumbnail_url ?? undefined,
    cta_label: s.cta_label,
    cta_url: s.cta_url,
    campaign_tag: s.campaign_tag,
    published_at: s.published_at,
    duration_ms: s.media_type === "video" ? 15000 : 5000,
  };
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
