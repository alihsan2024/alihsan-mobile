import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Easing,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Button from "../Button";
import { zakatResetInput, zakatStep } from "@/store/reduxSlice/zakatSlice";
import {
  useAddToBasketMutation,
  useGetBasketQuery,
  useRemoveFromBasketMutation,
} from "@/store/reduxSlice/api/basketApi";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { getAnyZakatCampaign } from "@/utils/api";
import {
  areMetalPricesReady,
  computeNisabAud,
  computeTotalWealth,
  computeZakatDue,
} from "@/utils/zakatCalculator";

type Props = {
  visible: boolean;
  onClose: () => void;
  /** When set, use this amount instead of calculating from form (for "I already know my zakat amount" flow) */
  overrideZakatAmount?: number | null;
};

export default function ZakatSummaryModal({ visible, onClose, overrideZakatAmount }: Props) {
  const dispatch = useAppDispatch();
  const { amounts, prices, step } = useSelector(
    (state: any) => state.zakatCalculator
  );
  const { user } = useSelector((state: any) => state.authentication);
  const isLoggedIn = !!user;

  const [addToBasket] = useAddToBasketMutation();
  const [removeFromBasket] = useRemoveFromBasketMutation();
  const { data: basketData } = useGetBasketQuery(undefined, {
    skip: !visible || !isLoggedIn,
  });

  const [loading, setLoading] = useState(false);
  const [zakatCampaign, setZakatCampaign] = useState<any>(null);

  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.88)).current;
  const isFetchingCampaignRef = useRef(false);
  const isSubmittingRef = useRef(false);
  const visibleRef = useRef(visible);
  visibleRef.current = visible;

  // Fetch zakat campaign when modal opens (single call; guard against Strict Mode double-mount)
  useEffect(() => {
    if (!visible) {
      isFetchingCampaignRef.current = false;
      return;
    }
    if (isFetchingCampaignRef.current) return;
    isFetchingCampaignRef.current = true;

    const fetchZakatCampaign = async () => {
      try {
        const campaign = await getAnyZakatCampaign();
        if (visibleRef.current) setZakatCampaign(campaign);
      } catch (error) {
        if (__DEV__) console.error("Error fetching zakat campaign:", error);
      } finally {
        isFetchingCampaignRef.current = false;
      }
    };
    fetchZakatCampaign();
  }, [visible]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 320,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.03,
            duration: 260,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.spring(scale, {
            toValue: 1,
            friction: 6,
            tension: 80,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 220,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.88,
          duration: 220,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const formatCurrency = (value: number): string => {
    return `$${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const pricesReady = areMetalPricesReady(prices);
  const goldPriceAud = Number(prices.price?.goldPriceInAud || 0);
  const silverPriceAud = Number(prices.silverFinePriceInAud || 0);
  const { goldNisabAud: goldNisab, silverNisabAud: silverNisab } = computeNisabAud(
    goldPriceAud,
    silverPriceAud
  );

  const totalAssets = computeTotalWealth(amounts);
  const totalLiabilities = 0;
  const zakatableWealth = totalAssets - totalLiabilities;
  const calculatedZakat = computeZakatDue(zakatableWealth, silverNisab, pricesReady);
  const zakatOwed = overrideZakatAmount != null && overrideZakatAmount > 0
    ? overrideZakatAmount
    : calculatedZakat;
  const isKnownAmountMode = overrideZakatAmount != null && overrideZakatAmount > 0;

  const handlePayZakat = async () => {
    if (zakatOwed <= 0) {
      Alert.alert(
        "Invalid Amount",
        isKnownAmountMode
          ? "Please enter an amount greater than 0."
          : !pricesReady
            ? "Live gold and silver prices are still loading. Please wait and try again."
            : "You are not required to pay Zakat — your wealth is below the silver nisab threshold."
      );
      return;
    }

    if (!zakatCampaign) {
      Alert.alert(
        "Error",
        "Unable to load Zakat campaign. Please try again."
      );
      return;
    }

    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setLoading(true);

    try {
      const zakatItem = {
        campaignId: zakatCampaign.id,
        name: zakatCampaign.name || "Zakat Al Maal",
        coverImage: zakatCampaign.coverImage || "",
        amount: Number(zakatOwed.toFixed(2)),
        total: Number(zakatOwed.toFixed(2)),
        quantity: 1,
        isRecurring: false,
        custom: false,
        checkoutType: "ZAQAT",
      };

      if (isLoggedIn) {
        // Ensure only one zakat in cart: remove existing zakat item then add
        const payload = basketData?.payload ?? [];
        const existingZakat = payload.find(
          (item: any) => item.campaignId === zakatCampaign.id || item.Campaign?.id === zakatCampaign.id
        );
        if (existingZakat) {
          try {
            await removeFromBasket({
              campaignId: zakatCampaign.id,
              donationItem: existingZakat.donationItem,
            }).unwrap();
          } catch {
            // Item may already be gone; proceed to add
          }
        }
        await addToBasket({ body: zakatItem }).unwrap();
      } else {
        const guestData = await AsyncStorage.getItem("guestBasket");
        const guestBasket = guestData ? JSON.parse(guestData) : [];

        const index = guestBasket.findIndex(
          (item: any) => item.campaignId === zakatCampaign.id
        );

        const updatedBasket =
          index >= 0
            ? [
                ...guestBasket.slice(0, index),
                zakatItem,
                ...guestBasket.slice(index + 1),
              ]
            : [...guestBasket, zakatItem];

        await AsyncStorage.setItem(
          "guestBasket",
          JSON.stringify(updatedBasket)
        );
      }

      Alert.alert("Success", "Zakat added to basket successfully");
      dispatch(zakatResetInput());
      onClose();
    } catch (err: any) {
      if (__DEV__) console.error("Zakat add to basket failed:", err);
      const message =
        err?.data?.message || err?.message || "Something went wrong while adding Zakat to basket.";
      Alert.alert("Error", message);
    } finally {
      isSubmittingRef.current = false;
      setLoading(false);
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View style={[styles.overlay, { opacity }]}>
        <Animated.View
          style={[styles.modalContainer, { transform: [{ scale }] }]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* CLOSE BUTTON */}
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={20} color="#010D26" />
            </TouchableOpacity>

            {/* Main Summary Card with Gradient */}
            <LinearGradient
              colors={["#6A7BFF", "#5663F7"]}
              style={styles.summaryCard}
            >
              <Text style={styles.guthenText}>Zakat Summary</Text>
              <Text style={styles.summaryTitle}>
                {isKnownAmountMode ? "Your Zakat Amount" : "Your Estimated Zakat Payment"}
              </Text>

              <View style={styles.amountContainer}>
                <Text style={styles.amountLabel}>Total Amount</Text>
                <Text style={styles.amountValue}>
                  {formatCurrency(zakatOwed)}
                </Text>
                {!isKnownAmountMode && pricesReady && calculatedZakat <= 0 && zakatableWealth > 0 && (
                  <Text style={styles.belowNisabNote}>
                    Your wealth is below the silver nisab — no Zakat is due on this calculation.
                  </Text>
                )}
              </View>

              {!isKnownAmountMode && (
                <>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryDetails}>
                    {[
                      { label: "Total Assets", value: totalAssets },
                      { label: "Total Liabilities", value: totalLiabilities },
                      { label: "Zakatable Wealth", value: zakatableWealth },
                    ].map((item) => (
                      <View key={item.label} style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>{item.label}</Text>
                        <Text style={styles.summaryValue}>
                          {formatCurrency(item.value)}
                        </Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </LinearGradient>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.payButton}
                onPress={handlePayZakat}
                disabled={loading || zakatOwed <= 0 || (!isKnownAmountMode && !pricesReady)}
                activeOpacity={0.8}
              >
                <Text style={styles.payButtonText}>
                  {loading ? "Processing..." : "Pay Zakat Now"}
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#010D26" />
              </TouchableOpacity>

              {!isKnownAmountMode && (
                <TouchableOpacity
                  onPress={() => {
                    dispatch(zakatResetInput());
                    dispatch(zakatStep(1 - step));
                    onClose();
                  }}
                  style={styles.resetButton}
                  activeOpacity={0.8}
                >
                  <Ionicons name="refresh-outline" size={16} color="#6B7280" />
                  <Text style={styles.resetText}>Reset Calculator</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Details Card - hide when user entered known amount */}
            {!isKnownAmountMode && (
            <View style={styles.detailsCard}>
              <Text style={styles.detailsTitle}>
                Calculation Details
              </Text>
              <Text style={styles.detailsSubtitle}>
                Based on Silver NISAB
              </Text>

              <View style={styles.detailsDivider} />

              <View style={styles.detailsRow}>
                <Text style={styles.detailsLabel}>
                  Gold price per gram (24K)
                </Text>
                <Text style={styles.detailsValue}>
                  {formatCurrency(goldPriceAud)}
                </Text>
              </View>

              <View style={styles.detailsRow}>
                <Text style={styles.detailsLabel}>
                  Silver price per gram (Fine)
                </Text>
                <Text style={styles.detailsValue}>
                  {formatCurrency(silverPriceAud)}
                </Text>
              </View>

              <View style={styles.nisabContainer}>
                <View style={styles.nisabCard}>
                  <Text style={styles.nisabLabel}>Gold Nisab</Text>
                  <Text style={styles.nisabValue}>
                    {formatCurrency(goldNisab)}
                  </Text>
                </View>

                <View style={[styles.nisabCard, styles.nisabCardSecondary]}>
                  <Text style={styles.nisabLabel}>Silver Nisab</Text>
                  <Text style={styles.nisabValue}>
                    {formatCurrency(silverNisab)}
                  </Text>
                </View>
              </View>

              {prices.price?.updatedAt && (
                <View style={styles.updateInfo}>
                  <Ionicons name="time-outline" size={12} color="#9CA3AF" />
                  <Text style={styles.updateText}>
                    Last updated: {new Date(prices.price.updatedAt).toLocaleString()}
                  </Text>
                </View>
              )}
            </View>
            )}
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: "100%",
    maxWidth: 400,
    maxHeight: "90%",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
    position: "relative",
  },
  scrollContent: {
    padding: 16,
  },
  closeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  summaryCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  guthenText: {
    fontSize: 20,
    fontFamily: "Guthen Bloots",
    color: "#FFD602",
    marginBottom: 4,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 16,
    fontFamily: "AlbertSans_800ExtraBold",
  },
  amountContainer: {
    marginBottom: 16,
  },
  amountLabel: {
    fontSize: 13,
    color: "#E0E4FF",
    marginBottom: 4,
    fontFamily: "AlbertSans_400Regular",
  },
  amountValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    fontFamily: "AlbertSans_800ExtraBold",
  },
  belowNisabNote: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 18,
    color: "rgba(255,255,255,0.92)",
    fontFamily: "AlbertSans_500Medium",
    textAlign: "center",
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginVertical: 16,
  },
  summaryDetails: {
    gap: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#E0E4FF",
    fontFamily: "AlbertSans_500Medium",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "AlbertSans_700Bold",
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 12,
  },
  payButton: {
    backgroundColor: "#FFD602",
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 52,
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#010D26",
    fontFamily: "AlbertSans_700Bold",
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    minHeight: 52,
  },
  resetText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    fontFamily: "AlbertSans_600SemiBold",
  },
  detailsCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#010D26",
    marginBottom: 4,
    fontFamily: "AlbertSans_800ExtraBold",
  },
  detailsSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 16,
    fontFamily: "AlbertSans_400Regular",
  },
  detailsDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginBottom: 16,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  detailsLabel: {
    fontSize: 14,
    color: "#6B7280",
    flex: 1,
    fontFamily: "AlbertSans_400Regular",
  },
  detailsValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#010D26",
    fontFamily: "AlbertSans_700Bold",
  },
  nisabContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  nisabCard: {
    flex: 1,
    backgroundColor: "#FFD602",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  nisabCardSecondary: {
    backgroundColor: "#F3F4F6",
  },
  nisabLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#010D26",
    marginBottom: 4,
    opacity: 0.7,
    fontFamily: "AlbertSans_600SemiBold",
  },
  nisabValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#010D26",
    fontFamily: "AlbertSans_700Bold",
  },
  updateInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  updateText: {
    fontSize: 11,
    color: "#9CA3AF",
    fontFamily: "AlbertSans_400Regular",
  },
});
