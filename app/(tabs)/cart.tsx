import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
  Switch,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSelector } from "react-redux";
import {
  useGetBasketQuery,
  useRemoveFromBasketMutation,
} from "@/store/reduxSlice/api/basketApi";
import RemoveDonationModal from "@/components/ui/Modals/RemoveDonationModal";
import { useFocusEffect } from "@react-navigation/native";

// Format price helper
const formatPrice = (price: number): string => {
  return !isNaN(price)
    ? price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "0.00";
};

// Format currency helper
const formatCurrency = (value: number): string => {
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// Get recurring label helper
const getRecurringLabel = (periodDays?: number): string => {
  if (!periodDays) return "";
  switch (parseInt(periodDays.toString())) {
    case 7:
      return "Weekly";
    case 30:
      return "Monthly";
    case 365:
      return "Yearly";
    case 1:
      return "Daily";
    case 10:
      return "Last 10 Ramadan";
    default:
      return "";
  }
};

export default function BasketScreen() {
  const { user } = useSelector((state: any) => state.authentication);
  const isAuthenticated = !!user;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [guestBasket, setGuestBasket] = useState<any[]>([]);
  const [guestLoading, setGuestLoading] = useState(false);
  const [removeModalVisible, setRemoveModalVisible] = useState(false);
  const [pendingRemoveItem, setPendingRemoveItem] = useState<{
    campaignId: number;
    orphanId: number;
    donationItem?: string;
    name?: string;
  } | null>(null);

  // RTK Query hooks for logged-in users
  const {
    data: basketData,
    isLoading,
    refetch,
  } = useGetBasketQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [removeFromBasket] = useRemoveFromBasketMutation();

  // Load guest basket from AsyncStorage
  const loadGuestBasket = useCallback(async () => {
    setGuestLoading(true);
    const data = await AsyncStorage.getItem("guestBasket");
    setGuestBasket(data ? JSON.parse(data) : []);
    setGuestLoading(false);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      loadGuestBasket();
    }
  }, [isAuthenticated, loadGuestBasket]);

  // Unified basketItems for rendering
  const basketItems = isAuthenticated
    ? (basketData?.payload ?? [])
    : guestBasket;

  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        refetch();
      } else {
        loadGuestBasket();
      }
    }, [isAuthenticated, refetch, loadGuestBasket]),
  );

  // Refresh logic
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (isAuthenticated) {
      await refetch();
    } else {
      await loadGuestBasket();
    }
    setRefreshing(false);
  }, [isAuthenticated, refetch, loadGuestBasket]);

  // Remove item logic
  const handleRemoveItem = (
    campaignId: number,
    orphanId: number,
    donationItem?: string,
    name?: string,
  ) => {
    setPendingRemoveItem({
      campaignId,
      orphanId,
      donationItem,
      name,
    });
    setRemoveModalVisible(true);
  };

  const confirmRemoveItem = async () => {
    if (!pendingRemoveItem) return;

    try {
      const { campaignId, orphanId, donationItem } = pendingRemoveItem;

      if (isAuthenticated) {
        await removeFromBasket({ campaignId, orphanId, donationItem });
        await refetch();
      } else {
        const updated = guestBasket.filter(
          (item) => item.campaignId !== campaignId,
        );
        setGuestBasket(updated);
        await AsyncStorage.setItem("guestBasket", JSON.stringify(updated));
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to remove item");
    } finally {
      setRemoveModalVisible(false);
      setPendingRemoveItem(null);
    }
  };

  // Checkout logic
  const handleCheckout = () => {
    if (basketItems.length === 0) {
      Alert.alert("Empty Cart", "Your cart is empty");
      return;
    }
    router.push("/checkout");
  };

  // Calculate totals
  const processingFee = 0.03; // 3%
  const subtotal = basketItems.reduce((sum: number, item: any) => {
    const checkoutType = item.checkoutType || item.Campaign?.checkoutType;
    if (isAuthenticated) {
      // Logged-in user: use total
      if (checkoutType === "ADEEQAH_GENERAL_SACRIFICE") {
        return sum + parseFloat(item.total?.toString() || "0");
      } else {
        return (
          sum +
          parseFloat(item.total?.toString() || item.amount?.toString() || "0")
        );
      }
    } else {
      // Guest user: use amount * quantity
      const quantity = parseFloat(item.quantity?.toString() || "1");
      const amount = parseFloat(item.amount?.toString() || "0");
      return sum + amount * quantity;
    }
  }, 0);
  const processingAmount = (subtotal * processingFee).toFixed(2);
  const total = subtotal + parseFloat(processingAmount);

  if (isLoading || guestLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#264B8B" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <RemoveDonationModal
        visible={removeModalVisible}
        description={`Are you sure you want to remove ${
          pendingRemoveItem?.name || "this donation"
        } from your donation list?`}
        onCancel={() => {
          setRemoveModalVisible(false);
          setPendingRemoveItem(null);
        }}
        onConfirm={confirmRemoveItem}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={22} color="#010D26" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Basket</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {basketItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="cart-outline" size={64} color="#E5E7EB" />
            </View>
            <Text style={styles.emptyTitle}>Your basket is empty</Text>
            <Text style={styles.emptySubtitle}>
              Browse our projects and add items to your basket
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => router.push("/(tabs)/campaigns")}
              activeOpacity={0.8}
            >
              <Text style={styles.browseButtonText}>Browse Projects</Text>
              <Ionicons name="arrow-forward" size={18} color="#010D26" />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Basket Items */}
            <View style={styles.itemsSection}>
              <Text style={styles.sectionTitle}>
                Your Items ({basketItems.length})
              </Text>
              {basketItems.map((item: any, index: number) => {
                const checkoutType =
                  item.checkoutType || item.Campaign?.checkoutType;
                const isAdeeqah = checkoutType === "ADEEQAH_GENERAL_SACRIFICE";
                const quantity = isAdeeqah
                  ? parseInt(item.riceQuantity?.toString() || "1")
                  : item.quantity || 1;
                const price = parseFloat(
                  item.amount?.toString() || item.ricePrice?.toString() || "0",
                );
                const itemTotal =
                  item.total !== undefined && item.total !== null
                    ? parseFloat(item.total?.toString() || "0")
                    : price * quantity;
                const isCommonORZaqat = [
                  "ZAQAT",
                  "COMMON",
                  "WATER_CAMPAIGN",
                  "KURBAN",
                ].includes(checkoutType || "");

                return (
                  <View key={item.id || index} style={styles.itemCard}>
                    <ExpoImage
                      source={{
                        uri:
                          item.coverImage ||
                          item.Campaign?.coverImage ||
                          item.Orphan?.coverImage ||
                          "https://via.placeholder.com/64",
                      }}
                      style={styles.itemImage}
                      contentFit="cover"
                    />
                    <View style={styles.itemContent}>
                      <Text style={styles.itemTitle} numberOfLines={2}>
                        {item.name ||
                          item.Campaign?.name ||
                          item.Orphan?.name ||
                          "Campaign"}
                      </Text>
                      <View style={styles.itemMetaRow}>
                        {item.isRecurring && (
                          <View style={styles.recurringBadge}>
                            <Ionicons name="repeat" size={9} color="#264B8B" />
                            <Text style={styles.recurringText}>
                              {getRecurringLabel(item.periodDays)}
                            </Text>
                          </View>
                        )}
                        {item.donationItem && (
                          <Text style={styles.donationItem}>
                            {item.donationItem}
                          </Text>
                        )}
                      </View>
                      <View style={styles.itemPriceRow}>
                        <Text style={styles.itemPrice}>
                          {formatCurrency(itemTotal)}
                        </Text>
                        {isCommonORZaqat && quantity > 1 && (
                          <Text style={styles.itemUnitPrice}>
                            {formatCurrency(price)} each
                          </Text>
                        )}
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() =>
                        handleRemoveItem(
                          item.campaignId,
                          item.orphanId,
                          item.donationItem,
                          item.name || item.Campaign?.name,
                        )
                      }
                      style={styles.deleteButton}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={16}
                        color="#DC2626"
                      />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>

            {/* Summary Card */}
            <LinearGradient
              colors={["#6A7BFF", "#5663F7"]}
              style={styles.summaryCard}
            >
              <Text style={styles.summaryLabel}>Total Amount</Text>
              <Text style={styles.summaryAmount}>{formatCurrency(total)}</Text>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryDetails}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryRowLabel}>Subtotal</Text>
                  <Text style={styles.summaryRowValue}>
                    {formatCurrency(subtotal)}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryRowLabel}>Admin Fee</Text>
                  <Text style={styles.summaryRowValue}>
                    {formatCurrency(parseFloat(processingAmount))}
                  </Text>
                </View>
              </View>
            </LinearGradient>

            {/* Anonymous Toggle */}
            <View style={styles.anonymousCard}>
              <View style={styles.anonymousRow}>
                <View style={styles.anonymousContent}>
                  <Text style={styles.anonymousTitle}>Remain Anonymous</Text>
                  <Text style={styles.anonymousSubtitle}>
                    Do you want to remain anonymous?
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setIsAnonymous(!isAnonymous)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.customToggle,
                      isAnonymous && styles.customToggleActive,
                    ]}
                  >
                    <View
                      style={[
                        styles.toggleThumb,
                        isAnonymous && styles.toggleThumbActive,
                      ]}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Footer with Checkout Button */}
      {basketItems.length > 0 && (
        <LinearGradient colors={["#264B8B", "#1E3A8A"]} style={styles.footer}>
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={handleCheckout}
            disabled={
              subtotal <= 0 ||
              basketItems.some(
                (item: any) =>
                  parseFloat(
                    isAuthenticated
                      ? item.total?.toString() || "0"
                      : item.amount?.toString() || "0",
                  ) === 0,
              )
            }
            activeOpacity={0.8}
          >
            <Text style={styles.checkoutText}>Proceed to Checkout</Text>
            <Ionicons name="chevron-forward" size={18} color="#010D26" />
          </TouchableOpacity>
          <Text style={styles.termsText}>
            By continuing, you agree to the{" "}
            <Text style={styles.termsLink}>terms and conditions</Text>
          </Text>
        </LinearGradient>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    color: "#010D26",
    fontFamily: "AlbertSans_800ExtraBold",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 16,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    minHeight: 300,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    color: "#010D26",
    marginBottom: 6,
    fontFamily: "AlbertSans_800ExtraBold",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
    fontFamily: "AlbertSans_400Regular",
  },
  browseButton: {
    backgroundColor: "#FFD602",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  browseButtonText: {
    fontSize: 15,
    color: "#010D26",
    fontFamily: "AlbertSans_700Bold",
  },
  itemsSection: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    color: "#010D26",
    marginBottom: 12,
    fontFamily: "AlbertSans_800ExtraBold",
  },
  itemCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  itemImage: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    flexShrink: 0,
    overflow: "hidden",
  },
  itemContent: {
    flex: 1,
    minWidth: 0,
  },
  itemTitle: {
    fontSize: 14,
    color: "#010D26",
    marginBottom: 4,
    fontFamily: "AlbertSans_500Medium",
    lineHeight: 18,
    letterSpacing: 0,
  },
  itemMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 5,
    marginBottom: 4,
  },
  recurringBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF4FF",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  recurringText: {
    fontSize: 9,
    color: "#264B8B",
    fontFamily: "AlbertSans_700Bold",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  donationItem: {
    fontSize: 11,
    color: "#6B7280",
    fontFamily: "AlbertSans_500Medium",
    lineHeight: 14,
  },
  itemPriceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 5,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 16,
    color: "#010D26",
    fontFamily: "AlbertSans_800ExtraBold",
    letterSpacing: -0.3,
  },
  itemUnitPrice: {
    fontSize: 11,
    color: "#9CA3AF",
    fontFamily: "AlbertSans_400Regular",
    lineHeight: 13,
  },
  deleteButton: {
    padding: 7,
    borderRadius: 7,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
    minWidth: 34,
    minHeight: 34,
    alignSelf: "center",
  },
  summaryCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#E0E4FF",
    marginBottom: 2,
    fontFamily: "AlbertSans_400Regular",
  },
  summaryAmount: {
    fontSize: 24,
    color: "#fff",
    marginBottom: 12,
    fontFamily: "AlbertSans_800ExtraBold",
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginBottom: 12,
  },
  summaryDetails: {
    gap: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryRowLabel: {
    fontSize: 13,
    color: "#E0E4FF",
    fontFamily: "AlbertSans_500Medium",
  },
  summaryRowValue: {
    fontSize: 13,
    color: "#fff",
    fontFamily: "AlbertSans_700Bold",
  },
  anonymousCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },
  anonymousRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  anonymousContent: {
    flex: 1,
    marginRight: 12,
  },
  anonymousTitle: {
    fontSize: 14,
    color: "#010D26",
    marginBottom: 2,
    fontFamily: "AlbertSans_700Bold",
  },
  anonymousSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "AlbertSans_400Regular",
  },
  customToggle: {
    width: 40,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: 2,
  },
  customToggleActive: {
    backgroundColor: "#22C55E",
    alignItems: "flex-end",
  },
  toggleThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#fff",
  },
  toggleThumbActive: {
    backgroundColor: "#fff",
  },
  footer: {
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  checkoutButton: {
    backgroundColor: "#FFD602",
    borderRadius: 10,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: 10,
  },
  checkoutText: {
    fontSize: 15,
    color: "#010D26",
    fontFamily: "AlbertSans_700Bold",
  },
  termsText: {
    fontSize: 11,
    textAlign: "center",
    color: "#E6ECFF",
    fontFamily: "AlbertSans_400Regular",
  },
  termsLink: {
    textDecorationLine: "underline",
    color: "#FFD602",
  },
});
