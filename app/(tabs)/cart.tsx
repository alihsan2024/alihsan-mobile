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
import BasketItemRow from "@/components/ui/Basket/BasketItemRow";

// Format price helper
const formatPrice = (price: number): string => {
  return !isNaN(price)
    ? price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "0.00";
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
  const basketItems = isAuthenticated ? basketData?.payload ?? [] : guestBasket;

  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        refetch();
      } else {
        loadGuestBasket();
      }
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
          style={{
            backgroundColor: "#FAFAFA",
            borderWidth: 1,
            borderColor: "#010D264D",
            padding: 5,
            borderRadius: 40,
          }}
        >
          <Ionicons name="chevron-back" size={16} color="#010D264D" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Basket</Text>
        <View style={{ width: 24 }} />
      </View>
      <Divider />

      {/* Scrollable Basket Items Section */}
      <View style={styles.scrollableSectionWrapper}>
        <ScrollView
          style={styles.scrollableSection}
          contentContainerStyle={styles.scrollableContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Basket Items */}
          <View style={styles.card}>
            {basketItems.length === 0 ? (
              <View style={styles.emptyBasketContainer}>
                <Ionicons
                  name="cart-outline"
                  size={48}
                  color="#E5E7EB"
                  style={{ marginBottom: 12 }}
                />
                <Text style={styles.emptyBasketText}>Your basket is empty</Text>
                <Text style={styles.emptyBasketSubtext}>
                  Browse our projects and add items to your basket
                </Text>
                <TouchableOpacity
                  style={styles.browseButton}
                  onPress={() => router.push("/(tabs)/campaigns")}
                >
                  <Text style={styles.browseButtonText}>Browse Projects</Text>
                </TouchableOpacity>
              </View>
            ) : (
              basketItems.map((item: any, index: number) => {
                const checkoutType =
                  item.checkoutType || item.Campaign?.checkoutType;
                const isAdeeqah = checkoutType === "ADEEQAH_GENERAL_SACRIFICE";
                const quantity = isAdeeqah
                  ? parseInt(item.riceQuantity?.toString() || "1")
                  : item.quantity || 1;
                const price = parseFloat(
                  item.amount?.toString() || item.ricePrice?.toString() || "0"
                );
                // For logged-in user, use item.total; for guest, use amount * quantity
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
                  <View key={item.id || index} style={styles.itemWrapper}>
                    <View style={styles.itemRow}>
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
                              <Ionicons
                                name="repeat"
                                size={10}
                                color="#264B8B"
                              />
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
                            ${formatPrice(itemTotal)}
                          </Text>
                          {isCommonORZaqat && quantity > 1 && (
                            <Text style={styles.itemUnitPrice}>
                              ${formatPrice(price)} each
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
                            item.name || item.Campaign?.name
                          )
                        }
                        style={styles.deleteButton}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={18}
                          color="#DC2626"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
        {/* Shadow indicator at bottom of scrollable section */}
        {basketItems.length > 0 && (
          <LinearGradient
            colors={[
              "rgba(255,255,255,0)",
              "rgba(255,255,255,0.4)",
              "rgba(255,255,255,0.9)",
              "#FFFFFF",
            ]}
            locations={[0, 0.3, 0.7, 1]}
            style={styles.shadowIndicator}
            pointerEvents="none"
          />
        )}
      </View>

      {/* Price Details - Fixed at bottom */}
      {basketItems.length > 0 && (
        <View style={styles.fixedBottomSection}>
          <View style={{ marginHorizontal: 16 }}>
            <Text style={styles.sectionTitle}>Price details</Text>

            <View style={styles.priceBox}>
              <Row label="Subtotal" value={`$${formatPrice(subtotal)}`} />
              <Row
                label="Admin Fee"
                value={`$${formatPrice(parseFloat(processingAmount))}`}
              />
              <Divider />
              <View style={styles.infoRow}>
                <Text style={styles.infoText}>
                  Do you want to remain anonymous?
                </Text>
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
              <Divider />
              <Row label="Total" value={`$${formatPrice(total)}`} />
            </View>
          </View>

          {/* Checkout Button */}
          <View style={styles.footer}>
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
            >
              <Text style={styles.checkoutText}>Proceed to Checkout</Text>
              <Ionicons name="chevron-forward" size={18} color="#000" />
            </TouchableOpacity>

            <Text style={styles.termsText}>
              By continuing, you agree to the{" "}
              <Text style={{ textDecorationLine: "underline" }}>
                terms and conditions.
              </Text>
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const Row = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.row}>
    <Text style={[styles.rowLabel]}>{label}</Text>
    <Text style={[styles.rowValue, styles.boldText]}>{value}</Text>
  </View>
);

const Divider = () => <View style={styles.divider} />;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollableSectionWrapper: {
    flex: 1,
    position: "relative",
  },
  scrollableSection: {
    flex: 1,
  },
  scrollableContent: {
    paddingBottom: 16,
  },
  shadowIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 24,
    pointerEvents: "none",
  },
  fixedBottomSection: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 16,
  },
  emptyBasketContainer: {
    alignItems: "center",
    padding: 32,
    minHeight: 400,
    justifyContent: "center",
  },
  emptyBasketText: {
    fontSize: 16,
    color: "#888",
    marginBottom: 8,
  },
  emptyBasketSubtext: {
    fontSize: 13,
    color: "#aaa",
    textAlign: "center",
    marginBottom: 16,
  },
  browseButton: {
    backgroundColor: "#264B8B",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: "#fff",
    fontWeight: "600",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },

  card: {
    borderRadius: 12,
  },

  donationItem: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500",
  },

  itemWrapper: {
    marginBottom: 10,
    marginHorizontal: 16,
  },
  itemRow: {
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },

  itemImage: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
  },

  itemContent: {
    flex: 1,
    minWidth: 0,
  },

  itemTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    lineHeight: 18,
    marginBottom: 4,
  },

  itemMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 6,
  },

  itemSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },

  itemPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },

  itemPriceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },

  itemUnitPrice: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500",
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
    fontWeight: "600",
    color: "#264B8B",
  },

  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },

  sectionTitle: {
    marginTop: 20,
    marginBottom: 8,
    fontSize: 18,
    fontWeight: "600",
    color: "#010D26",
  },

  priceBox: {
    borderRadius: 12,
    paddingVertical: 12,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  rowLabel: {
    fontSize: 14,
    color: "#010D26",
  },

  rowValue: {
    fontSize: 14,
    color: "#111827",
  },

  boldText: {
    fontWeight: "700",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  infoText: {
    flex: 1,
    fontSize: 12,
    color: "#010D26",
    marginRight: 8,
  },

  customToggle: {
    width: 36,
    height: 20,
    borderRadius: 12,
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
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  toggleThumbActive: {
    backgroundColor: "#fff",
  },

  footer: {
    padding: 16,
    backgroundColor: "#FFFFFF",
  },

  checkoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FACC15",
    borderRadius: 10,
    paddingVertical: 10,
    gap: 6,
  },

  checkoutText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
  },

  termsText: {
    marginTop: 8,
    fontSize: 12,
    textAlign: "center",
    color: "#010D26",
  },
});
