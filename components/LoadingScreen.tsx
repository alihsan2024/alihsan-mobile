import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Image as ExpoImage } from "expo-image";

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = "Loading..." }: LoadingScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>AI</Text>
          </View>
        </View>
        <ActivityIndicator size="large" color="#264B8B" style={styles.spinner} />
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#264B8B",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#264B8B",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
  },
  spinner: {
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
});

