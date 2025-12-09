import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  LayoutAnimation,
  UIManager,
  Platform,
} from "react-native";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { getPaymentsList } from "@/store/reduxSlice/paymentDetailsSlice";
import {
  generateInvoice,
  exportInvoice,
} from "@/store/reduxSlice/myDonationSlice";
import Button from "@/components/ui/Button";
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
};

const OneTimeUserDonationsScreen = () => {
  const dispatch = useAppDispatch();
  const { rows, loading } = useSelector(
    (state: any) => state.paymentDetails.paymentList
  );
  const [selectedFilter, setSelectedFilter] = useState(initialState.fromdate);
  const [groupedOrders, setGroupedOrders] = useState<GroupedOrder[]>([]);
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());
  const [selectedOrders, setSelectedOrders] = useState<Set<number>>(new Set());

  useEffect(() => {
    void dispatch(
      getPaymentsList({ ...initialState, fromdate: selectedFilter })
    );
  }, [selectedFilter, dispatch]);

  useEffect(() => {
    setGroupedOrders(groupPayments(rows as Payment[]));
  }, [rows]);

  const toggleOrderExpansion = (orderId: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newSet = new Set(expandedOrders);
    if (newSet.has(orderId)) newSet.delete(orderId);
    else newSet.add(orderId);
    setExpandedOrders(newSet);
  };

  const toggleOrderSelection = (orderId: number) => {
    const newSet = new Set(selectedOrders);
    if (newSet.has(orderId)) newSet.delete(orderId);
    else newSet.add(orderId);
    setSelectedOrders(newSet);
  };

  const handleExport = async () => {
    const exportIds = groupedOrders
      .filter((order) => selectedOrders.has(order.orderId))
      .flatMap((order) => order.payments.map((p) => p.id))
      .join(",");
    await dispatch(exportInvoice({ exportId: exportIds }) as any);
  };

  const handleDownload = async (id: number) => {
    await dispatch(generateInvoice({ donationId: id }) as any);
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
        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          {filters.map((f) => (
            <TouchableOpacity
              key={f.value}
              style={[
                styles.filterTab,
                selectedFilter === f.value && styles.filterTabActive,
              ]}
              onPress={() => setSelectedFilter(f.value)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterTabText,
                  selectedFilter === f.value && styles.filterTabTextActive,
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {groupedOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="payment" size={60} color="#A5B4FC" />
            <Text style={styles.emptyTitle}>No Donations Yet</Text>
            <Text style={styles.emptyDescription}>
              You haven’t made any payments. Start supporting a project today!
            </Text>
          </View>
        ) : (
          <FlatList
            contentContainerStyle={{ paddingBottom: 80 }}
            data={groupedOrders as GroupedOrder[]}
            keyExtractor={(item: GroupedOrder) => item.orderId.toString()}
            renderItem={({ item: order }: { item: GroupedOrder }) => (
              <View style={styles.orderCard}>
                <TouchableOpacity
                  style={styles.orderHeader}
                  onPress={() => toggleOrderExpansion(order.orderId)}
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <MaterialIcons
                      name={
                        expandedOrders.has(order.orderId)
                          ? "expand-less"
                          : "expand-more"
                      }
                      size={24}
                      color="#4F46E5"
                    />
                    <Text style={styles.orderTitle}>
                      Order #{order.orderId}
                    </Text>
                  </View>
                  <Text style={styles.orderAmount}>
                    ${order.totalAmount.toFixed(2)}
                  </Text>
                </TouchableOpacity>

                {expandedOrders.has(order.orderId) && (
                  <View style={styles.orderDetails}>
                    {order.payments.map((p: Payment) => (
                      <View key={p.id} style={styles.paymentRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.paymentName}>
                            {p.Campaign?.name || p.orphan_id
                              ? "Orphan Sponsorship"
                              : "Unnamed"}
                          </Text>
                          <Text style={styles.paymentId}>
                            Donation ID: {p.donationId}
                          </Text>
                        </View>
                        <Text style={styles.paymentTotal}>${p.total}</Text>
                        <TouchableOpacity
                          onPress={() => handleDownload(p.donationId)}
                        >
                          <MaterialIcons
                            name="download"
                            size={24}
                            color="#4F46E5"
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => toggleOrderSelection(order.orderId)}
                          style={[
                            styles.checkbox,
                            selectedOrders.has(order.orderId) &&
                              styles.checkboxSelected,
                          ]}
                        />
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          />
        )}

        {groupedOrders.length > 0 && (
          <View style={styles.bottomActions}>
            <Button
              label="Export Selected"
              onPress={handleExport}
              style={{ flex: 1 }}
            />
          </View>
        )}
      </View>
    </SafeAreaViewContext>
  );
};

// --- Styles
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F3F4F6" },
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  filterTabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 12,
    backgroundColor: "#fff",
    elevation: 2,
  },
  filterTab: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#E0E7FF",
  },
  filterTabActive: { backgroundColor: "#4F46E5" },
  filterTabText: { color: "#1E3A8A", fontWeight: "600" },
  filterTabTextActive: { color: "#fff" },
  orderCard: {
    backgroundColor: "#fff",
    margin: 12,
    borderRadius: 16,
    padding: 12,
    elevation: 1,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4F46E5",
    marginLeft: 8,
  },
  orderAmount: { fontWeight: "700", color: "#16A34A", fontSize: 16 },
  orderDetails: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 8,
  },
  paymentRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  paymentName: { fontWeight: "600", color: "#1E40AF" },
  paymentId: { fontSize: 12, color: "#6B7280" },
  paymentTotal: { fontWeight: "700", color: "#16A34A", marginHorizontal: 8 },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#4F46E5",
    borderRadius: 4,
    marginLeft: 8,
  },
  checkboxSelected: { backgroundColor: "#4F46E5" },
  bottomActions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: "#fff",
    flexDirection: "row",
    gap: 8,
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
    color: "#4F46E5",
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
  payments.forEach((p) => {
    const orderId = p.Donation?.orderId || p.orderId || p.donationId || p.id;
    if (!grouped[orderId])
      grouped[orderId] = { orderId, totalAmount: 0, payments: [] };
    grouped[orderId].payments.push(p);
    grouped[orderId].totalAmount += parseFloat(p.total) || 0;
  });
  return Object.values(grouped).sort((a, b) => b.totalAmount - a.totalAmount);
}

export default OneTimeUserDonationsScreen;
