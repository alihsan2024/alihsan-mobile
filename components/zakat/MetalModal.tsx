import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { useZakat } from "../../context/ZakatContext";
import Button from "../Button";

interface MetalModalProps {
  visible: boolean;
  type: "gold" | "silver" | null;
  metal: any;
  onClose: () => void;
  onSave: (metal: any) => void;
}

export default function MetalModal({
  visible,
  type,
  metal,
  onClose,
  onSave,
}: MetalModalProps) {
  const { amounts, prices } = useZakat();
  const [karat, setKarat] = useState(metal?.karat || "24");
  const [unit, setUnit] = useState<"gram" | "ounce">(metal?.unit || "gram");
  const [weight, setWeight] = useState(metal?.weight?.toString() || "");
  const [value, setValue] = useState(metal?.value?.toString() || "");

  useEffect(() => {
    if (metal) {
      setKarat(metal.karat || "24");
      setUnit(metal.unit || "gram");
      setWeight(metal.weight?.toString() || "");
      setValue(metal.value?.toString() || "");
    } else {
      setKarat("24");
      setUnit("gram");
      setWeight("");
      setValue("");
    }
  }, [metal, visible]);

  const calculateValue = useCallback((weightValue: string) => {
    if (!prices || !type || !weightValue) return 0;

    const weightNum = parseFloat(weightValue) || 0;
    if (weightNum <= 0) return 0;

    const karatNum = parseFloat(karat) || 24;

    let pricePerGram = 0;
    if (type === "gold") {
      // Gold price is per troy ounce, convert to grams
      const pricePerOunce =
        amounts.unit === "AUD"
          ? prices.goldPriceInAud
          : prices.goldPriceInUsd;
      pricePerGram = pricePerOunce / 31.1035;
      // Adjust for karat (24k is pure, so divide by 24 and multiply by karat)
      pricePerGram = (pricePerGram * karatNum) / 24;
    } else {
      // Silver price is per troy ounce, convert to grams
      const pricePerOunce =
        amounts.unit === "AUD"
          ? prices.silverFinePriceInAud
          : prices.silverFinePriceInUsd;
      pricePerGram = pricePerOunce / 31.1035;
    }

    const weightInGrams = unit === "ounce" ? weightNum * 31.1035 : weightNum;
    return weightInGrams * pricePerGram;
  }, [prices, type, amounts.unit, karat, unit]);

  const handleWeightChange = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, "");
    setWeight(cleaned);
    if (cleaned) {
      const calculatedValue = calculateValue(cleaned);
      setValue(calculatedValue.toFixed(2));
    } else {
      setValue("");
    }
  };

  useEffect(() => {
    if (weight && calculateValue) {
      const calculatedValue = calculateValue(weight);
      if (calculatedValue > 0) {
        setValue(calculatedValue.toFixed(2));
      }
    }
  }, [karat, unit, calculateValue]);

  const handleValueChange = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, "");
    setValue(cleaned);
  };

  const handleSave = () => {
    if (!weight || !value || !karat) return;

    const metalData = {
      key: metal?.key || Date.now().toString(),
      karat,
      unit,
      weight: parseFloat(weight),
      value: parseFloat(value),
      name: `${type} ${karat}k`,
    };

    onSave(metalData);
  };

  if (!type) return null;

  const karatOptions = type === "gold" ? ["24", "22", "18", "14", "10"] : ["1"];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>
              Add {type === "gold" ? "Gold" : "Silver"}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.label}>Karat/Purity</Text>
              <View style={styles.karatContainer}>
                {karatOptions.map((k) => (
                  <TouchableOpacity
                    key={k}
                    style={[
                      styles.karatButton,
                      karat === k && styles.karatButtonActive,
                    ]}
                    onPress={() => setKarat(k)}
                  >
                    <Text
                      style={[
                        styles.karatText,
                        karat === k && styles.karatTextActive,
                      ]}
                    >
                      {k}k
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Unit</Text>
              <View style={styles.unitContainer}>
                <TouchableOpacity
                  style={[
                    styles.unitButton,
                    unit === "gram" && styles.unitButtonActive,
                  ]}
                  onPress={() => setUnit("gram")}
                >
                  <Text
                    style={[
                      styles.unitText,
                      unit === "gram" && styles.unitTextActive,
                    ]}
                  >
                    Gram
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.unitButton,
                    unit === "ounce" && styles.unitButtonActive,
                  ]}
                  onPress={() => setUnit("ounce")}
                >
                  <Text
                    style={[
                      styles.unitText,
                      unit === "ounce" && styles.unitTextActive,
                    ]}
                  >
                    Ounce
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Weight ({unit})</Text>
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={handleWeightChange}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>
                Value ({amounts.unit})
              </Text>
              <TextInput
                style={styles.input}
                value={value}
                onChangeText={handleValueChange}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor="#999"
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Button
              label="Cancel"
              onPress={onClose}
              variant="secondary"
              style={styles.footerButton}
            />
            <Button
              label="Save"
              onPress={handleSave}
              style={styles.footerButton}
              disabled={!weight || !value || !karat}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#264B8B",
  },
  closeButton: {
    fontSize: 24,
    color: "#999",
    fontWeight: "300",
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  karatContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  karatButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  karatButtonActive: {
    borderColor: "#264B8B",
    backgroundColor: "#f0f4ff",
  },
  karatText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  karatTextActive: {
    color: "#264B8B",
  },
  unitContainer: {
    flexDirection: "row",
    gap: 12,
  },
  unitButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  unitButtonActive: {
    borderColor: "#264B8B",
    backgroundColor: "#f0f4ff",
  },
  unitText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  unitTextActive: {
    color: "#264B8B",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#fff",
    minHeight: 52,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  footerButton: {
    flex: 1,
  },
});

