import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

type Props = {
  /** Outer diameter (matches story ring). */
  size: number;
  strokeWidth?: number;
  /** Accent for the spinning arc. */
  accentColor?: string;
};

/**
 * Indeterminate arc that orbits the story avatar — similar to Instagram’s ring loader.
 */
export function StoryIconLoadingRing({
  size,
  strokeWidth = 3,
  accentColor = "#F58529",
}: Props) {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 880,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, [rotation]);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const r = size / 2 - strokeWidth / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const dashVisible = circumference * 0.26;

  return (
    <View
      style={[styles.wrap, { width: size, height: size }]}
      pointerEvents="none"
      accessibilityLabel="Loading story"
      accessibilityRole="progressbar"
    >
      <Animated.View style={[styles.rotator, { transform: [{ rotate: spin }] }]}>
        <Svg width={size} height={size}>
          <Circle
            cx={cx}
            cy={cy}
            r={r}
            stroke={accentColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${dashVisible} ${circumference}`}
          />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  rotator: {
    width: "100%",
    height: "100%",
  },
});
