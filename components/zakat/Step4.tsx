import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useZakat } from "../../context/ZakatContext";
import Button from "../Button";
import AmountInput from "./AmountInput";

export default function Step4() {
  const { amounts, updateAmount, nextStep, prevStep } = useZakat();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Other Assets</Text>
        
        <AmountInput
          label="Total Amount Of Awaiting Receivable Loans"
          value={amounts.loan}
          onChangeValue={(value) => updateAmount("loan", value)}
          currency={amounts.unit}
        />

        <AmountInput
          label="Other Zakatable Wealth"
          value={amounts.other}
          onChangeValue={(value) => updateAmount("other", value)}
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

