import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  LayoutAnimation,
  UIManager,
  Platform,
  TextInput,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { getPaymentsList } from "@/store/reduxSlice/paymentDetailsSlice";
import { SafeAreaView as SafeAreaViewContext } from "react-native-safe-area-context";

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const categories = [
  { label: "All", icon: "globe-outline", value: "all" },
  { label: "Zakat", icon: "moon-outline", value: "zakat" },
  { label: "Sadaqah", icon: "heart-outline", value: "sadaqah" },
  { label: "Orphans", icon: "people-outline", value: "sponsorship" },
];

// --- Types

type Payment = {
  id: number;
  donationId: number;
  total: string;
  updatedAt: string;
  Campaign?: { name?: string };
  orphan_id?: number;
  Donation?: { orderId?: number };
  orderId?: number;
};

type GroupedOrder = {
  orderId: number;
  totalAmount: number;
  payments: Payment[];
  paymentDate: string;
  itemCount: number;
};

const OneTimeUserDonationsScreen = () => {
  const dispatch = useAppDispatch();
  const { rows, loading } = useSelector(
    (state: any) => state.paymentDetails.paymentList
  );
  const [groupedOrders, setGroupedOrders] = useState<GroupedOrder[]>([]);
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    const category = selectedCategory.toLowerCase();

    return groupedOrders.filter((order) => {
      const matchesSearch =
        !query ||
        order.orderId.toString().includes(query) ||
        order.payments.some(
          (p) =>
            p?.Campaign?.name?.toLowerCase().includes(query) ||
            (p as any)?.donationItem?.toLowerCase().includes(query) ||
            p?.donationId?.toString().includes(query)
        );

      const matchesCategory =
        category === "all" ||
        order.payments.some((p) => {
          const name = (p?.Campaign?.name || "").toLowerCase();
          const item = ((p as any)?.Donation?.donationItem || (p as any)?.donationItem || "").toLowerCase();
          if (category === "zakat") return name.includes("zakat") || item.includes("zakat");
          if (category === "sadaqah") return name.includes("sadaqah") || item.includes("sadaqah") || name.includes("sadaqa");
          if (category === "sponsorship") return !!p?.orphan_id || name.includes("sponsor") || name.includes("orphan");
          return false;
        });

      return matchesSearch && matchesCategory;
    });
  }, [groupedOrders, search, selectedCategory]);

  useEffect(() => {
    // Get all donations by using a date far in the past (timestamp in milliseconds)
    const farPastDate = new Date(2000, 0, 1).getTime().toString();
    void dispatch(
      getPaymentsList({ 
        page: "1", 
        fromdate: farPastDate,
        limit: 1000 // Large limit to get all donations
      })
    );
  }, [dispatch]);

  useEffect(() => {
    if (rows && Array.isArray(rows) && rows.length > 0) {
      const grouped = groupPayments(rows as Payment[]);
      setGroupedOrders(grouped);
    } else if (rows && Array.isArray(rows) && rows.length === 0 && !loading) {
      setGroupedOrders([]);
    }
  }, [rows, loading]);

  const toggleOrderExpansion = (orderId: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newSet = new Set(expandedOrders);
    if (newSet.has(orderId)) newSet.delete(orderId);
    else newSet.add(orderId);
    setExpandedOrders(newSet);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-AU", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(date);
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2161CD" />
      </View>
    );
  }

  return (
    <SafeAreaViewContext style={styles.safeArea}>
      <View style={styles.container}>
        <View style={[styles.header, styles.screenEdgePadding]}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.push("/(tabs)/profile")}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={22} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Giving History</Text>
          <View style={styles.headerSpacer} />
        </View>
        {/* Search */}
        <View style={[styles.headerBar, styles.screenEdgePadding]}>
          <View style={styles.searchWrapper}>
            <View style={styles.searchContainer}>
              <Feather name="search" size={16} color="#6B7280" />
              <TextInput
                placeholder="Search donations..."
                placeholderTextColor="#9CA3AF"
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
              />
              {search.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearch("")}
                  style={styles.clearButton}
                >
                  <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Category tabs */}
        <View style={[styles.filtersSection, styles.screenEdgePadding]}>
          <View style={styles.filterPillsRow}>
            {categories.map((item) => {
              const isSelected = selectedCategory === item.value;
              return (
                <TouchableOpacity
                  key={item.value}
                  style={[styles.filterPillCategory, isSelected && styles.filterPillActive]}
                  onPress={() => setSelectedCategory(item.value)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={item.icon as keyof typeof Ionicons.glyphMap}
                    size={12}
                    color={isSelected ? "#2161CD" : "#6B7280"}
                  />
                  <Text style={[styles.filterPillText, isSelected && styles.filterPillTextActive]} numberOfLines={1}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {filteredOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyStateCard}>
              {groupedOrders.length === 0 ? (
                <>
                  <View style={styles.emptyStateIconWrap}>
                    <Ionicons name="heart-outline" size={40} color="#2161CD" />
                  </View>
                  <Text style={styles.emptyTitle}>No donations yet</Text>
                  <Text style={styles.emptyDescription}>
                    Your giving history will appear here. Browse campaigns and make your first donation to get started.
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyStateButton}
                    onPress={() => router.push("/(tabs)/campaigns")}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.emptyStateButtonText}>Browse campaigns</Text>
                    <Ionicons name="arrow-forward" size={18} color="#FFF" />
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View style={styles.emptyStateIconWrap}>
                    <Ionicons name="filter-outline" size={40} color="#9CA3AF" />
                  </View>
                  <Text style={styles.emptyTitle}>No donations match filters</Text>
                  <Text style={styles.emptyDescription}>
                    Try a different time range or category to see your donations.
                  </Text>
                </>
              )}
            </View>
          </View>
        ) : (
          <FlatList
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={true}
            data={filteredOrders as GroupedOrder[]}
            keyExtractor={(item: GroupedOrder) => item.orderId.toString()}
            renderItem={({ item: order }: { item: GroupedOrder }) => {
              // Helper function to check if payment is a processing fee
              const isProcessingFee = (p: Payment) => {
                const notes = (p as any)?.notes || (p as any)?.Donation?.notes || "";
                const campaignId = (p as any)?.campaignId || (p?.Campaign as any)?.id;
                const donationItem = (p as any)?.donationItem || (p as any)?.Donation?.donationItem || "";
                return (
                  notes.toLowerCase().includes("processing fee") ||
                  campaignId === 259 ||
                  donationItem.toLowerCase().includes("processing fee") ||
                  donationItem.toLowerCase().includes("admin fee")
                );
              };

              // Filter out processing fee items for primary display
              const nonProcessingFeePayments = order.payments.filter((p: Payment) => !isProcessingFee(p));
              const primaryPayment = nonProcessingFeePayments[0] || order.payments?.[0];
              
              // Get unique campaigns (excluding processing fees)
              const uniqueCampaigns = new Map<string, number>();
              nonProcessingFeePayments.forEach((p: Payment) => {
                const campaignName = p?.Campaign?.name
                  ? p.Campaign.name
                  : p?.orphan_id
                  ? "Orphan Sponsorship"
                  : "Donation";
                uniqueCampaigns.set(campaignName, (uniqueCampaigns.get(campaignName) || 0) + 1);
              });
              const campaignCount = uniqueCampaigns.size;
              const totalItems = nonProcessingFeePayments.length;
              
              const primaryCampaignName =
                primaryPayment?.Campaign?.name
                  ? primaryPayment.Campaign.name
                  : primaryPayment?.orphan_id
                  ? "Orphan Sponsorship"
                  : "Donation";
              
              // Build campaign name with count
              const otherCount = campaignCount > 1 ? campaignCount - 1 : 0;
              
              // Get cover image from the campaign (now included in API response)
              const coverImage =
                (primaryPayment?.Campaign as any)?.coverImage ||
                "https://alihsan.s3.ap-southeast-2.amazonaws.com/projects/1708467963799-alihsan-coverImage.png";
              const statusRaw =
                (primaryPayment as any)?.status ||
                (primaryPayment as any)?.Donation?.status ||
                "COMPLETED";
              const statusUpper = String(statusRaw).toUpperCase();
              const statusLabel =
                statusUpper === "COMPLETED" ? "Completed" : statusUpper;
              const amountLabel = `AUD $${Number(order.totalAmount).toFixed(2)}`;

              const statusBg =
                statusUpper === "COMPLETED" || statusUpper === "DISTRIBUTED"
                  ? "#E8F7EF"
                  : statusUpper === "ACTIVE"
                  ? "#EFF6FF"
                  : "#FEF3C7";
              const statusColor =
                statusUpper === "COMPLETED" || statusUpper === "DISTRIBUTED"
                  ? "#16A34A"
                  : statusUpper === "ACTIVE"
                  ? "#2563EB"
                  : "#D97706";

              return (
                <View style={styles.orderCard}>
                  <TouchableOpacity
                    style={styles.orderHeader}
                    onPress={() => toggleOrderExpansion(order.orderId)}
                    activeOpacity={0.7}
                  >
                    <Image source={{ uri: coverImage }} style={styles.orderImage} />
                    <View style={styles.orderInfo}>
                      <Text style={styles.orderTitle} numberOfLines={1}>
                        {primaryCampaignName}
                        {otherCount > 0 && (
                          <Text style={styles.orderOtherCampaigns}> +{otherCount}</Text>
                        )}
                      </Text>
                      <Text style={styles.orderMetaText}>
                        {formatDate(order.paymentDate)} · {amountLabel}
                      </Text>
                    </View>
                    <View style={styles.orderRight}>
                      <View style={[styles.orderStatusBadge, { backgroundColor: statusBg }]}>
                        <Text style={[styles.orderStatusText, { color: statusColor }]}>{statusLabel}</Text>
                      </View>
                      <Ionicons
                        name={expandedOrders.has(order.orderId) ? "chevron-up" : "chevron-down"}
                        size={18}
                        color="#9CA3AF"
                      />
                    </View>
                  </TouchableOpacity>

                  {expandedOrders.has(order.orderId) && (
                    <View style={styles.orderDetails}>
                      <View style={styles.orderDetailsHeader}>
                        <Text style={styles.orderDetailsTitle}>Order #{order.orderId}</Text>
                      </View>
                      <View style={styles.orderDetailsList}>
                        {order.payments.map((p: Payment, index: number) => {
                          const isFee = isProcessingFee(p);
                          return (
                            <View
                              key={p.id}
                              style={[
                                styles.paymentRow,
                                index === order.payments.length - 1 && styles.paymentRowLast,
                              ]}
                            >
                              <Text style={[styles.paymentName, isFee && styles.paymentNameFee]} numberOfLines={1}>
                                {isFee
                                  ? "Processing fee"
                                  : p.Campaign?.name
                                  ? p.Campaign.name
                                  : p.orphan_id
                                  ? "Orphan Sponsorship"
                                  : "Donation"}
                              </Text>
                              <Text style={[styles.paymentTotal, isFee && styles.paymentTotalFee]}>
                                ${Number(p.total).toFixed(2)}
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  )}
                </View>
              );
            }}
          />
        )}

      </View>
    </SafeAreaViewContext>
  );
};

// --- Styles
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1 },
  screenEdgePadding: { paddingHorizontal: 16 },
  listContent: { paddingHorizontal: 16, paddingBottom: 140, paddingTop: 4 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 10,
  },
  searchWrapper: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: "#111827",
  },
  clearButton: {
    paddingLeft: 4,
  },
  filtersSection: {
    paddingVertical: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  filterPillsRow: {
    flexDirection: "row",
    gap: 6,
  },
  filterPillCategory: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 0,
    paddingHorizontal: 6,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  filterPillActive: {
    backgroundColor: "rgba(33, 97, 205, 0.12)",
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  filterPillTextActive: {
    color: "#2161CD",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: "#111",
  },
  headerSpacer: {
    width: 40,
    height: 40,
  },
  orderCard: {
    backgroundColor: "#FAFAFA",
    marginTop: 8,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  orderHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  orderImage: {
    width: 44,
    height: 44,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: "#E8E8E8",
  },
  orderInfo: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
  },
  orderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  orderTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  orderOtherCampaigns: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
  },
  orderMetaText: {
    fontSize: 12,
    color: "#6B7280",
  },
  orderStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  orderStatusText: {
    fontWeight: "600",
    fontSize: 10,
  },
  orderDetails: {
    marginHorizontal: 12,
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  orderDetailsHeader: {
    marginBottom: 10,
  },
  orderDetailsTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  orderDetailsList: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  paymentRowLast: {
    borderBottomWidth: 0,
  },
  paymentName: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
    flex: 1,
    marginRight: 8,
  },
  paymentNameFee: {
    color: "#9CA3AF",
  },
  paymentTotal: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },
  paymentTotalFee: {
    color: "#6B7280",
    fontWeight: "500",
  },
  orderDetailsDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },
  resendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    gap: 8,
  },
  resendButtonText: {
    color: "#246BE1",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "AlbertSans_600SemiBold",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  emptyStateCard: {
    backgroundColor: "#FAFAFA",
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
    maxWidth: 320,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  emptyStateIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyStateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#2161CD",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  emptyStateButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFF",
  },
});

