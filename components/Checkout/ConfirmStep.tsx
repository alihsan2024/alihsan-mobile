import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Image as ExpoImage } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

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
        <View style={styles.headerIcon}>
          <Ionicons name="checkmark-circle" size={24} color="#264B8B" />
        </View>
        <Text style={styles.title}>Review Your Order</Text>
        <Text style={styles.subtitle}>
          Please review your donation items before completing payment
        </Text>
      </View>

      {/* Items Section */}
      <View style={styles.itemsSection}>
        <Text style={styles.sectionLabel}>Donation Items</Text>
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

            const computedTotal =
              item.total !== undefined && item.total !== null
                ? parseFloat(item.total?.toString() || "0")
                : parseFloat(item.amount?.toString() || "0") *
                  parseFloat(item.quantity?.toString() || "1");

            return (
              <View key={item.id || index} style={styles.itemCard}>
                <ExpoImage
                  source={{ uri: imageUri }}
                  style={styles.itemImage}
                  contentFit="cover"
                />
                <View style={styles.itemContent}>
                  <View style={styles.itemTextContainer}>
                    <Text style={styles.itemTitle} numberOfLines={1}>
                      {title}
                    </Text>
                    {subtitle && (
                      <Text style={styles.itemSubtitle} numberOfLines={1}>
                        {subtitle}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.itemPrice}>
                    ${formatPrice(computedTotal)}
                  </Text>
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
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>
              ${formatPrice(summary.subtotal)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Admin Fee</Text>
            <Text style={styles.summaryValue}>
              ${formatPrice(summary.adminFee)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              ${formatPrice(summary.total)}
            </Text>
          </View>
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="shield-checkmark" size={20} color="#22C55E" />
          <Text style={styles.infoText}>
            100% of your donation goes directly to the field
          </Text>
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
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
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
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#010D26",
    marginBottom: 12,
    fontFamily: "AlbertSans_700Bold",
  },
  itemsContainer: {
    gap: 8,
  },
  itemCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    alignItems: "center",
  },
  itemImage: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: "#E5E7EB",
    marginRight: 10,
  },
  itemContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
    fontFamily: "AlbertSans_600SemiBold",
  },
  itemSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "AlbertSans_400Regular",
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: "#264B8B",
    fontFamily: "AlbertSans_700Bold",
  },
  summarySection: {
    marginTop: 8,
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    color: "#6B7280",
    fontFamily: "AlbertSans_500Medium",
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    fontFamily: "AlbertSans_600SemiBold",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: "700",
    color: "#010D26",
    fontFamily: "AlbertSans_700Bold",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#264B8B",
    fontFamily: "AlbertSans_800ExtraBold",
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#166534",
    fontFamily: "AlbertSans_500Medium",
    lineHeight: 18,
  },
});
