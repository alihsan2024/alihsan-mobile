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
const VISIBLE_ITEMS = 4; // exactly four items visible

export type SliderItem = {
  id: string | number;
  image: any;
  title: string;
};

type Props = {
  data: SliderItem[];
  onPress?: (item: SliderItem) => void;
};

const ITEM_WIDTH =
  (width - HORIZONTAL_PADDING * 2 - ITEM_GAP * (VISIBLE_ITEMS - 1)) /
  VISIBLE_ITEMS;

export default function ImageSlider({ data, onPress }: Props) {
  return (
    <FlatList
      data={data}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={{ paddingHorizontal: 0 }}
      renderItem={({ item, index }) => (
        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.card,
            index === 0 && { marginLeft: 5 },
            index === data.length - 1 && { marginRight: HORIZONTAL_PADDING },
          ]}
          onPress={() => onPress?.(item)}
        >
          <ExpoImage
            source={item.image}
            style={styles.image}
            contentFit="cover"
          />
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    width: ITEM_WIDTH,
    marginRight: ITEM_GAP,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  image: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH, // square
    borderRadius: 12,
    marginBottom: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#010D26",
    textAlign: "center",
  },
});
