import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  StyleProp,
  ViewStyle,
  ColorValue,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

type GradientColors = readonly [ColorValue, ColorValue, ...ColorValue[]];

type Props = {
  amounts: number[];
  currency?: string;

  title?: string;
  titleColor?: string;

  backgroundColor?: string;
  containerStyle?: StyleProp<ViewStyle>;

  selectedGradientColors?: GradientColors;

  /** 🔥 CONTROLLED STATE */
  selectedAmount: number | null;
  customAmount: string;
  onSelectAmount: (amount: number) => void;
  onChangeCustomAmount: (value: string) => void;

  /** 🔥 ACTION */
  onDonate: () => void;
  loading?: boolean;
  donateText?: string;
};

export default function AmountSelector({
  amounts,
  currency = "$",

  title = "Choose an amount to give",
  titleColor = "#264B8B",

  backgroundColor = "#fff",
  containerStyle,

  selectedGradientColors = ["#246BE1", "#064DC3"],

  selectedAmount,
  customAmount,
  onSelectAmount,
  onChangeCustomAmount,

  onDonate,
  loading = false,
  donateText = "Donate Now",
}: Props) {
  return (
    <View style={[styles.amountContainer, { backgroundColor }, containerStyle]}>
      <Text style={[styles.amountTitle, { color: titleColor }]}>{title}</Text>

      {/* 🔥 EXACT 3 PER ROW */}
      <View style={styles.amountGrid}>
        {amounts.map((amt) => {
          const isSelected = selectedAmount === amt;

          return (
            <TouchableOpacity
              key={amt}
              style={styles.amountButton}
              activeOpacity={0.85}
              onPress={() => onSelectAmount(amt)}
            >
              {isSelected ? (
                <LinearGradient
                  colors={selectedGradientColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.amountGradient}
                >
                  <Text style={styles.amountTextSelected}>
                    {currency} {amt}
                  </Text>
                </LinearGradient>
              ) : (
                <Text style={styles.amountText}>
                  {currency} {amt}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* CUSTOM AMOUNT */}
      <View style={styles.inputWrapper}>
        <TextInput
          placeholder="Custom Amount"
          placeholderTextColor="#010D2640"
          keyboardType="numeric"
          value={customAmount}
          onChangeText={onChangeCustomAmount}
          style={styles.inputMiddle}
        />
        <Text style={styles.inputRight}>AUD</Text>
      </View>

      {/* DONATE BUTTON — SAME HANDLER */}
      <TouchableOpacity
        style={styles.donateButton}
        activeOpacity={0.8}
        onPress={onDonate}
        disabled={loading}
      >
        <View style={styles.donateContent}>
          <Text style={styles.donateText}>
            {loading ? "Adding..." : donateText}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={18}
            color="#010D26"
            style={{ marginLeft: 8 }}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  amountContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },

  amountTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#264B8B",
    marginBottom: 10,
  },

  amountGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  amountButton: {
    width: "32%",
    height: 45,
    borderRadius: 10,
    backgroundColor: "rgba(38,75,139,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    overflow: "hidden",
  },

  amountGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  amountText: {
    fontWeight: "600",
    color: "#264B8B",
  },

  amountTextSelected: {
    color: "#fff",
    fontWeight: "700",
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(38,75,139,0.3)",
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 45,
    marginBottom: 8,
    backgroundColor: "#fff",
  },

  inputMiddle: {
    flex: 1,
    height: "100%",
    color: "#264B8B",
  },

  inputRight: {
    color: "#264B8B",
    fontWeight: "600",
    marginLeft: 8,
  },

  donateButton: {
    backgroundColor: "#FFD602",
    borderRadius: 10,
    height: 45,
    alignItems: "center",
    justifyContent: "center",
  },

  donateContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  donateText: {
    color: "#010D26",
    fontWeight: "700",
    fontSize: 16,
  },
});
