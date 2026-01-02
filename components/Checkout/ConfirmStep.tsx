import React from "react";
import { View, StyleSheet } from "react-native";
import SummaryCard from "../ui/SummaryCard";
import PriceRow from "./PriceRow";

const ConfirmStep = () => {
  return (
    <View>
      <SummaryCard
        title="Monthly Sponsorship - Amina"
        subtitle="Jordan | Support for education & meals"
        amount="$40.00"
      />

      <View style={styles.priceBox}>
        <PriceRow label="Subtotal" value="$40.00" />
        <PriceRow label="Admin Fee" value="$1.20" />
        <PriceRow label="Total" value="$41.20" bold />
      </View>
    </View>
  );
};

export default ConfirmStep;

const styles = StyleSheet.create({
  priceBox: { marginTop: 16 },
});
