import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import Button from "../Button";

const { width } = Dimensions.get("window");

interface IntroSlideProps {
  onFinish: () => void;
}

const slide = {
  title: "Kindness at Your Fingertips.",
  description:
    "Support urgent global causes and fulfill your Zakat in seconds, not minutes.",
  background: require("../../../assets/intro-1.png"),
};

export default function IntroSlide({ onFinish }: IntroSlideProps) {
  const router = useRouter();

  const handleSignUp = () => {
    router.push("/signup");
  };

  const handleLogin = () => {
    router.push("/login");
  };

  const handleContinueAsGuest = () => {
    onFinish();
  };

  return (
    <View style={styles.container}>
      <View style={styles.slide}>
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

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Button
              label="Sign Up"
              variant="secondary"
              onPress={handleSignUp}
              style={styles.button}
              textStyle={styles.signUpButtonText}
            />
            <Button
              label="Login"
              variant="primary"
              onPress={handleLogin}
              style={[
                styles.button,
                styles.loginButton,
                Platform.OS === "web"
                  ? ({ backdropFilter: "blur(10px)" } as any)
                  : null,
              ]}
              textStyle={styles.loginButtonText}
            />
            <TouchableOpacity
              onPress={handleContinueAsGuest}
              style={styles.guestButton}
            >
              <Text style={styles.guestText}>Continue as guest</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontFamily: "AlbertSans_700Bold",
    color: "#fff",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    fontFamily: "AlbertSans_400Regular",
    color: "#fff",
    opacity: 0.9,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 32,
  },
  actionButtons: {
    width: "100%",
    flexDirection: "column",
    alignItems: "stretch",
  },
  button: {
    width: "100%",
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.7)",
  },
  loginButtonText: {
    fontFamily: "AlbertSans_600SemiBold",
    color: "#2161CD",
  },
  signUpButtonText: {
    fontFamily: "AlbertSans_600SemiBold",
    color: "#010D26",
  },
  guestButton: {
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  guestText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "AlbertSans_500Medium",
    opacity: 0.8,
  },
});
