import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import { Image } from "expo-image";
import Button from "../Button";

const { width } = Dimensions.get("window");

interface IntroSlideProps {
  onFinish: () => void;
}

const slides = [
  {
    title: "Kindness at Your Fingertips.",
    description:
      "Support urgent global causes and fulfill your Zakat in seconds, not minutes.",
    background: require("../../../assets/intro-1.png"),
  },
  {
    title: "Kindness at Your Fingertips.",
    description:
      "Support urgent global causes and fulfill your Zakat in seconds, not minutes.",
    background: require("../../../assets/intro-1.png"),
  },
];

export default function IntroSlide({ onFinish }: IntroSlideProps) {
  const [page, setPage] = useState(0);
  const slide = slides[page];

  // Animated values
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.96)).current;

  // Animate in on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const animatePageChange = (next: () => void) => {
    // Animate out
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.97,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Change page
      next();
      // Reset animation
      opacity.setValue(0);
      scale.setValue(0.96);
      // Animate in
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const finish = () => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 600,
      useNativeDriver: true,
    }).start(onFinish);
  };

  return (
    <Animated.View
      style={[styles.container, { opacity, transform: [{ scale }] }]}
    >
      {/* Background */}
      <Image
        source={slide.background}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />

      {/* Top Text */}
      <View style={styles.topTextContainer}>
        <Image
          source={require("../../../assets/logo-white.png")}
          style={{ width: 300, height: 80, resizeMode: "contain" }}
        />
      </View>

      {/* Bottom Content */}
      <View style={styles.bottomContainer}>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.description}>{slide.description}</Text>

        {/* Pagination */}
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index === page && styles.activeDot]}
            />
          ))}
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          <TouchableOpacity onPress={finish}>
            <Text style={styles.skip}>Skip</Text>
          </TouchableOpacity>

          <Button
            label="Next"
            variant="secondary"
            onPress={() => {
              if (page < slides.length - 1) {
                animatePageChange(() => setPage(page + 1));
              } else {
                finish();
              }
            }}
          />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topTextContainer: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  topText: {
    color: "#fff",
    fontSize: 16,
    opacity: 0.8,
  },
  bottomContainer: {
    position: "absolute",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    bottom: 60,
    width,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 40,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#fff",
    opacity: 0.9,
    lineHeight: 22,
    textAlign: "center",
  },
  pagination: {
    flexDirection: "row",
    marginTop: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.4)",
    marginRight: 8,
  },
  activeDot: {
    width: 18,
    backgroundColor: "#fff",
  },
  buttons: {
    marginTop: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    width,
  },
  skip: {
    color: "#fff",
    opacity: 0.7,
    fontSize: 16,
  },
  next: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
