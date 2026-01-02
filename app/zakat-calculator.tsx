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
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
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

              <View style={styles.pickerWrap}>
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
                >
                  <Picker.Item label="Grams" value="gram" />
                  <Picker.Item label="Ounces" value="ounce" />
                </Picker>
              </View>
            </View>

            {/* SILVER */}
            <Text style={styles.label}>Zakatable Silver</Text>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
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

              <View style={styles.pickerWrap}>
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

  /* ---------------- RENDER ---------------- */

  return (
    <View style={styles.container}>
      <ZakatSummaryModal
        visible={summaryOpen}
        onClose={() => setSummaryOpen(false)}
      />

      {/* HEADER */}
      <View style={styles.headerWrapper}>
        <TouchableOpacity
          style={{
            position: "absolute",
            top: 16,
            left: 16,
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
          }}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={22} color="#264B8B" />
        </TouchableOpacity>
        <Image
          source={require("@/assets/card1.png")}
          style={styles.headerImage}
        />

        <LinearGradient
          colors={["transparent", "rgba(38,75,139,0.6)", "rgba(38,75,139,0.9)"]}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Zakat Calculator</Text>
          <Text style={styles.headerSubtitle}>
            Accurately determine your Zakat with our scholar-verified
            calculator.
          </Text>
        </View>
      </View>

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
        <View>
          <Text style={styles.footerTitle}>Your estimated Zakat Payment</Text>
          <Text style={styles.footerSub}>
            Based on 2.5% of Zakatable Wealth
          </Text>
        </View>

        <TouchableOpacity
          style={styles.reviewWrap}
          onPress={() => setSummaryOpen(true)}
        >
          <Text style={styles.footerAmount}>AUD {zakat.toFixed(2)}</Text>

          <View style={styles.reviewRow}>
            <Text style={styles.reviewText}>Review Summary</Text>
            <Ionicons name="chevron-forward" size={14} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.nextBtn}
        onPress={() => dispatch(zakatStep(1))}
      >
        <Text style={styles.nextText}>Next</Text>
        <Ionicons name="chevron-forward" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F7FB" },

  headerWrapper: { height: 220 },
  headerImage: { width: "100%", height: "100%", position: "absolute" },
  headerContent: { position: "absolute", bottom: 20, left: 16, right: 16 },
  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "700" },
  headerSubtitle: { color: "#E6ECFF", fontSize: 14, marginTop: 6 },

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
    width: 120,
    backgroundColor: "#F0F2FF",
    borderRadius: 8,
    overflow: "hidden",
  },

  footer: {
    backgroundColor: "#5661E9",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerTitle: { color: "#E6E8FF", fontSize: 12 },
  footerSub: { color: "#C7CCFF", fontSize: 11 },
  footerAmount: { color: "#fff", fontSize: 18, fontWeight: "700" },
  reviewWrap: { alignItems: "flex-end" },
  reviewRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  reviewText: { color: "#fff", fontSize: 12 },

  nextBtn: {
    backgroundColor: "#244180",
    padding: 10,
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 10,
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
});
