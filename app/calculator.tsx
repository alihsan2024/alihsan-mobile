// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   TextInput,
//   ScrollView,
// } from "react-native";
// import DropDownPicker from "react-native-dropdown-picker";
// import { Picker } from "@react-native-picker/picker";
// import { Image as ExpoImage } from "expo-image";
// import { LinearGradient } from "expo-linear-gradient";
// import { Ionicons } from "@expo/vector-icons";
// import ZakatSummaryModal from "@/components/ui/Modals/ZakatSummaryModal";

// const SCREENS = [
//   { key: 0, label: "Cash & Bank" },
//   { key: 1, label: "Assets" },
//   { key: 2, label: "Gold, Silver…" },
//   { key: 3, label: "Liabilities/D…" },
// ];

// export default function ZakatCalculatorScreen() {
//   const [screen, setScreen] = useState(1); // default to 2nd screen for demo
//   // Inputs for screen 1
//   const [currency, setCurrency] = useState("AUD");
//   const [nisaab, setNisaab] = useState("Gold");
//   // Dropdown state for DropDownPicker
//   const [currencyOpen, setCurrencyOpen] = useState(false);
//   const [nisaabOpen, setNisaabOpen] = useState(false);
//   const [currencyItems, setCurrencyItems] = useState([
//     { label: "AUD", value: "AUD" },
//     { label: "USD", value: "USD" },
//   ]);
//   const [nisaabItems, setNisaabItems] = useState([
//     { label: "Gold", value: "Gold" },
//     { label: "Silver", value: "Silver" },
//   ]);
//   const [open, setOpen] = useState(false);
//   // Inputs for screen 2
//   const [cash1, setCash1] = useState("");
//   const [cash2, setCash2] = useState("");
//   const [property, setProperty] = useState("");
//   const [business, setBusiness] = useState("");
//   // Inputs for screen 3
//   const [goldValue, setGoldValue] = useState("");
//   const [goldUnit, setGoldUnit] = useState("grams");
//   const [silverValue, setSilverValue] = useState("");
//   const [silverUnit, setSilverUnit] = useState("grams");
//   // Dropdowns for gold/silver units
//   const [goldUnitOpen, setGoldUnitOpen] = useState(false);
//   const [silverUnitOpen, setSilverUnitOpen] = useState(false);
//   const [unitItems, setUnitItems] = useState([
//     { label: "Grams", value: "grams" },
//     { label: "Ounces", value: "ounces" },
//   ]);
//   // Inputs for screen 4
//   const [liabDebtsOwed, setLiabDebtsOwed] = useState("");
//   const [liabDebtDue, setLiabDebtDue] = useState("");
//   const [liabBusinessAssets, setLiabBusinessAssets] = useState("");
//   const [liabOther, setLiabOther] = useState("");

//   // Navigation handlers
//   const goNext = () => setScreen((s) => Math.min(s + 1, SCREENS.length - 1));
//   const goBack = () => setScreen((s) => Math.max(s - 1, 0));

//   return (
//     <View style={styles.container}>
//       <ZakatSummaryModal visible={open} onClose={() => setOpen(false)} />
//       {/* Header */}
//       <LinearGradient colors={["#5E6BFF", "#7A86FF"]} style={styles.header}>
//         <TouchableOpacity style={styles.backBtnCircle} onPress={goBack}>
//           <Ionicons name="chevron-back" size={22} color="#010D264D" />
//         </TouchableOpacity>
//         <View style={styles.headerImageWrapper}>
//           <ExpoImage
//             source={require("../assets/card1.png")}
//             style={styles.headerImage}
//             contentFit="cover"
//           />
//           <LinearGradient
//             colors={["transparent", "#246BE1"]}
//             end={{ x: 0, y: 0.5 }}
//             start={{ x: 1, y: 0.5 }}
//             style={styles.gradientOverlay}
//           />
//           <View style={styles.headerTextBottom}>
//             <View style={styles.headerContent}>
//               <Text style={styles.title}>Zakat Calculator</Text>
//               <Text style={styles.subtitle}>
//                 Accurately determine your Zakat with our scholar-verified
//                 calculator, ensuring your contribution is precise and impactful.
//               </Text>
//             </View>
//           </View>
//         </View>
//       </LinearGradient>

