import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useZakat } from "../../context/ZakatContext";
import { useBasket } from "../../context/BasketContext";
import { getAnyZakatCampaign } from "../../services/api";
import Button from "../Button";

export default function Step5() {
  const { amounts, calculateWealth, calculateZakat, calculateNisab, prevStep, reset } = useZakat();
  const { addItem } = useBasket();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [campaign, setCampaign] = useState<any>(null);

  useEffect(() => {
    loadZakatCampaign();
  }, []);

  const loadZakatCampaign = async () => {
    try {
      const zakatCampaign = await getAnyZakatCampaign();
      setCampaign(zakatCampaign);
    } catch (error) {
      console.error("Error loading zakat campaign:", error);
    }
  };

  const handleDonate = async () => {
    const zakatAmount = calculateZakat();
    if (zakatAmount <= 0) return;

    setLoading(true);
    try {
      if (campaign) {
        await addItem({
          campaignId: campaign.id,
          amount: zakatAmount,
          donationItem: "Zakat Al Maal Donation",
          isRecurring: false,
        });
      }
      
      reset();
      router.push("/(tabs)/cart");
    } catch (error: any) {
      console.error("Error adding to basket:", error);
      alert("Failed to add to basket. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const wealth = calculateWealth();
  const zakat = calculateZakat();
  const nisab = calculateNisab();
  const isZakatable = zakat > 0;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Your Zakat Summary</Text>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Wealth:</Text>
          <Text style={styles.summaryValue}>
            {amounts.unit} {wealth.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Silver Nisab:</Text>
          <Text style={styles.summaryValue}>
            {amounts.unit} {nisab.silver.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        </View>

        <View style={[styles.summaryRow, styles.zakatRow]}>
          <Text style={styles.zakatLabel}>Your Zakat (2.5%):</Text>
          <Text style={styles.zakatValue}>
            {amounts.unit} {zakat.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        </View>

        {!isZakatable && (
          <View style={styles.messageBox}>
            <Text style={styles.messageText}>
              You are not required to pay Zakat as your wealth is less than the Nisab.
            </Text>
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        {isZakatable ? (
          <>
            <Button
              label={`Pay Zakat of ${amounts.unit} ${zakat.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
              onPress={handleDonate}
              loading={loading}
            />
            <Button
              label="Back"
              onPress={prevStep}
              variant="secondary"
              style={styles.backButton}
            />
          </>
        ) : (
          <Button
            label="Return Home"
            onPress={() => router.push("/(tabs)")}
            variant="secondary"
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  summaryCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: "#264B8B",
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#264B8B",
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  summaryLabel: {
    fontSize: 16,
    color: "#666",
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  zakatRow: {
    marginTop: 8,
    paddingTop: 20,
    borderTopWidth: 2,
    borderTopColor: "#264B8B",
    borderBottomWidth: 0,
  },
  zakatLabel: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#264B8B",
  },
  zakatValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#264B8B",
  },
  messageBox: {
    backgroundColor: "#fff3cd",
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#ffc107",
  },
  messageText: {
    fontSize: 14,
    color: "#856404",
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 20,
  },
  backButton: {
    marginTop: 12,
  },
});

