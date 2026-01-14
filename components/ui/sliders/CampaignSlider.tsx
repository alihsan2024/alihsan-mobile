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

const { width } = Dimensions.get("window");
const HORIZONTAL_PADDING = 20;
const ITEM_GAP = 12;
const VISIBLE_ITEMS = 1.5; // show 1.5 cards on screen

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

export default function CampaignSlider({ data, onPress }: Props) {
  return (
    <FlatList
      data={data}
      horizontal
      style={{ marginBottom: 100 }}
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item, index }) => (
        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.card,
            index !== data.length - 1 && { marginRight: ITEM_GAP },
          ]}
          onPress={() => onPress?.(item)}
        >
          <View style={styles.imageWrapper}>
            <ExpoImage
              source={item.image}
              style={styles.image}
              contentFit="cover"
            />
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>
            
            {/* Progress Bar with Amount and Goal */}
            {(() => {
              const raised = parseFloat(item.amountRaised.replace(/[^0-9.]/g, ''));
              const goalValue = parseFloat(item.goal.replace(/[^0-9.]/g, ''));
              const progress = goalValue > 0 ? Math.min((raised / goalValue) * 100, 100) : 0;
              
              return (
                <View style={styles.progressContainer}>
                  <View style={styles.amountRow}>
                    <Text style={styles.amountRaised}>{item.amountRaised}</Text>
                    <Text style={styles.amountGoal}>{item.goal}</Text>
                  </View>
                  <View style={styles.progressBarBackground}>
                    <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                  </View>
                </View>
              );
            })()}

            <Text style={styles.donors}>
              {item.donors} donors • {item.status}
            </Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    width: ITEM_WIDTH,
    borderRadius: 12,
    backgroundColor: "#fff",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  imageWrapper: {
    width: "100%",
    height: 120,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  infoContainer: {
    padding: 10,
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    color: "#010D26",
    marginBottom: 8,
    lineHeight: 17,
  },
  progressContainer: {
    marginBottom: 6,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  progressBarBackground: {
    width: "100%",
    height: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#FFD602",
    borderRadius: 6,
  },
  donors: {
    fontSize: 10,
    fontWeight: "500",
    color: "#6B7280",
  },
  amountRaised: {
    fontSize: 15,
    fontWeight: "700",
    color: "#010D26",
  },
  amountGoal: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
});
