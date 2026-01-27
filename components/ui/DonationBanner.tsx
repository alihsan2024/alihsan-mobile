import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface DonationBannerProps {
  appealText?: string;
  heading?: string;
  description?: string;
}

export default function DonationBanner({
  appealText = "Appeal 2025",
  heading = "Bring Ease to Their Hardship",
  description = "Support our humanitarian mission to provide relief to those facing hardship worldwide. Your donation can bring comfort, hope, and essential aid to communities in crisis.",
}: DonationBannerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.appealText}>{appealText}</Text>
      <Text style={styles.heading}>{heading}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#EEF4FF",
    paddingTop: 32,
    paddingBottom: 40,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  appealText: {
    fontSize: 20,
    fontFamily: "GuthenBloots",
    color: "#244180",
    marginBottom: 8,
  },
  heading: {
    fontSize: 32,
    fontWeight: "700",
    color: "#010D26",
    marginBottom: 12,
    lineHeight: 38,
    fontFamily: "AlbertSans_700Bold",
  },
  description: {
    fontSize: 16,
    color: "#010D26B2",
    lineHeight: 24,
    maxWidth: "100%",
    fontFamily: "AlbertSans_400Regular",
  },
});
