import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
  Linking,
  Platform,
  PanResponder,
  useWindowDimensions,
} from "react-native";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useRef, useState, useCallback } from "react";
import { VideoView, useVideoPlayer } from "expo-video";
import { router } from "expo-router";
import type { Story } from "./mockStories";
import { getVideoThumbnail } from "./videoThumbnailCache";
import {
  getSegmentDurationsMs,
  STORY_SEGMENT_MS,
} from "./storyUtils";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const DEFAULT_IMAGE_DURATION_MS = STORY_SEGMENT_MS;
/** Horizontal inset from screen edges for caption + CTA row */
const CAPTION_EDGE_INSET = 16;

/** Progress fill 0–1 within one segment from overall playback ratio (0–1). */
function segmentFillRatio(
  overallRatio: number,
  totalMs: number,
  segmentIndex: number,
  segmentDurations: number[]
): number {
  if (totalMs <= 0 || !segmentDurations.length) return 0;
  const elapsed = overallRatio * totalMs;
  let start = 0;
  for (let i = 0; i < segmentIndex; i++) start += segmentDurations[i];
  const dur = segmentDurations[segmentIndex];
  if (elapsed <= start) return 0;
  if (elapsed >= start + dur) return 1;
  return (elapsed - start) / dur;
}

type Props = {
  visible: boolean;
  stories: Story[];
  initialIndex: number;
  onClose: () => void;
  onStoryViewed?: (story: Story) => void;
  onCTAPress?: (story: Story) => void;
};

const DISMISS_DRAG_THRESHOLD = 110;
/** Require real drag distance before velocity can dismiss — avoids taps registering high vy and closing the viewer. */
const DISMISS_MIN_DRAG_FOR_FLICK = 52;
const DISMISS_VELOCITY = 1.35;
/** Drag distance over which the story scales down ~20% (scale → 0.8). */
const DRAG_SCALE_DISTANCE = SCREEN_H * 0.38;
/** Corner radius grows with drag so the card feels more “sheet-like” as it moves down. */
const DRAG_RADIUS_MAX_EARLY = 26;
const DRAG_RADIUS_MAX_DEEP = 42;

