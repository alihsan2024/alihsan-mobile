import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function CheckoutHeader({
  step,
  setStep,
}: {
  step?: 1 | 2 | 3;
  setStep?: (step: 1 | 2 | 3) => void;
}) {
  const router = useRouter();
  console.log({ step });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => {
          if (step && setStep) {
            if (step === 2 || step === 3) {
              setStep((step - 1) as 1 | 2 | 3);
            } else {
              router.back();
            }
          } else {
            router.back();
          }
        }}
        style={{
          padding: 4,
          backgroundColor: "#FAFAFA",
          borderRadius: 50,
          borderWidth: 1,
          borderColor: "#010D261A",
        }}
      >
        <Ionicons name="chevron-back" size={20} color="#010D261A" />
      </TouchableOpacity>

      <Text style={styles.title}>Checkout</Text>

      <TouchableOpacity onPress={() => router.push("/(tabs)/cart")}>
        <Text style={styles.cancel}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#010D26",
  },
  cancel: {
    fontSize: 14,
    color: "#010D26",
  },
});
