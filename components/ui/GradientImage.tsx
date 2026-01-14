import {
  View,
  StyleSheet,
  ViewStyle,
  ColorValue,
  TouchableOpacity,
  Image,
} from "react-native";
import { Image as ExpoImage, ImageSource } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

// Import ellipse image
const Ellipse = require("@/assets/Ellipse.png");

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

  gradientColors = ["rgba(36,107,225,0.1)", "rgba(36,107,225,0.9)"],
  gradientLocations = [0.1, 0.67],
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
        start={{ x: 0.85, y: 0.15 }}
        end={{ x: 0.15, y: 0.85 }}
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

      {/* Ellipse decorative elements for homepage - after gradient, before content */}
      {isHome && (
        <View style={styles.ellipseContainer}>
          <ExpoImage
            source={Ellipse}
            style={styles.ellipse}
            contentFit="cover"
          />
        </View>
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

  content: {
    zIndex: 10,
  },
  ellipseContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    width: "100%",
    height: "100%",
    overflow: "hidden",
    zIndex: 3,
    pointerEvents: "none",
  },
  ellipse: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 600,
    height: "100%",
    opacity: 1,
  },
});
