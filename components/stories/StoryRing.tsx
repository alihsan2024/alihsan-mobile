import { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import StoryViewer from "./StoryViewer";
import {
  getStoriesGroupedByCategory,
  type Story,
  type StoryCategory,
} from "./mockStories";
import { fetchStories } from "@/utils/api";
import { apiToStory } from "./storyUtils";
import {
  prefetchVideoThumbnail,
  getVideoThumbnail,
  subscribeToThumbnails,
} from "./videoThumbnailCache";

const SEEN_KEY = "seen_story_ids";

// Ring geometry
const RING_SIZE = 72;       // outer diameter incl. gradient border
const RING_BORDER = 2.5;    // gradient / seen ring thickness
const RING_GAP = 2.5;       // white gap between border and image
const AVATAR_SIZE = RING_SIZE - 2 * (RING_BORDER + RING_GAP); // ≈ 62 px

// Per-category fallback background when no thumbnail is available yet.
const CATEGORY_COLOR: Record<string, readonly [string, string]> = {
  "emergency-2026": ["#EF4444", "#B91C1C"],
  "ramadan-2026":   ["#7C3AED", "#4C1D95"],
  "water-2026":     ["#2563EB", "#1E40AF"],
  "sponsorship":    ["#F59E0B", "#B45309"],
  "eye-project":    ["#10B981", "#065F46"],
};

type CategoryGroup = {
  category: StoryCategory;
  stories: Story[];
};

type Props = {
  /** Pass explicit groups for tests / Storybook. Omit to fetch from the API. */
  groups?: CategoryGroup[];
  onCTAPress?: (story: Story) => void;
};

/** Returns the best available cover URI for a category's first story. */
function getCoverUri(stories: Story[]): string | null {
  const s = stories[0];
  if (!s) return null;
  if (s.thumbnail_url) return s.thumbnail_url;
  if (s.media_type === "image") return s.media_url;
  return getVideoThumbnail(s.media_url); // null until extracted
}

export default function StoryRing({ groups: groupsProp, onCTAPress }: Props) {
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
  const [openStories, setOpenStories] = useState<Story[] | null>(null);
  const [initialStoryIndex, setInitialStoryIndex] = useState(0);
  const [fetchedStories, setFetchedStories] = useState<Story[]>([]);
  // Bumped whenever a video thumbnail lands so rings re-render with the new poster.
  const [, setThumbnailTick] = useState(0);

  // Load seen state
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(SEEN_KEY);
        if (raw) setSeenIds(new Set(JSON.parse(raw)));
      } catch {}
    })();
  }, []);

  // Fetch stories from API (skipped when caller supplies groups directly)
  useEffect(() => {
    if (groupsProp) return;
    let cancelled = false;
    (async () => {
      try {
        const stories = await fetchStories();
        if (!cancelled) setFetchedStories(stories.map(apiToStory));
      } catch {
        if (!cancelled) setFetchedStories([]);
      }
    })();
    return () => { cancelled = true; };
  }, [groupsProp]);

  // Re-render rings when a video first-frame thumbnail finishes extracting
  useEffect(() => subscribeToThumbnails(() => setThumbnailTick((n) => n + 1)), []);

  // Prefetch images + kick off video thumbnail extraction the moment data lands
  useEffect(() => {
    if (!fetchedStories.length) return;
    const imageUrls = fetchedStories
      .flatMap((s) => [
        s.media_type === "image" ? s.media_url : null,
        s.thumbnail_url ?? null,
      ])
      .filter((u): u is string => !!u);
    if (imageUrls.length) ExpoImage.prefetch(imageUrls);
    fetchedStories
      .filter((s) => s.media_type === "video")
      .forEach((s) => prefetchVideoThumbnail(s.media_url));
  }, [fetchedStories]);

  const groups = useMemo<CategoryGroup[]>(() => {
    if (groupsProp) return groupsProp;
    return getStoriesGroupedByCategory(fetchedStories);
  }, [groupsProp, fetchedStories]);

  const markSeen = useCallback((story: Story) => {
    setSeenIds((prev) => {
      if (prev.has(story.id)) return prev;
      const next = new Set(prev);
      next.add(story.id);
      AsyncStorage.setItem(SEEN_KEY, JSON.stringify([...next])).catch(() => {});
      return next;
    });
  }, []);

  const isCategorySeen = useCallback(
    (stories: Story[]) => stories.every((s) => seenIds.has(s.id)),
    [seenIds]
  );

  const openCategory = (stories: Story[]) => {
    if (!stories.length) return;
    const firstUnseen = stories.findIndex((s) => !seenIds.has(s.id));
    setInitialStoryIndex(firstUnseen === -1 ? 0 : firstUnseen);
    setOpenStories(stories);
  };

  if (!groups.length) return null;

  return (
    <View style={styles.wrapper}>
      {/* Section header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Latest Stories</Text>
        <Text style={styles.headerSub}>{groups.length} categories</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {groups.map(({ category, stories }) => {
          const seen = isCategorySeen(stories);
          const coverUri = getCoverUri(stories);
          const fallbackColors = CATEGORY_COLOR[category.slug] ?? ["#010D26", "#1e293b"];
          const unseenCount = stories.filter((s) => !seenIds.has(s.id)).length;

          return (
            <Pressable
              key={category.slug}
              style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
              onPress={() => openCategory(stories)}
            >
              <View style={styles.ringOuter}>
                {/* Gradient ring (unseen) or muted ring (seen) */}
                {seen ? (
                  <View style={[styles.ringCircle, styles.ringCircleSeen]} />
                ) : (
                  <LinearGradient
                    colors={["#F58529", "#DD2A7B", "#8134AF"]}
                    start={{ x: 0, y: 1 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.ringCircle}
                  />
                )}

                {/* White gap + avatar */}
                <View style={styles.avatarBorder}>
                  {coverUri ? (
                    <ExpoImage
                      source={{ uri: coverUri }}
                      style={[styles.avatar, seen && styles.avatarSeen]}
                      contentFit="cover"
                      cachePolicy="memory-disk"
                      transition={200}
                    />
                  ) : (
                    /* Coloured gradient placeholder until thumbnail is ready */
                    <LinearGradient
                      colors={fallbackColors as unknown as string[]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[styles.avatar, seen && styles.avatarSeen]}
                    />
                  )}
                </View>

                {/* Unseen count badge — bottom-right corner of the ring */}
                {!seen && unseenCount > 1 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unseenCount}</Text>
                  </View>
                )}
              </View>

              <Text
                style={[styles.label, seen && styles.labelSeen]}
                numberOfLines={1}
              >
                {category.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <StoryViewer
        visible={openStories !== null}
        stories={openStories ?? []}
        initialIndex={initialStoryIndex}
        onClose={() => setOpenStories(null)}
        onStoryViewed={markSeen}
        onCTAPress={onCTAPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: 16,
    paddingBottom: 4,
    backgroundColor: "#fff",
  },

  // ── Section header ──────────────────────────────────────────
  header: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#010D26",
    fontFamily: "AlbertSans_700Bold",
  },
  headerSub: {
    fontSize: 12,
    color: "#9CA3AF",
    fontFamily: "AlbertSans_400Regular",
  },

  // ── Scroll row ───────────────────────────────────────────────
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 16,
  },

  // ── Individual ring item ─────────────────────────────────────
  item: {
    alignItems: "center",
    width: RING_SIZE + 10,
  },
  itemPressed: {
    opacity: 0.75,
  },

  ringOuter: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: "center",
    justifyContent: "center",
    // Subtle drop shadow for depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 3,
  },

  ringCircle: {
    position: "absolute",
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
  },
  ringCircleSeen: {
    backgroundColor: "#E5E7EB",
  },

  // White gap between ring and image
  avatarBorder: {
    width: AVATAR_SIZE + 2 * RING_GAP,
    height: AVATAR_SIZE + 2 * RING_GAP,
    borderRadius: (AVATAR_SIZE + 2 * RING_GAP) / 2,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarSeen: {
    opacity: 0.5,
  },

  // ── Unseen count badge ───────────────────────────────────────
  badge: {
    position: "absolute",
    bottom: 1,
    right: 1,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#F58529",
    borderWidth: 2,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "700",
    fontFamily: "AlbertSans_700Bold",
    lineHeight: 12,
  },

  // ── Label ────────────────────────────────────────────────────
  label: {
    marginTop: 7,
    fontSize: 11,
    fontWeight: "600",
    color: "#010D26",
    fontFamily: "AlbertSans_600SemiBold",
    maxWidth: RING_SIZE + 8,
    textAlign: "center",
  },
  labelSeen: {
    color: "#9CA3AF",
    fontWeight: "400",
    fontFamily: "AlbertSans_400Regular",
  },
});
