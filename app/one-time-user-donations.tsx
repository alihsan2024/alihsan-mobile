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
import {
  generateInvoice,
} from "@/store/reduxSlice/myDonationSlice";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView as SafeAreaViewContext } from "react-native-safe-area-context";

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);
const last7Days = new Date(today);
last7Days.setDate(today.getDate() - 7);

const filters = [
  { label: "Today", value: today.toISOString().split("T")[0] },
  { label: "Yesterday", value: yesterday.toISOString().split("T")[0] },
  { label: "Last 7 Days", value: last7Days.toISOString().split("T")[0] },
];

const initialState = {
  page: "1",
  fromdate: today.toISOString().split("T")[0],
  limit: 10,
};

const categories = [
  { label: "All", icon: "globe-outline" },
  { label: "Zakat", icon: "moon-outline" },
  { label: "Sadaqah", icon: "heart-outline" },
  { label: "Sponsorship", icon: "people-outline" },
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
  const [selectedFilter, setSelectedFilter] = useState(initialState.fromdate);
  const [groupedOrders, setGroupedOrders] = useState<GroupedOrder[]>([]);
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    const category = selectedCategory.toLowerCase();

    return groupedOrders.filter((order) => {
      const matchesSearch =
        !query ||
        order.orderId.toString().includes(query) ||
        order.payments.some(
          (payment) =>
            payment?.Campaign?.name?.toLowerCase().includes(query) ||
            payment?.donationId?.toString().includes(query)
        );

      const matchesCategory =
        selectedCategory === "All" ||
        order.payments.some((payment) =>
          payment?.Campaign?.name?.toLowerCase().includes(category)
        );

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

  const handleResend = async (id: number) => {
    await dispatch(generateInvoice({ donationId: id }) as any);
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
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <SafeAreaViewContext style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
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
        <View style={styles.headerBar}>
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

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <FlatList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => `${item.label}-${index}`}
            contentContainerStyle={styles.categoriesHorizontal}
            renderItem={({ item }) => {
              const isSelected = selectedCategory === item.label;
            const activeColor = isSelected ? "#2161CD" : "#6B7280";

              return (
                <TouchableOpacity
                  style={[
                    styles.categoryItemHorizontal,
                    isSelected && styles.categoryItemSelected,
                  ]}
                  onPress={() => setSelectedCategory(item.label)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={item.icon as keyof typeof Ionicons.glyphMap}
                    size={12}
                    color={activeColor}
                  />
                  <Text
                    style={[
                      styles.categoryText,
                      isSelected && styles.categoryTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {filteredOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="payment" size={60} color="#2161CD" />
            <Text style={styles.emptyTitle}>No Donations Yet</Text>
            <Text style={styles.emptyDescription}>
              You haven’t made any payments. Start supporting a project today!
            </Text>
          </View>
        ) : (
          <FlatList
            contentContainerStyle={{ paddingBottom: 140, paddingTop: 4 }}
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

              return (
                <View style={styles.orderCard}>
                  <TouchableOpacity
                    style={styles.orderHeader}
                    onPress={() => toggleOrderExpansion(order.orderId)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.orderHeaderLeft}>
                      <Image source={{ uri: coverImage }} style={styles.orderImage} />
                      <View style={styles.orderInfo}>
                        <View style={styles.orderTitleRow}>
                          <Text style={styles.orderTitle} numberOfLines={1}>
                            {primaryCampaignName}
                          </Text>
                          {otherCount > 0 && (
                            <Text style={styles.orderOtherCampaigns}>
                              {" "}+ {otherCount} other{otherCount !== 1 ? "s" : ""}
                            </Text>
                          )}
                        </View>
                        <View style={styles.orderMetaRow}>
                          <Text style={styles.orderMetaText}>
                            {formatDate(order.paymentDate)}
                          </Text>
                          <Text style={styles.orderMetaDot}>•</Text>
                          <Text style={styles.orderMetaText}>
                            {totalItems} item{totalItems !== 1 ? "s" : ""}
                          </Text>
                          <Text style={styles.orderMetaDot}>•</Text>
                          <Text style={styles.orderMetaAmount}>
                            {amountLabel}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.orderStatusBadge}>
                      <Text style={styles.orderStatusText}>{statusLabel}</Text>
                    </View>
                  </TouchableOpacity>

                  {expandedOrders.has(order.orderId) && (
                    <View style={styles.orderDetails}>
                      <View style={styles.orderDetailsHeader}>
                        <Text style={styles.orderDetailsTitle}>Order Items</Text>
                        <Text style={styles.orderDetailsSubtitle}>Order #{order.orderId}</Text>
                      </View>
                      <View style={styles.orderDetailsList}>
                        {order.payments.map((p: Payment, index: number) => {
                          const isFee = isProcessingFee(p);
                          return (
                            <View
                              key={p.id}
                              style={[
                                styles.paymentRow,
                                index === order.payments.length - 1 &&
                                  styles.paymentRowLast,
                              ]}
                            >
                              <View style={styles.paymentRowLeft}>
                                <View style={styles.paymentIconContainer}>
                                  <Ionicons 
                                    name={isFee ? "card-outline" : "gift-outline"} 
                                    size={16} 
                                    color={isFee ? "#9CA3AF" : "#246BE1"} 
                                  />
                                </View>
                                <View style={styles.paymentInfo}>
                                  <Text style={styles.paymentName}>
                                    {isFee
                                      ? "Processing Fee"
                                      : p.Campaign?.name
                                      ? p.Campaign.name
                                      : p.orphan_id
                                      ? "Orphan Sponsorship"
                                      : "Donation"}
                                  </Text>
                                  {!isFee && (
                                    <Text style={styles.paymentId}>
                                      {p.Campaign?.name ? "Campaign" : "Donation"}
                                    </Text>
                                  )}
                                </View>
                              </View>
                              <Text style={[styles.paymentTotal, isFee && styles.paymentTotalFee]}>
                                ${Number(p.total).toFixed(2)}
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                      <View style={styles.orderDetailsDivider} />
                      <TouchableOpacity
                        style={styles.resendButton}
                        onPress={() => handleResend(primaryPayment?.donationId)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="mail-outline" size={16} color="#246BE1" />
                        <Text style={styles.resendButtonText}>
                          Resend Invoice
                        </Text>
                      </TouchableOpacity>
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
  container: { flex: 1, paddingHorizontal: 16 },
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
  categoriesHorizontal: {
    paddingBottom: 0,
    marginBottom: 0,
    gap: 6,
  },
  categoriesSection: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    marginHorizontal: -16,
    paddingHorizontal: 16,
    paddingBottom: 10,
    marginBottom: 10,
  },
  categoryItemHorizontal: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 0,
    paddingHorizontal: 6,
    borderRadius: 8,
    justifyContent: "center",
    height: 36,
  },
  categoryItemSelected: {
    backgroundColor: "rgba(242, 246, 255, 1)",
  },
  categoryText: {
    fontSize: 10,
    lineHeight: 12,
    color: "#6B7280",
    fontWeight: "600",
  },
  categoryTextSelected: {
    color: "#2161CD",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    marginHorizontal: -16,
    paddingHorizontal: 16,
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
    backgroundColor: "#fff",
    marginTop: 8,
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 2,
  },
  orderHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  orderImage: {
    width: 48,
    height: 48,
    borderRadius: 10,
    marginRight: 8,
  },
  orderInfo: {
    flex: 1,
    marginRight: 8,
  },
  orderStatusBadge: {
    backgroundColor: "#E6F7D9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  orderStatusText: {
    color: "#3C7A2A",
    fontWeight: "600",
    fontSize: 11,
  },
  orderTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  orderTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  orderOtherCampaigns: {
    fontSize: 11,
    fontWeight: "400",
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  orderMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  orderMetaText: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  orderMetaDot: {
    marginHorizontal: 8,
    color: "#9CA3AF",
    fontSize: 11,
  },
  orderMetaAmount: {
    fontSize: 11,
    color: "#0F172A",
    fontWeight: "700",
  },
  orderDetails: {
    marginTop: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  orderDetailsHeader: {
    marginBottom: 12,
  },
  orderDetailsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#010D26",
    fontFamily: "AlbertSans_700Bold",
    marginBottom: 4,
  },
  orderDetailsSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "AlbertSans_400Regular",
  },
  orderDetailsList: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 8,
    marginBottom: 12,
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  paymentRowLast: {
    borderBottomWidth: 0,
  },
  paymentRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  paymentIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#010D26",
    fontFamily: "AlbertSans_600SemiBold",
    marginBottom: 2,
  },
  paymentId: {
    fontSize: 11,
    color: "#9CA3AF",
    fontFamily: "AlbertSans_400Regular",
  },
  paymentTotal: {
    fontSize: 15,
    fontWeight: "700",
    color: "#010D26",
    fontFamily: "AlbertSans_700Bold",
  },
  paymentTotalFee: {
    color: "#9CA3AF",
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
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#264B8B",
    marginTop: 16,
  },
  emptyDescription: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 4,
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
    // Only add to totalAmount and itemCount if it's not a processing fee
    if (!isProcessingFee(p)) {
      grouped[orderId].totalAmount += parseFloat(p.total) || 0;
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
