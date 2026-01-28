import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  Alert,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import Button from "@/components/ui/Button";
import ZakatCalculatorHeader from "@/components/Zakat/ZakatCalculatorHeader";
import Stepper from "@/components/ui/Stepper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { zakatStep, zakatResetInput } from "@/store/reduxSlice/zakatSlice";
import { getAnyZakatCampaign } from "@/utils/api";

interface Step5Props {
  zakatTotal: number;
}

export default function Step5({ zakatTotal }: Step5Props) {
  const dispatch = useDispatch();
  const { amounts, prices } = useSelector(
    (state: any) => state.zakatCalculator
  );
  const [loading, setLoading] = useState(false);
  const [campaign, setCampaign] = useState<any>(null);

  useEffect(() => {
    const fetchZakatCampaign = async () => {
      try {
        const zakatCampaign = await getAnyZakatCampaign();
        setCampaign(zakatCampaign);
      } catch (error) {
        console.error("Error fetching zakat campaign:", error);
      }
    };
    fetchZakatCampaign();
  }, []);

  const total = (arrayData: { value: number }[]) =>
    arrayData.reduce((sum, item) => sum + (item.value || 0), 0);

  const wealth =
    (amounts.cash || 0) +
    (amounts.bank || 0) +
    total(amounts.silver || []) +
    total(amounts.gold || []) +
    (amounts.investmentProfit || 0) +
    (amounts.shareResale || 0) +
    (amounts.merchandise || 0) +
    (amounts.loan || 0) +
    (amounts.other || 0);

  const nisabSilver = 612.36 * (prices.silverUsd || 0);

  const usdToUnit = (amount: number) =>
    prices.audToUsd ? amount / prices.audToUsd : amount;

  const zakatableAmount = (nisab: number, wealth: number) =>
    usdToUnit(nisab) < wealth ? wealth / 40 : 0;

  const handleDonation = async () => {
    if (!campaign) {
      Alert.alert(
        "Error",
        "Unable to load Zakat campaign. Please try again."
      );
      return;
    }

    setLoading(true);
    try {
      const checkoutData = await AsyncStorage.getItem("checkout");
      const checkout = checkoutData ? JSON.parse(checkoutData) : [];

      const newItem = {
        campaignId: campaign.id,
        name: campaign.name || "Zakat Al Maal",
        coverImage: campaign.coverImage || "",
        amount:
          zakatTotal > 0
            ? zakatTotal
            : typeof usdToUnit(zakatableAmount(nisabSilver, wealth)) ===
                "number" &&
              !isNaN(usdToUnit(zakatableAmount(nisabSilver, wealth)))
            ? parseFloat(
                usdToUnit(zakatableAmount(nisabSilver, wealth)).toFixed(2)
              )
            : 0,
        total:
          zakatTotal > 0
            ? zakatTotal
            : typeof usdToUnit(zakatableAmount(nisabSilver, wealth)) ===
                "number" &&
              !isNaN(usdToUnit(zakatableAmount(nisabSilver, wealth)))
            ? parseFloat(
                usdToUnit(zakatableAmount(nisabSilver, wealth)).toFixed(2)
              )
            : 0,
        isRecurring: false,
        custom: false,
        checkoutType: "ZAQAT",
      };

      const index = checkout.findIndex(
        (obj: any) => obj.campaignId === newItem.campaignId
      );
      const updatedCheckout =
        index >= 0
          ? [...checkout.slice(0, index), newItem, ...checkout.slice(index + 1)]
          : [...checkout, newItem];

      await AsyncStorage.setItem("checkout", JSON.stringify(updatedCheckout));

      Alert.alert(
        "Success",
        `Item ${index >= 0 ? "updated" : "added"} successfully`
      );
      dispatch(zakatResetInput());
      setLoading(false);
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "Something went wrong while adding to basket.");
    }
  };

  const secondaryButtonLabel =
    usdToUnit(zakatableAmount(nisabSilver, wealth)) <= 0
      ? "Return Home"
      : "Back";

  const handleSecondaryButton = () => {
    if (usdToUnit(zakatableAmount(nisabSilver, wealth)) <= 0) {
      // navigate home, using your preferred navigation
      Alert.alert("Navigate", "Returning Home");
    } else {
      dispatch(zakatStep(-1));
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <ZakatCalculatorHeader />

      <View style={{ marginVertical: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 8 }}>
          Ready to give your Zakat?
        </Text>
        <Text style={{ marginBottom: 8 }}>
          Assets that are included in the Zakat calculation are cash, shares,
          gold and silver, business goods, and income from investment property.
        </Text>
        {usdToUnit(zakatableAmount(nisabSilver, wealth)) <= 0 &&
          !zakatTotal && (
            <Text style={{ color: "red" }}>
              You are not required to pay Zakat as your wealth is less than the
              Nisab.
            </Text>
          )}
      </View>

      <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
        <Button
          label={`Pay Zakat of $${
            typeof (zakatTotal > 0
              ? zakatTotal
              : usdToUnit(zakatableAmount(nisabSilver, wealth))) === "number" &&
            !isNaN(
              zakatTotal > 0
                ? zakatTotal
                : usdToUnit(zakatableAmount(nisabSilver, wealth))
            )
              ? (zakatTotal > 0
                  ? zakatTotal
                  : usdToUnit(zakatableAmount(nisabSilver, wealth))
                ).toFixed(2)
              : "0.00"
          } AUD`}
          onPress={handleDonation}
          disabled={
            loading || usdToUnit(zakatableAmount(nisabSilver, wealth)) <= 0
          }
        />
        <Button label={secondaryButtonLabel} onPress={handleSecondaryButton} />
      </View>

      <Image
        source={require("@/assets/coin-only.png")}
        style={{
          width: "50%",
          height: 100,
          resizeMode: "contain",
          alignSelf: "flex-end",
        }}
      />
    </ScrollView>
  );
}
