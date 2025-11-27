import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  zakatStep,
  zakatInput,
  zakatMetalInput,
} from "@/store/reduxSlice/zakatSlice";
import type { ZakatAmountKeys } from "@/store/reduxSlice/zakatSlice";
import Button from "@/components/ui/Button";
import ZakatCalculatorHeader from "@/components/Zakat/ZakatCalculatorHeader";
import Stepper from "@/components/ui/Stepper";

// -------------------------
// MetalModal Component
// -------------------------
interface MetalModalProps {
  visible: boolean;
  metal: { type: "gold" | "silver"; key: number } | null;
  onRequestClose: () => void;
  unit: "AUD" | "USD";
  onSave: (value: number, karat?: number) => void;
  initialValue?: number;
}
function MetalModal({
  visible,
  onRequestClose,
  metal,
  onSave,
  initialValue = 0,
}: MetalModalProps) {
  const [value, setValue] = useState(initialValue);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          backgroundColor: "#00000099",
          padding: 20,
        }}
      >
        <View
          style={{ backgroundColor: "#fff", padding: 20, borderRadius: 12 }}
        >
          <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 12 }}>
            {metal?.type === "gold"
              ? "Add Zakatable Gold"
              : "Add Zakatable Silver"}
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              padding: 10,
              borderRadius: 8,
              marginBottom: 20,
            }}
            keyboardType="numeric"
            value={value.toString()}
            onChangeText={(t) => setValue(Number(t))}
            placeholder="Enter value"
          />
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Button label="Cancel" onPress={onRequestClose} />
            <Button
              label="Save"
              onPress={() => {
                onSave(value);
                onRequestClose();
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

// -------------------------
// MetalDisplay Component
// -------------------------
interface MetalDisplayProps {
  value: number;
  unit: "AUD" | "USD";
  type: "gold" | "silver";
  onEdit: () => void;
  onDelete: () => void;
}
function MetalDisplay({
  value,
  unit,
  type,
  onEdit,
  onDelete,
}: MetalDisplayProps) {
  if (!value || value <= 0) return null;
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 12,
        marginVertical: 6,
        borderRadius: 10,
        backgroundColor: type === "silver" ? "#E8F0FE" : "#FFE8E8",
        borderWidth: 1,
        borderColor: type === "silver" ? "#264B8B" : "#FF5C5C",
      }}
    >
      <Text>{`Zakatable ${type === "silver" ? "Silver" : "Gold"}: ${
        typeof value === "number" && !isNaN(value) ? value.toFixed(2) : "0.00"
      } ${unit}`}</Text>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <TouchableOpacity onPress={onEdit}>
          <Text style={{ color: "#264B8B" }}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete}>
          <Text style={{ color: "#FF5C5C" }}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// -------------------------
// Step2 Component
// -------------------------
export default function Step2() {
  const dispatch = useDispatch();
  const { cash, bank, unit, silver, gold } = useSelector(
    (state: any) => state.zakatCalculator.amounts
  );

  const [errors, setErrors] = useState<{ cash?: string; bank?: string }>({});
  const [modalMetal, setModalMetal] = useState<{
    type: "gold" | "silver";
    key: number;
  } | null>(null);

  const onChangeValue = (name: string, value: number) => {
    dispatch(zakatInput({ name: name as ZakatAmountKeys, value }));
  };

  const addError = (name: string, error: string) =>
    setErrors((e) => ({ ...e, [name]: error }));

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <ZakatCalculatorHeader />

      {/* Cash on Hand */}
      <Text style={{ fontWeight: "700", marginTop: 20 }}>Cash on Hand</Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: errors.cash ? "red" : "#ccc",
          padding: 10,
          borderRadius: 8,
          marginVertical: 8,
        }}
        keyboardType="numeric"
        placeholder="Enter cash on hand"
        value={cash?.toString() || ""}
        onChangeText={(t) => onChangeValue("cash", Number(t))}
      />
      {errors.cash && <Text style={{ color: "red" }}>{errors.cash}</Text>}

      {/* Bank Balance */}
      <Text style={{ fontWeight: "700", marginTop: 20 }}>
        Balance Held in Bank Accounts
      </Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: errors.bank ? "red" : "#ccc",
          padding: 10,
          borderRadius: 8,
          marginVertical: 8,
        }}
        keyboardType="numeric"
        placeholder="Enter bank balance"
        value={bank?.toString() || ""}
        onChangeText={(t) => onChangeValue("bank", Number(t))}
      />
      {errors.bank && <Text style={{ color: "red" }}>{errors.bank}</Text>}

      {/* Zakatable Metals */}
      <View style={{ flexDirection: "row", gap: 12, marginTop: 20 }}>
        <Button
          label="Add Zakatable Silver"
          onPress={() => setModalMetal({ type: "silver", key: 0 })}
        />
        <Button
          label="Add Zakatable Gold"
          onPress={() => setModalMetal({ type: "gold", key: 0 })}
        />
      </View>

      {/* Metals Display */}
      {silver?.map((each: any, i: number) => (
        <MetalDisplay
          key={`silver_${i}`}
          value={each.value}
          unit={unit}
          type="silver"
          onEdit={() => setModalMetal({ type: "silver", key: each.key })}
          onDelete={() =>
            dispatch(zakatMetalInput({ ...each, value: 0, weight: 0 }))
          }
        />
      ))}
      {gold?.map((each: any, i: number) => (
        <MetalDisplay
          key={`gold_${i}`}
          value={each.value}
          unit={unit}
          type="gold"
          onEdit={() => setModalMetal({ type: "gold", key: each.key })}
          onDelete={() =>
            dispatch(zakatMetalInput({ ...each, value: 0, weight: 0 }))
          }
        />
      ))}

      {/* Back / Next */}
      <View style={{ flexDirection: "row", gap: 12, marginTop: 30 }}>
        <Button label="Back" onPress={() => dispatch(zakatStep(-1))} />
        <Button
          label="Next"
          onPress={() => dispatch(zakatStep(1))}
          disabled={!!errors.cash || !!errors.bank}
        />
      </View>

      {/* Metal Modal */}
      {modalMetal && (
        <MetalModal
          visible={!!modalMetal}
          metal={modalMetal}
          unit={unit}
          onRequestClose={() => setModalMetal(null)}
          onSave={(value) => {
            dispatch(
              zakatMetalInput({
                name: modalMetal.type,
                key: modalMetal.key,
                unit,
                value,
                type: modalMetal.type,
              })
            );
          }}
        />
      )}
    </ScrollView>
  );
}
