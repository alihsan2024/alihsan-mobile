import React from "react";
import { View } from "react-native";
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
    <View>
      {summary.items.map((item, index) => (
        <BasketItemRow
          key={item.id || index}
          item={item}
          index={index}
          formatPrice={formatPrice}
          variant="summary"
        />
      ))}

      <BasketTotal
        subTotal={summary.subtotal}
        processingAmount={summary.adminFee}
        total={summary.total}
      />
    </View>
  );
};

export default ConfirmStep;
