import {
  View,
  StyleSheet,
  ViewStyle,
  ColorValue,
  TouchableOpacity,
} from "react-native";
import { Image as ExpoImage, ImageSource } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

type GradientColors = readonly [ColorValue, ColorValue, ...ColorValue[]];
type GradientLocations = readonly [number, number, ...number[]];

type HeroBackgroundProps = {
  source: ImageSource;
  children?: ReactNode;

  /** NEW */
  isHome?: boolean;

  /** Back icon */
  showBack?: boolean;
  onBackPress?: () => void;
  backIconStyle?: ViewStyle;

  /** Optional customization */
  gradientColors?: GradientColors;
  gradientLocations?: GradientLocations;
  containerStyle?: ViewStyle;
  contentStyle?: ViewStyle;
};

export default function HeroBackground({
  source,
  children,

  isHome = false,

  showBack = false,
  onBackPress = () => router.back(),
  backIconStyle,

  gradientColors = [
    "rgba(36,107,225,0.5)",
    "rgba(36,107,225,0.5)",
    "rgba(36,107,225,0.0)",
  ],
  gradientLocations = [0, 0.7, 1],
  containerStyle,
  contentStyle,
}: HeroBackgroundProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {/* Background image */}
      <ExpoImage
        source={source}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />

      {/* Gradient overlay */}
      <LinearGradient
        colors={gradientColors}
        locations={gradientLocations}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* 🔙 Back icon */}
      {showBack && (
        <TouchableOpacity
          style={[styles.backIcon, backIconStyle]}
          onPress={onBackPress}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={22} color="#010D264D" />
        </TouchableOpacity>
      )}

      {/* Foreground content */}
      {children && (
        <View
          style={[
            styles.content,
            contentStyle,
            !isHome && styles.headerContent,
          ]}
        >
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
    overflow: "hidden",
  },

  backIcon: {
    position: "absolute",
    top: 48,
    left: 16,
    zIndex: 20,
    borderWidth: 1,
    borderColor: "#010D264D",
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },

  /** Applied only when NOT home */
  headerContent: {
    position: "absolute",
    bottom: 0,
    left: 16,
    right: 16,
  },

  content: {},
});
