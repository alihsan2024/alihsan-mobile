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

export default function Step4() {
  const dispatch = useDispatch();
  const { loan, other } = useSelector(
    (state: any) => state.zakatCalculator.amounts
  );

  const [errors, setErrors] = useState<{ loan?: string; other?: string }>({});
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
      {/* <Text style={{ fontSize: 20, marginBottom: 16 }}>
        Loans & Other Wealth
      </Text> */}

      {/* Awaiting Receivable Loans */}
      <View style={{ marginBottom: 16 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Text style={{ fontWeight: "700", fontSize: 16 }}>
            Total Amount Of Awaiting Receivable Loans
          </Text>
          <TouchableOpacity
            onPress={() =>
              openTooltip(
                "List the total sum of outstanding loans you expect to receive back."
              )
            }
          >
            <Text style={{ marginLeft: 8, color: "#007AFF" }}>ℹ️</Text>
          </TouchableOpacity>
        </View>
        <AmountInput
          name="loan"
          defaultValue={loan || ""}
          onChangeValue={onChangeValue}
          onValidationError={addError}
          placeholder="0"
        />
        {errors.loan && <Text style={{ color: "red" }}>{errors.loan}</Text>}
      </View>

      {/* Other Zakatable Wealth */}
      <View style={{ marginBottom: 16 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Text style={{ fontWeight: "700", fontSize: 16 }}>
            Other Zakatable Wealth
          </Text>
          <TouchableOpacity
            onPress={() =>
              openTooltip(
                "Input any additional assets subject to Zakat, such as rental income or valuable commodities."
              )
            }
          >
            <Text style={{ marginLeft: 8, color: "#007AFF" }}>ℹ️</Text>
          </TouchableOpacity>
        </View>
        <AmountInput
          name="other"
          defaultValue={other || ""}
          onChangeValue={onChangeValue}
          onValidationError={addError}
          placeholder="0.00"
        />
        {errors.other && <Text style={{ color: "red" }}>{errors.other}</Text>}
      </View>

      {/* Back / Next Buttons */}
      <View style={{ flexDirection: "row", marginTop: 20, gap: 12 }}>
        <Button label="Back" onPress={() => dispatch(zakatStep(-1))} />
        <Button label="Next" onPress={() => dispatch(zakatStep(1))} />
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
