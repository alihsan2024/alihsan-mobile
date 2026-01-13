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

const formatPrice = (price: number): string => {
  return !isNaN(price)
    ? price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "0.00";
};

export default function ZakatCalculatorScreen() {
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const { step, amounts, prices } = useSelector(
    (state: any) => state.zakatCalculator
  );

  const [summaryOpen, setSummaryOpen] = useState(false);
  const [goldDropdownOpen, setGoldDropdownOpen] = useState(false);
  const [silverDropdownOpen, setSilverDropdownOpen] = useState(false);

  useEffect(() => {
    dispatch(getMetalPrices());
    return () => {
      dispatch(resetZakatInput());
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
    setGoldDropdownOpen(false);
    setSilverDropdownOpen(false);
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

  // Helper function to calculate metal value in AUD
  const calculateMetalValue = (
    weight: number,
    unit: string,
    pricePerGram: number
  ): number => {
    if (!weight || !pricePerGram) return 0;
    const weightInGrams = unit === "ounce" ? weight * 31.1035 : weight;
    return weightInGrams * pricePerGram;
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <Text style={styles.sectionTitle}>Cash & Bank</Text>

            <Text style={styles.label}>Cash on Hand</Text>
            <View style={styles.inputWithPrefix}>
              <Text style={styles.prefix}>$</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={amounts.cash?.toString() || ""}
                onChangeText={(v) =>
                  dispatch(zakatInput({ name: "cash", value: Number(v) }))
                }
              />
            </View>
            <Text style={styles.tip}>
              Physical cash you currently have in your possession
            </Text>

            <Text style={styles.label}>Balance Held in Bank Accounts</Text>
            <View style={styles.inputWithPrefix}>
              <Text style={styles.prefix}>$</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={amounts.bank?.toString() || ""}
                onChangeText={(v) =>
                  dispatch(zakatInput({ name: "bank", value: Number(v) }))
                }
              />
            </View>
            <Text style={styles.tip}>
              Total balance across all your savings and checking accounts
            </Text>
          </>
        );

      case 2:
        return (
          <>
            <Text style={styles.sectionTitle}>Assets</Text>

            <Text style={styles.label}>Annual Profit Of Investment Held</Text>
            <View style={styles.inputWithPrefix}>
              <Text style={styles.prefix}>$</Text>
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
            </View>
            <Text style={styles.tip}>
              Yearly profit earned from your investments
            </Text>

            <Text style={styles.label}>Resale Value Of Share</Text>
            <View style={styles.inputWithPrefix}>
              <Text style={styles.prefix}>$</Text>
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
            </View>
            <Text style={styles.tip}>
              Current market value of your shares if sold today
            </Text>

            <Text style={styles.label}>Merchandise & Profits</Text>
            <View style={styles.inputWithPrefix}>
              <Text style={styles.prefix}>$</Text>
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
            </View>
            <Text style={styles.tip}>
              Value of goods you own for business or resale purposes
            </Text>
          </>
        );

      case 3:
        return (
          <>
            <Text style={styles.sectionTitle}>Gold & Silver</Text>

            {/* GOLD */}
            <Text style={styles.label}>Zakatable Gold</Text>
            <View style={[styles.row, { alignItems: "center" }]}>
              <View
                style={[styles.inputWithPrefix, { flex: 1, marginBottom: 0 }]}
              >
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={amounts.gold?.[0]?.weight?.toString() || ""}
                  placeholder="0"
                  onChangeText={(v) => {
                    const weight = Number(v) || 0;
                    const unit = amounts.gold?.[0]?.unit || "gram";
                    const calculatedValue = calculateMetalValue(
                      weight,
                      unit,
                      goldPriceAud
                    );
                    dispatch(
                      zakatMetalInput({
                        name: "gold",
                        key: 0,
                        weight,
                        value: calculatedValue,
                        unit,
                        type: "gold",
                      })
                    );
                  }}
                />
              </View>
              <View style={styles.dropdownContainer}>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setGoldDropdownOpen(!goldDropdownOpen)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dropdownText}>
                    {amounts.gold?.[0]?.unit === "ounce" ? "Ounces" : "Grams"}
                  </Text>
                  <Ionicons
                    name={goldDropdownOpen ? "chevron-up" : "chevron-down"}
                    size={16}
                    color="#264B8B"
                  />
                </TouchableOpacity>
                {goldDropdownOpen && (
                  <View style={styles.dropdownMenu}>
                    <TouchableOpacity
                      style={[styles.dropdownItem, { borderBottomWidth: 1 }]}
                      onPress={() => {
                        const weight = amounts.gold?.[0]?.weight || 0;
                        const calculatedValue = calculateMetalValue(
                          weight,
                          "gram",
                          goldPriceAud
                        );
                        dispatch(
                          zakatMetalInput({
                            name: "gold",
                            key: 0,
                            weight,
                            value: calculatedValue,
                            unit: "gram",
                            type: "gold",
                          })
                        );
                        setGoldDropdownOpen(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          amounts.gold?.[0]?.unit === "gram" &&
                            styles.dropdownItemTextActive,
                        ]}
                      >
                        Grams
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => {
                        const weight = amounts.gold?.[0]?.weight || 0;
                        const calculatedValue = calculateMetalValue(
                          weight,
                          "ounce",
                          goldPriceAud
                        );
                        dispatch(
                          zakatMetalInput({
                            name: "gold",
                            key: 0,
                            weight,
                            value: calculatedValue,
                            unit: "ounce",
                            type: "gold",
                          })
                        );
                        setGoldDropdownOpen(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          amounts.gold?.[0]?.unit === "ounce" &&
                            styles.dropdownItemTextActive,
                        ]}
                      >
                        Ounces
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
            <Text style={[styles.tip, { marginTop: 4 }]}>
              Total weight of gold you own (jewelry, coins, bars)
            </Text>
            {amounts.gold?.[0]?.value > 0 && (
              <Text style={styles.valueDisplay}>
                Value: ${formatPrice(amounts.gold?.[0]?.value || 0)}
              </Text>
            )}

            {/* SILVER */}
            <Text style={styles.label}>Zakatable Silver</Text>
            <View style={[styles.row, { alignItems: "center" }]}>
              <View
                style={[styles.inputWithPrefix, { flex: 1, marginBottom: 0 }]}
              >
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={amounts.silver?.[0]?.weight?.toString() || ""}
                  placeholder="0"
                  onChangeText={(v) => {
                    const weight = Number(v) || 0;
                    const unit = amounts.silver?.[0]?.unit || "gram";
                    const calculatedValue = calculateMetalValue(
                      weight,
                      unit,
                      silverPriceAud
                    );
                    dispatch(
                      zakatMetalInput({
                        name: "silver",
                        key: 0,
                        weight,
                        value: calculatedValue,
                        unit,
                        type: "silver",
                      })
                    );
                  }}
                />
              </View>
              <View style={styles.dropdownContainer}>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setSilverDropdownOpen(!silverDropdownOpen)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dropdownText}>
                    {amounts.silver?.[0]?.unit === "ounce" ? "Ounces" : "Grams"}
                  </Text>
                  <Ionicons
                    name={silverDropdownOpen ? "chevron-up" : "chevron-down"}
                    size={16}
                    color="#264B8B"
                  />
                </TouchableOpacity>
                {silverDropdownOpen && (
                  <View style={styles.dropdownMenu}>
                    <TouchableOpacity
                      style={[styles.dropdownItem, { borderBottomWidth: 1 }]}
                      onPress={() => {
                        const weight = amounts.silver?.[0]?.weight || 0;
                        const calculatedValue = calculateMetalValue(
                          weight,
                          "gram",
                          silverPriceAud
                        );
                        dispatch(
                          zakatMetalInput({
                            name: "silver",
                            key: 0,
                            weight,
                            value: calculatedValue,
                            unit: "gram",
                            type: "silver",
                          })
                        );
                        setSilverDropdownOpen(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          amounts.silver?.[0]?.unit === "gram" &&
                            styles.dropdownItemTextActive,
                        ]}
                      >
                        Grams
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => {
                        const weight = amounts.silver?.[0]?.weight || 0;
                        const calculatedValue = calculateMetalValue(
                          weight,
                          "ounce",
                          silverPriceAud
                        );
                        dispatch(
                          zakatMetalInput({
                            name: "silver",
                            key: 0,
                            weight,
                            value: calculatedValue,
                            unit: "ounce",
                            type: "silver",
                          })
                        );
                        setSilverDropdownOpen(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          amounts.silver?.[0]?.unit === "ounce" &&
                            styles.dropdownItemTextActive,
                        ]}
                      >
                        Ounces
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
            <Text style={[styles.tip, { marginTop: 4 }]}>
              Total weight of silver you own (jewelry, coins, bars)
            </Text>
            {amounts.silver?.[0]?.value > 0 && (
              <Text style={styles.valueDisplay}>
                Value: ${formatPrice(amounts.silver?.[0]?.value || 0)}
              </Text>
            )}
          </>
        );

      case 4:
        return (
          <>
            <Text style={styles.sectionTitle}>Liabilities</Text>

            <Text style={styles.label}>
              Total Amount Of Awaiting Receivable Loans
            </Text>
            <View style={styles.inputWithPrefix}>
              <Text style={styles.prefix}>$</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={amounts.loan?.toString() || ""}
                onChangeText={(v) =>
                  dispatch(zakatInput({ name: "loan", value: Number(v) }))
                }
              />
            </View>
            <Text style={styles.tip}>
              Money you owe to others that you need to pay back
            </Text>

            <Text style={styles.label}>Other Zakatable Wealth</Text>
            <View style={styles.inputWithPrefix}>
              <Text style={styles.prefix}>$</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={amounts.other?.toString() || ""}
                onChangeText={(v) =>
                  dispatch(zakatInput({ name: "other", value: Number(v) }))
                }
              />
            </View>
            <Text style={styles.tip}>
              Any other wealth that qualifies for Zakat calculation
            </Text>
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
      <View style={styles.headerWrapper}>
        <Image
          source={require("@/assets/zakat-bg.png")}
          style={styles.headerImage}
        />

        <LinearGradient
          colors={["transparent", "rgba(38,75,139,0.6)", "rgba(38,75,139,0.9)"]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Zakat Calculator</Text>
          <Text style={styles.headerSubtitle}>
            Accurately determine your Zakat with our scholar-verified
            calculator, ensuring your contribution is precise and impactful.
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
            activeOpacity={0.7}
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

      <View style={styles.buttonSection}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => {
              if (step === 1) {
                router.push("/(tabs)/");
              } else {
                dispatch(zakatStep(-1));
              }
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name={step === 1 ? "home" : "chevron-back"}
              size={16}
              color="#264B8B"
            />
            <Text style={styles.backText}>{step === 1 ? "Home" : "Back"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.nextBtn}
            onPress={() => {
              if (step === 4) {
                setSummaryOpen(true);
              } else {
                dispatch(zakatStep(1));
              }
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.nextText}>
              {step === 4 ? "Finish" : "Next"}
            </Text>
            {step !== 4 && (
              <Ionicons name="chevron-forward" size={16} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>
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

  tabs: {
    flexDirection: "row",
    marginTop: 20,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  tabWrap: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 4,
  },
  tabLine: {
    height: 4,
    width: "100%",
    borderRadius: 4,
    marginBottom: 8,
  },
  tabActive: {
    backgroundColor: "#264B8B",
  },
  tabInactive: {
    backgroundColor: "#E5E7EB",
  },
  tabText: {
    fontSize: 11,
    color: "#9AA0B5",
    textAlign: "center",
    fontWeight: "500",
  },
  tabTextActive: {
    color: "#264B8B",
    fontWeight: "600",
  },

  content: { padding: 20, paddingTop: 28 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
    color: "#010D26",
  },
  label: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 8,
    fontWeight: "500",
  },
  tip: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: -12,
    marginBottom: 16,
    fontStyle: "italic",
    lineHeight: 14,
  },
  valueDisplay: {
    fontSize: 12,
    color: "#264B8B",
    fontWeight: "600",
    marginTop: -10,
    marginBottom: 16,
  },
  inputWithPrefix: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
    paddingLeft: 12,
  },
  prefix: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
    marginRight: 4,
  },
  input: {
    flex: 1,
    backgroundColor: "transparent",
    borderWidth: 0,
    padding: 12,
    paddingLeft: 0,
    marginBottom: 0,
  },

  row: { flexDirection: "row", gap: 10 },
  pickerWrap: {
    width: 140,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#010D2633",
  },
  dropdownContainer: {
    position: "relative",
    width: 140,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    height: 44,
  },
  dropdownText: {
    fontSize: 14,
    color: "#264B8B",
    fontWeight: "500",
  },
  dropdownMenu: {
    position: "absolute",
    top: 48,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
    overflow: "hidden",
  },
  dropdownItem: {
    padding: 12,
    borderBottomColor: "#F3F4F6",
  },
  dropdownItemText: {
    fontSize: 14,
    color: "#6B7280",
  },
  dropdownItemTextActive: {
    color: "#264B8B",
    fontWeight: "600",
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

  buttonSection: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
  },
  backBtn: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#264B8B",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
    minHeight: 44,
  },
  backText: {
    color: "#264B8B",
    fontSize: 15,
    fontWeight: "600",
  },
  nextBtn: {
    flex: 1,
    backgroundColor: "#244180",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
    minHeight: 44,
  },
  nextText: {
    color: "#fff",
    fontSize: 15,
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
