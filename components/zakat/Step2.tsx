import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useZakat } from "../../context/ZakatContext";
import Button from "../Button";
import AmountInput from "./AmountInput";
import MetalModal from "./MetalModal";

export default function Step2() {
  const { amounts, updateAmount, nextStep, prevStep, updateMetal, removeMetal } = useZakat();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"gold" | "silver" | null>(null);
  const [editingMetal, setEditingMetal] = useState<any>(null);

  const openModal = (type: "gold" | "silver") => {
    setModalType(type);
    setEditingMetal(null);
    setModalVisible(true);
  };

  const editMetal = (metal: any, type: "gold" | "silver") => {
    setEditingMetal(metal);
    setModalType(type);
    setModalVisible(true);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cash & Bank</Text>
        
        <View style={styles.currencySelector}>
          <TouchableOpacity
            style={[
              styles.currencyButton,
              amounts.unit === "AUD" && styles.currencyButtonActive,
            ]}
            onPress={() => updateAmount("unit", "AUD")}
          >
            <Text
              style={[
                styles.currencyText,
                amounts.unit === "AUD" && styles.currencyTextActive,
              ]}
            >
              AUD
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.currencyButton,
              amounts.unit === "USD" && styles.currencyButtonActive,
            ]}
            onPress={() => updateAmount("unit", "USD")}
          >
            <Text
              style={[
                styles.currencyText,
                amounts.unit === "USD" && styles.currencyTextActive,
              ]}
            >
              USD
            </Text>
          </TouchableOpacity>
        </View>

        <AmountInput
          label="Cash On Hand"
          value={amounts.cash}
          onChangeValue={(value) => updateAmount("cash", value)}
          currency={amounts.unit}
        />

        <AmountInput
          label="Balance Held In Bank Accounts"
          value={amounts.bank}
          onChangeValue={(value) => updateAmount("bank", value)}
          currency={amounts.unit}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Gold & Silver</Text>
        
        <View style={styles.metalButtons}>
          <Button
            label="Add Gold"
            onPress={() => openModal("gold")}
            variant="outline"
            style={styles.metalButton}
          />
          <Button
            label="Add Silver"
            onPress={() => openModal("silver")}
            variant="outline"
            style={styles.metalButton}
          />
        </View>

        {amounts.gold.map((metal) => (
          <MetalCard
            key={metal.key}
            type="gold"
            metal={metal}
            currency={amounts.unit}
            onEdit={() => editMetal(metal, "gold")}
            onDelete={() => removeMetal("gold", metal.key)}
          />
        ))}

        {amounts.silver.map((metal) => (
          <MetalCard
            key={metal.key}
            type="silver"
            metal={metal}
            currency={amounts.unit}
            onEdit={() => editMetal(metal, "silver")}
            onDelete={() => removeMetal("silver", metal.key)}
          />
        ))}
      </View>

      <View style={styles.buttonRow}>
        <Button label="Back" onPress={prevStep} variant="secondary" style={styles.button} />
        <Button label="Next" onPress={nextStep} style={styles.button} />
      </View>

      <MetalModal
        visible={modalVisible}
        type={modalType}
        metal={editingMetal}
        onClose={() => setModalVisible(false)}
        onSave={(metal) => {
          if (modalType) {
            updateMetal(modalType, metal);
            setModalVisible(false);
          }
        }}
      />
    </ScrollView>
  );
}

function MetalCard({
  type,
  metal,
  currency,
  onEdit,
  onDelete,
}: {
  type: "gold" | "silver";
  metal: any;
  currency: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  if (metal.value <= 0) return null;

  return (
    <View style={[styles.metalCard, type === "gold" && styles.goldCard]}>
      <View style={styles.metalCardContent}>
        <Text style={styles.metalCardTitle}>
          {type === "gold" ? "Gold" : "Silver"}
        </Text>
        <Text style={styles.metalCardValue}>
          {currency} {metal.value.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      </View>
      <View style={styles.metalCardActions}>
        <TouchableOpacity onPress={onEdit} style={styles.metalCardButton}>
          <Text style={styles.metalCardButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={styles.metalCardButton}>
          <Text style={[styles.metalCardButtonText, styles.deleteText]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#264B8B",
    marginBottom: 16,
  },
  currencySelector: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 12,
  },
  currencyButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  currencyButtonActive: {
    borderColor: "#264B8B",
    backgroundColor: "#f0f4ff",
  },
  currencyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  currencyTextActive: {
    color: "#264B8B",
  },
  metalButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  metalButton: {
    flex: 1,
  },
  metalCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#264B8B",
  },
  goldCard: {
    borderLeftColor: "#FFD700",
  },
  metalCardContent: {
    marginBottom: 12,
  },
  metalCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  metalCardValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#264B8B",
  },
  metalCardActions: {
    flexDirection: "row",
    gap: 12,
  },
  metalCardButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  metalCardButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#264B8B",
  },
  deleteText: {
    color: "#d32f2f",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
    marginBottom: 20,
  },
  button: {
    flex: 1,
  },
});

