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
} from "react-native";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useRef, useState, useCallback } from "react";
import { VideoView, useVideoPlayer } from "expo-video";
import { router } from "expo-router";
import type { Story } from "./mockStories";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const DEFAULT_IMAGE_DURATION_MS = 5000;

type Props = {
  visible: boolean;
  stories: Story[];
  initialIndex: number;
  onClose: () => void;
  /** Fired when a story becomes visible. Use to mark as seen and POST /view. */
  onStoryViewed?: (story: Story) => void;
  /** Fired when user taps the CTA button. */
  onCTAPress?: (story: Story) => void;
};

export default function StoryViewer({
  visible,
  stories,
  initialIndex,
  onClose,
  onStoryViewed,
  onCTAPress,
}: Props) {
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(initialIndex);
  const [paused, setPaused] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const indexRef = useRef(index);
  indexRef.current = index;

  const story = stories[index];

  // Reset when the modal opens or jumps to a new initial index
  useEffect(() => {
    if (visible) {
      setIndex(initialIndex);
      setPaused(false);
    }
  }, [visible, initialIndex]);

  // Fire onStoryViewed whenever the visible story changes
  useEffect(() => {
    if (visible && story) {
      onStoryViewed?.(story);
    }
  }, [visible, story?.id]);

  const goNext = useCallback(() => {
    if (indexRef.current >= stories.length - 1) {
      onClose();
    } else {
      setIndex((i) => Math.min(i + 1, stories.length - 1));
    }
  }, [stories.length, onClose]);

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

  // Drive the progress bar for the current story
  useEffect(() => {
    if (!visible || !story) return;

    progress.setValue(0);
    const duration = story.duration_ms ?? DEFAULT_IMAGE_DURATION_MS;

    animationRef.current = Animated.timing(progress, {
      toValue: 1,
      duration,
      useNativeDriver: false,
    });

    if (!paused) {
      animationRef.current.start(({ finished }) => {
        if (finished) goNext();
      });
    }

    return () => {
      animationRef.current?.stop();
    };
    // We intentionally re-run only on story change or visibility toggle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, story?.id]);

  // Pause/resume — stop or continue the in-flight animation
  useEffect(() => {
    if (!visible || !story) return;
    if (paused) {
      animationRef.current?.stop();
      return;
    }

    // Resume from current value
    const duration = story.duration_ms ?? DEFAULT_IMAGE_DURATION_MS;
    // @ts-ignore Animated.Value._value is internal but widely used
    const current = (progress as any)._value ?? 0;
    const remaining = Math.max(0, duration * (1 - current));

    animationRef.current = Animated.timing(progress, {
      toValue: 1,
      duration: remaining,
      useNativeDriver: false,
    });
    animationRef.current.start(({ finished }) => {
      if (finished) goNext();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused]);

  const handleCTA = () => {
    if (!story) return;
    onCTAPress?.(story);
    if (!story.cta_url) return;

    // Close the viewer first so the navigation target is visible.
    onClose();

    // Internal routes start with "/" — navigate via expo-router.
    // Anything else (http(s), mailto, tel) falls through to Linking.
    if (story.cta_url.startsWith("/")) {
      // Small delay lets the modal finish dismissing before we push.
      setTimeout(() => router.push(story.cta_url as any), 50);
    } else {
      Linking.openURL(story.cta_url).catch(() => {
        // Silently ignore — unknown scheme.
      });
    }
  };

  if (!story) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        {/* Media */}
        {story.media_type === "image" && (
          <ExpoImage
            source={{ uri: story.media_url }}
            style={styles.media}
            contentFit="cover"
            transition={150}
          />
        )}
        {story.media_type === "video" && (
          <StoryVideo
            key={story.id}
            source={story.media_url}
            paused={paused}
            style={styles.media}
          />
        )}

        {/* Tap zones — rendered early so header/CTA sit on top and
            receive their own taps. Long-press pauses playback. */}
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

        {/* Dark gradients top & bottom for legibility */}
        <LinearGradient
          colors={["rgba(0,0,0,0.6)", "transparent"]}
          style={[styles.gradientTop, { height: 140 + insets.top }]}
          pointerEvents="none"
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.7)"]}
          style={styles.gradientBottom}
          pointerEvents="none"
        />

        {/* Progress bars */}
        <View style={[styles.progressRow, { top: insets.top + 8 }]}>
          {stories.map((_, i) => {
            const isActive = i === index;
            const width =
              i < index
                ? "100%"
                : isActive
                ? progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  })
                : "0%";
            return (
              <View key={i} style={styles.progressTrack}>
                <Animated.View
                  style={[styles.progressFill, { width: width as any }]}
                />
              </View>
            );
          })}
        </View>

        {/* Header: avatar + close */}
        <View style={[styles.header, { top: insets.top + 18 }]}>
          <View style={styles.headerLeft}>
            <ExpoImage
              source={require("../../assets/app-icon.png")}
              style={styles.avatar}
              contentFit="cover"
            />
            <Text style={styles.brand}>Al-Ihsan Foundation Team</Text>
          </View>
          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Caption */}
        {!!story.caption && (
          <View style={[styles.captionWrap, { bottom: insets.bottom + 92 }]}>
            <Text style={styles.caption} numberOfLines={2}>
              {story.caption}
            </Text>
          </View>
        )}

        {/* CTA */}
        {!!story.cta_url && (
          <TouchableOpacity
            style={[styles.cta, { bottom: insets.bottom + 24 }]}
            onPress={handleCTA}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>{story.cta_label ?? "Learn More"}</Text>
            <Ionicons name="arrow-forward" size={18} color="#010D26" />
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );
}

/**
 * Isolated video subcomponent — useVideoPlayer is a hook that must run
 * unconditionally. Keying this by story.id on the parent guarantees a
 * fresh player per story rather than a stale source binding.
 */
function StoryVideo({
  source,
  paused,
  style,
}: {
  source: string;
  paused: boolean;
  style: any;
}) {
  const player = useVideoPlayer(source, (p) => {
    p.loop = false;
    p.muted = false;
    p.play();
  });

  useEffect(() => {
    try {
      if (paused) player.pause();
      else player.play();
    } catch {
      // Player may be torn down mid-transition; ignore.
    }
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
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  media: {
    width: SCREEN_W,
    height: SCREEN_H,
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
    height: 220,
  },
  progressRow: {
    position: "absolute",
    left: 8,
    right: 8,
    flexDirection: "row",
    gap: 4,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.3)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#fff",
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
    gap: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#fff",
  },
  brand: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "AlbertSans_700Bold",
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
  captionWrap: {
    position: "absolute",
    left: 16,
    right: 16,
  },
  caption: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 20,
    fontFamily: "AlbertSans_500Medium",
  },
  cta: {
    position: "absolute",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFD602",
    paddingHorizontal: 22,
    height: 44,
    borderRadius: 22,
  },
  ctaText: {
    color: "#010D26",
    fontWeight: "700",
    fontSize: 14,
    fontFamily: "AlbertSans_700Bold",
  },
});
