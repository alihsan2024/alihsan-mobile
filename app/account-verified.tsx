import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import HeroBackground from "@/components/ui/GradientImage";
import Button from "@/components/ui/Button";

export default function AccountVerifiedScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* ===== TOP IMAGE ===== */}
      <HeroBackground
        source={require("@/assets/header-image.png")}
        containerStyle={{ height: 220 }}
        gradientLocations={[0.6, 1]}
      />

      {/* ===== CONTENT ===== */}
      <View style={styles.content}>
        <Text style={styles.title}>Account Verified!</Text>
        <Text style={styles.subtitle}>
          Your journey with Al-Ihsan begins now. Redirecting you to your
          impact...
        </Text>
      </View>

      {/* ===== CTA ===== */}
      <View style={styles.footer}>
        <Button
          label="Done"
          variant="secondary"
          onPress={() => router.replace("/")}
        />
      </View>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  title: {
    fontSize: 26,
    fontWeight: "600",
    color: "#010D26",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    color: "#010D26",
    opacity: 0.6,
    lineHeight: 20,
  },

  footer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    marginTop: "auto",
  },
});
