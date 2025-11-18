import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useZakat } from "../../context/ZakatContext";

export default function Summary() {
  const {
    amounts,
    calculateWealth,
    calculateZakat,
    calculateNisab,
    setStep,
    prices,
  } = useZakat();

  const wealth = calculateWealth();
  const zakat = calculateZakat();
  const nisab = calculateNisab();

  // Ensure nisab values are valid numbers
  const silverNisab =
    isFinite(nisab.silver) && !isNaN(nisab.silver) ? nisab.silver : 0;
  const goldNisab = isFinite(nisab.gold) && !isNaN(nisab.gold) ? nisab.gold : 0;

  const navigateToStep = (step: number) => {
    setStep(step);
  };

  const totalSilver = amounts.silver.reduce((sum, item) => sum + item.value, 0);
  const totalGold = amounts.gold.reduce((sum, item) => sum + item.value, 0);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Zakatable Wealth</Text>
          <Text style={styles.wealth}>
            {amounts.unit}{" "}
            {wealth.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.zakatSection}>
          <Text style={styles.zakatLabel}>Your estimated Zakat Payment</Text>
          <Text style={styles.zakatAmount}>
            {amounts.unit}{" "}
            {zakat.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
          <Text style={styles.zakatSubtext}>2.5% of Zakatable Wealth</Text>
        </View>

        {(amounts.cash > 0 ||
          amounts.bank > 0 ||
          totalGold > 0 ||
          totalSilver > 0 ||
          amounts.investmentProfit > 0 ||
          amounts.shareResale > 0 ||
          amounts.merchandise > 0 ||
          amounts.loan > 0 ||
          amounts.other > 0) && (
          <>
            <View style={styles.divider} />
            <View style={styles.breakdown}>
              {amounts.cash > 0 || amounts.bank > 0 ? (
                <TouchableOpacity
                  style={styles.breakdownItem}
                  onPress={() => navigateToStep(2)}
                >
                  <Text style={styles.breakdownText}>
                    Cash: {amounts.unit}{" "}
                    {(amounts.cash + amounts.bank).toLocaleString()}
                  </Text>
                </TouchableOpacity>
              ) : null}

              {totalGold > 0 ? (
                <TouchableOpacity
                  style={styles.breakdownItem}
                  onPress={() => navigateToStep(2)}
                >
                  <Text style={styles.breakdownText}>
                    Gold: {amounts.unit} {totalGold.toFixed(2)}
                  </Text>
                </TouchableOpacity>
              ) : null}

              {totalSilver > 0 ? (
                <TouchableOpacity
                  style={styles.breakdownItem}
                  onPress={() => navigateToStep(2)}
                >
                  <Text style={styles.breakdownText}>
                    Silver: {amounts.unit} {totalSilver.toFixed(2)}
                  </Text>
                </TouchableOpacity>
              ) : null}

              {amounts.investmentProfit > 0 ||
              amounts.shareResale > 0 ||
              amounts.merchandise > 0 ? (
                <TouchableOpacity
                  style={styles.breakdownItem}
                  onPress={() => navigateToStep(3)}
                >
                  <Text style={styles.breakdownText}>
                    Investments: {amounts.unit}{" "}
                    {(
                      amounts.investmentProfit +
                      amounts.shareResale +
                      amounts.merchandise
                    ).toLocaleString()}
                  </Text>
                </TouchableOpacity>
              ) : null}

              {amounts.loan > 0 ? (
                <TouchableOpacity
                  style={styles.breakdownItem}
                  onPress={() => navigateToStep(4)}
                >
                  <Text style={styles.breakdownText}>
                    Loans: {amounts.unit} {amounts.loan.toLocaleString()}
                  </Text>
                </TouchableOpacity>
              ) : null}

              {amounts.other > 0 ? (
                <TouchableOpacity
                  style={styles.breakdownItem}
                  onPress={() => navigateToStep(4)}
                >
                  <Text style={styles.breakdownText}>
                    Other: {amounts.unit} {amounts.other.toLocaleString()}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </>
        )}

        {prices &&
        prices.silverFinePriceInUsd > 0 &&
        prices.goldPriceInUsd > 0 ? (
          <>
            <View style={styles.divider} />
            <View style={styles.nisabSection}>
              <Text style={styles.nisabTitle}>
                Calculation is Based on Silver Nisab
              </Text>
              <View style={styles.nisabRow}>
                <View style={styles.nisabBadge}>
                  <Text style={styles.nisabLabel}>Gold Nisab</Text>
                  <Text style={styles.nisabValue}>
                    {amounts.unit}{" "}
                    {goldNisab.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                </View>
                <View style={[styles.nisabBadge, styles.silverBadge]}>
                  <Text style={styles.nisabLabel}>Silver Nisab</Text>
                  <Text style={styles.nisabValue}>
                    {amounts.unit}{" "}
                    {silverNisab.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                </View>
              </View>
              {prices.updatedAt && (
                <Text style={styles.updateText}>
                  Prices updated: {new Date(prices.updatedAt).toLocaleString()}
                </Text>
              )}
            </View>
          </>
        ) : prices ? (
          <>
            <View style={styles.divider} />
            <View style={styles.nisabSection}>
              <Text style={styles.updateText}>Loading metal prices...</Text>
            </View>
          </>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  card: {
    backgroundColor: "#f9f9f9",
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#264B8B",
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  wealth: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#264B8B",
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 16,
  },
  zakatSection: {
    marginBottom: 8,
  },
  zakatLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  zakatAmount: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#264B8B",
    marginBottom: 4,
  },
  zakatSubtext: {
    fontSize: 14,
    color: "#666",
  },
  breakdown: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  breakdownItem: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  breakdownText: {
    fontSize: 12,
    color: "#264B8B",
    fontWeight: "600",
  },
  nisabSection: {
    marginTop: 8,
  },
  nisabTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  nisabRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  nisabBadge: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  silverBadge: {
    backgroundColor: "#f5f5f5",
  },
  nisabLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  nisabValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  updateText: {
    fontSize: 11,
    color: "#999",
    marginTop: 8,
  },
});
