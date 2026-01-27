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
import { addBasketItem, getBasketItems } from "@/store/reduxSlice/basketSlice";
import { useAppDispatch } from "@/hooks/useAppDispatch";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function ZakatSummaryModal({ visible, onClose }: Props) {
  const dispatch = useAppDispatch();

  const { amounts, prices, step } = useSelector(
    (state: any) => state.zakatCalculator
  );
  const isLoggedIn = useSelector(
    (state: any) => !!state.authentication.auth?.token
  );

  const [loading, setLoading] = useState(false);

  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.88)).current;

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

  const sumArray = (arr: any[] = []) =>
    arr.reduce((s, i) => s + (i.value || 0), 0);

  const totalAssets =
    (amounts.cash || 0) +
    (amounts.bank || 0) +
    sumArray(amounts.gold) +
    sumArray(amounts.silver) +
    (amounts.investmentProfit || 0) +
    (amounts.shareResale || 0) +
    (amounts.merchandise || 0) +
    (amounts.loan || 0) +
    (amounts.other || 0);

  const totalLiabilities = 0;
  const zakatableWealth = totalAssets - totalLiabilities;

  const goldPriceAud = Number(prices.price?.goldPriceInAud || 0);
  const silverPriceAud = Number(prices.silverFinePriceInAud || 0);

  const goldNisab = 87.48 * goldPriceAud;
  const silverNisab = 612.36 * silverPriceAud;

  const zakatOwed = zakatableWealth >= silverNisab ? zakatableWealth / 40 : 0;

  const handlePayZakat = async () => {
    if (zakatOwed <= 0) {
      Alert.alert(
        "Zakat Not Due",
        "You are not required to pay Zakat as your wealth is below the Nisab."
      );
      return;
    }

    setLoading(true);

    try {
      const zakatItem = {
        campaignId: "zakat",
        name: "Zakat Payment",
        coverImage: "",
        amount: Number(zakatOwed.toFixed(2)),
        total: Number(zakatOwed.toFixed(2)),
        isRecurring: false,
        custom: false,
        checkoutType: "ZAQAT",
      };

      if (isLoggedIn) {
        await dispatch(addBasketItem(zakatItem)).unwrap();
        dispatch(getBasketItems());
      } else {
        const guestData = await AsyncStorage.getItem("guestBasket");
        const guestBasket = guestData ? JSON.parse(guestData) : [];

        const index = guestBasket.findIndex(
          (item: any) => item.campaignId === "zakat"
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
    } catch {
      Alert.alert(
        "Error",
        "Something went wrong while adding Zakat to basket."
      );
    } finally {
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
              <Text style={styles.summaryTitle}>Your Estimated Zakat Payment</Text>

              <View style={styles.amountContainer}>
                <Text style={styles.amountLabel}>Total Amount</Text>
                <Text style={styles.amountValue}>
                  {formatCurrency(zakatOwed)}
                </Text>
              </View>

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
            </LinearGradient>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.payButton}
                onPress={handlePayZakat}
                disabled={loading || zakatOwed <= 0}
                activeOpacity={0.8}
              >
                <Text style={styles.payButtonText}>
                  {loading ? "Processing..." : "Pay Zakat Now"}
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#010D26" />
              </TouchableOpacity>

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
            </View>

            {/* Details Card */}
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
