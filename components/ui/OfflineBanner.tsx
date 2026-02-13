import React from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNetwork } from "@/context/NetworkContext";

export default function OfflineBanner() {
  const { isConnected } = useNetwork();
  const insets = useSafeAreaInsets();
  // Start completely off-screen (negative value larger than banner height + safe area)
  const slideAnim = React.useRef(new Animated.Value(-200)).current;
  const opacityAnim = React.useRef(new Animated.Value(isConnected ? 0 : 1)).current;
  const [shouldRender, setShouldRender] = React.useState(!isConnected);

  // Initialize animation position based on connection state
  React.useEffect(() => {
    if (!isConnected) {
      slideAnim.setValue(0);
      opacityAnim.setValue(1);
    } else {
      slideAnim.setValue(-200);
      opacityAnim.setValue(0);
    }
  }, []);

  React.useEffect(() => {
    if (!isConnected) {
      // Show banner when offline
      setShouldRender(true);
      // Slide down and fade in
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Slide up and fade out - ensure it goes completely off screen
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -200,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Only hide after animation completes
        setShouldRender(false);
      });
    }
  }, [isConnected]);

  if (!shouldRender) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.banner,
        {
          top: insets.top,
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
      pointerEvents={isConnected ? "none" : "auto"}
    >
      <View style={styles.content}>
        <Ionicons name="cloud-offline-outline" size={18} color="#FFFFFF" />
        <Text style={styles.text}>You're offline. Please check your internet connection.</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 99999,
    backgroundColor: "#DC2626",
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 10,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  text: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "AlbertSans_600SemiBold",
    flex: 1,
    textAlign: "center",
  },
});
