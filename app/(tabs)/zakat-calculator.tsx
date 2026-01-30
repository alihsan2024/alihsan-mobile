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
    arr.reduce((s, i) => {
      const value = i.value || 0;
      return s + (isNaN(value) ? 0 : value);
    }, 0);

  // Total zakatable wealth
  const totalWealth = (() => {
    const cash = isNaN(amounts.cash) ? 0 : (amounts.cash || 0);
    const bank = isNaN(amounts.bank) ? 0 : (amounts.bank || 0);
    const gold = sumArray(amounts.gold);
    const silver = sumArray(amounts.silver);
    const investmentProfit = isNaN(amounts.investmentProfit) ? 0 : (amounts.investmentProfit || 0);
    const shareResale = isNaN(amounts.shareResale) ? 0 : (amounts.shareResale || 0);
    const merchandise = isNaN(amounts.merchandise) ? 0 : (amounts.merchandise || 0);
    const loan = isNaN(amounts.loan) ? 0 : (amounts.loan || 0);
    const other = isNaN(amounts.other) ? 0 : (amounts.other || 0);
    
    const total = cash + bank + gold + silver + investmentProfit + shareResale + merchandise + loan + other;
    return isNaN(total) ? 0 : total;
  })();

  const goldPriceAud = isNaN(Number(prices.price?.goldPriceInAud)) ? 0 : Number(prices.price?.goldPriceInAud || 0);
  const silverPriceAud = isNaN(Number(prices.silverFinePriceInAud)) ? 0 : Number(prices.silverFinePriceInAud || 0);

  const goldNisabAud = isNaN(87.48 * goldPriceAud) ? 0 : 87.48 * goldPriceAud;
  const silverNisabAud = isNaN(612.36 * silverPriceAud) ? 0 : 612.36 * silverPriceAud;

  const zakat = totalWealth >= silverNisabAud ? (isNaN(totalWealth / 40) ? 0 : totalWealth / 40) : 0;

  // Helper function to calculate metal value in AUD
  const calculateMetalValue = (
    weight: number,
    unit: string,
    pricePerGram: number
  ): number => {
    if (!weight || !pricePerGram || isNaN(weight) || isNaN(pricePerGram)) return 0;
    const weightInGrams = unit === "ounce" ? weight * 31.1035 : weight;
    const result = weightInGrams * pricePerGram;
    return isNaN(result) ? 0 : result;
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
                onChangeText={(v) => {
                  const numValue = Number(v) || 0;
                  dispatch(zakatInput({ name: "cash", value: isNaN(numValue) ? 0 : numValue }));
                }}
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
                onChangeText={(v) => {
                  const numValue = Number(v) || 0;
                  dispatch(zakatInput({ name: "bank", value: isNaN(numValue) ? 0 : numValue }));
                }}
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
                onChangeText={(v) => {
                  const numValue = Number(v) || 0;
                  dispatch(
                    zakatInput({
                      name: "investmentProfit",
                      value: isNaN(numValue) ? 0 : numValue,
                    })
                  );
                }}
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
                onChangeText={(v) => {
                  const numValue = Number(v) || 0;
                  dispatch(
                    zakatInput({
                      name: "shareResale",
                      value: isNaN(numValue) ? 0 : numValue,
                    })
                  );
                }}
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
                onChangeText={(v) => {
                  const numValue = Number(v) || 0;
                  dispatch(
                    zakatInput({
                      name: "merchandise",
                      value: isNaN(numValue) ? 0 : numValue,
                    })
                  );
                }}
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
                    const weight = isNaN(Number(v)) ? 0 : (Number(v) || 0);
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
                        value: isNaN(calculatedValue) ? 0 : calculatedValue,
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
                        const weight = isNaN(amounts.gold?.[0]?.weight) ? 0 : (amounts.gold?.[0]?.weight || 0);
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
                            value: isNaN(calculatedValue) ? 0 : calculatedValue,
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
                        const weight = isNaN(amounts.gold?.[0]?.weight) ? 0 : (amounts.gold?.[0]?.weight || 0);
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
                            value: isNaN(calculatedValue) ? 0 : calculatedValue,
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
                    const weight = isNaN(Number(v)) ? 0 : (Number(v) || 0);
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
                        value: isNaN(calculatedValue) ? 0 : calculatedValue,
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
                        const weight = isNaN(amounts.silver?.[0]?.weight) ? 0 : (amounts.silver?.[0]?.weight || 0);
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
                            value: isNaN(calculatedValue) ? 0 : calculatedValue,
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
                        const weight = isNaN(amounts.silver?.[0]?.weight) ? 0 : (amounts.silver?.[0]?.weight || 0);
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
                            value: isNaN(calculatedValue) ? 0 : calculatedValue,
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
                onChangeText={(v) => {
                  const numValue = Number(v) || 0;
                  dispatch(zakatInput({ name: "loan", value: isNaN(numValue) ? 0 : numValue }));
                }}
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
                onChangeText={(v) => {
                  const numValue = Number(v) || 0;
                  dispatch(zakatInput({ name: "other", value: isNaN(numValue) ? 0 : numValue }));
                }}
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
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />

        <LinearGradient
          colors={["transparent", "rgba(38,75,139,0.6)", "rgba(38,75,139,0.9)"]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        <View style={styles.headerContent}>
          <Text style={styles.guthenText}>Calculate Your Zakat</Text>
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
      <LinearGradient
        colors={["#5089E7", "#2161CD"]}
        style={styles.footer}
      >
        {/* Row 1 */}
        <View style={styles.footerRow}>
          <Text style={styles.footerTitle}>Your estimated Zakat Payment</Text>
          <Text style={styles.footerAmount}>AUD {isNaN(zakat) ? "0.00" : zakat.toFixed(2)}</Text>
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

        {/* Navigation Buttons */}
        <View style={styles.footerDivider} />
        <View style={styles.navigationButtonsContainer}>
          {step > 1 && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => dispatch(zakatStep(-1))}
              activeOpacity={0.8}
            >
              <Ionicons name="chevron-back" size={18} color="#6B7280" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          {step < 4 ? (
            <TouchableOpacity
              style={styles.nextButton}
              onPress={() => dispatch(zakatStep(1))}
              activeOpacity={0.8}
            >
              <Text style={styles.nextButtonText}>Continue</Text>
              <Ionicons name="chevron-forward" size={18} color="#010D26" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.finishButton}
              onPress={() => setSummaryOpen(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.finishButtonText}>Finish</Text>
              <Ionicons name="checkmark-circle" size={18} color="#010D26" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  headerWrapper: {
    height: 240,
    width: "100%",
    position: "relative",
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  headerContent: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
    zIndex: 1,
  },
  guthenText: {
    fontSize: 24,
    fontFamily: "Guthen Bloots",
    color: "#FFD602",
    marginBottom: 4,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    fontFamily: "AlbertSans_800ExtraBold",
    marginBottom: 8,
  },
  headerSubtitle: {
    color: "#E6ECFF",
    fontSize: 15,
    lineHeight: 22,
    fontFamily: "AlbertSans_400Regular",
  },

  tabs: {
    flexDirection: "row",
    marginTop: 24,
    marginHorizontal: 20,
    marginBottom: 12,
    gap: 8,
  },
  tabWrap: {
    flex: 1,
    alignItems: "center",
  },
  tabLine: {
    height: 4,
    width: "100%",
    borderRadius: 4,
    marginBottom: 10,
  },
  tabActive: {
    backgroundColor: "#264B8B",
  },
  tabInactive: {
    backgroundColor: "#E5E7EB",
  },
  tabText: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    fontWeight: "500",
    fontFamily: "AlbertSans_500Medium",
  },
  tabTextActive: {
    color: "#264B8B",
    fontWeight: "700",
    fontFamily: "AlbertSans_700Bold",
  },

  content: { padding: 20, paddingTop: 24 },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 16,
    color: "#010D26",
    fontFamily: "AlbertSans_800ExtraBold",
  },
  label: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 8,
    fontWeight: "600",
    fontFamily: "AlbertSans_600SemiBold",
  },
  tip: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    marginBottom: 12,
    lineHeight: 18,
    fontFamily: "AlbertSans_400Regular",
  },
  valueDisplay: {
    fontSize: 14,
    color: "#264B8B",
    fontWeight: "700",
    marginTop: 4,
    marginBottom: 12,
    fontFamily: "AlbertSans_700Bold",
  },
  inputWithPrefix: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
    paddingLeft: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  prefix: {
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "600",
    marginRight: 6,
    fontFamily: "AlbertSans_600SemiBold",
  },
  input: {
    flex: 1,
    backgroundColor: "transparent",
    borderWidth: 0,
    padding: 14,
    paddingLeft: 0,
    marginBottom: 0,
    fontSize: 15,
    color: "#010D26",
    fontFamily: "AlbertSans_400Regular",
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    height: 44,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dropdownText: {
    fontSize: 14,
    color: "#264B8B",
    fontWeight: "600",
    fontFamily: "AlbertSans_600SemiBold",
  },
  dropdownMenu: {
    position: "absolute",
    top: 48,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1000,
    overflow: "hidden",
  },
  dropdownItem: {
    padding: 14,
    borderBottomColor: "#F3F4F6",
  },
  dropdownItemText: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: "AlbertSans_400Regular",
  },
  dropdownItemTextActive: {
    color: "#264B8B",
    fontWeight: "700",
    fontFamily: "AlbertSans_700Bold",
  },

  reviewWrap: { alignItems: "flex-end" },

  footer: {
    padding: 20,
    marginTop: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },

  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  footerDivider: {
    height: 1,
    backgroundColor: "#fff",
    opacity: 0.2,
    marginVertical: 12,
  },

  footerTitle: {
    fontSize: 15,
    color: "#fff",
    opacity: 0.9,
    fontFamily: "AlbertSans_500Medium",
  },

  footerAmount: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFD602",
    fontFamily: "AlbertSans_800ExtraBold",
  },

  footerSub: {
    fontSize: 13,
    color: "#fff",
    opacity: 0.8,
    fontFamily: "AlbertSans_400Regular",
  },

  reviewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  reviewText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFD602",
    fontFamily: "AlbertSans_700Bold",
  },

  navigationButtonsContainer: {
    marginTop: 8,
    gap: 12,
  },
  backButton: {
    width: "100%",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#6B7280",
    fontFamily: "AlbertSans_700Bold",
  },
  nextButton: {
    width: "100%",
    backgroundColor: "#FFD602",
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#010D26",
    fontFamily: "AlbertSans_700Bold",
  },
  finishButton: {
    width: "100%",
    backgroundColor: "#FFD602",
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  finishButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#010D26",
    fontFamily: "AlbertSans_700Bold",
  },
});
