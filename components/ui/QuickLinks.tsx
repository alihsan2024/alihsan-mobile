import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const { width: screenWidth } = Dimensions.get("window");

const links = [
  {
    id: 1,
    title: "Found for\nEducation",
    link: "/campaign/education-support",
    colors: ["#B9C7FF", "#4066FF"],
  },
  {
    id: 2,
    title: "Emergency\nAppeal",
    link: "/campaign/emergency-appeal",
    colors: ["#BDF6FF", "#02B9E2"],
  },
  {
    id: 3,
    title: "Sponsor an\nOrphan",
    link: "/orphans-list",
    colors: ["#FFEEF5", "#FD76B1"],
  },
  {
    id: 4,
    title: "Zakat\nal-Maal",
    link: "/campaign/zakat-al-maal",
    colors: ["#CAA9FB", "#8546E2"],
  },
];

export default function QuickLinks() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Quick Links</Text>

      <View style={styles.grid}>
        {links.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() => router.push(item.link)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={item.colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradient}
            >
              <Text style={styles.cardTitle}>{item.title}</Text>
              <TouchableOpacity
                style={styles.donateButton}
                onPress={(e) => {
                  e.stopPropagation();
                  router.push(item.link);
                }}
              >
                <Text style={styles.donateButtonText}>Donate Now</Text>
                <Ionicons name="arrow-forward" size={16} color="#010D26" />
              </TouchableOpacity>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 20,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 28,
    fontWeight: "800",
    color: "#010D26",
    marginBottom: 24,
    fontFamily: "AlbertSans_800ExtraBold",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 0,
  },
  card: {
    width: (screenWidth - 52) / 2,
    minHeight: 150,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  gradient: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    lineHeight: 28,
    fontFamily: "AlbertSans_800ExtraBold",
  },
  donateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFD602",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
    alignSelf: "flex-start",
    gap: 6,
  },
  donateButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#010D26",
    fontFamily: "AlbertSans_700Bold",
  },
});