// --- Utility function
function groupPayments(payments: Payment[]): GroupedOrder[] {
  const grouped: { [key: number]: GroupedOrder } = {};
  
  // Helper function to check if payment is a processing fee
  const isProcessingFee = (p: Payment) => {
    const notes = (p as any)?.notes || (p as any)?.Donation?.notes || "";
    const campaignId = (p as any)?.campaignId || (p?.Campaign as any)?.id;
    const donationItem = (p as any)?.donationItem || (p as any)?.Donation?.donationItem || "";
    return (
      notes.toLowerCase().includes("processing fee") ||
      campaignId === 259 ||
      donationItem.toLowerCase().includes("processing fee") ||
      donationItem.toLowerCase().includes("admin fee")
    );
  };

  payments.forEach((p) => {
    // Prioritize orderId from Donation object, then direct orderId, avoid using donationId as fallback
    const orderId = p.Donation?.orderId || p.orderId;
    if (!orderId) {
      console.warn("Payment missing orderId:", p);
      return; // Skip payments without orderId
    }
    if (!grouped[orderId]) {
      grouped[orderId] = {
        orderId,
        totalAmount: 0,
        payments: [],
        paymentDate: p.updatedAt,
        itemCount: 0,
      };
    }
    // Include all payments (including processing fees) in the payments array
    grouped[orderId].payments.push(p);
    // Total = sum of all items (donations + fees)
    grouped[orderId].totalAmount += parseFloat(p.total) || 0;
    if (!isProcessingFee(p)) {
      grouped[orderId].itemCount += 1;
    }

    const paymentDate = new Date(p.updatedAt);
    const currentOrderDate = new Date(grouped[orderId].paymentDate);
    if (paymentDate < currentOrderDate) {
      grouped[orderId].paymentDate = p.updatedAt;
    }
  });
  return Object.values(grouped).sort(
    (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
  );
}

export default OneTimeUserDonationsScreen;
