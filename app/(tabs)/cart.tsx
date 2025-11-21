import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBasket } from "../../context/BasketContext";
import { Image as ExpoImage } from "expo-image";
import LoadingScreen from "../../components/LoadingScreen";
import { useAuth } from "../../context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";

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

export default function CartScreen() {
  const {
    items,
    isLoading,
    itemCount,
    totalAmount,
    removeItem,
    refreshBasket,
    clearBasket,
  } = useBasket();
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshBasket();
    setRefreshing(false);
  };

  const handleRemoveItem = (campaignId: number, donationItem?: string) => {
    Alert.alert(
      "Remove Item",
      "Are you sure you want to remove this item from your cart?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await removeItem(campaignId, donationItem);
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to remove item");
            }
          },
        },
      ]
    );
  };

  const handleCheckout = () => {
    // if (!isAuthenticated) {
    //   Alert.alert("Login Required", "Please login to proceed with checkout", [
    //     { text: "Cancel", style: "cancel" },
    //     {
    //       text: "Login",
    //       onPress: () => router.push("/login"),
    //     },
    //   ]);
    //   return;
    // }

    if (items.length === 0) {
      Alert.alert("Empty Cart", "Your cart is empty");
      return;
    }

    // Navigate to checkout (to be implemented)
    // Alert.alert("Checkout", "Checkout functionality coming soon!");
    router.push("/checkout");
  };

  // Calculate totals
  const processingFee = 0.03; // 3%
  const subtotal = items.reduce((sum, item) => {
    const checkoutType = item.checkoutType || item.Campaign?.checkoutType;
    if (checkoutType === "ADEEQAH_GENERAL_SACRIFICE") {
      return sum + parseFloat(item.total?.toString() || "0");
    } else {
      return (
        sum +
        parseFloat(item.amount?.toString() || item.total?.toString() || "0") *
          parseFloat(item.quantity?.toString() || "1")
      );
    }
  }, 0);
  const processingAmount = (subtotal * processingFee).toFixed(2);
  const total = subtotal + parseFloat(processingAmount);

  if (isLoading) {
    return <LoadingScreen message="Loading cart..." />;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={styles.emptyTitle}>Your basket is empty</Text>
            <Text style={styles.emptyDescription}>
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
          <>
            {/* Cart Header */}
            <View style={styles.cartHeaderContainer}>
              <LinearGradient
                colors={["#264B8B", "#5B8FD8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.cartHeaderGradient}
              >
                <View style={styles.cartHeaderContent}>
                  <View style={styles.cartIconContainer}>
                    <Text style={styles.cartIcon}>🛒</Text>
                  </View>
                  <View style={{ marginLeft: 8 }}>
                    <Text style={styles.cartHeaderTitle}>
                      Your Cart ({items.length})
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {/* Cart Items */}
            <View style={styles.cartItemsContainer}>
              {items.map((item, index) => {
                const checkoutType =
                  item.checkoutType || item.Campaign?.checkoutType;
                const isAdeeqah = checkoutType === "ADEEQAH_GENERAL_SACRIFICE";
                const quantity = isAdeeqah
                  ? parseInt(item.riceQuantity?.toString() || "1")
                  : item.quantity || 1;
                const price = parseFloat(
                  item.amount?.toString() || item.ricePrice?.toString() || "0"
                );
                const total = parseFloat(item.total?.toString() || "0");
                const isCommonORZaqat = [
                  "ZAQAT",
                  "COMMON",
                  "WATER_CAMPAIGN",
                  "KURBAN",
                ].includes(checkoutType || "");

                return (
                  <View key={item.id || index} style={styles.cartItem}>
                    <View style={styles.cartItemContent}>
                      <ExpoImage
                        source={{
                          uri:
                            item.coverImage ||
                            item.Campaign?.coverImage ||
                            "https://via.placeholder.com/64",
                        }}
                        style={styles.itemImage}
                        contentFit="cover"
                      />
                      <View style={[styles.itemDetails, { marginLeft: 12 }]}>
                        <Text style={styles.itemName} numberOfLines={2}>
                          {item.name || item.Campaign?.name || "Campaign"}
                        </Text>

                        {item.isRecurring && (
                          <View
                            style={[styles.recurringBadge, { marginTop: 4 }]}
                          >
                            <Text style={styles.recurringIcon}>🔄</Text>
                            <Text style={styles.recurringText}>
                              {getRecurringLabel(item.periodDays)} donation
                            </Text>
                          </View>
                        )}

                        {item.donationItem && (
                          <Text style={[styles.donationItem, { marginTop: 4 }]}>
                            {item.donationItem}
                          </Text>
                        )}

                        <View style={styles.itemPriceRow}>
                          <Text style={styles.itemTotalPrice}>
                            ${formatPrice(total)}
                          </Text>
                          {isCommonORZaqat && quantity > 1 && (
                            <Text style={styles.itemUnitPrice}>
                              (${formatPrice(price)} each)
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() =>
                        handleRemoveItem(item.campaignId, item.donationItem)
                      }
                    >
                      <Text style={styles.removeButtonText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>

            {/* Order Summary */}
            <View style={styles.orderSummaryContainer}>
              <LinearGradient
                colors={["#264B8B", "#5B8FD8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.summaryHeaderGradient}
              >
                <View style={styles.summaryHeaderContent}>
                  <View style={styles.summaryIconContainer}>
                    <Text style={styles.summaryIcon}>🛡️</Text>
                  </View>
                  <View style={{ marginLeft: 8 }}>
                    <Text style={styles.summaryHeaderTitle}>Order Summary</Text>
                  </View>
                </View>
              </LinearGradient>

              <View style={styles.summaryContent}>
                <View style={styles.summaryHeaderRow}>
                  <Text style={styles.summaryHeaderText}>Order Summary</Text>
                  <View style={styles.itemCountBadge}>
                    <Text style={styles.itemCountText}>
                      {items.length} {items.length === 1 ? "item" : "items"}
                    </Text>
                  </View>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>
                    ${formatPrice(subtotal)}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <View style={styles.feeRow}>
                    <Text style={styles.summaryLabel}>Processing Fee (3%)</Text>
                    <Text style={styles.helpIcon}>ℹ️</Text>
                  </View>
                  <Text style={styles.summaryValue}>
                    ${formatPrice(parseFloat(processingAmount))}
                  </Text>
                </View>

                <View style={styles.summaryDivider} />

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>${formatPrice(total)}</Text>
                </View>

                <Text style={styles.charityNote}>
                  100% of your donation goes to charity
                </Text>

                {isAuthenticated && user && (
                  <View style={styles.anonymousContainer}>
                    <Switch
                      value={isAnonymous}
                      onValueChange={setIsAnonymous}
                      trackColor={{
                        false: "#e0e0e0",
                        true: "#264B8B",
                      }}
                      thumbColor={isAnonymous ? "#fff" : "#f4f3f4"}
                    />
                    <Text style={styles.anonymousLabel}>
                      Anonymous Checkout
                    </Text>
                    <View style={{ marginLeft: 8 }}>
                      <Text style={styles.helpIconSmall}>ℹ️</Text>
                    </View>
                  </View>
                )}

                <TouchableOpacity
                  style={[
                    styles.checkoutButton,
                    (subtotal <= 0 ||
                      items.some(
                        (item) =>
                          parseFloat(item.total?.toString() || "0") === 0
                      )) &&
                      styles.checkoutButtonDisabled,
                  ]}
                  onPress={handleCheckout}
                  disabled={
                    subtotal <= 0 ||
                    items.some(
                      (item) => parseFloat(item.total?.toString() || "0") === 0
                    )
                  }
                >
                  <Text style={styles.checkoutButtonText}>
                    Proceed to Checkout
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 16,
    opacity: 0.3,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: "#264B8B",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  // Cart Header
  cartHeaderContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 6,
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cartHeaderGradient: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  cartHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  cartIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  cartIcon: {
    fontSize: 16,
  },
  cartHeaderTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  // Cart Items Container
  cartItemsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cartItem: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    alignItems: "center",
  },
  cartItemContent: {
    flex: 1,
    flexDirection: "row",
  },
  itemImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: "#e0e0e0",
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    lineHeight: 20,
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
  donationItem: {
    fontSize: 12,
    color: "#666",
  },
  itemPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  itemTotalPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#264B8B",
  },
  itemUnitPrice: {
    fontSize: 12,
    color: "#999",
    marginLeft: 8,
  },
  removeButton: {
    padding: 8,
    marginLeft: 8,
  },
  removeButtonText: {
    fontSize: 18,
  },
  // Order Summary
  orderSummaryContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryHeaderGradient: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  summaryHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  summaryIcon: {
    fontSize: 16,
  },
  summaryHeaderTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  summaryContent: {
    padding: 16,
  },
  summaryHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  summaryHeaderText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  itemCountBadge: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  itemCountText: {
    fontSize: 11,
    color: "#666",
    fontWeight: "500",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  feeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  helpIcon: {
    fontSize: 14,
    color: "#999",
    marginLeft: 6,
  },
  helpIconSmall: {
    fontSize: 12,
    color: "#999",
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#264B8B",
  },
  charityNote: {
    fontSize: 11,
    color: "#999",
    textAlign: "right",
    marginBottom: 16,
  },
  anonymousContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  anonymousLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginLeft: 8,
  },
  checkoutButton: {
    backgroundColor: "#264B8B",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  checkoutButtonDisabled: {
    backgroundColor: "#ccc",
    opacity: 0.6,
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
