import React from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const formatPrice = (price: number): string => {
  return !isNaN(price)
    ? price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "0.00";
};

/** Matches cart basket item recurring labels (AU Next.js style). */
const getRecurringLabel = (periodDays?: number): string => {
  if (periodDays == null) return "";
  switch (parseInt(periodDays.toString())) {
    case 7:
      return "Weekly";
    case 30:
      return "Monthly";
    case 90:
      return "Quarterly";
    case 365:
      return "Yearly";
    case 1:
      return "Daily";
    case 9:
      return "Every Friday";
    case 10:
      return "Last 10 Ramadan";
    case 100:
      return "Ramadan Daily";
    case 101:
      return "Ramadan Last 10";
    case 102:
      return "Ramadan Odd Nights";
    case 103:
      return "Ramadan Even Nights";
    case 104:
      return "27th Night";
    default:
      return "";
  }
};

/** Display text for "per" line under amount: per month, Friday weekly, per week, etc. */
const getRecurringPerLine = (periodDays?: number): string => {
  if (periodDays == null) return "";
  switch (parseInt(periodDays.toString())) {
    case 7:
      return "per week";
    case 30:
      return "per month";
    case 90:
      return "per quarter";
    case 365:
      return "per year";
    case 1:
      return "per day";
    case 9:
      return "Friday weekly";
    case 10:
      return "Last 10 Ramadan";
    case 100:
      return "Ramadan daily";
    case 101:
      return "Ramadan Last 10";
    case 102:
      return "Ramadan odd nights";
    case 103:
      return "Ramadan even nights";
    case 104:
      return "27th night";
    default:
      return "";
  }
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

      {/* Items Section - same design/layout as basket cart */}
      <View style={styles.itemsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Donation Items</Text>
          <Text style={styles.itemCount}>{summary.items.length} {summary.items.length === 1 ? "item" : "items"}</Text>
        </View>
        <View style={styles.itemsContainer}>
          {summary.items.map((item: any, index: number) => {
            const imageUri =
              item.coverImage ||
              item.Campaign?.coverImage ||
              item.Orphan?.coverImage ||
              "https://via.placeholder.com/64";
            const title =
              item.name || item.Campaign?.name || item.Orphan?.name || "Campaign";
            const quantity = parseInt(item.quantity?.toString() || "1");
            const amount = parseFloat(item.amount?.toString() || "0");
            const checkoutType =
              item.checkoutType || item.Campaign?.checkoutType;
            const computedTotal =
              checkoutType === "ADEEQAH_GENERAL_SACRIFICE"
                ? parseFloat(
                    item.total?.toString() ??
                      item.amount?.toString() ??
                      "0"
                  )
                : item.total !== undefined && item.total !== null
                  ? parseFloat(item.total?.toString() || "0")
                  : amount * quantity;
            const amountLabel = `$${formatPrice(computedTotal)}`;
            const isOrphan = !!item.orphanId;
            const recurringLabel = getRecurringLabel(item.periodDays);
            const perLine = getRecurringPerLine(item.periodDays);
            const hasStrip = item.isRecurring || isOrphan;

            return (
              <View
                key={item.id || index}
                style={[
                  styles.itemCard,
                  isOrphan && styles.itemCardOrphan,
                  item.isRecurring && !isOrphan && styles.itemCardRecurring,
                ]}
              >
                {item.isRecurring && !isOrphan && (
                  <View style={styles.itemStrip}>
                    <View style={styles.itemStripRow}>
                      <View style={styles.itemStripLeft}>
                        <Ionicons name="repeat" size={14} color="#fff" />
                        <Text style={styles.itemStripLabel}>RECURRING</Text>
                      </View>
                      <View style={styles.itemStripPill}>
                        <Text style={styles.itemStripPillText}>
                          {recurringLabel}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
                {isOrphan && (
                  <View style={styles.itemStrip}>
                    <View style={styles.itemStripRow}>
                      <View style={styles.itemStripLeft}>
                        <Ionicons name="person" size={14} color="#fff" />
                        <Text style={styles.itemStripLabel}>
                          ORPHAN SPONSORSHIP
                        </Text>
                      </View>
                      {recurringLabel ? (
                        <View style={styles.itemStripPill}>
                          <Text style={styles.itemStripPillText}>
                            {recurringLabel}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                )}

                <View
                  style={[
                    styles.itemBody,
                    hasStrip && styles.itemBodyTinted,
                  ]}
                >
                  <View
                    style={[
                      styles.itemImageWrap,
                      hasStrip && styles.itemImageWrapRing,
                    ]}
                  >
                    <Image
                      source={{ uri: imageUri }}
                      style={styles.itemImage}
                    />
                    {hasStrip && (
                      <LinearGradient
                        colors={["transparent", "rgba(33,97,205,0.1)"]}
                        style={StyleSheet.absoluteFillObject}
                      />
                    )}
                  </View>

                  <View style={styles.itemContent}>
                    <Text
                      style={[
                        styles.itemTitle,
                        hasStrip && styles.itemTitlePrimary,
                      ]}
                      numberOfLines={2}
                    >
                      {title}
                    </Text>
                    {isOrphan && (
                      <View style={styles.itemMetaRow}>
                        <View style={styles.itemOrphanBadge}>
                          <Text style={styles.itemOrphanBadgeText}>
                            ID: {item.orphanId || "N/A"}
                          </Text>
                        </View>
                        {item.age != null && (
                          <>
                            <Text style={styles.itemMetaDot}>•</Text>
                            <Text style={styles.itemMetaSecondary}>
                              {item.age}
                            </Text>
                          </>
                        )}
                      </View>
                    )}
                    {!isOrphan && item.donationItem && (
                      <View style={styles.itemMetaRow}>
                        <View style={styles.itemDonationChip}>
                          <Text style={styles.itemDonationChipText}>
                            {item.donationItem}
                          </Text>
                          {quantity > 1 && (
                            <Text style={styles.itemDonationChipText}>
                              {" "}• {quantity}x
                            </Text>
                          )}
                        </View>
                      </View>
                    )}
                  </View>

                  <View style={styles.itemRight}>
                    <Text
                      style={[
                        styles.itemAmount,
                        hasStrip && styles.itemAmountPrimary,
                      ]}
                    >
                      {amountLabel}
                    </Text>
                    {(item.isRecurring || isOrphan) && perLine ? (
                      <Text style={styles.itemPerLabel}>{perLine}</Text>
                    ) : null}
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
    gap: 10,
  },
  itemCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  itemCardOrphan: {
    borderColor: "#93C5FD",
  },
  itemCardRecurring: {
    borderColor: "#93C5FD",
  },
  itemStrip: {
    backgroundColor: "#2161CD",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(33,97,205,0.5)",
  },
  itemStripRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemStripLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  itemStripLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.5,
    fontFamily: "AlbertSans_800ExtraBold",
  },
  itemStripPill: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  itemStripPillText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    fontFamily: "AlbertSans_700Bold",
  },
  itemBody: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 10,
    gap: 10,
  },
  itemBodyTinted: {
    backgroundColor: "transparent",
  },
  itemImageWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
  },
  itemImageWrapRing: {
    borderWidth: 2,
    borderColor: "rgba(33,97,205,0.4)",
  },
  itemImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F3F4F6",
  },
  itemContent: {
    flex: 1,
    minWidth: 0,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
    fontFamily: "AlbertSans_700Bold",
  },
  itemTitlePrimary: {
    color: "#0F172A",
  },
  itemMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 4,
  },
  itemOrphanBadge: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  itemOrphanBadgeText: {
    fontSize: 12,
    color: "#1D4ED8",
    fontFamily: "AlbertSans_500Medium",
  },
  itemMetaDot: {
    fontSize: 12,
    color: "#93C5FD",
    marginHorizontal: 2,
  },
  itemMetaSecondary: {
    fontSize: 12,
    color: "#1D4ED8",
    fontFamily: "AlbertSans_500Medium",
  },
  itemDonationChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 20,
  },
  itemDonationChipText: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "AlbertSans_500Medium",
  },
  itemRight: {
    alignItems: "flex-end",
    flexShrink: 0,
  },
  itemAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2161CD",
    fontFamily: "AlbertSans_700Bold",
  },
  itemAmountPrimary: {
    color: "#1D4ED8",
  },
  itemPerLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#3B82F6",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 2,
    fontFamily: "AlbertSans_600SemiBold",
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
