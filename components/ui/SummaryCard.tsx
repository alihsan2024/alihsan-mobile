import React from "react";
import { View, Text, StyleSheet } from "react-native";

type Props = {
  title: string;
  subtitle?: string;
  amount: string;
};

export default function SummaryCard({ title, subtitle, amount }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      <Text style={styles.amount}>{amount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 12,
    marginBottom: 12,
  },
  summaryTitle: { fontWeight: "600" },
  summarySub: { color: "#777", fontSize: 12 },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
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
