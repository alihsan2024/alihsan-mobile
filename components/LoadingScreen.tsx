import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({
  message = "Loading...",
}: LoadingScreenProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#EEF4FF", "#FFFFFF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Logo Icon Container */}
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={["#264B8B", "#1E3A8A"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoCircle}
            >
              <Ionicons name="heart" size={32} color="#FFD602" />
            </LinearGradient>
            {/* Pulsing Ring Effect */}
            <View style={styles.pulseRing} />
          </View>

          {/* Loading Indicator */}
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#264B8B" />
          </View>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>Please wait a moment</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  logoContainer: {
    marginBottom: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#264B8B",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    zIndex: 2,
  },
  pulseRing: {
    position: "absolute",
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: "#264B8B",
    opacity: 0.3,
    zIndex: 1,
  },
  loadingContainer: {
    marginBottom: 20,
  },
  message: {
    fontSize: 18,
    color: "#010D26",
    fontWeight: "700",
    fontFamily: "AlbertSans_700Bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: "AlbertSans_400Regular",
    textAlign: "center",
  },
});

