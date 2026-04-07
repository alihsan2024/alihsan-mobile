import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import PhoneInput from "@/components/ui/inputs/PhoneInput";
import { getCountryByCode } from "@/utils/countries";

const RICE_PRICE = 60;
const COW_PRICE = 120;
const GOAT_PRICE = 135;
const SHEEP_PRICE = 145;

type Animal = "goat" | "sheep" | "";

type CountryOpt = { code: string; name: string; available: boolean };

function getCountriesForAnimal(animal: Animal): CountryOpt[] {
  switch (animal) {
    case "goat":
      return [
        { code: "BD", name: "Bangladesh", available: true },
        { code: "UG", name: "Uganda", available: true },
      ];
    case "sheep":
      return [{ code: "UG", name: "Uganda", available: true }];
    default:
      return [];
  }
}

function getCountryForAnimalByCode(animal: Animal, countryCode: string) {
  return getCountriesForAnimal(animal).find((c) => c.code === countryCode);
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

interface AqeeqahDonationOptionsProps {
  campaign: any;
  onAddToBasket: (payload: any) => Promise<void>;
  addingToCart: boolean;
}

/**
 * Sadaqah sacrifice / Adeeqah general sacrifice — matches AU web
 * `AqeeqahDonationGeneral` (goat/sheep, countries, on behalf of, WhatsApp, rice, Waleemah).
 */
export default function AqeeqahDonationOptions({
  campaign,
  onAddToBasket,
  addingToCart,
}: AqeeqahDonationOptionsProps) {
  const [donationItem, setDonationItem] = useState<Animal>("");
  const [quantity, setQuantity] = useState(1);
  const [country, setCountry] = useState("");
  const [behalfOf, setBehalfOf] = useState("");
  const [whatsappLocal, setWhatsappLocal] = useState("");
  const [whatsappCountryCode, setWhatsappCountryCode] = useState("AU");
  const [specialRequest, setSpecialRequest] = useState("");
  const [notes, setNotes] = useState("");
  const [riceQuantity, setRiceQuantity] = useState("25");
  const [isWaleemah, setIsWaleemah] = useState(false);

  const countries = useMemo(
    () => getCountriesForAnimal(donationItem),
    [donationItem]
  );

  useEffect(() => {
    setCountry("");
  }, [donationItem]);

  useEffect(() => {
    if (countries.length === 1) {
      setCountry(countries[0].code);
    }
  }, [countries]);

  useEffect(() => {
    if (isWaleemah) {
      const minRice = quantity * 25;
      const current = parseInt(riceQuantity, 10);
      if (!riceQuantity || riceQuantity === "" || current < minRice) {
        setRiceQuantity(String(minRice));
      }
    }
  }, [isWaleemah, quantity]);

  const itemPrices: Record<string, number> = {
    goat: GOAT_PRICE,
    sheep: SHEEP_PRICE,
    cow: COW_PRICE,
  };

  const donationItemPrice = donationItem ? itemPrices[donationItem] ?? 0 : 0;

  const subTotal = useMemo(() => {
    const riceKg = riceQuantity === "" ? 0 : parseInt(riceQuantity, 10) || 0;
    const riceCost = (riceKg / 25) * RICE_PRICE;
    const base = donationItemPrice * quantity + riceCost;
    return isWaleemah ? base + COW_PRICE * quantity : base;
  }, [donationItemPrice, quantity, riceQuantity, isWaleemah]);

  const buildInternationalWhatsapp = () => {
    const meta = getCountryByCode(whatsappCountryCode);
    const dial = meta?.dialCode?.replace(/\D/g, "") ?? "";
    const local = whatsappLocal.replace(/\D/g, "");
    return `+${dial}${local}`;
  };

  const buildNotes = (values: {
    whatsappE164: string;
    donationCountryCode: string;
  }) => {
    const sections: string[] = [];
    sections.push(`WhatsApp: ${values.whatsappE164}`);
    const waName =
      getCountryByCode(whatsappCountryCode)?.name ?? whatsappCountryCode;
    sections.push(
      `WhatsApp Country: ${waName} (${whatsappCountryCode.toUpperCase()})`
    );
    const selected = getCountryForAnimalByCode(
      donationItem,
      values.donationCountryCode
    );
    if (selected) {
      sections.push(
        `Donation Country: ${selected.name} (${values.donationCountryCode})`
      );
    }
    if (specialRequest && notes.trim()) {
      let requestType = "Special Request";
      if (specialRequest === "dua") requestType = "Dua Request";
      if (specialRequest === "specialDua") requestType = "Special Dua Request";
      sections.push(`${requestType}: ${notes.trim()}`);
    }
    return sections.join("\n---\n");
  };

  const validate = (): string | null => {
    if (!donationItem) return "Please select goat or sheep.";
    if (!country) return "Please select a country.";
    if (!behalfOf.trim()) return "Please enter on behalf of (full name).";
    const wa = buildInternationalWhatsapp();
    if (!/^\+?[1-9]\d{1,14}$/.test(wa)) {
      return "Please enter a valid WhatsApp number.";
    }
    if (specialRequest === "specialDua" && !notes.trim()) {
      return "Please enter notes for your special dua request.";
    }
    return null;
  };

  const increaseQuantity = () => setQuantity((q) => q + 1);

  const decreaseQuantity = () =>
    setQuantity((q) => (q > 1 ? q - 1 : 1));

  const setRicePreset = (kg: string) => {
    if (kg === "") {
      if (!isWaleemah) setRiceQuantity("");
      return;
    }
    const n = parseInt(kg, 10);
    const min = isWaleemah ? quantity * 25 : 0;
    setRiceQuantity(String(Math.max(n, min || 25)));
  };

  const adjustRice = (delta: number) => {
    const current = riceQuantity === "" ? 0 : parseInt(riceQuantity, 10) || 0;
    const minRice = isWaleemah ? quantity * 25 : 0;
    const next = Math.max(minRice, current + delta);
    if (!isWaleemah && next === 0) {
      setRiceQuantity("");
      return;
    }
    setRiceQuantity(String(Math.max(25, next)));
  };

  const handleAddToCart = async () => {
    const err = validate();
    if (err) {
      Alert.alert("Check details", err);
      return;
    }

    const whatsappE164 = buildInternationalWhatsapp();
    const riceKg = riceQuantity === "" ? 0 : parseInt(riceQuantity, 10) || 0;
    const riceBags = riceKg / 25;

    const basketItem = {
      campaignId: campaign.id,
      name: campaign.name,
      coverImage: campaign.coverImage,
      amount: subTotal,
      total: subTotal,
      quantity,
      riceQuantity: riceBags,
      ricePrice: RICE_PRICE,
      donationItemPrice,
      isRecurring: false,
      periodDays: 0,
      checkoutType: "ADEEQAH_GENERAL_SACRIFICE",
      donationItem: donationItem === "goat" ? "GOAT" : "SHEEP",
      country,
      isWaleemah,
      behalfOf: behalfOf.trim(),
      notes: buildNotes({
        whatsappE164,
        donationCountryCode: country,
      }),
    };

    await onAddToBasket(basketItem);
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled
      showsVerticalScrollIndicator={false}
      persistentScrollbar={false}
    >
      <Section title="Animal">
        <View style={styles.segmentRow}>
          {(["goat", "sheep"] as const).map((key) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.segment,
                donationItem === key && styles.segmentActive,
              ]}
              onPress={() => setDonationItem(key)}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.segmentText,
                  donationItem === key && styles.segmentTextActive,
                ]}
              >
                {key === "goat" ? "Goat" : "Sheep"}
              </Text>
              <Text
                style={[
                  styles.segmentPrice,
                  donationItem === key && styles.segmentPriceActive,
                ]}
              >
                ${key === "goat" ? GOAT_PRICE : SHEEP_PRICE}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {donationItem !== "" && (
          <View style={styles.qtyRow}>
            <Text style={styles.fieldLabel}>Quantity</Text>
            <View style={styles.stepper}>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={decreaseQuantity}
                accessibilityLabel="Decrease quantity"
              >
                <Ionicons name="remove" size={18} color="#010D26" />
              </TouchableOpacity>
              <Text style={styles.stepperValue}>{quantity}</Text>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={increaseQuantity}
                accessibilityLabel="Increase quantity"
              >
                <Ionicons name="add" size={18} color="#010D26" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {donationItem !== "" && countries.length > 0 && (
          <>
            <Text style={styles.fieldLabel}>Country</Text>
            <View style={styles.pickerWrap}>
              <Picker
                selectedValue={country}
                onValueChange={(v) => setCountry(v)}
                style={styles.picker}
                itemStyle={
                  Platform.OS === "ios" ? styles.pickerItemIos : undefined
                }
              >
                <Picker.Item label="Select a country" value="" />
                {countries.map((c) => (
                  <Picker.Item key={c.code} label={c.name} value={c.code} />
                ))}
              </Picker>
            </View>
          </>
        )}
      </Section>

      <Section title="Contact">
        <Text style={styles.fieldLabel}>On behalf of</Text>
        <TextInput
          style={styles.input}
          placeholder="Full name"
          value={behalfOf}
          onChangeText={setBehalfOf}
          placeholderTextColor="#9CA3AF"
        />

        <View style={styles.phoneBlock}>
          <PhoneInput
            label="WhatsApp"
            value={whatsappLocal}
            countryCode={whatsappCountryCode}
            onChangeText={setWhatsappLocal}
            onCountryChange={setWhatsappCountryCode}
          />
        </View>
        <Text style={styles.hint}>
          For order confirmation and sacrifice updates.
        </Text>
      </Section>

      <Section title="Requests (optional)">
        <View style={styles.pickerWrap}>
          <Picker
            selectedValue={specialRequest}
            onValueChange={(v) => setSpecialRequest(v)}
            style={styles.pickerCompact}
            itemStyle={Platform.OS === "ios" ? styles.pickerItemIos : undefined}
          >
            <Picker.Item label="None" value="" />
            <Picker.Item label="Dua" value="dua" />
            <Picker.Item label="Special dua" value="specialDua" />
          </Picker>
        </View>

        {specialRequest === "specialDua" && (
          <TextInput
            style={[styles.input, styles.textArea, styles.inputTightTop]}
            placeholder="Notes for your request"
            value={notes}
            onChangeText={setNotes}
            multiline
            placeholderTextColor="#9CA3AF"
          />
        )}
      </Section>

      {donationItem !== "" && (
        <Section title="Rice & Waleemah">
          <View style={styles.riceHeader}>
            <Text style={styles.fieldLabel}>Extra rice</Text>
            {!isWaleemah && <Text style={styles.optional}>Optional</Text>}
          </View>
          {!isWaleemah && (
            <TouchableOpacity
              style={[
                styles.riceOption,
                riceQuantity === "" && styles.riceOptionActive,
              ]}
              onPress={() => setRicePreset("")}
            >
              <Text style={styles.riceOptionText}>No rice</Text>
              <Text style={styles.riceBadge}>Free</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[
              styles.riceOption,
              riceQuantity === "25" && styles.riceOptionActive,
            ]}
            onPress={() => setRicePreset("25")}
          >
            <Text style={styles.riceOptionText}>25 kg rice</Text>
            {isWaleemah && (
              <Text style={styles.riceBadgeReq}>Required</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.riceOption,
              riceQuantity === "50" && styles.riceOptionActive,
              isWaleemah && styles.riceOptionDisabled,
            ]}
            onPress={() => !isWaleemah && setRicePreset("50")}
            disabled={isWaleemah}
          >
            <Text style={styles.riceOptionText}>50 kg rice</Text>
            {isWaleemah && (
              <Text style={styles.riceBadgeMuted}>Unavailable</Text>
            )}
          </TouchableOpacity>

          {riceQuantity !== "" && (
            <View style={styles.riceAdjust}>
              <Text style={styles.subLabel}>Adjust (25 kg steps)</Text>
              <View style={styles.stepper}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => adjustRice(-25)}
                  disabled={
                    isWaleemah &&
                    parseInt(riceQuantity, 10) <= quantity * 25
                  }
                >
                  <Ionicons
                    name="remove"
                    size={18}
                    color={
                      isWaleemah &&
                      parseInt(riceQuantity, 10) <= quantity * 25
                        ? "#D1D5DB"
                        : "#010D26"
                    }
                  />
                </TouchableOpacity>
                <Text style={styles.riceKg}>{riceQuantity} kg</Text>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => adjustRice(25)}
                >
                  <Ionicons name="add" size={18} color="#010D26" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[styles.waleemah, isWaleemah && styles.waleemahOn]}
            onPress={() => {
              const next = !isWaleemah;
              setIsWaleemah(next);
              if (next) {
                setRiceQuantity(String(quantity * 25));
              }
            }}
            activeOpacity={0.9}
          >
            <View style={styles.waleemahRow}>
              <View
                style={[styles.checkbox, isWaleemah && styles.checkboxOn]}
              >
                {isWaleemah && (
                  <Ionicons name="checkmark" size={14} color="#fff" />
                )}
              </View>
              <View style={styles.waleemahTextCol}>
                <Text style={styles.waleemahTitle}>
                  Waleemah (+$120 each)
                </Text>
                <Text style={styles.waleemahDesc}>
                  Cooked with rice and served to the community.
                </Text>
              </View>
            </View>
            {isWaleemah && (
              <Text style={styles.waleemahNote}>
                25 kg rice minimum per animal; rice cannot be removed while
                Waleemah is on.
              </Text>
            )}
          </TouchableOpacity>
        </Section>
      )}

      {donationItem !== "" && country !== "" && (
        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${subTotal.toFixed(2)}</Text>
        </View>
      )}

      {donationItem !== "" && country !== "" && (
        <Text style={styles.processingNote}>
          Allow up to 5 business days to process.
        </Text>
      )}

      <TouchableOpacity
        style={[
          styles.primaryButton,
          addingToCart && styles.primaryButtonDisabled,
        ]}
        onPress={handleAddToCart}
        disabled={addingToCart}
        activeOpacity={0.85}
      >
        <Text style={styles.primaryButtonText}>
          {addingToCart ? "Adding…" : "Add to basket"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { maxHeight: 520 },
  scrollContent: {
    paddingBottom: 12,
    paddingHorizontal: 2,
  },
  section: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B7280",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  subLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 6,
  },
  hint: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 4,
    lineHeight: 15,
  },
  phoneBlock: {
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 10 : 8,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#fff",
  },
  inputTightTop: { marginTop: 8 },
  textArea: { minHeight: 64, textAlignVertical: "top" },
  pickerWrap: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  picker: { width: "100%" },
  pickerCompact: {
    width: "100%",
    ...(Platform.OS === "android" ? { height: 48 } : {}),
  },
  pickerItemIos: { height: 120 },
  segmentRow: {
    flexDirection: "row",
    gap: 8,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  segmentActive: {
    borderColor: "#246BE1",
    backgroundColor: "#EFF6FF",
  },
  segmentText: { fontSize: 15, fontWeight: "700", color: "#374151" },
  segmentTextActive: { color: "#1D4ED8" },
  segmentPrice: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9CA3AF",
    marginTop: 2,
  },
  segmentPriceActive: { color: "#246BE1" },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  stepperBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  stepperValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    minWidth: 26,
    textAlign: "center",
  },
  riceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  optional: { fontSize: 11, color: "#9CA3AF" },
  riceOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 6,
    backgroundColor: "#fff",
  },
  riceOptionActive: {
    borderColor: "#246BE1",
    backgroundColor: "#EFF6FF",
  },
  riceOptionDisabled: { opacity: 0.5 },
  riceOptionText: { fontSize: 14, fontWeight: "600", color: "#374151" },
  riceBadge: {
    fontSize: 10,
    color: "#6B7280",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: "hidden",
  },
  riceBadgeReq: {
    fontSize: 10,
    color: "#fff",
    backgroundColor: "#246BE1",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: "hidden",
  },
  riceBadgeMuted: {
    fontSize: 10,
    color: "#6B7280",
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: "hidden",
  },
  riceAdjust: { marginBottom: 8 },
  riceKg: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    minWidth: 68,
    textAlign: "center",
  },
  waleemah: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 12,
    marginTop: 4,
    backgroundColor: "#fff",
  },
  waleemahOn: {
    borderColor: "#93C5FD",
    backgroundColor: "#EFF6FF",
  },
  waleemahRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  waleemahTextCol: { flex: 1 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#9CA3AF",
    marginTop: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxOn: {
    backgroundColor: "#246BE1",
    borderColor: "#246BE1",
  },
  waleemahTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  waleemahDesc: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
    lineHeight: 16,
  },
  waleemahNote: {
    marginTop: 8,
    fontSize: 11,
    color: "#1E40AF",
    lineHeight: 15,
  },
  totalBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  totalLabel: { fontSize: 15, fontWeight: "700", color: "#111827" },
  totalValue: { fontSize: 19, fontWeight: "800", color: "#010D26" },
  processingNote: {
    fontSize: 11,
    color: "#9CA3AF",
    marginBottom: 8,
    textAlign: "center",
    lineHeight: 15,
  },
  primaryButton: {
    backgroundColor: "#FFD602",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 4,
  },
  primaryButtonDisabled: { opacity: 0.6 },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#010D26",
  },
});
