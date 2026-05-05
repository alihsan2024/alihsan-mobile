import { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
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
import { prepareStoryMediaReady } from "./prepareStoryMedia";
import { StoryIconLoadingRing } from "./StoryIconLoadingRing";

const SEEN_KEY = "seen_story_ids";

// Ring geometry — compact row (modern story-strip density)
const RING_SIZE = 62;
const RING_BORDER = 2;
const RING_GAP = 2;
const AVATAR_SIZE = RING_SIZE - 2 * (RING_BORDER + RING_GAP);

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
  /** Increment when `/stories` should refetch (version poll or pull-to-refresh). */
  refreshSignal?: number;
};

/** Returns the best available cover URI for a category's first story. */
function getCoverUri(stories: Story[]): string | null {
  const s = stories[0];
  if (!s) return null;
  if (s.thumbnail_url) return s.thumbnail_url;
  if (s.media_type === "image") return s.media_url;
  return getVideoThumbnail(s.media_url); // null until extracted
}

export default function StoryRing({
  groups: groupsProp,
  onCTAPress,
  refreshSignal = 0,
}: Props) {
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
  const [openStories, setOpenStories] = useState<Story[] | null>(null);
  const [initialStoryIndex, setInitialStoryIndex] = useState(0);
  /** Which category ring is currently preparing media (Instagram-style arc on that icon only). */
  const [preparingSlug, setPreparingSlug] = useState<string | null>(null);
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
        const forceFullFetch = refreshSignal > 0;
        const stories = await fetchStories(forceFullFetch);
        if (!cancelled) setFetchedStories(stories.map(apiToStory));
      } catch {
        if (!cancelled) setFetchedStories([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [groupsProp, refreshSignal]);

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

  const openCategory = async (categoryStories: Story[], slug: string) => {
    if (!categoryStories.length || preparingSlug !== null) return;
    const firstUnseen = categoryStories.findIndex((s) => !seenIds.has(s.id));
    const idx = firstUnseen === -1 ? 0 : firstUnseen;
    const first = categoryStories[idx];
    setPreparingSlug(slug);
    try {
      const meta = await prepareStoryMediaReady(first);
      const augmented = categoryStories.map((s, i) =>
        i === idx ? { ...s, duration_ms: meta.durationMs } : s
      );
      setInitialStoryIndex(idx);
      setOpenStories(augmented);
    } catch {
      Alert.alert(
        "Couldn't open story",
        "Please check your connection and try again.",
        [{ text: "OK" }]
      );
    } finally {
      setPreparingSlug(null);
    }
  };

  if (!groups.length) return null;

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Stories</Text>
        <Text style={styles.headerMeta}>
          {groups.length} {groups.length === 1 ? "topic" : "topics"}
        </Text>
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
          const loadingThis = preparingSlug === category.slug;

          return (
            <Pressable
              key={category.slug}
              style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
              onPress={() => openCategory(stories, category.slug)}
              disabled={preparingSlug !== null}
            >
              <View style={styles.ringOuter}>
                {/* Gradient ring (unseen) or muted ring (seen), or neutral while loading */}
                {loadingThis ? (
                  <View style={[styles.ringCircle, styles.ringCircleLoading]} />
                ) : seen ? (
                  <View style={[styles.ringCircle, styles.ringCircleSeen]} />
                ) : (
                  <LinearGradient
                    colors={["#F58529", "#DD2A7B", "#8134AF"]}
                    start={{ x: 0, y: 1 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.ringCircle}
                  />
                )}

                {loadingThis && (
                  <View
                    style={styles.ringLoadingOverlay}
                    pointerEvents="none"
                  >
                    <StoryIconLoadingRing size={RING_SIZE} strokeWidth={2.5} />
                  </View>
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
  section: {
    marginTop: 12,
    marginBottom: 2,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    fontFamily: "AlbertSans_700Bold",
    letterSpacing: -0.2,
  },
  headerMeta: {
    fontSize: 12,
    fontWeight: "500",
    color: "#94A3B8",
    fontFamily: "AlbertSans_500Medium",
  },

  scroll: {
    paddingRight: 4,
    paddingBottom: 2,
    gap: 11,
  },

  item: {
    alignItems: "center",
    width: RING_SIZE + 8,
  },
  itemPressed: {
    opacity: 0.75,
  },

  ringOuter: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
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
  ringCircleLoading: {
    backgroundColor: "#E8E8EA",
  },
  ringLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
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
    bottom: 0,
    right: 0,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#EA580C",
    borderWidth: 1.5,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    color: "#fff",
    fontSize: 8,
    fontWeight: "700",
    fontFamily: "AlbertSans_700Bold",
    lineHeight: 10,
  },

  label: {
    marginTop: 5,
    fontSize: 10,
    fontWeight: "600",
    color: "#334155",
    fontFamily: "AlbertSans_600SemiBold",
    maxWidth: RING_SIZE + 10,
    textAlign: "center",
  },
  labelSeen: {
    color: "#9CA3AF",
    fontWeight: "400",
    fontFamily: "AlbertSans_400Regular",
  },
});
