import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Modal,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/store/store";

import {
  zakatInput,
  zakatStep,
  getMetalPrices,
  resetZakatInput,
  zakatMetalInput,
  zakatMetalRemove,
} from "@/store/reduxSlice/zakatSlice";

import ZakatSummaryModal from "@/components/ui/Modals/ZakatSummaryModal";
import HeroBackground from "@/components/ui/GradientImage";
import {
  areMetalPricesReady,
  calculateMetalValueAud,
  computeNisabAud,
  computeTotalWealth,
  computeZakatDue,
  getZakatFooterStatus,
  resolveGoldPricePerGram,
  resolveSilverPricePerGram,
  type GoldCaratPrice,
} from "@/utils/zakatCalculator";

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

let metalPricesFetchedOnce = false;

const ZAKAT_AL_MAAL_SLUG = "zakat-al-maal";

export default function ZakatCalculatorScreen() {
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const scrollRef = useRef<ScrollView>(null);

  const { step, amounts, prices } = useSelector(
    (state: any) => state.zakatCalculator
  );

  const [summaryOpen, setSummaryOpen] = useState(false);
  /** Which gold/silver row’s unit dropdown is open (null = closed). */
  const [goldDropdownKey, setGoldDropdownKey] = useState<number | null>(null);
  const [silverDropdownKey, setSilverDropdownKey] = useState<number | null>(null);
  const [goldKaratDropdownKey, setGoldKaratDropdownKey] = useState<number | null>(null);
  const [silverTypeDropdownKey, setSilverTypeDropdownKey] = useState<number | null>(null);
  const [knownAmountModalVisible, setKnownAmountModalVisible] = useState(false);
  const [knownAmount, setKnownAmount] = useState("");
  const [overrideZakatAmount, setOverrideZakatAmount] = useState<number | null>(null);

  useEffect(() => {
    if (!metalPricesFetchedOnce) {
      metalPricesFetchedOnce = true;
      dispatch(getMetalPrices());
    }
    return () => {
      dispatch(resetZakatInput());
    };
  }, [dispatch]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
    setGoldDropdownKey(null);
    setSilverDropdownKey(null);
    setGoldKaratDropdownKey(null);
    setSilverTypeDropdownKey(null);
  }, [step]);

  const pricesReady = areMetalPricesReady(prices);
  const goldPriceAud = Number(prices.price?.goldPriceInAud || 0);
  const silverFineAud = Number(prices.silverFinePriceInAud || 0);
  const silverSterlingAud = Number(prices.silverSterlingPriceInAud || 0);
  const goldCaratPrices = (prices.goldPriceInAud || []) as GoldCaratPrice[];

  const { goldNisabAud, silverNisabAud } = computeNisabAud(goldPriceAud, silverFineAud);
  const totalWealth = computeTotalWealth(amounts);
  const zakat = computeZakatDue(totalWealth, silverNisabAud, pricesReady);
  const footerStatus = getZakatFooterStatus(totalWealth, zakat, pricesReady);

  const sumArray = (arr: any[] = []) =>
    arr.reduce((s, i) => {
      const value = i.value || 0;
      return s + (isNaN(value) ? 0 : value);
    }, 0);

  const goldPriceForEntry = (karat: string | number | undefined) =>
    resolveGoldPricePerGram(karat, goldCaratPrices, goldPriceAud);

  const silverPriceForEntry = (karat: string | number | undefined) =>
    resolveSilverPricePerGram(karat, silverFineAud, silverSterlingAud);

  /** Re-value metal rows when live prices load (avoids nisab = 0 / wrong totals). */
  useEffect(() => {
    if (!pricesReady) return;

    (amounts.gold || []).forEach((g: any) => {
      const weight = g.weight || 0;
      if (weight <= 0) return;
      const unit = g.unit || "gram";
      const price = goldPriceForEntry(g.karat);
      const value = calculateMetalValueAud(weight, unit, price);
      if (Math.abs((g.value || 0) - value) < 0.01) return;
      dispatch(
        zakatMetalInput({
          name: "gold",
          key: g.key ?? 0,
          karat: g.karat || "24",
          weight,
          value,
          unit,
          type: "gold",
        })
      );
    });

    (amounts.silver || []).forEach((s: any) => {
      const weight = s.weight || 0;
      if (weight <= 0) return;
      const unit = s.unit || "gram";
      const price = silverPriceForEntry(s.karat);
      const value = calculateMetalValueAud(weight, unit, price);
      if (Math.abs((s.value || 0) - value) < 0.01) return;
      dispatch(
        zakatMetalInput({
          name: "silver",
          key: s.key ?? 0,
          karat: s.karat || "fine",
          weight,
          value,
          unit,
          type: "silver",
        })
      );
    });
  }, [pricesReady, goldPriceAud, silverFineAud, silverSterlingAud, dispatch]);

  const nextMetalKey = (items: { key?: number }[] = []) => {
    if (!items.length) return 0;
    return Math.max(...items.map((i) => i.key ?? 0)) + 1;
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

      case 3: {
        const goldList = amounts.gold?.length
          ? amounts.gold
          : [{ karat: "24", unit: "gram", weight: 0, value: 0, key: 0 }];
        const silverList = amounts.silver?.length
          ? amounts.silver
          : [{ karat: "fine", unit: "gram", weight: 0, value: 0, key: 0 }];

        const goldTotal = sumArray(goldList);
        const silverTotal = sumArray(silverList);

        return (
          <>
            <Text style={styles.sectionTitle}>Gold & Silver</Text>
            <Text style={styles.tip}>
              Totals use live rates by karat (gold) and type (silver). Zakat is due only when
              your combined wealth exceeds the silver nisab threshold.
            </Text>

            <Text style={styles.label}>Zakatable Gold</Text>
            <Text style={styles.tip}>Add separate lines for different holdings (e.g. jewelry vs coins). Values sum for Zakat.</Text>

            {goldList.map((g: any, idx: number) => {
              const rowKey = g.key ?? idx;
              const unit = g.unit || "gram";
              const weight = isNaN(g.weight) ? 0 : (g.weight || 0);
              const dropdownOpen = goldDropdownKey === rowKey;
              const karatDropdownOpen = goldKaratDropdownKey === rowKey;
              const karatKey = String(g.karat === "1" ? "24" : g.karat || "24");
              const karatLabel =
                goldCaratPrices.find((p) => String(p.key) === karatKey)?.label ??
                `${karatKey} Carat`;

              return (
                <View key={`gold-${rowKey}`} style={styles.metalEntryBlock}>
                  <Text style={styles.metalSubLabel}>Karat</Text>
                  <View style={[styles.row, { marginBottom: 8, zIndex: karatDropdownOpen ? 20 : 1 }]}>
                    <View style={[styles.dropdownContainer, { flex: 1 }]}>
                      <TouchableOpacity
                        style={styles.dropdownButton}
                        onPress={() => {
                          setGoldDropdownKey(null);
                          setGoldKaratDropdownKey(karatDropdownOpen ? null : rowKey);
                        }}
                        activeOpacity={0.7}
                        disabled={!pricesReady}
                      >
                        <Text style={styles.dropdownText} numberOfLines={1}>
                          {pricesReady ? karatLabel : "Loading rates…"}
                        </Text>
                        <Ionicons
                          name={karatDropdownOpen ? "chevron-up" : "chevron-down"}
                          size={16}
                          color="#264B8B"
                        />
                      </TouchableOpacity>
                      {karatDropdownOpen && pricesReady && (
                        <ScrollView style={styles.dropdownMenuScroll} nestedScrollEnabled>
                          {goldCaratPrices.map((carat) => (
                            <TouchableOpacity
                              key={`gold-k-${rowKey}-${carat.key}`}
                              style={[styles.dropdownItem, { borderBottomWidth: 1 }]}
                              onPress={() => {
                                const price = carat.value;
                                const calculatedValue = calculateMetalValueAud(weight, unit, price);
                                dispatch(
                                  zakatMetalInput({
                                    name: "gold",
                                    key: rowKey,
                                    karat: String(carat.key),
                                    weight,
                                    value: isNaN(calculatedValue) ? 0 : calculatedValue,
                                    unit,
                                    type: "gold",
                                  })
                                );
                                setGoldKaratDropdownKey(null);
                              }}
                            >
                              <Text
                                style={[
                                  styles.dropdownItemText,
                                  karatKey === String(carat.key) && styles.dropdownItemTextActive,
                                ]}
                              >
                                {carat.label}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      )}
                    </View>
                  </View>

                  <Text style={styles.metalSubLabel}>Weight</Text>
                  <View style={[styles.row, styles.metalInputRowWrap, { alignItems: "stretch" }]}>
                    <View
                      style={[
                        styles.inputWithPrefix,
                        styles.metalInputRow,
                        { flex: 1, marginBottom: 0 },
                      ]}
                    >
                      <TextInput
                        style={[styles.input, styles.metalInput]}
                        keyboardType="numeric"
                        value={weight ? weight.toString() : ""}
                        placeholder="0"
                        onChangeText={(v) => {
                          const w = isNaN(Number(v)) ? 0 : (Number(v) || 0);
                          const price = goldPriceForEntry(g.karat);
                          const calculatedValue = calculateMetalValueAud(w, unit, price);
                          dispatch(
                            zakatMetalInput({
                              name: "gold",
                              key: rowKey,
                              karat: g.karat || "24",
                              weight: w,
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
                        style={[styles.dropdownButton, styles.dropdownButtonMetal]}
                        onPress={() =>
                          setGoldDropdownKey(dropdownOpen ? null : rowKey)
                        }
                        activeOpacity={0.7}
                      >
                        <Text style={styles.dropdownText}>
                          {unit === "ounce" ? "Ounces" : "Grams"}
                        </Text>
                        <Ionicons
                          name={dropdownOpen ? "chevron-up" : "chevron-down"}
                          size={16}
                          color="#264B8B"
                        />
                      </TouchableOpacity>
                      {dropdownOpen && (
                        <View style={styles.dropdownMenu}>
                          <TouchableOpacity
                            style={[styles.dropdownItem, { borderBottomWidth: 1 }]}
                            onPress={() => {
                              const price = goldPriceForEntry(g.karat);
                              const calculatedValue = calculateMetalValueAud(weight, "gram", price);
                              dispatch(
                                zakatMetalInput({
                                  name: "gold",
                                  key: rowKey,
                                  karat: g.karat || "24",
                                  weight,
                                  value: isNaN(calculatedValue) ? 0 : calculatedValue,
                                  unit: "gram",
                                  type: "gold",
                                })
                              );
                              setGoldDropdownKey(null);
                            }}
                          >
                            <Text
                              style={[
                                styles.dropdownItemText,
                                unit === "gram" && styles.dropdownItemTextActive,
                              ]}
                            >
                              Grams
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.dropdownItem}
                            onPress={() => {
                              const price = goldPriceForEntry(g.karat);
                              const calculatedValue = calculateMetalValueAud(weight, "ounce", price);
                              dispatch(
                                zakatMetalInput({
                                  name: "gold",
                                  key: rowKey,
                                  karat: g.karat || "24",
                                  weight,
                                  value: isNaN(calculatedValue) ? 0 : calculatedValue,
                                  unit: "ounce",
                                  type: "gold",
                                })
                              );
                              setGoldDropdownKey(null);
                            }}
                          >
                            <Text
                              style={[
                                styles.dropdownItemText,
                                unit === "ounce" && styles.dropdownItemTextActive,
                              ]}
                            >
                              Ounces
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                    {goldList.length > 1 ? (
                      <TouchableOpacity
                        style={styles.metalDeleteInline}
                        onPress={() => {
                          setGoldDropdownKey(null);
                          setGoldKaratDropdownKey(null);
                          dispatch(zakatMetalRemove({ name: "gold", key: rowKey }));
                        }}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        accessibilityLabel={`Remove gold entry ${idx + 1}`}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="trash-outline" size={18} color="#DC2626" />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                  {g.value > 0 && (
                    <Text style={styles.valueDisplay}>
                      Line value: ${formatPrice(g.value || 0)}
                    </Text>
                  )}
                </View>
              );
            })}

            <TouchableOpacity
              style={styles.addMetalRow}
              onPress={() => {
                setGoldDropdownKey(null);
                setGoldKaratDropdownKey(null);
                const key = nextMetalKey(amounts.gold || []);
                dispatch(
                  zakatMetalInput({
                    name: "gold",
                    key,
                    karat: "24",
                    unit: "gram",
                    weight: 0,
                    value: 0,
                    type: "gold",
                  })
                );
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle-outline" size={22} color="#264B8B" />
              <Text style={styles.addMetalRowText}>Add another gold entry</Text>
            </TouchableOpacity>

            <Text style={[styles.tip, { marginTop: 8 }]}>
              Total weight of gold you own (jewelry, coins, bars)
            </Text>
            {goldTotal > 0 && (
              <Text style={styles.valueDisplay}>
                Total gold value: ${formatPrice(goldTotal)}
              </Text>
            )}

            <Text style={[styles.label, { marginTop: 16 }]}>Zakatable Silver</Text>
            <Text style={styles.tip}>Add separate lines for different silver holdings. Values sum for Zakat.</Text>

            {silverList.map((s: any, idx: number) => {
              const rowKey = s.key ?? idx;
              const unit = s.unit || "gram";
              const weight = isNaN(s.weight) ? 0 : (s.weight || 0);
              const dropdownOpen = silverDropdownKey === rowKey;
              const typeDropdownOpen = silverTypeDropdownKey === rowKey;
              const silverType = s.karat === "sterling" ? "sterling" : "fine";
              const silverTypeLabel = silverType === "sterling" ? "Sterling" : "Fine";

              return (
                <View key={`silver-${rowKey}`} style={styles.metalEntryBlock}>
                  <Text style={styles.metalSubLabel}>Silver type</Text>
                  <View style={[styles.row, { marginBottom: 8, zIndex: typeDropdownOpen ? 20 : 1 }]}>
                    <View style={[styles.dropdownContainer, { flex: 1 }]}>
                      <TouchableOpacity
                        style={styles.dropdownButton}
                        onPress={() => {
                          setSilverDropdownKey(null);
                          setSilverTypeDropdownKey(typeDropdownOpen ? null : rowKey);
                        }}
                        activeOpacity={0.7}
                        disabled={!pricesReady}
                      >
                        <Text style={styles.dropdownText}>{silverTypeLabel}</Text>
                        <Ionicons
                          name={typeDropdownOpen ? "chevron-up" : "chevron-down"}
                          size={16}
                          color="#264B8B"
                        />
                      </TouchableOpacity>
                      {typeDropdownOpen && pricesReady && (
                        <View style={styles.dropdownMenu}>
                          {(["fine", "sterling"] as const).map((type) => (
                            <TouchableOpacity
                              key={`silver-type-${rowKey}-${type}`}
                              style={[styles.dropdownItem, { borderBottomWidth: type === "fine" ? 1 : 0 }]}
                              onPress={() => {
                                const price =
                                  type === "sterling"
                                    ? silverPriceForEntry("sterling")
                                    : silverPriceForEntry("fine");
                                const calculatedValue = calculateMetalValueAud(weight, unit, price);
                                dispatch(
                                  zakatMetalInput({
                                    name: "silver",
                                    key: rowKey,
                                    karat: type,
                                    weight,
                                    value: isNaN(calculatedValue) ? 0 : calculatedValue,
                                    unit,
                                    type: "silver",
                                  })
                                );
                                setSilverTypeDropdownKey(null);
                              }}
                            >
                              <Text
                                style={[
                                  styles.dropdownItemText,
                                  silverType === type && styles.dropdownItemTextActive,
                                ]}
                              >
                                {type === "fine" ? "Fine" : "Sterling"}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  </View>

                  <Text style={styles.metalSubLabel}>Weight</Text>
                  <View style={[styles.row, styles.metalInputRowWrap, { alignItems: "stretch" }]}>
                    <View
                      style={[
                        styles.inputWithPrefix,
                        styles.metalInputRow,
                        { flex: 1, marginBottom: 0 },
                      ]}
                    >
                      <TextInput
                        style={[styles.input, styles.metalInput]}
                        keyboardType="numeric"
                        value={weight ? weight.toString() : ""}
                        placeholder="0"
                        onChangeText={(v) => {
                          const w = isNaN(Number(v)) ? 0 : (Number(v) || 0);
                          const price = silverPriceForEntry(s.karat);
                          const calculatedValue = calculateMetalValueAud(w, unit, price);
                          dispatch(
                            zakatMetalInput({
                              name: "silver",
                              key: rowKey,
                              karat: s.karat || "fine",
                              weight: w,
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
                        style={[styles.dropdownButton, styles.dropdownButtonMetal]}
                        onPress={() =>
                          setSilverDropdownKey(dropdownOpen ? null : rowKey)
                        }
                        activeOpacity={0.7}
                      >
                        <Text style={styles.dropdownText}>
                          {unit === "ounce" ? "Ounces" : "Grams"}
                        </Text>
                        <Ionicons
                          name={dropdownOpen ? "chevron-up" : "chevron-down"}
                          size={16}
                          color="#264B8B"
                        />
                      </TouchableOpacity>
                      {dropdownOpen && (
                        <View style={styles.dropdownMenu}>
                          <TouchableOpacity
                            style={[styles.dropdownItem, { borderBottomWidth: 1 }]}
                            onPress={() => {
                              const price = silverPriceForEntry(s.karat);
                              const calculatedValue = calculateMetalValueAud(weight, "gram", price);
                              dispatch(
                                zakatMetalInput({
                                  name: "silver",
                                  key: rowKey,
                                  karat: s.karat || "fine",
                                  weight,
                                  value: isNaN(calculatedValue) ? 0 : calculatedValue,
                                  unit: "gram",
                                  type: "silver",
                                })
                              );
                              setSilverDropdownKey(null);
                            }}
                          >
                            <Text
                              style={[
                                styles.dropdownItemText,
                                unit === "gram" && styles.dropdownItemTextActive,
                              ]}
                            >
                              Grams
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.dropdownItem}
                            onPress={() => {
                              const price = silverPriceForEntry(s.karat);
                              const calculatedValue = calculateMetalValueAud(weight, "ounce", price);
                              dispatch(
                                zakatMetalInput({
                                  name: "silver",
                                  key: rowKey,
                                  karat: s.karat || "fine",
                                  weight,
                                  value: isNaN(calculatedValue) ? 0 : calculatedValue,
                                  unit: "ounce",
                                  type: "silver",
                                })
                              );
                              setSilverDropdownKey(null);
                            }}
                          >
                            <Text
                              style={[
                                styles.dropdownItemText,
                                unit === "ounce" && styles.dropdownItemTextActive,
                              ]}
                            >
                              Ounces
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                    {silverList.length > 1 ? (
                      <TouchableOpacity
                        style={styles.metalDeleteInline}
                        onPress={() => {
                          setSilverDropdownKey(null);
                          setSilverTypeDropdownKey(null);
                          dispatch(zakatMetalRemove({ name: "silver", key: rowKey }));
                        }}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        accessibilityLabel={`Remove silver entry ${idx + 1}`}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="trash-outline" size={18} color="#DC2626" />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                  {s.value > 0 && (
                    <Text style={styles.valueDisplay}>
                      Line value: ${formatPrice(s.value || 0)}
                    </Text>
                  )}
                </View>
              );
            })}

            <TouchableOpacity
              style={styles.addMetalRow}
              onPress={() => {
                setSilverDropdownKey(null);
                setSilverTypeDropdownKey(null);
                const key = nextMetalKey(amounts.silver || []);
                dispatch(
                  zakatMetalInput({
                    name: "silver",
                    key,
                    karat: "fine",
                    unit: "gram",
                    weight: 0,
                    value: 0,
                    type: "silver",
                  })
                );
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle-outline" size={22} color="#264B8B" />
              <Text style={styles.addMetalRowText}>Add another silver entry</Text>
            </TouchableOpacity>

            <Text style={[styles.tip, { marginTop: 8 }]}>
              Total weight of silver you own (jewelry, coins, bars)
            </Text>
            {silverTotal > 0 && (
              <Text style={styles.valueDisplay}>
                Total silver value: ${formatPrice(silverTotal)}
              </Text>
            )}
          </>
        );
      }

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
        onClose={() => {
          setSummaryOpen(false);
          setOverrideZakatAmount(null);
        }}
        overrideZakatAmount={overrideZakatAmount}
      />

      {/* Known amount modal */}
      <Modal
        visible={knownAmountModalVisible}
        transparent
        animationType="fade"
      >
        <View style={styles.knownAmountModalOverlay}>
          <View style={styles.knownAmountModalBox}>
            <Text style={styles.knownAmountModalTitle}>Enter your zakat amount</Text>
            <View style={styles.knownAmountModalInputWrap}>
              <Text style={styles.knownAmountModalPrefix}>AUD $</Text>
              <TextInput
                style={styles.knownAmountModalInput}
                placeholder="0.00"
                placeholderTextColor="#9CA3AF"
                keyboardType="decimal-pad"
                value={knownAmount}
                onChangeText={setKnownAmount}
              />
            </View>
            <View style={styles.knownAmountModalButtons}>
              <TouchableOpacity
                style={styles.knownAmountModalCancel}
                onPress={() => {
                  setKnownAmountModalVisible(false);
                  setKnownAmount("");
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.knownAmountModalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.knownAmountModalContinue,
                  (!knownAmount || isNaN(parseFloat(knownAmount.replace(/,/g, "."))) || parseFloat(knownAmount.replace(/,/g, ".")) <= 0) && styles.knownAmountModalContinueDisabled,
                ]}
                onPress={() => {
                  const amount = parseFloat(knownAmount.replace(/,/g, "."));
                  if (!isNaN(amount) && amount > 0) {
                    setOverrideZakatAmount(amount);
                    setKnownAmountModalVisible(false);
                    setKnownAmount("");
                    setSummaryOpen(true);
                  }
                }}
                activeOpacity={0.8}
                disabled={!knownAmount || isNaN(parseFloat(knownAmount.replace(/,/g, "."))) || parseFloat(knownAmount.replace(/,/g, ".")) <= 0}
              >
                <Text style={styles.knownAmountModalContinueText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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

      <ScrollView
        ref={scrollRef}
        style={styles.contentScroll}
        contentContainerStyle={styles.contentScrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
      >
        {renderStep()}
      </ScrollView>

      {/* FOOTER - compact */}
      <LinearGradient
        colors={["#5089E7", "#2161CD"]}
        style={styles.footer}
      >
        <View style={styles.footerRowCompact}>
          <Text style={styles.footerTitle}>
            {footerStatus === "loading_prices"
              ? "Zakat estimate"
              : footerStatus === "below_nisab"
                ? "No Zakat due"
                : footerStatus === "empty"
                  ? "Your estimated Zakat"
                  : "Your estimated Zakat Payment"}
          </Text>
          {footerStatus === "loading_prices" ? (
            <View style={styles.footerLoadingRow}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.footerAmountSmall}>Loading rates…</Text>
            </View>
          ) : (
            <Text style={styles.footerAmount}>
              AUD {zakat.toFixed(2)}
            </Text>
          )}
        </View>
        <View style={styles.footerRowCompact}>
          <Text style={styles.footerSub}>
            {footerStatus === "loading_prices"
              ? "Fetching live gold & silver prices"
              : footerStatus === "below_nisab"
                ? `Below silver nisab (${formatPrice(silverNisabAud)}) — 2.5% not due`
                : footerStatus === "empty"
                  ? "Enter assets above silver nisab threshold"
                  : "Based on 2.5% (silver nisab)"}
          </Text>
          <TouchableOpacity
            style={styles.reviewRow}
            onPress={() => {
              setOverrideZakatAmount(null);
              setSummaryOpen(true);
            }}
            disabled={footerStatus === "loading_prices"}
          >
            <Text
              style={[
                styles.reviewText,
                footerStatus === "loading_prices" && styles.reviewTextDisabled,
              ]}
            >
              Review Summary
            </Text>
            <Ionicons name="chevron-forward" size={12} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.navRow}>
          {step > 1 ? (
            <>
              <TouchableOpacity
                style={styles.navButtonBack}
                onPress={() => dispatch(zakatStep(-1))}
                activeOpacity={0.8}
              >
                <Ionicons name="chevron-back" size={14} color="#6B7280" />
                <Text style={styles.navButtonBackText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.navButtonNext}
                onPress={() => {
                  if (step < 4) dispatch(zakatStep(1));
                  else {
                    setOverrideZakatAmount(null);
                    setSummaryOpen(true);
                  }
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.navButtonNextText}>{step < 4 ? "Continue" : "Finish"}</Text>
                <Ionicons name="chevron-forward" size={14} color="#010D26" />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.navButtonNextSingle}
              onPress={() => dispatch(zakatStep(1))}
              activeOpacity={0.8}
            >
              <Text style={styles.navButtonNextText}>Continue</Text>
              <Ionicons name="chevron-forward" size={14} color="#010D26" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.knowAmountLink}
          onPress={() => router.push(`/campaign/${ZAKAT_AL_MAAL_SLUG}`)}
          activeOpacity={0.7}
        >
          <Text style={styles.knowAmountLinkText}>I already know my zakat amount</Text>
          <Ionicons name="arrow-forward" size={12} color="rgba(255,255,255,0.9)" />
        </TouchableOpacity>
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
  contentScroll: { flex: 1 },
  contentScrollContent: { padding: 20, paddingTop: 24, paddingBottom: 24 },
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
  metalEntryBlock: {
    marginBottom: 12,
  },
  metalSubLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
    fontFamily: "AlbertSans_600SemiBold",
  },
  metalInputRowWrap: {
    gap: 8,
  },
  metalDeleteInline: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  addMetalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  addMetalRowText: {
    fontSize: 14,
    color: "#264B8B",
    fontWeight: "600",
    fontFamily: "AlbertSans_600SemiBold",
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
  dropdownButtonMetal: {
    height: 48,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  metalInputRow: {
    minHeight: 48,
  },
  metalInput: {
    paddingVertical: 14,
    minHeight: 48,
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
  dropdownMenuScroll: {
    position: "absolute",
    top: 48,
    left: 0,
    right: 0,
    maxHeight: 220,
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
    padding: 12,
    paddingBottom: 14,
    marginTop: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 6,
  },
  footerRowCompact: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  footerTitle: {
    fontSize: 12,
    color: "#fff",
    opacity: 0.9,
    fontFamily: "AlbertSans_500Medium",
  },
  footerAmount: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFD602",
    fontFamily: "AlbertSans_800ExtraBold",
  },
  footerAmountSmall: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "AlbertSans_700Bold",
  },
  footerLoadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  footerSub: {
    fontSize: 11,
    color: "#fff",
    opacity: 0.8,
    fontFamily: "AlbertSans_400Regular",
  },
  reviewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  reviewText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFD602",
    fontFamily: "AlbertSans_700Bold",
  },
  reviewTextDisabled: {
    opacity: 0.5,
  },

  navRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
    marginBottom: 4,
  },
  navButtonBack: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  navButtonBackText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6B7280",
    fontFamily: "AlbertSans_700Bold",
  },
  navButtonNext: {
    flex: 1,
    backgroundColor: "#FFD602",
    borderRadius: 10,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  navButtonNextSingle: {
    flex: 1,
    backgroundColor: "#FFD602",
    borderRadius: 10,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  navButtonNextText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#010D26",
    fontFamily: "AlbertSans_700Bold",
  },

  knowAmountLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 6,
  },
  knowAmountLinkText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    fontFamily: "AlbertSans_500Medium",
  },

  knownAmountModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  knownAmountModalBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 320,
  },
  knownAmountModalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    fontFamily: "AlbertSans_700Bold",
    marginBottom: 14,
    textAlign: "center",
  },
  knownAmountModalInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingLeft: 14,
    marginBottom: 16,
  },
  knownAmountModalPrefix: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "600",
    fontFamily: "AlbertSans_600SemiBold",
  },
  knownAmountModalInput: {
    flex: 1,
    padding: 12,
    paddingLeft: 8,
    fontSize: 15,
    color: "#111827",
    fontFamily: "AlbertSans_600SemiBold",
  },
  knownAmountModalButtons: {
    flexDirection: "row",
    gap: 10,
  },
  knownAmountModalCancel: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  knownAmountModalCancelText: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: "AlbertSans_600SemiBold",
  },
  knownAmountModalContinue: {
    flex: 1,
    backgroundColor: "#264B8B",
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
  },
  knownAmountModalContinueDisabled: {
    opacity: 0.5,
  },
  knownAmountModalContinueText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "AlbertSans_700Bold",
  },
});