//       {/* Tabs */}
//       <View style={styles.tabs}>
//         {SCREENS.map((tab, idx) => (
//           <View key={tab.key} style={styles.tabContainer}>
//             <View
//               style={[
//                 styles.tabLine,
//                 idx <= screen ? styles.tabLineActive : styles.tabLineInactive,
//               ]}
//             />
//             <TouchableOpacity
//               style={styles.tabTouchable}
//               onPress={() => setScreen(idx)}
//             >
//               <Text style={[styles.tab, screen === idx && styles.activeTab]}>
//                 {tab.label}
//               </Text>
//             </TouchableOpacity>
//           </View>
//         ))}
//       </View>

//       {/* Content */}

//       <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
//         {screen === 0 && (
//           <>
//             <Text style={styles.sectionTitle}>Set Your Zakat Base</Text>
//             <View style={styles.row}>
//               <View style={styles.field}>
//                 <Text style={styles.label}>Currency</Text>
//                 <View style={styles.pickerWrapper}>
//                   <DropDownPicker
//                     open={currencyOpen}
//                     value={currency}
//                     items={currencyItems}
//                     setOpen={setCurrencyOpen}
//                     setValue={setCurrency}
//                     setItems={setCurrencyItems}
//                     containerStyle={{ zIndex: 2000 }}
//                     style={{
//                       marginBottom: 8,
//                       borderWidth: 1,
//                       borderColor: "#E5E7EB",
//                     }}
//                   />
//                 </View>
//               </View>
//               <View style={styles.field}>
//                 <Text style={styles.label}>Nisaab</Text>
//                 <View style={styles.pickerWrapper}>
//                   <DropDownPicker
//                     open={nisaabOpen}
//                     value={nisaab}
//                     items={nisaabItems}
//                     setOpen={setNisaabOpen}
//                     setValue={setNisaab}
//                     setItems={setNisaabItems}
//                     containerStyle={{ zIndex: 1000 }}
//                     style={{
//                       marginBottom: 8,
//                       borderWidth: 1,
//                       borderColor: "#E5E7EB",
//                     }}
//                   />
//                 </View>
//               </View>
//             </View>
//           </>
//         )}
//         {screen === 1 && (
//           <>
//             <Text style={styles.sectionTitle}>What are your assets?</Text>
//             <View style={styles.row}>
//               <View style={styles.field}>
//                 <Text style={styles.label}>Cash</Text>
//                 <TextInput
//                   style={styles.input}
//                   value={cash1}
//                   onChangeText={setCash1}
//                   placeholder="Enter amount"
//                   keyboardType="numeric"
//                 />
//               </View>
//               <View style={styles.field}>
//                 <Text style={styles.label}>Cash again</Text>
//                 <TextInput
//                   style={styles.input}
//                   value={cash2}
//                   onChangeText={setCash2}
//                   placeholder="Enter amount"
//                   keyboardType="numeric"
//                 />
//               </View>
//             </View>
//             <View style={{ marginTop: 16 }}>
//               <Text style={styles.label}>Property and Fixed Assets</Text>
//               <TextInput
//                 style={styles.input}
//                 value={property}
//                 onChangeText={setProperty}
//                 placeholder="Enter amount"
//                 keyboardType="numeric"
//               />
//             </View>
//             <View style={{ marginTop: 16 }}>
//               <Text style={styles.label}>Business Assets</Text>
//               <TextInput
//                 style={styles.input}
//                 value={business}
//                 onChangeText={setBusiness}
//                 placeholder="Enter amount"
//                 keyboardType="numeric"
//               />
//             </View>
//           </>
//         )}
//         {screen === 2 && (
//           <>
//             <Text style={styles.sectionTitle}>Gold and Silver Assets</Text>
//             <View style={{ marginBottom: 16 }}>
//               <Text style={styles.label}>Gold</Text>
//               <View style={styles.row}>
//                 <View style={[styles.field, { flex: 1, marginRight: 8 }]}>
//                   <TextInput
//                     style={styles.input}
//                     value={goldValue}
//                     onChangeText={setGoldValue}
//                     placeholder="Enter amount"
//                     keyboardType="numeric"
//                   />
//                 </View>
//                 <View
//                   style={[
//                     styles.pickerWrapper,
//                     { width: 100, minWidth: 90, justifyContent: "center" },
//                   ]}
//                 >
//                   <DropDownPicker
//                     open={goldUnitOpen}
//                     value={goldUnit}
//                     items={unitItems}
//                     setOpen={setGoldUnitOpen}
//                     setValue={setGoldUnit}
//                     setItems={setUnitItems}
//                     containerStyle={{ zIndex: 1200, width: 100 }}
//                     style={{
//                       marginBottom: 8,
//                       width: 100,
//                       height: 40,
//                       minHeight: 40,
//                       borderWidth: 1,
//                       borderColor: "#E5E7EB",
//                     }}
//                     dropDownContainerStyle={{ width: 100 }}
//                     listMode="SCROLLVIEW"
//                   />
//                 </View>
//               </View>
//             </View>
//             <View style={{ marginBottom: 16 }}>
//               <Text style={styles.label}>Silver</Text>
//               <View style={styles.row}>
//                 <View style={[styles.field, { flex: 1, marginRight: 8 }]}>
//                   <TextInput
//                     style={styles.input}
//                     value={silverValue}
//                     onChangeText={setSilverValue}
//                     placeholder="Enter amount"
//                     keyboardType="numeric"
//                   />
//                 </View>
//                 <View
//                   style={[
//                     styles.pickerWrapper,
//                     { width: 100, minWidth: 90, justifyContent: "center" },
//                   ]}
//                 >
//                   <DropDownPicker
//                     open={silverUnitOpen}
//                     value={silverUnit}
//                     items={unitItems}
//                     setOpen={setSilverUnitOpen}
//                     setValue={setSilverUnit}
//                     setItems={setUnitItems}
//                     containerStyle={{ zIndex: 1100, width: 100 }}
//                     style={{
//                       marginBottom: 8,
//                       width: 100,
//                       height: 40,
//                       minHeight: 40,
//                       borderWidth: 1,
//                       borderColor: "#E5E7EB",
//                     }}
//                     dropDownContainerStyle={{ width: 100 }}
//                     listMode="SCROLLVIEW"
//                   />
//                 </View>
//               </View>
//             </View>
//           </>
//         )}
//         {screen === 3 && (
//           <>
//             <Text style={styles.sectionTitle}>Your Liabilities & Others</Text>
//             <View style={{ marginBottom: 16 }}>
//               <Text style={styles.label}>Debts owed to you</Text>
//               <TextInput
//                 style={styles.input}
//                 value={liabDebtsOwed}
//                 onChangeText={setLiabDebtsOwed}
//                 placeholder="Enter amount"
//                 keyboardType="numeric"
//               />
//             </View>
//             <View style={{ marginBottom: 16 }}>
//               <Text style={styles.label}>Debt due</Text>
//               <TextInput
//                 style={styles.input}
//                 value={liabDebtDue}
//                 onChangeText={setLiabDebtDue}
//                 placeholder="Enter amount"
//                 keyboardType="numeric"
//               />
//             </View>
//             <View style={{ marginBottom: 16 }}>
//               <Text style={styles.label}>Business Assets</Text>
//               <TextInput
//                 style={styles.input}
//                 value={liabBusinessAssets}
//                 onChangeText={setLiabBusinessAssets}
//                 placeholder="Enter amount"
//                 keyboardType="numeric"
//               />
//             </View>
//             <View style={{ marginBottom: 16 }}>
//               <Text style={styles.label}>Other</Text>
//               <TextInput
//                 style={styles.input}
//                 value={liabOther}
//                 onChangeText={setLiabOther}
//                 placeholder="Enter amount"
//                 keyboardType="numeric"
//               />
//             </View>
//           </>
//         )}
//       </ScrollView>

