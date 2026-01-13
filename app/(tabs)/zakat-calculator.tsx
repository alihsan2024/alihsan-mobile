import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/store/store";

import {
  zakatInput,
  zakatStep,
  getMetalPrices,
  resetZakatInput,
  zakatMetalInput,
} from "@/store/reduxSlice/zakatSlice";

import ZakatSummaryModal from "@/components/ui/Modals/ZakatSummaryModal";
import { useRouter } from "expo-router";
import HeroBackground from "@/components/ui/GradientImage";

const STEPS = [
  { key: 1, label: "Cash & Bank" },
  { key: 2, label: "Assets" },
  { key: 3, label: "Gold, Silver" },
  { key: 4, label: "Liabilities" },
];

export default function ZakatCalculatorScreen() {
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const { step, amounts, prices } = useSelector(
    (state: any) => state.zakatCalculator
  );

  const [summaryOpen, setSummaryOpen] = useState(false);

  useEffect(() => {
    dispatch(getMetalPrices());
    return () => {
      dispatch(resetZakatInput());
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [step]);

  const sumArray = (arr: any[] = []) =>
    arr.reduce((s, i) => s + (i.value || 0), 0);

  // Total zakatable wealth
  const totalWealth =
    (amounts.cash || 0) +
    (amounts.bank || 0) +
    sumArray(amounts.gold) +
    sumArray(amounts.silver) +
    (amounts.investmentProfit || 0) +
    (amounts.shareResale || 0) +
    (amounts.merchandise || 0) +
    (amounts.loan || 0) +
    (amounts.other || 0);

  const goldPriceAud = Number(prices.price?.goldPriceInAud || 0);
  const silverPriceAud = Number(prices.silverFinePriceInAud || 0);

  const goldNisabAud = 87.48 * goldPriceAud;
  const silverNisabAud = 612.36 * silverPriceAud;

  const zakat = totalWealth >= silverNisabAud ? totalWealth / 40 : 0;

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <Text style={styles.sectionTitle}>Cash & Bank</Text>

            <Text style={styles.label}>Cash on Hand</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={amounts.cash?.toString() || ""}
              onChangeText={(v) =>
                dispatch(zakatInput({ name: "cash", value: Number(v) }))
              }
            />

            <Text style={styles.label}>Balance Held in Bank Accounts</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={amounts.bank?.toString() || ""}
              onChangeText={(v) =>
                dispatch(zakatInput({ name: "bank", value: Number(v) }))
              }
            />
          </>
        );

      case 2:
        return (
          <>
            <Text style={styles.sectionTitle}>Assets</Text>

            <Text style={styles.label}>Annual Profit Of Investment Held</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={amounts.investmentProfit?.toString() || ""}
              onChangeText={(v) =>
                dispatch(
                  zakatInput({
                    name: "investmentProfit",
                    value: Number(v),
                  })
                )
              }
            />

            <Text style={styles.label}>Resale Value Of Share</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={amounts.shareResale?.toString() || ""}
              onChangeText={(v) =>
                dispatch(
                  zakatInput({
                    name: "shareResale",
                    value: Number(v),
                  })
                )
              }
            />

            <Text style={styles.label}>Merchandise & Profits</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={amounts.merchandise?.toString() || ""}
              onChangeText={(v) =>
                dispatch(
                  zakatInput({
                    name: "merchandise",
                    value: Number(v),
                  })
                )
              }
            />
          </>
        );

      case 3:
        return (
          <>
            <Text style={styles.sectionTitle}>Gold & Silver</Text>

            {/* GOLD */}
            <Text style={styles.label}>Zakatable Gold</Text>
            <View style={[styles.row, { alignItems: "center" }]}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                keyboardType="numeric"
                value={amounts.gold?.[0]?.value?.toString() || ""}
                placeholder="0"
                onChangeText={(v) =>
                  dispatch(
                    zakatMetalInput({
                      name: "gold",
                      key: 0,
                      value: Number(v),
                      unit: amounts.gold?.[0]?.unit || "gram",
                      type: "gold",
                    })
                  )
                }
              />
              <View
                style={[
                  styles.pickerWrap,
                  { justifyContent: "center", height: 44, width: 140 },
                ]}
              >
                <Picker
                  selectedValue={amounts.gold?.[0]?.unit || "gram"}
                  onValueChange={(unit) =>
                    dispatch(
                      zakatMetalInput({
                        name: "gold",
                        key: 0,
                        value: amounts.gold?.[0]?.value || 0,
                        unit,
                        type: "gold",
                      })
                    )
                  }
                  style={{ height: 52, width: 140 }}
                  itemStyle={{ minWidth: 100 }}
                >
                  <Picker.Item label="Grams" value="gram" />
                  <Picker.Item label="Ounces" value="ounce" />
                </Picker>
              </View>
            </View>

            {/* SILVER */}
            <Text style={styles.label}>Zakatable Silver</Text>
            <View style={[styles.row, { alignItems: "center" }]}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                keyboardType="numeric"
                value={amounts.silver?.[0]?.value?.toString() || ""}
                placeholder="0"
                onChangeText={(v) =>
                  dispatch(
                    zakatMetalInput({
                      name: "silver",
                      key: 0,
                      value: Number(v),
                      unit: amounts.silver?.[0]?.unit || "gram",
                      type: "silver",
                    })
                  )
                }
              />
              <View
                style={[
                  styles.pickerWrap,
                  { justifyContent: "center", height: 44, width: 140 },
                ]}
              >
                <Picker
                  selectedValue={amounts.silver?.[0]?.unit || "gram"}
                  onValueChange={(unit) =>
                    dispatch(
                      zakatMetalInput({
                        name: "silver",
                        key: 0,
                        value: amounts.silver?.[0]?.value || 0,
                        unit,
                        type: "silver",
                      })
                    )
                  }
                  style={{ height: 52, width: 140 }}
                  itemStyle={{ minWidth: 100 }}
                >
                  <Picker.Item label="Grams" value="gram" />
                  <Picker.Item label="Ounces" value="ounce" />
                </Picker>
              </View>
            </View>
          </>
        );

      case 4:
        return (
          <>
            <Text style={styles.sectionTitle}>Liabilities</Text>

            <Text style={styles.label}>
              Total Amount Of Awaiting Receivable Loans
            </Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={amounts.loan?.toString() || ""}
              onChangeText={(v) =>
                dispatch(zakatInput({ name: "loan", value: Number(v) }))
              }
            />

            <Text style={styles.label}>Other Zakatable Wealth</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={amounts.other?.toString() || ""}
              onChangeText={(v) =>
                dispatch(zakatInput({ name: "other", value: Number(v) }))
              }
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <ZakatSummaryModal
        visible={summaryOpen}
        onClose={() => setSummaryOpen(false)}
      />

      {/* HEADER */}
      <HeroBackground
        source={require("@/assets/zakat-bg.png")}
        containerStyle={{ height: 220 }}
        showBack
      >
        <Text style={styles.headerTitle}>Zakat Calculator</Text>
        <Text style={styles.headerSubtitle}>
          Accurately determine your Zakat with our scholar-verified calculator.
        </Text>
      </HeroBackground>

      {/* TOP STEPS */}
      <View style={styles.tabs}>
        {STEPS.map((s) => (
          <TouchableOpacity
            key={s.key}
            style={styles.tabWrap}
            onPress={() => dispatch(zakatStep(s.key - step))}
          >
            <View
              style={[
                styles.tabLine,
                s.key <= step ? styles.tabActive : styles.tabInactive,
              ]}
            />
            <Text
              style={[styles.tabText, step === s.key && styles.tabTextActive]}
            >
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView ref={scrollRef} style={styles.content}>
        {renderStep()}
      </ScrollView>

      {/* FOOTER */}
      <View style={styles.footer}>
        {/* Row 1 */}
        <View style={styles.footerRow}>
          <Text style={styles.footerTitle}>Your estimated Zakat Payment</Text>
          <Text style={styles.footerAmount}>AUD {zakat.toFixed(2)}</Text>
        </View>

        {/* Divider */}
        <View style={styles.footerDivider} />

        {/* Row 2 */}
        <View style={styles.footerRow}>
          <Text style={styles.footerSub}>
            Based on 2.5% of Zakatable Wealth
          </Text>

          <TouchableOpacity
            style={styles.reviewRow}
            onPress={() => setSummaryOpen(true)}
          >
            <Text style={styles.reviewText}>Review Summary</Text>
            <Ionicons name="chevron-forward" size={14} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.nextBtn}
        onPress={() => {
          if (step === 4) {
            setSummaryOpen(true);
          } else {
            dispatch(zakatStep(1));
          }
        }}
      >
        <Text style={styles.nextText}>Next</Text>
        <Ionicons name="chevron-forward" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F7FB" },

  headerWrapper: { height: 220 },
  headerImage: { width: "100%", height: "100%", position: "absolute" },
  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "700" },
  headerSubtitle: {
    color: "#E6ECFF",
    fontSize: 14,
    marginTop: 6,
    marginBottom: 10,
  },

  tabs: { flexDirection: "row", marginTop: 16, marginHorizontal: 16 },
  tabWrap: { flex: 1, alignItems: "center", marginHorizontal: 6 },
  tabLine: { height: 4, width: "100%", borderRadius: 4 },
  tabActive: { backgroundColor: "#264B8B" },
  tabInactive: { backgroundColor: "#E5E7EB" },
  tabText: { fontSize: 11, color: "#9AA0B5" },
  tabTextActive: { color: "#264B8B", fontWeight: "600" },

  content: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 16 },
  label: { fontSize: 12, color: "#6B7280", marginBottom: 6 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    marginBottom: 16,
  },

  row: { flexDirection: "row", gap: 10 },
  pickerWrap: {
    width: 140,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#010D2633",
  },

  reviewWrap: { alignItems: "flex-end" },
  backBtn: {
    position: "absolute",
    zIndex: 10,
    backgroundColor: "#fff",
    borderRadius: 20,
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  nextBtn: {
    backgroundColor: "#244180",
    padding: 8,
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 6,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  nextText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    backgroundColor: "#246BE1",
    padding: 16,
    marginTop: 16,
  },

  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  footerDivider: {
    height: 1,
    backgroundColor: "#fff",
    opacity: 0.1,
    marginVertical: 10,
  },

  footerTitle: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.8,
  },

  footerAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },

  footerSub: {
    fontSize: 12,
    color: "#fff",
    opacity: 0.7,
  },

  reviewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  reviewText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    textDecorationLine: "underline",
  },
});
