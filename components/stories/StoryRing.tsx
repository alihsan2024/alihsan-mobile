import { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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
import { fetchStories, type StoryPayload } from "@/utils/api";

const SEEN_KEY = "seen_story_ids";
const RING_SIZE = 72;
const AVATAR_SIZE = RING_SIZE - 8;

type CategoryGroup = {
  category: StoryCategory;
  stories: Story[];
};

type Props = {
  /** Override the category groups (tests / Storybook). If omitted the
   *  component fetches `/stories` and groups them by campaign_tag. */
  groups?: CategoryGroup[];
  onCTAPress?: (story: Story) => void;
};

export default function StoryRing({ groups: groupsProp, onCTAPress }: Props) {
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
  const [openStories, setOpenStories] = useState<Story[] | null>(null);
  const [fetchedStories, setFetchedStories] = useState<Story[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(SEEN_KEY);
        if (raw) setSeenIds(new Set(JSON.parse(raw)));
      } catch {
        // First launch or corrupted store.
      }
    })();
  }, []);

  // Fetch from the API unless the caller provided groups explicitly.
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
    return () => {
      cancelled = true;
    };
  }, [groupsProp]);

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

  // A category is "seen" only when every one of its stories has been seen.
  const isCategorySeen = useCallback(
    (stories: Story[]) => stories.every((s) => seenIds.has(s.id)),
    [seenIds]
  );

  const openCategory = (stories: Story[]) => {
    if (!stories.length) return;
    setOpenStories(stories);
  };

  const viewerStories = useMemo(() => openStories ?? [], [openStories]);

  if (!groups.length) return null;

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {groups.map(({ category, stories }) => {
          const seen = isCategorySeen(stories);
          return (
            <TouchableOpacity
              key={category.slug}
              style={styles.item}
              onPress={() => openCategory(stories)}
              activeOpacity={0.85}
            >
              <View style={styles.ringOuter}>
                {seen ? (
                  <View style={[styles.ringSeen, styles.ringCircle]} />
                ) : (
                  <LinearGradient
                    colors={["#F58529", "#DD2A7B", "#8134AF"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.ringCircle}
                  />
                )}
                <View style={styles.avatarContainer}>
                  <ExpoImage
                    source={require("../../assets/app-icon.png")}
                    style={styles.avatar}
                    contentFit="cover"
                    transition={120}
                  />
                </View>
              </View>
              <Text style={styles.label} numberOfLines={1}>
                {category.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <StoryViewer
        visible={openStories !== null}
        stories={viewerStories}
        initialIndex={0}
        onClose={() => setOpenStories(null)}
        onStoryViewed={markSeen}
        onCTAPress={onCTAPress}
      />
    </View>
  );
}

/**
 * Translate the raw API payload into the mobile Story shape. These are
 * already near-identical — only `duration_ms` is added for the viewer's
 * progress-bar timing. Videos get 15s by default (can be refined once
 * the backend exposes a real duration column).
 */
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
  wrapper: {
    paddingVertical: 8,
  },
  scroll: {
    paddingHorizontal: 16,
    gap: 14,
  },
  item: {
    alignItems: "center",
    width: RING_SIZE + 8,
  },
  ringOuter: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  ringCircle: {
    position: "absolute",
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
  },
  ringSeen: {
    backgroundColor: "#D1D5DB",
  },
  avatarContainer: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: "#fff",
    padding: 2,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: AVATAR_SIZE / 2,
  },
  label: {
    marginTop: 6,
    fontSize: 11,
    color: "#010D26",
    fontWeight: "500",
    fontFamily: "AlbertSans_500Medium",
    maxWidth: RING_SIZE + 4,
    textAlign: "center",
  },
});
