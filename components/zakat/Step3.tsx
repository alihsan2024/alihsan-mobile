import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useZakat } from "../../context/ZakatContext";
import Button from "../Button";
import AmountInput from "./AmountInput";

export default function Step3() {
  const { amounts, updateAmount, nextStep, prevStep } = useZakat();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Investments</Text>
        
        <AmountInput
          label="Annual Profit Of Investment Held"
          value={amounts.investmentProfit}
          onChangeValue={(value) => updateAmount("investmentProfit", value)}
          currency={amounts.unit}
        />

        <AmountInput
          label="Resale Value Of Share"
          value={amounts.shareResale}
          onChangeValue={(value) => updateAmount("shareResale", value)}
          currency={amounts.unit}
        />

        <AmountInput
          label="Merchandise & Profits"
          value={amounts.merchandise}
          onChangeValue={(value) => updateAmount("merchandise", value)}
          currency={amounts.unit}
        />
      </View>

      <View style={styles.buttonRow}>
        <Button label="Back" onPress={prevStep} variant="secondary" style={styles.button} />
        <Button label="Next" onPress={nextStep} style={styles.button} />
      </View>
    </ScrollView>
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

