import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  step: 1 | 2 | 3;
  onNext: () => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;
};

export default function BottomBar({
  step,
  onNext,
  loading = false,
  disabled = false,
}: Props) {
  const isLast = step === 3;

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.total}>AUD 1,380.20</Text>
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          isLast && styles.checkoutButton,
          disabled && { opacity: 0.6 },
        ]}
        onPress={onNext}
        disabled={disabled || loading}
      >
        {loading ? (
          <ActivityIndicator color={isLast ? "#000" : "#244180"} />
        ) : (
          <>
            <Text style={[styles.buttonText, isLast && styles.checkoutText]}>
              {isLast ? "Checkout" : "Next"}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={isLast ? "#000" : "#244180"}
            />
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    backgroundColor: "#246BE1",
  },
  totalLabel: {
    fontSize: 12,
    color: "#fff",
  },
  total: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,

    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  buttonText: {
    color: "#244180",
    fontWeight: "600",
  },
  checkoutButton: {
    backgroundColor: "#FFD602",
  },
  checkoutText: {
    color: "#000",
  },
});
