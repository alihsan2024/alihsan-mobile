import React from "react";
import {
  View,
  Text,
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
    <View style={styles.container}>
      {data.map((item, index) => (
        <TouchableOpacity
          key={item.id.toString()}
          activeOpacity={0.85}
          style={styles.card}
          onPress={() => onPress?.(item)}
        >
          <ExpoImage
            source={item.image}
            style={styles.image}
            contentFit="cover"
            contentPosition="center"
          />
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 0,
  },
  card: {
    width: ITEM_WIDTH,
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  image: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH, // square
    borderRadius: 12,
    marginBottom: 6,
  },
  title: {
    fontSize: 12,
    fontWeight: "600",
    color: "#010D26",
    textAlign: "center",
  },
});
