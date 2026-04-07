import React, { useCallback, useEffect, useState, useRef } from "react";
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
  Image,
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
import TermsAndConditionsModal from "@/components/ui/Modals/TermsAndConditionsModal";
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

// Get recurring label for strip/badge (matches AU Next.js BasketItem)
const getRecurringLabel = (periodDays?: number): string => {
  if (!periodDays) return "";
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

export default function BasketScreen() {
  const { user } = useSelector((state: any) => state.authentication);
  const isAuthenticated = !!user;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [guestBasket, setGuestBasket] = useState<any[]>([]);
  const [guestLoading, setGuestLoading] = useState(false);
  const [removeModalVisible, setRemoveModalVisible] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);
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
  const basketItems = isAuthenticated ? basketData?.payload ?? [] : guestBasket;

  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        refetch();
      } else {
        loadGuestBasket();
      }
      // Scroll to top when screen comes into focus
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, [isAuthenticated, refetch, loadGuestBasket])
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
    name?: string
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
          (item) => item.campaignId !== campaignId
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
      if (checkoutType === "ADEEQAH_GENERAL_SACRIFICE") {
        return sum + parseFloat(item.total?.toString() || "0");
      }
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
        <ActivityIndicator size="large" color="#2161CD" />
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
      
      <TermsAndConditionsModal
        visible={termsModalVisible}
        onClose={() => setTermsModalVisible(false)}
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

      {/* Scrollable Content - items only when not empty */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          basketItems.length === 0 && styles.scrollContentCentered,
          basketItems.length > 0 && { paddingBottom: 280 },
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {basketItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>Your basket is empty</Text>
            <Text style={styles.emptySubtitle}>
              Add donations from our campaigns
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => router.push("/(tabs)/campaigns")}
              activeOpacity={0.8}
            >
              <Text style={styles.browseButtonText}>Browse campaigns</Text>
            </TouchableOpacity>
          </View>
        ) : (
            <View style={styles.itemsSection}>
              <Text style={styles.sectionTitle}>
                Your Items ({basketItems.length})
              </Text>
              {basketItems.map((item: any, index: number) => {
                const checkoutType =
                  item.checkoutType || item.Campaign?.checkoutType;
                const isAdeeqah = checkoutType === "ADEEQAH_GENERAL_SACRIFICE";
                const quantity = isAdeeqah
                  ? parseInt(item.quantity?.toString() || "1", 10)
                  : item.quantity || 1;
                const price = parseFloat(
                  item.amount?.toString() || item.ricePrice?.toString() || "0"
                );
                const itemTotal =
                  item.total !== undefined && item.total !== null
                    ? parseFloat(item.total?.toString() || "0")
                    : isAdeeqah
                      ? price
                      : price * quantity;
                const isOrphan = !!item.orphanId;
                const itemName =
                  item.name ||
                  item.Campaign?.name ||
                  item.Orphan?.name ||
                  "Campaign";
                const itemImage =
                  item.coverImage ||
                  item.Campaign?.coverImage ||
                  item.Orphan?.coverImage ||
                  "https://via.placeholder.com/64";
                const amountLabel = formatCurrency(itemTotal);
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
                            <Ionicons
                              name="repeat"
                              size={14}
                              color="#fff"
                            />
                            <Text style={styles.itemStripLabel}>
                              RECURRING
                            </Text>
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
                            <Ionicons
                              name="person"
                              size={14}
                              color="#fff"
                            />
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
                          source={{ uri: itemImage }}
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
                          {itemName}
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

                      <TouchableOpacity
                        onPress={() =>
                          handleRemoveItem(
                            item.campaignId,
                            item.orphanId,
                            item.donationItem,
                            itemName
                          )
                        }
                        style={styles.deleteButton}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={16}
                          color="#9CA3AF"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
        )}
      </ScrollView>

      {/* Fixed bottom: Total, Anonymous, Checkout */}
      {basketItems.length > 0 && (
        <View style={[styles.fixedBottom, { paddingBottom: Math.max(insets.bottom, 6) }]}>
          <LinearGradient
            colors={["#5089E7", "#2161CD"]}
            style={styles.summaryCard}
          >
            <View style={styles.summaryTopRow}>
              <Text style={styles.summaryLabel}>Total Amount</Text>
              <Text style={styles.summaryAmount}>{formatCurrency(total)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryDetails}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryRowLabel}>Subtotal</Text>
                <Text style={styles.summaryRowValue}>
                  {formatCurrency(subtotal)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryRowLabel}>Admin Fee (3%)</Text>
                <Text style={styles.summaryRowValue}>
                  {formatCurrency(parseFloat(processingAmount))}
                </Text>
              </View>
            </View>
          </LinearGradient>

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
                      : item.amount?.toString() || "0"
                  ) === 0
              )
            }
            activeOpacity={0.8}
          >
            <Text style={styles.checkoutText}>Proceed to Checkout</Text>
            <Ionicons name="chevron-forward" size={18} color="#010D26" />
          </TouchableOpacity>
          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>By continuing, you agree to the </Text>
            <TouchableOpacity
              onPress={() => setTermsModalVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.termsLink}>terms and conditions</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    fontWeight: "800",
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
  scrollContentCentered: {
    flexGrow: 1,
    justifyContent: "center",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#374151",
    marginTop: 16,
    marginBottom: 6,
    fontFamily: "AlbertSans_700Bold",
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    marginBottom: 24,
    fontFamily: "AlbertSans_400Regular",
  },
  browseButton: {
    backgroundColor: "#2161CD",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  browseButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
    fontFamily: "AlbertSans_600SemiBold",
  },
  itemsSection: {
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#010D26",
    marginBottom: 10,
    fontFamily: "AlbertSans_700Bold",
  },
  itemCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  itemCardOrphan: {
    backgroundColor: "#fff",
    borderColor: "#93C5FD",
  },
  itemCardRecurring: {
    backgroundColor: "#fff",
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
  deleteButton: {
    padding: 6,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  fixedBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  summaryCard: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    overflow: "hidden",
  },
  summaryTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    fontFamily: "AlbertSans_500Medium",
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    fontFamily: "AlbertSans_800ExtraBold",
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginBottom: 8,
  },
  summaryDetails: {
    gap: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryRowLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
    fontFamily: "AlbertSans_500Medium",
  },
  summaryRowValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "AlbertSans_700Bold",
  },
  anonymousCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
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
    fontSize: 13,
    fontWeight: "700",
    color: "#010D26",
    marginBottom: 1,
    fontFamily: "AlbertSans_700Bold",
  },
  anonymousSubtitle: {
    fontSize: 11,
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
  checkoutButton: {
    backgroundColor: "#FFD602",
    borderRadius: 10,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: 8,
  },
  checkoutText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#010D26",
    fontFamily: "AlbertSans_700Bold",
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    marginBottom: 0,
  },
  termsText: {
    fontSize: 11,
    textAlign: "center",
    color: "#374151",
    fontFamily: "AlbertSans_400Regular",
  },
  termsLink: {
    fontSize: 11,
    textDecorationLine: "underline",
    color: "#2161CD",
    fontFamily: "AlbertSans_400Regular",
  },
});
