import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Image as ExpoImage } from "expo-image";

type Props = {
  title: string;
  subtitle?: string;
  amount: string;
  image?: string;
};

export default function SummaryCard({ title, subtitle, amount, image }: Props) {
  return (
    <View style={styles.card}>
      {/* Image */}
      {image && (
        <ExpoImage
          source={{ uri: image }}
          style={styles.image}
          contentFit="cover"
        />
      )}

      {/* Text */}
      <View style={styles.left}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        )}
      </View>

      {/* Amount */}
      <Text style={styles.amount}>{amount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  image: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
    marginRight: 12,
  },

  left: {
    flex: 1,
    marginRight: 12,
  },

  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },

  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },

  amount: {
    fontSize: 15,
    fontWeight: "700",
    color: "#264B8B",
  },
});
