import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Image as ExpoImage } from "expo-image";

type BasketItemRowProps = {
  item: any;
  index?: number;

  // basket-only (optional for summary)
  quantity?: number;
  price?: number;
  itemTotal?: number;
  isCommonORZaqat?: boolean;
  onRemove?: (
    campaignId: number,
    orphanId: number,
    donationItem?: string,
    name?: string
  ) => void;

  // shared
  formatPrice: (value: number) => string;
  getRecurringLabel?: (days: number) => string;

  variant?: "basket" | "summary";
};

export default function BasketItemRow({
  item,
  index,
  quantity,
  price,
  itemTotal,
  isCommonORZaqat,
  formatPrice,
  getRecurringLabel,
  onRemove,
  variant = "basket",
}: BasketItemRowProps) {
  const isSummary = variant === "summary";

  const imageUri =
    item.coverImage ||
    item.Campaign?.coverImage ||
    item.Orphan?.coverImage ||
    "https://via.placeholder.com/64";

  const title =
    item.name || item.Campaign?.name || item.Orphan?.name || "Campaign";

  const subtitle =
    item.donationItem || item.Campaign?.subtitle || item.Orphan?.subtitle;

  const computedTotal =
    itemTotal ??
    (item.total !== undefined && item.total !== null
      ? parseFloat(item.total?.toString() || "0")
      : parseFloat(item.amount?.toString() || "0"));

  return (
    <View key={item.id || index}>
      <View style={styles.itemRow}>
        <ExpoImage
          source={{ uri: imageUri }}
          style={styles.itemImage}
          contentFit="cover"
        />

        <View style={styles.itemContent}>
          <Text style={styles.itemTitle} numberOfLines={2}>
            {title}
          </Text>

          {/* Summary subtitle */}
          {isSummary && subtitle && (
            <Text style={styles.itemSubtitle} numberOfLines={2}>
              {subtitle}
            </Text>
          )}

          {/* Basket-only recurring */}
          {!isSummary && item.isRecurring && getRecurringLabel && (
            <View style={[styles.recurringBadge, { marginTop: 4 }]}>
              <Text style={styles.recurringIcon}>🔄</Text>
              <Text style={styles.recurringText}>
                {getRecurringLabel(item.periodDays)} donation
              </Text>
            </View>
          )}

          {/* Basket-only donation item */}
          {!isSummary && item.donationItem && (
            <Text style={[styles.donationItem, { marginTop: 4 }]}>
              {item.donationItem}
            </Text>
          )}

          <View style={styles.itemPriceRow}>
            <Text style={styles.itemPrice}>${formatPrice(computedTotal)}</Text>

            {!isSummary &&
              isCommonORZaqat &&
              quantity &&
              quantity > 1 &&
              price !== undefined && (
                <Text style={styles.itemUnitPrice}>
                  (${formatPrice(price)} each)
                </Text>
              )}
          </View>
        </View>

        {/* Basket-only remove button */}
        {!isSummary && onRemove && (
          <TouchableOpacity
            onPress={() =>
              onRemove(item.campaignId, item.orphanId, item.donationItem, title)
            }
          >
            <View
              style={{
                backgroundColor: "#F2F6FF",
                padding: 10,
                borderRadius: 4,
              }}
            >
              <ExpoImage
                source={require("../../../assets/trash.png")}
                style={{ width: 16, height: 16, borderRadius: 4 }}
                contentFit="contain"
              />
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

/* 🔒 STYLES — UNCHANGED */

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
  },

  donationItem: {
    fontSize: 12,
    color: "#666",
  },

  itemRow: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    borderColor: "#010D261A",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
    marginHorizontal: 16,
  },

  itemImage: {
    width: 64,
    height: 68,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
  },

  itemContent: {
    flex: 1,
  },

  itemTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },

  itemSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },

  itemPrice: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "600",
  },

  itemPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  itemUnitPrice: {
    fontSize: 12,
    color: "#999",
    marginLeft: 8,
  },

  recurringBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },

  recurringIcon: {
    fontSize: 10,
    marginRight: 4,
  },

  recurringText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#264B8B",
  },
});
