import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const HORIZONTAL_PADDING = 20;
const ITEM_GAP = 12;
const VISIBLE_ITEMS = 1.5;
const CARD_HEIGHT = 220;

export type CampaignItem = {
  id: string | number;
  slug: string;
  image: any;
  title: string;
  donors: number;
  status: string;
  amountRaised: string;
  goal: string;
};

type Props = {
  data: CampaignItem[];
  onPress?: (item: CampaignItem) => void;
};

const ITEM_WIDTH =
  (width - HORIZONTAL_PADDING * 2 - ITEM_GAP * (VISIBLE_ITEMS - 1)) /
  VISIBLE_ITEMS;

function parseAmount(str: string): number {
  return parseFloat(String(str).replace(/[^0-9.]/g, "")) || 0;
}

export default function CampaignSlider({ data, onPress }: Props) {
  return (
    <FlatList
      data={data}
      horizontal
      style={{ marginBottom: 0 }}
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item, index }) => {
        const raised = parseAmount(item.amountRaised);
        const goalValue = parseAmount(item.goal);
        const effectiveGoal = goalValue > 0 ? goalValue : raised > 0 ? raised : 1;
        const progress = effectiveGoal > 0 ? Math.min((raised / effectiveGoal) * 100, 100) : 0;

        return (
          <TouchableOpacity
            activeOpacity={0.9}
            style={[
              styles.card,
              index !== data.length - 1 && { marginRight: ITEM_GAP },
            ]}
            onPress={() => onPress?.(item)}
          >
            <ExpoImage
              source={item.image}
              style={styles.image}
              contentFit="cover"
            />
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.4)", "rgba(0,0,0,0.85)"]}
              locations={[0.3, 0.6, 1]}
              style={styles.gradient}
            >
              <View style={styles.overlayContent}>
                <Text style={styles.title} numberOfLines={2}>
                  {item.title}
                </Text>
                <View style={styles.progressContainer}>
                  <View style={styles.amountRow}>
                    <Text style={styles.amountRaised}>{item.amountRaised}</Text>
                    {goalValue > 0 ? (
                      <Text style={styles.amountGoal}>{item.goal}</Text>
                    ) : null}
                  </View>
                  <View style={styles.progressBarBackground}>
                    <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                  </View>
                </View>
                <View style={styles.footer}>
                  <Text style={styles.donors}>
                    {item.donors} donors{item.status ? ` • ${item.status}` : ""}
                  </Text>
                  <View style={styles.ctaPill}>
                    <Text style={styles.ctaText}>Donate</Text>
                    <Ionicons name="arrow-forward" size={14} color="#010D26" />
                  </View>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    width: ITEM_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
  },
  overlayContent: {
    padding: 14,
    paddingTop: 24,
  },
  title: {
    fontSize: 18,
    fontFamily: "Guthen Bloots",
    color: "#FFD602",
    lineHeight: 22,
    letterSpacing: 1,
    marginBottom: 10,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  progressContainer: {
    marginBottom: 10,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  amountRaised: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  amountGoal: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.85)",
  },
  progressBarBackground: {
    width: "100%",
    height: 5,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#FFD602",
    borderRadius: 5,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  donors: {
    fontSize: 11,
    fontWeight: "500",
    color: "rgba(255,255,255,0.9)",
    flex: 1,
  },
  ctaPill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: "#FFD602",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  ctaText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#010D26",
  },
});
