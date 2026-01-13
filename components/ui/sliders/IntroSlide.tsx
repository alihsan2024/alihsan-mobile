import React, { useRef, useState } from "react";
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
  
  // Animated value for slide translation
  const translateX = useRef(new Animated.Value(0)).current;

  // Animate slide change
  const animatePageChange = (nextPage: number) => {
    Animated.timing(translateX, {
      toValue: -nextPage * width,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setPage(nextPage);
  };

  const finish = () => {
    onFinish();
  };

  return (
    <View style={styles.container}>
      {/* Slides Container Wrapper with overflow hidden */}
      <View style={styles.slidesWrapper}>
        <Animated.View
          style={[
            styles.slidesContainer,
            {
              transform: [{ translateX }],
            },
          ]}
        >
          {slides.map((slide, index) => (
            <View key={index} style={styles.slide}>
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
              </View>
            </View>
          ))}
        </Animated.View>
      </View>

      {/* Fixed Pagination */}
      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => animatePageChange(index)}
            style={styles.dotContainer}
            activeOpacity={0.7}
          >
            <View
              style={[styles.dot, index === page && styles.activeDot]}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Fixed Buttons */}
      <View style={styles.buttons}>
        <TouchableOpacity onPress={finish}>
          <Text style={styles.skip}>Skip</Text>
        </TouchableOpacity>

        <Button
          label="Next"
          variant="secondary"
          onPress={() => {
            if (page < slides.length - 1) {
              animatePageChange(page + 1);
            } else {
              finish();
            }
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slidesWrapper: {
    flex: 1,
    overflow: "hidden",
  },
  slidesContainer: {
    flexDirection: "row",
    height: "100%",
    width: width * slides.length,
  },
  slide: {
    width,
    height: "100%",
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
    bottom: 180,
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
    position: "absolute",
    bottom: 140,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  dotContainer: {
    padding: 8,
    marginHorizontal: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  activeDot: {
    width: 18,
    backgroundColor: "#fff",
  },
  buttons: {
    position: "absolute",
    bottom: 60,
    left: 0,
    right: 0,
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
