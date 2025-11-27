import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { zakatInput, zakatStep } from "@/store/reduxSlice/zakatSlice";
import Button from "@/components/ui/Button";
import AmountInput from "@/components/ui/inputs/AmountInput";
import ZakatCalculatorHeader from "@/components/Zakat/ZakatCalculatorHeader";
import Stepper from "@/components/ui/Stepper";

interface TooltipProps {
  visible: boolean;
  text: string;
  onClose: () => void;
}

const TooltipRN = ({ visible, text, onClose }: TooltipProps) => (
  <Modal transparent visible={visible} animationType="fade">
    <TouchableOpacity
      style={{
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "center",
        alignItems: "center",
      }}
      onPress={onClose}
    >
      <View
        style={{
          backgroundColor: "#fff",
          padding: 16,
          borderRadius: 8,
          maxWidth: 300,
        }}
      >
        <Text style={{ fontSize: 14, color: "#444" }}>{text}</Text>
      </View>
    </TouchableOpacity>
  </Modal>
);

export default function Step3() {
  const dispatch = useDispatch();
  const { investmentProfit, shareResale, merchandise } = useSelector(
    (state: any) => state.zakatCalculator.amounts
  );

  const [errors, setErrors] = useState<{
    investmentProfit?: string;
    shareResale?: string;
    merchandise?: string;
  }>({});

  const [tooltipText, setTooltipText] = useState("");
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const onChangeValue = (name: string, value: number) => {
    dispatch(
      zakatInput({
        name: name as import("@/store/reduxSlice/zakatSlice").ZakatAmountKeys,
        value,
      })
    );
  };

  const addError = (name: string, error: string) =>
    setErrors((prev) => ({ ...prev, [name]: error }));

  const openTooltip = (text: string) => {
    setTooltipText(text);
    setTooltipVisible(true);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <ZakatCalculatorHeader />

      {/* Investment Profit */}
      <View style={{ marginBottom: 16 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Text style={{ fontWeight: "700", fontSize: 16 }}>
            Annual Profit Of Investment Held:
          </Text>
          <TouchableOpacity
            onPress={() =>
              openTooltip(
                "Record the yearly earnings from investments, including stocks, bonds, or business ventures."
              )
            }
          >
            <Text style={{ marginLeft: 8, color: "#007AFF" }}>ℹ️</Text>
          </TouchableOpacity>
        </View>
        <AmountInput
          name="investmentProfit"
          defaultValue={investmentProfit || ""}
          onChangeValue={onChangeValue}
          onValidationError={addError}
          placeholder="0"
        />
        {errors.investmentProfit && (
          <Text style={{ color: "red" }}>{errors.investmentProfit}</Text>
        )}
      </View>

      {/* Share Resale */}
      <View style={{ marginBottom: 16 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Text style={{ fontWeight: "700", fontSize: 16 }}>
            Resale Value Of Share:
          </Text>
          <TouchableOpacity
            onPress={() =>
              openTooltip(
                "Enter the current market value of any shares you own."
              )
            }
          >
            <Text style={{ marginLeft: 8, color: "#007AFF" }}>ℹ️</Text>
          </TouchableOpacity>
        </View>
        <AmountInput
          name="shareResale"
          defaultValue={shareResale || ""}
          onChangeValue={onChangeValue}
          onValidationError={addError}
          placeholder="0.00"
        />
        {errors.shareResale && (
          <Text style={{ color: "red" }}>{errors.shareResale}</Text>
        )}
      </View>

      {/* Merchandise & Profits */}
      <View style={{ marginBottom: 16 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Text style={{ fontWeight: "700", fontSize: 16 }}>
            Merchandise & Profits:
          </Text>
          <TouchableOpacity
            onPress={() =>
              openTooltip(
                "Include the value of business inventory plus any profits not yet reinvested."
              )
            }
          >
            <Text style={{ marginLeft: 8, color: "#007AFF" }}>ℹ️</Text>
          </TouchableOpacity>
        </View>
        <AmountInput
          name="merchandise"
          defaultValue={merchandise || ""}
          onChangeValue={onChangeValue}
          onValidationError={addError}
          placeholder="0"
        />
        {errors.merchandise && (
          <Text style={{ color: "red" }}>{errors.merchandise}</Text>
        )}
      </View>

      {/* Back / Next Buttons */}
      <View style={{ flexDirection: "row", marginTop: 20, gap: 12 }}>
        <Button label="Back" onPress={() => dispatch(zakatStep(-1))} />
        <Button
          label="Next"
          onPress={() => dispatch(zakatStep(1))}
          disabled={
            !!errors.investmentProfit ||
            !!errors.shareResale ||
            !!errors.merchandise
          }
        />
      </View>

      {/* Tooltip Modal */}
      <TooltipRN
        visible={tooltipVisible}
        text={tooltipText}
        onClose={() => setTooltipVisible(false)}
      />
    </ScrollView>
  );
}
