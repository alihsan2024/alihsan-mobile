import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";

import SummaryCard from "../ui/SummaryCard";
import PriceRow from "./PriceRow";
import { useGetBasketQuery } from "@/store/reduxSlice/api/basketApi";

/* ---------- Helpers (SAME as BasketScreen) ---------- */

const formatPrice = (price: number): string => {
  return !isNaN(price)
    ? price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "0.00";
};

/* ---------- Component ---------- */

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
        const title =
          item.name || item.Campaign?.name || item.Orphan?.name || "Campaign";

        const subtitle =
          item.donationItem || item.Campaign?.subtitle || item.Orphan?.subtitle;

        const image =
          item.coverImage ||
          item.Campaign?.coverImage ||
          item.Orphan?.coverImage ||
          "https://via.placeholder.com/64";

        const amount =
          item.total !== undefined && item.total !== null
            ? parseFloat(item.total?.toString() || "0")
            : parseFloat(item.amount?.toString() || "0");

        return (
          <SummaryCard
            key={item.id || index}
            title={title}
            subtitle={subtitle}
            image={image}
            amount={`$${formatPrice(amount)}`}
          />
        );
      })}

      {/* Price Summary */}
      <View style={styles.priceBox}>
        <PriceRow label="Subtotal" value={`$${formatPrice(subtotal)}`} />
        <PriceRow label="Admin Fee" value={`$${formatPrice(adminFee)}`} />
        <PriceRow label="Total" value={`$${formatPrice(total)}`} bold />
      </View>
    </View>
  );
};

export default ConfirmStep;

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  priceBox: {
    marginTop: 16,
  },
});
