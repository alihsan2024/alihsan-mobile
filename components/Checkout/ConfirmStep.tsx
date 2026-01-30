import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Image as ExpoImage } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { getRecurringLabel } from "@/utils/helper";

const formatPrice = (price: number): string => {
  return !isNaN(price)
    ? price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "0.00";
};

type Props = {
  summary: {
    items: any[];
    subtotal: number;
    adminFee: number;
    total: number;
  };
};

const ConfirmStep = ({ summary }: Props) => {
  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <LinearGradient
          colors={["#EEF4FF", "#FFFFFF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerIconContainer}
        >
          <View style={styles.headerIcon}>
            <Ionicons name="checkmark-circle" size={28} color="#2161CD" />
          </View>
        </LinearGradient>
        <Text style={styles.title}>Review Your Order</Text>
        <Text style={styles.subtitle}>
          Please review your donation items before completing payment
        </Text>
      </View>

      {/* Items Section */}
      <View style={styles.itemsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Donation Items</Text>
          <Text style={styles.itemCount}>{summary.items.length} {summary.items.length === 1 ? 'item' : 'items'}</Text>
        </View>
        <View style={styles.itemsContainer}>
          {summary.items.map((item, index) => {
            const imageUri =
              item.coverImage ||
              item.Campaign?.coverImage ||
              item.Orphan?.coverImage ||
              "https://via.placeholder.com/64";

            const title =
              item.name || item.Campaign?.name || item.Orphan?.name || "Campaign";

            const subtitle =
              item.donationItem ||
              item.Campaign?.subtitle ||
              item.Orphan?.subtitle;

            const quantity = parseInt(item.quantity?.toString() || "1");
            const amount = parseFloat(item.amount?.toString() || "0");
            const computedTotal =
              item.total !== undefined && item.total !== null
                ? parseFloat(item.total?.toString() || "0")
                : amount * quantity;

            const isRecurring = item.isRecurring || false;
            const periodDays = item.periodDays;

            return (
              <View key={item.id || index} style={styles.itemCard}>
                {/* Image with gradient overlay */}
                <View style={styles.imageContainer}>
                  <ExpoImage
                    source={{ uri: imageUri }}
                    style={styles.itemImage}
                    contentFit="cover"
                  />
                  {isRecurring && (
                    <View style={styles.recurringBadgeOverlay}>
                      <Ionicons name="repeat" size={12} color="#FFFFFF" />
                    </View>
                  )}
                </View>

                {/* Content */}
                <View style={styles.itemContent}>
                  <View style={styles.itemTextContainer}>
                    <Text style={styles.itemTitle} numberOfLines={2}>
                      {title}
                    </Text>
                    {subtitle && (
                      <Text style={styles.itemSubtitle} numberOfLines={1}>
                        {subtitle}
                      </Text>
                    )}
                    
                    {/* Recurring badge and quantity */}
                    <View style={styles.itemMetaRow}>
                      {isRecurring && periodDays && (
                        <View style={styles.recurringBadge}>
                          <Ionicons name="repeat" size={10} color="#2161CD" />
                          <Text style={styles.recurringText}>
                            {getRecurringLabel(periodDays)}
                          </Text>
                        </View>
                      )}
                      {quantity > 1 && (
                        <View style={styles.quantityBadge}>
                          <Text style={styles.quantityText}>
                            Qty: {quantity}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Price */}
                  <View style={styles.priceContainer}>
                    <Text style={styles.itemPrice}>
                      ${formatPrice(computedTotal)}
                    </Text>
                    {quantity > 1 && (
                      <Text style={styles.unitPrice}>
                        ${formatPrice(amount)} each
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Summary Section */}
      <View style={styles.summarySection}>
        <Text style={styles.sectionLabel}>Order Summary</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryLabelContainer}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summarySubtext}>
                {summary.items.length} {summary.items.length === 1 ? 'donation' : 'donations'}
              </Text>
            </View>
            <Text style={styles.summaryValue}>
              ${formatPrice(summary.subtotal)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <View style={styles.summaryLabelContainer}>
              <Text style={styles.summaryLabel}>Processing Fee</Text>
              <Text style={styles.summarySubtext}>3%</Text>
            </View>
            <Text style={styles.summaryValue}>
              ${formatPrice(summary.adminFee)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              ${formatPrice(summary.total)}
            </Text>
          </View>
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <LinearGradient
            colors={["#F0FDF4", "#FFFFFF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.infoBannerGradient}
          >
            <View style={styles.infoIconContainer}>
              <Ionicons name="shield-checkmark" size={22} color="#22C55E" />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Secure & Transparent</Text>
              <Text style={styles.infoText}>
                100% of your donation goes directly to the field
              </Text>
            </View>
          </LinearGradient>
        </View>
      </View>
    </View>
  );
};

export default ConfirmStep;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingBottom: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
    paddingHorizontal: 4,
  },
  headerIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#2161CD",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#010D26",
    marginBottom: 8,
    fontFamily: "AlbertSans_800ExtraBold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    fontFamily: "AlbertSans_400Regular",
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  itemsSection: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#010D26",
    fontFamily: "AlbertSans_700Bold",
    marginBottom: 12,
  },
  itemCount: {
    fontSize: 13,
    color: "#6B7280",
    fontFamily: "AlbertSans_500Medium",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  itemsContainer: {
    gap: 8,
  },
  itemCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: "#010D261A",
    alignItems: "center",
    gap: 10,
  },
  imageContainer: {
    position: "relative",
  },
  itemImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
  },
  recurringBadgeOverlay: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "#2161CD",
    borderRadius: 8,
    width: 14,
    height: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  itemContent: {
    flex: 1,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 1,
    fontFamily: "AlbertSans_600SemiBold",
  },
  itemSubtitle: {
    fontSize: 11,
    color: "#6B7280",
    fontFamily: "AlbertSans_400Regular",
    marginTop: 1,
    marginBottom: 2,
  },
  itemMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexWrap: "wrap",
    marginTop: 2,
  },
  recurringBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  recurringText: {
    fontSize: 10,
    fontWeight: "500",
    color: "#264B8B",
    fontFamily: "AlbertSans_500Medium",
  },
  quantityBadge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  quantityText: {
    fontSize: 10,
    fontWeight: "500",
    color: "#6B7280",
    fontFamily: "AlbertSans_500Medium",
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
    fontFamily: "AlbertSans_600SemiBold",
    marginTop: 2,
  },
  unitPrice: {
    fontSize: 10,
    color: "#9CA3AF",
    fontFamily: "AlbertSans_400Regular",
    marginTop: 1,
  },
  summarySection: {
    marginTop: 8,
    marginBottom: 8,
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: 12,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  totalRow: {
    marginTop: 4,
    marginBottom: 0,
  },
  summaryLabelContainer: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 15,
    color: "#374151",
    fontFamily: "AlbertSans_600SemiBold",
    marginBottom: 2,
  },
  summarySubtext: {
    fontSize: 12,
    color: "#9CA3AF",
    fontFamily: "AlbertSans_400Regular",
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    fontFamily: "AlbertSans_700Bold",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "800",
    color: "#010D26",
    fontFamily: "AlbertSans_800ExtraBold",
  },
  totalValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#2161CD",
    fontFamily: "AlbertSans_800ExtraBold",
  },
  infoBanner: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  infoBannerGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#166534",
    fontFamily: "AlbertSans_700Bold",
    marginBottom: 2,
  },
  infoText: {
    fontSize: 12,
    color: "#166534",
    fontFamily: "AlbertSans_500Medium",
    lineHeight: 16,
  },
});
