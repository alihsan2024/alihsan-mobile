import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

const { width: W } = Dimensions.get("window");

const BANNER_URI =
  "https://alihsan.s3.ap-southeast-2.amazonaws.com/qurban-2026/1777975482827-alihsan-group-c.jpeg";

/** `object-position: center top` — horizontal center, anchor to top. */
const IMAGE_TOP_CENTER = { top: "0%" as const, left: "50%" as const };

const TRUST_POINTS: { label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: "ACNC Registered Charity", icon: "shield-checkmark" },
  { label: "10+ Years Experience", icon: "time" },
  { label: "17 Countries Served", icon: "globe" },
  { label: "440,600+ People Reached in 2025", icon: "people" },
];

type Props = {
  minHeight?: number;
};

/**
 * Hero aligned with AU: full-bleed image (top-center crop), blue wash, trust pills
 * as floating wrap row with light “glass” pills + tagline (see `section-qurban-trust` on web).
 */
export default function QurbanHeroBanner({ minHeight = 440 }: Props) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.wrap, { height: minHeight }]}>
      <ExpoImage
        source={{ uri: BANNER_URI }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        contentPosition={IMAGE_TOP_CENTER}
      />

      <LinearGradient
        colors={[
          "rgba(36, 107, 225, 0.92)",
          "rgba(36, 107, 225, 0.55)",
          "rgba(36, 107, 225, 0.12)",
        ]}
        locations={[0, 0.38, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[StyleSheet.absoluteFill, { opacity: 0.95 }]}
      />

      <LinearGradient
        colors={["rgba(0,0,0,0.12)", "transparent", "rgba(255,255,255,0.97)", "#f9fafb"]}
        locations={[0, 0.42, 0.7, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <TouchableOpacity
        style={[styles.backBtn, { top: insets.top + 8 }]}
        onPress={() => router.back()}
        hitSlop={12}
        activeOpacity={0.85}
      >
        <View style={styles.backCircle}>
          <Ionicons name="chevron-back" size={22} color="#0f172a" />
        </View>
      </TouchableOpacity>

      <View
        style={[styles.heroColumn, { paddingTop: insets.top + 52, paddingBottom: 8 }]}
      >
        <View style={styles.copyBlock}>
          <Text style={styles.guthenLine}>Honour the legacy, nourish the Ummah</Text>
          <Text style={styles.headline}>Qurban 2026{"\n"}with Ihsan</Text>
          <Text style={styles.subline}>
            Fulfil your sacrifice with dignity — fresh meat to families across multiple countries this Eid
            al-Adha.
          </Text>
        </View>

        {/* AU: flex-wrap pills, “floating” with negative lift + glass + ring + shadow */}
        <View style={styles.trustLift}>
          <View style={styles.trustPillWrap}>
            {TRUST_POINTS.map((t) => (
              <View key={t.label} style={styles.trustPill}>
                <Ionicons name={t.icon} size={15} color="#2563EB" style={styles.trustPillIcon} />
                <Text style={styles.trustPillText} numberOfLines={2}>
                  {t.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: W,
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#1e3a8a",
    flexDirection: "column",
  },
  backBtn: {
    position: "absolute",
    left: 16,
    zIndex: 20,
  },
  backCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  heroColumn: {
    flex: 1,
    paddingHorizontal: 12,
    justifyContent: "space-between",
  },
  copyBlock: {
    maxWidth: 520,
    width: "100%",
    alignSelf: "center",
  },
  guthenLine: {
    fontFamily: "Guthen Bloots",
    fontSize: 22,
    color: "#FDE047",
    marginBottom: 6,
  },
  headline: {
    fontFamily: "AlbertSans_800ExtraBold",
    fontSize: 32,
    lineHeight: 36,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.5,
  },
  subline: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 22,
    color: "rgba(255,255,255,0.92)",
    fontFamily: "AlbertSans_400Regular",
  },
  trustLift: {
    marginTop: 8,
    marginBottom: -6,
    paddingTop: 4,
  },
  trustPillWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignContent: "center",
    gap: 8,
    rowGap: 10,
    columnGap: 8,
  },
  trustPill: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "100%",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.85)",
    backgroundColor: "rgba(255,255,255,0.78)",
    shadowColor: "rgb(36, 65, 128)",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  trustPillIcon: {
    marginRight: 6,
  },
  trustPillText: {
    flexShrink: 1,
    color: "#1E3A8A",
    fontSize: 10,
    fontWeight: "700",
    fontFamily: "AlbertSans_700Bold",
    lineHeight: 14,
  },
  trustTagline: {
    marginTop: 12,
    textAlign: "center",
    fontFamily: "Guthen Bloots",
    fontSize: 22,
    lineHeight: 28,
    color: "#1E40AF",
    textShadowColor: "rgba(255,255,255,0.95)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
    paddingHorizontal: 8,
  },
});
