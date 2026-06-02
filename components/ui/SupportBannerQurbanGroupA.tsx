import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { Image as ExpoImage } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

export type SupportBannerQurbanGroupAProps = {
  title: string;
  description: string;
  price: number;
  postText: string;
  imageUri: string;
  quantity: number;
  onDecrement: () => void;
  onIncrement: () => void;
  onAddToCart: () => void;
  adding: boolean;
  onOpenFullQurban: () => void;
};

/** Row thumbnail: max width/height so title column stays readable on narrow phones. */
const ROW_THUMB_MAX_W = 132;
const ROW_THUMB_MAX_H = 120;

/**
 * Group A quick-add — image + title header row, details block underneath (AU QuickAdd parity).
 */
export default function SupportBannerQurbanGroupA({
  title,
  description,
  price,
  postText,
  imageUri,
  quantity,
  onDecrement,
  onIncrement,
  onAddToCart,
  adding,
  onOpenFullQurban,
}: SupportBannerQurbanGroupAProps) {
  const { width: windowWidth } = useWindowDimensions();
  /** Inside donation card: window minus gradient (16×2). Content area subtracts card horizontal padding (16×2). */
  const cardOuterW = Math.max(0, windowWidth - 32);
  const contentW = Math.max(0, cardOuterW - 32);
  const thumbW = Math.min(ROW_THUMB_MAX_W, Math.round(contentW * 0.42));
  const thumbH = Math.min(thumbW, ROW_THUMB_MAX_H);

  const lineTotal = (price * quantity).toFixed(2);

  return (
    <View style={styles.card}>
      {/* Row 1: thumbnail left, title + open link right */}
      <View style={styles.topRow}>
        <View style={[styles.imageFrame, { width: thumbW, height: thumbH }]}>
          <ExpoImage
            source={{ uri: imageUri }}
            style={styles.heroImage}
            contentFit="cover"
            contentPosition="top center"
            accessibilityLabel={title}
            transition={180}
          />
        </View>

        <View style={styles.titleColumn}>
          <View style={styles.titleHeaderRow}>
            <Text style={styles.title} numberOfLines={3}>
              {title}
            </Text>
            <TouchableOpacity
              onPress={onOpenFullQurban}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Open full Qurban programme"
            >
              <Ionicons name="open-outline" size={22} color="#244180" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Row 2+: description, price, cart */}
      <View style={styles.detailsBlock}>
        <Text style={styles.description}>{description}</Text>

        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Price</Text>
          <Text style={styles.priceValue}>${price}</Text>
          <Text style={styles.postText}>{postText}</Text>
        </View>

        <View style={styles.actionsRow}>
          <View style={styles.qtyWrap}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={onDecrement}
              disabled={adding || quantity <= 1}
              accessibilityRole="button"
              accessibilityLabel="Decrease quantity"
            >
              <Ionicons name="remove" size={18} color="#010D26" />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={onIncrement}
              disabled={adding}
              accessibilityRole="button"
              accessibilityLabel="Increase quantity"
            >
              <Ionicons name="add" size={18} color="#010D26" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.addBtn, adding && styles.addBtnDisabled]}
            onPress={onAddToCart}
            disabled={adding}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Add Qurban Group A to cart"
          >
            {adding ? (
              <ActivityIndicator size="small" color="#010D26" />
            ) : (
              <>
                <Ionicons name="cart-outline" size={18} color="#010D26" />
                <Text style={styles.addBtnText}>Add to Cart</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.totalLine}>Total: ${lineTotal}</Text>

        <TouchableOpacity onPress={onOpenFullQurban} activeOpacity={0.8}>
          <Text style={styles.linkLine}>All Qurban options & countries →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  imageFrame: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#E8ECF2",
    flexShrink: 0,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#E8ECF2",
  },
  titleColumn: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
    minHeight: 72,
  },
  titleHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#010D26",
    fontFamily: "AlbertSans_700Bold",
    lineHeight: 21,
  },
  detailsBlock: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 14,
  },
  description: {
    fontSize: 12,
    lineHeight: 18,
    color: "rgba(1, 13, 38, 0.72)",
    marginBottom: 12,
    fontFamily: "AlbertSans_400Regular",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 12,
    color: "rgba(1, 13, 38, 0.7)",
    fontFamily: "AlbertSans_600SemiBold",
  },
  priceValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#010D26",
    fontFamily: "AlbertSans_700Bold",
  },
  postText: {
    fontSize: 11,
    color: "rgba(1, 13, 38, 0.5)",
    fontFamily: "AlbertSans_500Medium",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  qtyWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(1, 13, 38, 0.2)",
    borderRadius: 10,
    overflow: "hidden",
    flexShrink: 0,
  },
  qtyBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAFAFA",
  },
  qtyText: {
    minWidth: 36,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "700",
    color: "#010D26",
    fontFamily: "AlbertSans_700Bold",
  },
  addBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#FFD602",
    borderRadius: 12,
    paddingVertical: 11,
    minHeight: 44,
  },
  addBtnDisabled: {
    opacity: 0.75,
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#010D26",
    fontFamily: "AlbertSans_700Bold",
  },
  totalLine: {
    fontSize: 13,
    fontWeight: "600",
    color: "#3F3F3F",
    textAlign: "right",
    marginBottom: 8,
    fontFamily: "AlbertSans_600SemiBold",
  },
  linkLine: {
    fontSize: 12,
    fontWeight: "600",
    color: "#244180",
    textAlign: "center",
    fontFamily: "AlbertSans_600SemiBold",
  },
});
