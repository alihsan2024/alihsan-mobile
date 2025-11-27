import React from "react";
import { View, Text, ScrollView } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import Button from "@/components/ui/Button";
import { zakatStep } from "@/store/reduxSlice/zakatSlice";

interface SummaryProps {
  zakatTotal: number;
}

const Summary = ({ zakatTotal }: SummaryProps) => {
  const dispatch = useDispatch();
  const { amounts, prices, step } = useSelector(
    (state: any) => state.zakatCalculator
  );

  const total = (arr: { value: number }[]) =>
    arr.reduce((sum: number, item: { value: number }) => sum + item.value, 0);

  const wealth =
    amounts.cash +
    amounts.bank +
    total(amounts.silver) +
    total(amounts.gold) +
    amounts.investmentProfit +
    amounts.shareResale +
    amounts.merchandise +
    amounts.loan +
    amounts.other;

  const nisabSilver =
    612.36 *
    (typeof prices.silverFinePriceInUsd === "number"
      ? prices.silverFinePriceInUsd
      : Number(prices.silverFinePriceInUsd) || 0);
  const nisabGold =
    87.48 *
    (typeof prices.price?.goldPriceInUsd === "number"
      ? prices.price.goldPriceInUsd
      : Number(prices.price?.goldPriceInUsd) || 0);

  const usdToUnit = (amount: number) =>
    prices.price?.todayAud
      ? amount /
        (typeof prices.price.todayAud === "number"
          ? prices.price.todayAud
          : Number(prices.price.todayAud) || 1)
      : amount;

  const zakatableAmount = (nisab: number, wealth: number) =>
    usdToUnit(nisab) < wealth ? wealth / 40 : 0;

  const showDate = (d: Date) =>
    d.toLocaleTimeString() + " " + d.toLocaleDateString();

  const calculateStep = (stepToGo: number) => {
    const stepsToMove = stepToGo - step;
    dispatch(zakatStep(stepsToMove));
  };

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 16,
        backgroundColor: "#F0F0F0",
        borderRadius: 16,
      }}
    >
      {/* Zakatable Wealth */}
      <View
        style={{
          padding: 12,
          backgroundColor: "#E0EFFF",
          borderRadius: 12,
          marginBottom: 12,
        }}
      >
        <Text style={{ fontWeight: "600" }}>
          Zakatable Wealth:{" "}
          {typeof wealth === "number" ? wealth.toFixed(2) : "0.00"} AUD
        </Text>
      </View>

      {/* Estimated Zakat */}
      <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 4 }}>
        Your Estimated Zakat Payment
      </Text>
      <Text
        style={{
          fontSize: 22,
          fontWeight: "700",
          color: "#264B8B",
          marginBottom: 4,
        }}
      >
        {typeof zakatTotal === "number" && zakatTotal > 0
          ? zakatTotal.toFixed(2)
          : typeof zakatableAmount(nisabSilver, wealth) === "number"
          ? zakatableAmount(nisabSilver, wealth).toFixed(2)
          : "0.00"}{" "}
        AUD
      </Text>
      <Text style={{ fontSize: 14, marginBottom: 12 }}>
        2.5% of Zakatable Wealth
      </Text>

      {/* Dynamic Buttons for Editing Steps */}
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          marginBottom: 12,
        }}
      >
        {[
          (amounts.cash || amounts.bank) && (
            <View key="cash" style={{ marginRight: 8, marginBottom: 8 }}>
              <Button
                variant="secondaryOutline"
                label={`Cash: $${(
                  amounts.cash + amounts.bank
                ).toLocaleString()}`}
                onPress={() => calculateStep(2)}
              />
            </View>
          ),
          (amounts.investmentProfit ||
            amounts.shareResale ||
            amounts.merchandise) && (
            <View key="investments" style={{ marginRight: 8, marginBottom: 8 }}>
              <Button
                variant="secondaryOutline"
                label={`Investments: $${(
                  amounts.investmentProfit +
                  amounts.shareResale +
                  amounts.merchandise
                ).toLocaleString()}`}
                onPress={() => calculateStep(3)}
              />
            </View>
          ),
          amounts.loan > 0 && (
            <View key="loan" style={{ marginRight: 8, marginBottom: 8 }}>
              <Button
                variant="secondaryOutline"
                label={`Loans: $${amounts.loan.toLocaleString()}`}
                onPress={() => calculateStep(4)}
              />
            </View>
          ),
          amounts.other > 0 && (
            <View key="other" style={{ marginRight: 8, marginBottom: 8 }}>
              <Button
                variant="secondaryOutline"
                label={`Other Wealth: $${amounts.other.toLocaleString()}`}
                onPress={() => calculateStep(4)}
              />
            </View>
          ),
          total(amounts.gold) > 0 && (
            <View key="gold" style={{ marginRight: 8, marginBottom: 8 }}>
              <Button
                variant="dark"
                label={`Zakatable Gold: $${
                  typeof total(amounts.gold) === "number" &&
                  !isNaN(total(amounts.gold))
                    ? total(amounts.gold).toFixed(2)
                    : "0.00"
                }`}
                onPress={() => calculateStep(2)}
              />
            </View>
          ),
          total(amounts.silver) > 0 && (
            <View key="silver" style={{ marginRight: 8, marginBottom: 8 }}>
              <Button
                variant="dark"
                label={`Zakatable Silver: $${
                  typeof total(amounts.silver) === "number" &&
                  !isNaN(total(amounts.silver))
                    ? total(amounts.silver).toFixed(2)
                    : "0.00"
                }`}
                onPress={() => calculateStep(2)}
              />
            </View>
          ),
        ].filter(Boolean)}
      </View>

      {/* Divider */}
      <View
        style={{ height: 1, backgroundColor: "#ccc", marginVertical: 12 }}
      />

      {/* Nisab Info */}
      <View style={{ padding: 12, backgroundColor: "#FFF", borderRadius: 12 }}>
        <Text style={{ fontWeight: "600", marginBottom: 6 }}>
          Calculation is Based on Silver Nisab
        </Text>
        <Text style={{ fontSize: 12, marginBottom: 4 }}>
          Current price of gold per gram (24K):{" "}
          {typeof usdToUnit(Number(prices.price?.goldPriceInUsd)) ===
            "number" && !isNaN(usdToUnit(Number(prices.price?.goldPriceInUsd)))
            ? usdToUnit(Number(prices.price?.goldPriceInUsd)).toFixed(2)
            : "0.00"}{" "}
          AUD
        </Text>
        <Text style={{ fontSize: 12, marginBottom: 8 }}>
          Current price of silver per gram (Fine):{" "}
          {typeof usdToUnit(Number(prices.silverFinePriceInUsd)) === "number" &&
          !isNaN(usdToUnit(Number(prices.silverFinePriceInUsd)))
            ? usdToUnit(Number(prices.silverFinePriceInUsd)).toFixed(2)
            : "0.00"}{" "}
          AUD
        </Text>

        <View style={{ flexDirection: "row", gap: 8, marginBottom: 4 }}>
          <View
            style={{
              flex: 1,
              backgroundColor: "#DDEEFF",
              padding: 6,
              borderRadius: 8,
            }}
          >
            <Text style={{ fontWeight: "600" }}>
              Gold Nisab:{" "}
              {typeof usdToUnit(nisabGold) === "number" &&
              !isNaN(usdToUnit(nisabGold))
                ? usdToUnit(nisabGold).toFixed(2)
                : "0.00"}{" "}
              AUD
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: "#EEE",
              padding: 6,
              borderRadius: 8,
            }}
          >
            <Text style={{ fontWeight: "600" }}>
              Silver Nisab:{" "}
              {typeof usdToUnit(nisabSilver) === "number" &&
              !isNaN(usdToUnit(nisabSilver))
                ? usdToUnit(nisabSilver).toFixed(2)
                : "0.00"}{" "}
              AUD
            </Text>
          </View>
        </View>

        {prices.updatedAt && (
          <Text style={{ fontSize: 12, color: "#555", marginTop: 6 }}>
            Prices last updated at {showDate(new Date(prices.updatedAt))}
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

export default Summary;
