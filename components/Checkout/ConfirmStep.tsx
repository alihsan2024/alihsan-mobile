import React from "react";
import { View, Text, StyleSheet } from "react-native";
import BasketTotal from "../ui/Basket/BasketTotal";
import BasketItemRow from "../ui/Basket/BasketItemRow";

const formatPrice = (price: number): string => {
  return !isNaN(price)
    ? price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "0.00";
};

type Props = {
  summary: {
    items: any[];
    subtotal: number;
    adminFee: number;
    total: number;
  };
};

const ConfirmStep = ({ summary }: Props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Review Your Order</Text>
      
      <View style={styles.itemsContainer}>
        {summary.items.map((item, index) => (
          <BasketItemRow
            key={item.id || index}
            item={item}
            index={index}
            formatPrice={formatPrice}
            variant="summary"
          />
        ))}
      </View>

      <BasketTotal
        subTotal={summary.subtotal}
        processingAmount={summary.adminFee}
        total={summary.total}
      />
    </View>
  );
};

export default ConfirmStep;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    width: "100%",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#010D26",
    marginBottom: 12,
    fontFamily: "AlbertSans_800ExtraBold",
    textAlign: "center",
    width: "100%",
  },
  itemsContainer: {
    width: "100%",
    marginBottom: 12,
  },
});
