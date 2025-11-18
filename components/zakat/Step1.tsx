import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useZakat } from "../../context/ZakatContext";
import Button from "../Button";

export default function Step1() {
  const { nextStep } = useZakat();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Let's calculate your Zakat Al-Maal</Text>
      <Text style={styles.description}>
        In Sharia, Zakat al-Maal is an Islamic financial obligation requiring
        Muslims to donate 2.5% of their wealth annually to the needy.
      </Text>
      <View style={styles.buttonContainer}>
        <Button label="Bismillah, calculate." onPress={nextStep} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#264B8B",
    marginBottom: 16,
    lineHeight: 36,
  },
  description: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
    marginBottom: 32,
  },
  buttonContainer: {
    marginTop: 16,
  },
});

