import React, { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGetBasketQuery } from "@/store/reduxSlice/api/basketApi";
import BasketTotal from "../ui/Basket/BasketTotal";
import BasketItemRow from "../ui/Basket/BasketItemRow";

/* ---------- Helpers (SAME as BasketScreen) ---------- */

const formatPrice = (price: number): string => {
  return !isNaN(price)
    ? price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "0.00";
};

const ConfirmStep = () => {
  const { user } = useSelector((state: any) => state.authentication);
  const isAuthenticated = !!user;

  const [guestBasket, setGuestBasket] = useState<any[]>([]);

  // Logged-in basket
  const { data: basketData } = useGetBasketQuery(undefined, {
    skip: !isAuthenticated,
  });

  // Load guest basket (same key as BasketScreen)
  const loadGuestBasket = useCallback(async () => {
    const data = await AsyncStorage.getItem("guestBasket");
    setGuestBasket(data ? JSON.parse(data) : []);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      loadGuestBasket();
    }
  }, [isAuthenticated, loadGuestBasket]);

  // Unified basket items
  const basketItems = isAuthenticated ? basketData?.payload ?? [] : guestBasket;

  /* ---------- Totals (IDENTICAL logic) ---------- */

  const processingFee = 0.03;

  const subtotal = basketItems.reduce((sum: number, item: any) => {
    const checkoutType = item.checkoutType || item.Campaign?.checkoutType;

    if (isAuthenticated) {
      if (checkoutType === "ADEEQAH_GENERAL_SACRIFICE") {
        return sum + parseFloat(item.total?.toString() || "0");
      }
      return (
        sum +
        parseFloat(item.total?.toString() || item.amount?.toString() || "0")
      );
    } else {
      const quantity = parseFloat(item.quantity?.toString() || "1");
      const amount = parseFloat(item.amount?.toString() || "0");
      return sum + amount * quantity;
    }
  }, 0);

  const adminFee = subtotal * processingFee;
  const total = subtotal + adminFee;

  /* ---------- UI ---------- */

  return (
    <View>
      {/* Basket Items */}
      {basketItems.map((item: any, index: number) => {
        return (
          <BasketItemRow
            key={item.id || index}
            item={item}
            index={index}
            formatPrice={formatPrice}
            variant="summary"
          />
        );
      })}

      {/* Price Summary */}
      <BasketTotal
        subTotal={subtotal}
        processingAmount={adminFee}
        total={total}
      />
    </View>
  );
};

export default ConfirmStep;
