import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Button from "../Button";
import { zakatResetInput } from "@/store/reduxSlice/zakatSlice";
import { addBasketItem, getBasketItems } from "@/store/reduxSlice/basketSlice";
import { useAppDispatch } from "@/hooks/useAppDispatch";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function ZakatSummaryModal({ visible, onClose }: Props) {
  const dispatch = useAppDispatch();
  const { amounts, prices } = useSelector(
    (state: any) => state.zakatCalculator
  );
  const isLoggedIn = useSelector(
    (state: any) => !!state.authentication.auth?.token
  );

  const [loading, setLoading] = useState(false);

  /* =====================================================
     ✅ CALCULATIONS — MATCHES WEB EXACTLY
     ===================================================== */

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

  // ✅ AUD prices directly (NO USD CONVERSION)
  const goldPriceAud = Number(prices.price?.goldPriceInAud || 0);
  const silverPriceAud = Number(prices.silverFinePriceInAud || 0);

  // ✅ Nisab (AUD)
  const goldNisab = 87.48 * goldPriceAud;
  const silverNisab = 612.36 * silverPriceAud;

  // ✅ Zakat (based on SILVER nisab)
  const zakatOwed = zakatableWealth >= silverNisab ? zakatableWealth / 40 : 0;

  /* =====================================================
     ✅ ADD TO BASKET — SAME AS OLD STEP 5
     ===================================================== */

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
        // ✅ LOGGED-IN USER → API
        await dispatch(addBasketItem(zakatItem)).unwrap();
        dispatch(getBasketItems());
      } else {
        // ✅ GUEST USER → ASYNC STORAGE
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
    } catch (error) {
      Alert.alert(
        "Error",
        "Something went wrong while adding Zakat to basket."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     UI — UNCHANGED
     ===================================================== */

  return (
    <Modal transparent animationType="slide" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* ===== TOP ===== */}
          <View style={styles.topContainer}>
            <Text style={styles.title}>Your estimated Zakat Payment</Text>

            <View style={styles.amountBox}>
              <Text style={styles.amountText}>AUD {zakatOwed.toFixed(2)}</Text>
            </View>

            {[
              { label: "Total Assets", value: totalAssets },
              { label: "Total Liabilities", value: totalLiabilities },
              { label: "Zakatable Wealth", value: zakatableWealth },
              { label: "Zakat Owed", value: zakatOwed },
            ].map((i) => (
              <View key={i.label} style={styles.row}>
                <Text style={styles.rowTextLeft}>{i.label}</Text>
                <Text style={styles.rowTextRight}>{i.value.toFixed(2)}</Text>
              </View>
            ))}

            <View style={{ marginTop: 16 }}>
              <Button
                label="Pay Zakat Now"
                variant="secondary"
                onPress={handlePayZakat}
                disabled={loading}
              />

              <TouchableOpacity
                onPress={() => {
                  dispatch(zakatResetInput());
                  onClose();
                }}
              >
                <Text style={styles.resetText}>Reset</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.gap} />

          {/* ===== BOTTOM ===== */}
          <View style={styles.bottomContainer}>
            <Text style={styles.subTitle}>
              Calculation is Based on Silver NISAB
            </Text>

            <View style={styles.rowDark}>
              <Text style={styles.darkTextLeft}>
                Current price of gold per gram (24K)
              </Text>
              <Text style={styles.darkTextRight}>
                {goldPriceAud.toFixed(2)} AUD
              </Text>
            </View>

            <View style={styles.rowDark}>
              <Text style={styles.darkTextLeft}>
                Current price of silver per gram (Fine)
              </Text>
              <Text style={styles.darkTextRight}>
                {silverPriceAud.toFixed(2)} AUD
              </Text>
            </View>

            <View style={styles.nisabRow}>
              <View style={styles.goldBox}>
                <Text style={styles.nisabText}>Gold Nisab</Text>
                <Text style={styles.nisabText}>{goldNisab.toFixed(2)} AUD</Text>
              </View>

              <View style={styles.silverBox}>
                <Text style={styles.nisabTextDark}>Silver Nisab</Text>
                <Text style={styles.nisabTextDark}>
                  {silverNisab.toFixed(2)} AUD
                </Text>
              </View>
            </View>

            {prices.price?.updatedAt && (
              <View style={styles.footer}>
                <Ionicons name="reload" size={16} color="#555" />
                <Text style={styles.footerText}>
                  Prices were last updated at{" "}
                  {new Date(prices.price.updatedAt).toLocaleString()}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

/* ================= STYLES (UNCHANGED) ================= */

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    overflow: "hidden",
    backgroundColor: "transparent",
    minWidth: 320,
    width: "90%",
    alignSelf: "center",
    borderRadius: 20,
    elevation: 10,
  },
  gap: {
    height: 12,
    backgroundColor: "rgba(0,0,0,0.9)",
  },
  topContainer: {
    backgroundColor: "#1E6EF2",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 12,
  },
  amountBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginBottom: 16,
  },
  amountText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E6EF2",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.4)",
    paddingVertical: 8,
  },
  rowTextLeft: {
    color: "#FFFFFFCC",
    fontSize: 14,
  },
  rowTextRight: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  resetText: {
    color: "#fff",
    textAlign: "center",
    textDecorationLine: "underline",
    marginTop: 8,
  },
  bottomContainer: {
    backgroundColor: "#fff",
    padding: 12,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  subTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    color: "#010D26",
  },
  rowDark: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingVertical: 8,
  },
  darkTextLeft: {
    fontSize: 14,
    color: "#010D26",
    opacity: 0.7,
  },
  darkTextRight: {
    fontSize: 14,
    color: "#010D26",
    fontWeight: "600",
  },
  nisabRow: {
    flexDirection: "row",
    marginTop: 16,
    gap: 6,
  },
  goldBox: {
    flex: 1,
    backgroundColor: "#FFD60233",
    padding: 6,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  silverBox: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 6,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  nisabText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#010D26",
    opacity: 0.7,
  },
  nisabTextDark: {
    fontSize: 13,
    fontWeight: "600",
    color: "#010D26",
    opacity: 0.7,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    gap: 6,
  },
  footerText: {
    fontSize: 12,
    color: "#666",
  },
});
