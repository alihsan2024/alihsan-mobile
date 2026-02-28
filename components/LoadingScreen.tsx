import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

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
          {/* Loading Indicator */}
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2161CD" />
          </View>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>
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
  loadingContainer: {
    marginBottom: 24,
  },
  message: {
    fontSize: 16,
    color: "#010D26",
    fontWeight: "600",
    fontFamily: "AlbertSans_600SemiBold",
    textAlign: "center",
    letterSpacing: 0.2,
  },
});

