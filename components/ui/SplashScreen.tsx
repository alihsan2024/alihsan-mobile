import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";

interface SplashScreenProps {
  onFinish?: () => void;
}

const SplashScreen = ({ onFinish }: SplashScreenProps) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.95)).current;
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade + scale in (slower & smoother)
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 1000, // ⬅️ was 600
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 10, // ⬅️ was 6 (slower spring)
        tension: 40, // ⬅️ adds smoothness
        useNativeDriver: true,
      }),
    ]).start();

    // Floating background shapes (slower wave)
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 5000, // ⬅️ was 3000
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 5000, // ⬅️ was 3000
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Auto hide (stay visible longer + slow fade out)
    const timeout = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 900, // ⬅️ was 600
        useNativeDriver: true,
      }).start(() => {
        onFinish?.();
      });
    }, 2800); // ⬅️ was 1800

    return () => clearTimeout(timeout);
  }, []);

  const floatTranslate = float.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20],
  });

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity, zIndex: 9999 }]}>
      <LinearGradient colors={["#5089E7", "#2161CD"]} style={styles.container}>
        <Animated.View
          style={[styles.centerContent, { transform: [{ scale }] }]}
        >
          <Animated.Image
            source={require("../../assets/splash-top.png")}
            style={[
              styles.splashTop,
              {
                transform: [
                  { translateY: floatTranslate },
                  { rotate: "180deg" },
                ],
              },
            ]}
            resizeMode="contain"
          />

          <Image
            source={require("../../assets/splash-logo.png")}
            style={styles.splashLogo}
            contentFit="contain"
          />

          <Animated.Image
            source={require("../../assets/splash-top.png")}
            style={[
              styles.splashBottom,
              {
                transform: [
                  { translateY: Animated.multiply(floatTranslate, -1) },
                ],
              },
            ]}
            resizeMode="contain"
          />
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  splashLogo: {
    width: 250,
    height: 250,
    zIndex: 10,
  },
  splashTop: {
    position: "absolute",
    bottom: -350,
    width: "100%",
    height: "100%",
  },
  splashBottom: {
    position: "absolute",
    top: -350,
    width: "100%",
    height: "100%",
  },
});

export default SplashScreen;