export default function StoryViewer({
  visible,
  stories,
  initialIndex,
  onClose,
  onStoryViewed,
  onCTAPress,
}: Props) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  /** Never wider than the screen minus margins (caps at 560 on large phones/tablets). */
  const captionBlockMaxWidth = Math.min(
    560,
    windowWidth - CAPTION_EDGE_INSET * 2,
  );
  const [index, setIndex] = useState(initialIndex);
  const [paused, setPaused] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const translateY = useRef(new Animated.Value(0)).current;
  const dragOffsetRef = useRef(0);
  const indexRef = useRef(index);
  indexRef.current = index;

  /**
   * Story ring closes with `stories=[]`, which would unmount this tree and destroy video players.
   * Keep the last non-empty list so `StoryVideo` / `useVideoPlayer` stay mounted — reopen reuses buffers.
   */
  const storiesSnapshotRef = useRef<Story[]>([]);
  useEffect(() => {
    if (stories.length > 0) {
      storiesSnapshotRef.current = stories;
    }
  }, [stories]);

  const storyList =
    stories.length > 0 ? stories : storiesSnapshotRef.current;

  const storyListLenRef = useRef(0);
  storyListLenRef.current = storyList.length;

  const story = storyList[index];

  /** Measured from the active video player; drives full-length playback and 5s segment layout. */
  const [videoDurationMs, setVideoDurationMs] = useState<number | null>(null);
  /** 0–1 elapsed / duration for the current video story. */
  const [videoRatio, setVideoRatio] = useState(0);

  const storyRef = useRef(story);
  storyRef.current = story;
  const onStoryViewedRef = useRef(onStoryViewed);
  onStoryViewedRef.current = onStoryViewed;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (visible) {
      setIndex(initialIndex);
      setPaused(false);
      translateY.setValue(0);
      dragOffsetRef.current = 0;
    }
  }, [visible, initialIndex]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      /** Higher dy threshold so light finger noise does not steal taps from left/right story navigation. */
      onMoveShouldSetPanResponder: (_, g) =>
        g.dy > 22 &&
        Math.abs(g.dy) > Math.abs(g.dx) * 1.08 &&
        Math.abs(g.dx) < 64,
      onMoveShouldSetPanResponderCapture: (_, g) =>
        g.dy > 22 &&
        Math.abs(g.dy) > Math.abs(g.dx) * 1.08 &&
        Math.abs(g.dx) < 64,
      onPanResponderGrant: () => {
        translateY.stopAnimation((v) => {
          dragOffsetRef.current = v;
        });
      },
      onPanResponderMove: (_, g) => {
        const y = Math.max(0, dragOffsetRef.current + g.dy);
        translateY.setValue(y);
      },
      onPanResponderRelease: (_, g) => {
        const y = dragOffsetRef.current + g.dy;
        const shouldClose =
          y > DISMISS_DRAG_THRESHOLD ||
          (y > DISMISS_MIN_DRAG_FOR_FLICK && g.vy > DISMISS_VELOCITY);
        if (shouldClose) {
          Animated.timing(translateY, {
            toValue: SCREEN_H,
            duration: 220,
            useNativeDriver: true,
          }).start(() => {
            onCloseRef.current();
            translateY.setValue(0);
            dragOffsetRef.current = 0;
          });
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            friction: 9,
            tension: 80,
          }).start(() => {
            dragOffsetRef.current = 0;
          });
        }
      },
    })
  ).current;

  /** Shrinks with downward drag (≈20% at full range). */
  const dragShrinkScale = translateY.interpolate({
    inputRange: [0, DRAG_SCALE_DISTANCE],
    outputRange: [1, 0.8],
    extrapolate: "clamp",
  });

  /** Corners start sharp at rest and round further the more you drag (and a bit more near full dismiss). */
  const dragCornerRadius = translateY.interpolate({
    inputRange: [0, DRAG_SCALE_DISTANCE, SCREEN_H * 0.55],
    outputRange: [0, DRAG_RADIUS_MAX_EARLY, DRAG_RADIUS_MAX_DEEP],
    extrapolate: "clamp",
  });

  useEffect(() => {
    setVideoRatio(0);
    if (
      story?.media_type === "video" &&
      typeof story.duration_ms === "number" &&
      story.duration_ms > 0
    ) {
      setVideoDurationMs(story.duration_ms);
    } else {
      setVideoDurationMs(null);
    }
  }, [story?.id, story?.media_type, story?.duration_ms]);

  useEffect(() => {
    if (!visible || !storyList.length) return;
    const urls = storyList
      .flatMap((s) => [
        s.media_type === "image" ? s.media_url : null,
        s.thumbnail_url ?? null,
      ])
      .filter((u): u is string => !!u);
    if (urls.length) ExpoImage.prefetch(urls);
  }, [visible, storyList]);

  const goNext = useCallback(() => {
    if (storyRef.current) onStoryViewedRef.current?.(storyRef.current);
    const n = storyListLenRef.current;
    if (n === 0) return;
    if (indexRef.current >= n - 1) {
      onClose();
    } else {
      setIndex((i) => Math.min(i + 1, n - 1));
    }
  }, [onClose]);

  const goNextRef = useRef(goNext);
  goNextRef.current = goNext;

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

  const handleVideoDuration = useCallback((ms: number) => {
    if (ms > 0) setVideoDurationMs(ms);
  }, []);

  const handleVideoRatio = useCallback((r: number) => {
    setVideoRatio(Math.min(1, Math.max(0, r)));
  }, []);

  const handleVideoEnd = useCallback(() => {
    goNext();
  }, [goNext]);

  useEffect(() => {
    if (!visible || !story) return;
    if (story.media_type === "video") return;

    progress.setValue(0);
    const duration = story.duration_ms ?? DEFAULT_IMAGE_DURATION_MS;

    animationRef.current = Animated.timing(progress, {
      toValue: 1,
      duration,
      useNativeDriver: false,
    });

    if (!paused) {
      animationRef.current.start(({ finished }) => {
        if (finished) goNextRef.current();
      });
    }

    return () => {
      animationRef.current?.stop();
    };
  }, [visible, story?.id, story?.media_type]);

  useEffect(() => {
    if (!visible || !story) return;
    if (story.media_type === "video") return;
    if (paused) {
      animationRef.current?.stop();
      return;
    }

    const duration = story.duration_ms ?? DEFAULT_IMAGE_DURATION_MS;
    const current = (progress as any)._value ?? 0;
    const remaining = Math.max(0, duration * (1 - current));

    animationRef.current = Animated.timing(progress, {
      toValue: 1,
      duration: remaining,
      useNativeDriver: false,
    });
    animationRef.current.start(({ finished }) => {
      if (finished) goNextRef.current();
    });
  }, [paused, story?.media_type, visible, story?.id]);

  const handleCTA = () => {
    if (!story) return;
    onCTAPress?.(story);
    if (!story.cta_url) return;

    onClose();

    if (story.cta_url.startsWith("/")) {
      setTimeout(() => router.push(story.cta_url as any), 50);
    } else {
      Linking.openURL(story.cta_url).catch(() => {});
    }
  };

  if (!storyList.length || !story) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      presentationStyle={Platform.OS === "ios" ? "overFullScreen" : "fullScreen"}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar barStyle="light-content" />
      {/* Transparent shell so the route underneath (homepage) shows around the shrinking story card */}
      <View style={styles.modalRoot}>
        <Animated.View
          style={[
            styles.container,
            {
              borderRadius: dragCornerRadius,
              overflow: "hidden",
              transform: [
                { translateY },
                { scale: dragShrinkScale },
              ],
            },
          ]}
          {...panResponder.panHandlers}
        >
        {/* Pass-through so taps hit tap zones / navigation — VideoView can otherwise sit above RN siblings on some devices. */}
        {story.media_type === "image" && (
          <View style={styles.media} pointerEvents="none">
            <ExpoImage
              source={{ uri: story.media_url }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          </View>
        )}
        {story.media_type === "video" && (
          <View style={styles.media} pointerEvents="none">
            {!!getVideoThumbnail(story.media_url) && (
              <ExpoImage
                source={{ uri: getVideoThumbnail(story.media_url)! }}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
            )}
            <StoryVideo
              key={story.id}
              source={story.media_url}
              paused={paused || !visible}
              viewerVisible={visible}
              style={StyleSheet.absoluteFill}
              onSourceDurationMs={handleVideoDuration}
              onPlaybackRatio={handleVideoRatio}
              onPlayToEnd={handleVideoEnd}
            />
          </View>
        )}

        {storyList[index + 1]?.media_type === "video" && (
          <View pointerEvents="none" style={styles.preloadHidden}>
            <StoryVideo
              key={`preload_${storyList[index + 1].id}`}
              source={storyList[index + 1].media_url}
              paused
              viewerVisible={visible}
              style={StyleSheet.absoluteFill}
            />
          </View>
        )}

        <LinearGradient
          colors={["rgba(0,0,0,0.78)", "rgba(0,0,0,0.18)", "transparent"]}
          locations={[0, 0.42, 1]}
          style={[styles.gradientTop, { height: 180 + insets.top }]}
          pointerEvents="none"
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.22)", "rgba(0,0,0,0.82)"]}
          locations={[0, 0.38, 1]}
          style={styles.gradientBottom}
          pointerEvents="none"
        />

        <View style={styles.tapRow} pointerEvents="box-none">
          <TouchableWithoutFeedback
            onPress={goPrev}
            onLongPress={() => setPaused(true)}
            onPressOut={() => setPaused(false)}
            delayLongPress={180}
          >
            <View style={styles.tapZone} />
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback
            onPress={goNext}
            onLongPress={() => setPaused(true)}
            onPressOut={() => setPaused(false)}
            delayLongPress={180}
          >
            <View style={styles.tapZone} />
          </TouchableWithoutFeedback>
        </View>

        <View
          style={[styles.progressRow, { top: insets.top + 10 }]}
          pointerEvents="none"
        >
          {storyList.map((s, i) => {
            const isPast = i < index;
            const isActive = i === index;

            if (isPast) {
              return (
                <View key={s.id} style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: "100%" }]} />
                </View>
              );
            }

            if (!isActive) {
              return (
                <View key={s.id} style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: "0%" }]} />
                </View>
              );
            }

            if (s.media_type === "image") {
              const width = progress.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              });
              return (
                <View key={s.id} style={styles.progressTrack}>
                  <Animated.View
                    style={[styles.progressFill, { width: width as any }]}
                  />
                </View>
              );
            }

            const totalMs =
              videoDurationMs ??
              (s.duration_ms && s.duration_ms > 0
                ? s.duration_ms
                : STORY_SEGMENT_MS);
            const segs = getSegmentDurationsMs(totalMs);
            const sumMs = segs.reduce((a, b) => a + b, 0);

            return (
              <View key={s.id} style={styles.activeVideoSegmentRow}>
                {segs.map((_, segIdx) => {
                  const fill = segmentFillRatio(
                    videoRatio,
                    sumMs,
                    segIdx,
                    segs
                  );
                  return (
                    <View key={segIdx} style={styles.progressTrack}>
                      <View
                        style={[styles.progressFill, { width: `${fill * 100}%` }]}
                      />
                    </View>
                  );
                })}
              </View>
            );
          })}
        </View>

        <View
          style={[styles.header, { top: insets.top + 20 }]}
          pointerEvents="box-none"
        >
          <View style={styles.headerLeft} pointerEvents="none">
            <ExpoImage
              source={require("../../assets/app-icon.png")}
              style={styles.avatar}
              contentFit="cover"
            />
            <View style={styles.headerTitles}>
              <Text style={styles.brand}>Al-Ihsan Foundation</Text>
              <Text style={styles.subBrand}>Stories</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={12}
            style={styles.closeFab}
            activeOpacity={0.85}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {!!story.caption && (
          <View
            style={[styles.captionOuter, { bottom: insets.bottom + 112 }]}
            pointerEvents="none"
          >
            <View
              style={[
                styles.captionPanel,
                { maxWidth: captionBlockMaxWidth },
              ]}
            >
              <Text style={styles.caption} numberOfLines={5}>
                {story.caption}
              </Text>
            </View>
          </View>
        )}

        {!!story.cta_url && (
          <TouchableOpacity
            style={[
              styles.cta,
              {
                bottom: insets.bottom + 28,
                maxWidth: captionBlockMaxWidth,
              },
            ]}
            onPress={handleCTA}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>{story.cta_label ?? "Learn More"}</Text>
            <Ionicons name="arrow-forward" size={20} color="#010D26" />
          </TouchableOpacity>
        )}
      </Animated.View>
      </View>
    </Modal>
  );
}

