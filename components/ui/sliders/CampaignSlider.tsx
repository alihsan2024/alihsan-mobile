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
            <Text style={styles.donors}>
              {item.donors} donors • {item.status}
            </Text>
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.amount}>
              {item.amountRaised} of {item.goal} goal
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
    backgroundColor: "#F2F6FF",
    overflow: "hidden",
    padding: 10,
  },
  imageWrapper: {
    width: "100%",
    height: 180,
    overflow: "hidden",
    borderRadius: 12,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  infoContainer: {
    padding: 10,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  donors: {
    fontSize: 12,
    fontWeight: "500",
    color: "#4B5563",
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  amount: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
});
