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
        style={styles.backButton}
        activeOpacity={0.8}
      >
        <Ionicons name="chevron-back" size={22} color="#010D26" />
      </TouchableOpacity>

      <Text style={styles.title}>Checkout</Text>

      <TouchableOpacity 
        onPress={() => router.push("/(tabs)/cart")}
        activeOpacity={0.8}
      >
        <Text style={styles.cancel}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "800",
    color: "#010D26",
    fontFamily: "AlbertSans_800ExtraBold",
  },
  cancel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    fontFamily: "AlbertSans_600SemiBold",
  },
});