function StoryVideo({
  source,
  paused,
  viewerVisible = true,
  style,
  onSourceDurationMs,
  onPlaybackRatio,
  onPlayToEnd,
}: {
  source: string;
  paused: boolean;
  /** When false (modal closed), playback must stop — keeps mounted players from decoding in the background. */
  viewerVisible?: boolean;
  style: any;
  onSourceDurationMs?: (ms: number) => void;
  onPlaybackRatio?: (ratio: number) => void;
  onPlayToEnd?: () => void;
}) {
  const initialPausedRef = useRef(paused);
  const durationCbRef = useRef(onSourceDurationMs);
  const ratioCbRef = useRef(onPlaybackRatio);
  const endCbRef = useRef(onPlayToEnd);
  durationCbRef.current = onSourceDurationMs;
  ratioCbRef.current = onPlaybackRatio;
  endCbRef.current = onPlayToEnd;
  const reportPlayback = Boolean(
    onSourceDurationMs || onPlaybackRatio || onPlayToEnd
  );

  const player = useVideoPlayer(source, (p) => {
    p.loop = false;
    p.muted = initialPausedRef.current;
    if (!initialPausedRef.current) p.play();
  });

  const durationSeenRef = useRef(false);

  useEffect(() => {
    durationSeenRef.current = false;
  }, [player]);

  /** Re-open from the start so replays don’t resume mid-buffer. */
  useEffect(() => {
    if (!viewerVisible) return;
    try {
      player.currentTime = 0;
    } catch {
      /* player may not be ready yet */
    }
  }, [viewerVisible, player]);

  useEffect(() => {
    if (!reportPlayback) {
      try {
        player.timeUpdateEventInterval = 0;
      } catch {}
      return;
    }
    try {
      player.timeUpdateEventInterval = 0.05;
    } catch {}

    const reportDurationOnce = (seconds: number) => {
      if (seconds <= 0 || durationSeenRef.current) return;
      durationSeenRef.current = true;
      durationCbRef.current?.(seconds * 1000);
    };

    const subSource = player.addListener("sourceLoad", ({ duration }) => {
      reportDurationOnce(duration);
    });
    const subTime = player.addListener("timeUpdate", ({ currentTime }) => {
      const d = player.duration;
      if (d > 0) {
        reportDurationOnce(d);
        ratioCbRef.current?.(currentTime / d);
      }
    });
    const subEnd = player.addListener("playToEnd", () => {
      endCbRef.current?.();
    });

    return () => {
      try {
        subSource.remove();
        subTime.remove();
        subEnd.remove();
        player.timeUpdateEventInterval = 0;
      } catch {}
    };
  }, [player, reportPlayback]);

  useEffect(() => {
    try {
      if (paused) {
        player.pause();
      } else {
        player.muted = false;
        player.play();
      }
    } catch {}
  }, [paused, player]);

  return (
    <VideoView
      player={player}
      style={style}
      contentFit="cover"
      nativeControls={false}
    />
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    backgroundColor: "transparent",
  },
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  media: {
    width: SCREEN_W,
    height: SCREEN_H,
  },
  preloadHidden: {
    position: "absolute",
    opacity: 0,
    width: 1,
    height: 1,
    overflow: "hidden",
  },
  gradientTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  gradientBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 280,
  },
  progressRow: {
    position: "absolute",
    left: 14,
    right: 14,
    flexDirection: "row",
    gap: 6,
  },
  activeVideoSegmentRow: {
    flex: 1,
    flexDirection: "row",
    gap: 6,
  },
  progressTrack: {
    flex: 1,
    height: 5,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.28)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 5,
    backgroundColor: "#fff",
    shadowColor: "#fff",
    shadowOpacity: 0.35,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  header: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
  },
  headerTitles: {
    flex: 1,
    minWidth: 0,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.95)",
  },
  brand: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "AlbertSans_700Bold",
    textShadowColor: "rgba(0,0,0,0.45)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  subBrand: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "AlbertSans_500Medium",
    marginTop: 1,
  },
  closeFab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.38)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  tapRow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
  },
  tapZone: {
    flex: 1,
  },
  captionOuter: {
    position: "absolute",
    left: CAPTION_EDGE_INSET,
    right: CAPTION_EDGE_INSET,
    alignItems: "center",
  },
  captionPanel: {
    width: "100%",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: "rgba(0,0,0,0.48)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.14)",
    overflow: "hidden",
  },
  caption: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
    fontFamily: "AlbertSans_500Medium",
    flexShrink: 1,
  },
  cta: {
    position: "absolute",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFD602",
    paddingHorizontal: 28,
    minHeight: 50,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.06)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
      },
      default: {},
    }),
  },
  ctaText: {
    color: "#010D26",
    fontWeight: "700",
    fontSize: 15,
    fontFamily: "AlbertSans_700Bold",
  },
});
