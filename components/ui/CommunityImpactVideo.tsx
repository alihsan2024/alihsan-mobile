import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useVideoPlayer, VideoView } from "expo-video";

interface CommunityImpactVideoProps {
  videoUrl?: string;
  backgroundImage?: string;
  coverImage?: string;
  title?: string;
  headline?: string;
  subheadline?: string;
}

export default function CommunityImpactVideo({
  videoUrl,
  backgroundImage = "https://alihsan.s3.ap-southeast-2.amazonaws.com/projects/dac1a675d19a0d43be37299aebb6dd02.jpg",
  coverImage,
  title = "Community Impact",
  headline = "Millions are facing hardship. Be the one who brings ease.",
  subheadline = "Meet the passionate individuals working together to bring kindness, care, and impact to every community we touch.",
}: CommunityImpactVideoProps) {
  const isYouTubeUrl =
    !!videoUrl && (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be"));
  const canPlayInline = !!videoUrl && !isYouTubeUrl;

  const player = useVideoPlayer(canPlayInline ? videoUrl! : null, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  const imageSource = coverImage || backgroundImage;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.videoContainer}
        activeOpacity={0.9}
        disabled={!videoUrl}
      >
        <View style={styles.videoWrapper}>
          {canPlayInline ? (
            <VideoView
              style={styles.backgroundVideo}
              player={player}
              contentFit="cover"
              nativeControls={false}
            />
          ) : (
            <ExpoImage
              source={{ uri: imageSource }}
              style={styles.backgroundImage}
              contentFit="cover"
            />
          )}

          {/* Gradient Overlay */}
          <LinearGradient
            colors={["transparent", "rgba(1, 13, 38, 0.3)", "rgba(1, 13, 38, 0.7)", "rgba(1, 13, 38, 0.855)"]}
            locations={[0, 0.2, 0.5, 0.8, 1]}
            style={styles.gradientOverlay}
          />

          {/* Text Overlay */}
          <View style={styles.textOverlay}>
            <Text style={styles.titleText}>{title}</Text>
            <Text style={styles.headlineText}>{headline}</Text>
            <Text style={styles.subheadlineText} numberOfLines={3}>
              {subheadline}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 20,
  },
  videoContainer: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  videoWrapper: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
    position: "relative",
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  backgroundVideo: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "70%",
  },
  textOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    zIndex: 5,
  },
  titleText: {
    fontSize: 18,
    fontFamily: "Guthen Bloots",
    color: "#FFD602",
    marginBottom: 4,
  },
  headlineText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 6,
    fontFamily: "AlbertSans_700Bold",
  },
  subheadlineText: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
    lineHeight: 20,
    fontFamily: "AlbertSans_400Regular",
  },
});