//       {/* Bottom Summary */}
//       <View style={{ backgroundColor: "#5E6BFF" }}>
//         <View style={styles.summary}>
//           <View>
//             <Text style={styles.summaryLabel}>
//               Your estimated Zakat Payment
//             </Text>
//           </View>
//           <Text style={styles.amount}>AUD 1,639.41</Text>
//         </View>
//         <View
//           style={{
//             height: 1,
//             backgroundColor: "#fff",
//             marginHorizontal: 16,
//             opacity: 0.1,
//           }}
//         />

//         <View
//           style={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//             flexDirection: "row",
//           }}
//         >
//           <TouchableOpacity style={styles.reviewRow}>
//             <Text style={styles.summarySub}>
//               Based on 2.5% of Zakatable assets
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={styles.reviewRow}
//             onPress={() => setOpen(true)}
//           >
//             <Text style={styles.reviewText}>Review Summary</Text>
//             <Ionicons name="chevron-forward" size={18} color="#fff" />
//           </TouchableOpacity>
//         </View>

//         <View style={{ backgroundColor: "#fff" }}>
//           <TouchableOpacity style={styles.nextBtn} onPress={goNext}>
//             <Text style={styles.nextText}>Next</Text>
//             <Ionicons name="chevron-forward" size={18} color="#fff" />
//           </TouchableOpacity>
//         </View>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F6F7FB",
//   },
//   header: {
//     height: 250,
//     paddingTop: 50,
//     paddingHorizontal: 20,
//     borderBottomLeftRadius: 24,
//     borderBottomRightRadius: 24,
//   },
//   backBtnCircle: {
//     position: "absolute",
//     top: 40,
//     left: 20,
//     zIndex: 20,
//     width: 30,
//     height: 30,
//     borderRadius: 20,
//     backgroundColor: "#fff",
//     alignItems: "center",
//     justifyContent: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   headerTextBottom: {
//     position: "absolute",
//     left: 0,
//     right: 0,
//     bottom: 20,
//     zIndex: 10,
//     paddingHorizontal: 20,
//   },
//   headerContent: {
//     width: "100%",
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: "700",
//     color: "#fff",
//     marginBottom: 8,
//   },
//   subtitle: {
//     fontSize: 13,
//     color: "#E6E8FF",
//     lineHeight: 18,
//   },
//   headerImageWrapper: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     height: 250,
//   },
//   headerImage: {
//     width: "100%",
//     height: "100%",
//     position: "absolute",
//     left: 0,
//     top: 0,
//     right: 0,
//     bottom: 0,
//   },
//   gradientOverlay: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     width: "100%",
//     height: "100%",
//   },
//   pickerWrapper: {
//     borderRadius: 10,
//     borderColor: "#E5E7EB",
//   },
//   input: {
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     fontSize: 14,
//     marginBottom: 2,
//   },
//   summary: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 16,
//     borderRadius: 14,
//     marginTop: "auto",
//   },
//   summaryLabel: {
//     color: "#fff",
//     opacity: 0.8,
//     fontSize: 12,
//   },
//   summarySub: {
//     color: "#fff",
//     opacity: 0.8,
//     fontSize: 11,
//   },
//   amount: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "500",
//   },
//   reviewRow: {
//     flexDirection: "row",
//     justifyContent: "flex-end",
//     alignItems: "center",
//     marginTop: 8,
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//     borderRadius: 10,
//   },
//   reviewText: {
//     marginRight: 4,
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "500",
//     textDecorationLine: "underline",
//   },
//   nextBtn: {
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#3C3F9E",
//     paddingVertical: 14,
//     margin: 16,
//     borderRadius: 14,
//   },
//   nextText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "600",
//     marginRight: 6,
//   },
//   tabs: {
//     flexDirection: "row",
//     marginTop: 12,
//     paddingHorizontal: 0,
//     justifyContent: "space-between",
//     alignItems: "flex-end",
//   },
//   tabContainer: {
//     flex: 1,
//     alignItems: "center",
//     marginHorizontal: 4,
//   },
//   tabLine: {
//     height: 4,
//     width: "100%",
//     marginBottom: 4,
//     borderTopLeftRadius: 2,
//     borderTopRightRadius: 2,
//   },
//   tabLineActive: {
//     backgroundColor: "#4B56E5",
//   },
//   tabLineInactive: {
//     backgroundColor: "#E5E7EB",
//   },
//   tabTouchable: {
//     width: "100%",
//     alignItems: "center",
//     paddingVertical: 6,
//   },
//   tab: {
//     fontSize: 12,
//     color: "#9AA0B5",
//   },
//   activeTab: {
//     color: "#4B56E5",
//     fontWeight: "600",
//   },
//   content: {
//     padding: 20,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     marginBottom: 16,
//   },
//   row: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   field: {
//     width: "48%",
//   },
//   label: {
//     fontSize: 12,
//     color: "#6B7280",
//     marginBottom: 6,
//   },
// });

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

/* ---------------- STEPS ---------------- */

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

  /* ---------------- INIT ---------------- */

  useEffect(() => {
    dispatch(getMetalPrices());
    return () => {
      dispatch(resetZakatInput());
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [step]);

  /* =====================================================
     ✅ CORRECT CALCULATION (MATCHES WEB 1:1)
     ===================================================== */

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

  // ✅ AUD prices (CORRECT FIELDS)
  const goldPriceAud = Number(prices.price?.goldPriceInAud || 0);
  const silverPriceAud = Number(prices.silverFinePriceInAud || 0);

  // Nisab (AUD)
  const goldNisabAud = 87.48 * goldPriceAud;
  const silverNisabAud = 612.36 * silverPriceAud;

  // Zakat (2.5%) — based on SILVER nisab
  const zakat = totalWealth >= silverNisabAud ? totalWealth / 40 : 0;

  /* ---------------- STEPS UI ---------------- */

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
