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
  total?: number;
};

export default function BottomBar({
  step,
  onNext,
  loading = false,
  disabled = false,
  total = 0,
}: Props) {
  const isLast = step === 3;

  const formattedTotal = total.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.total}>AUD {formattedTotal}</Text>
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          isLast && styles.checkoutButton,
          disabled && styles.buttonDisabled,
        ]}
        onPress={onNext}
        disabled={disabled || loading}
        activeOpacity={0.85}
      >
        {/* Invisible content keeps width stable */}
        <View style={[styles.content, loading && styles.contentHidden]}>
          <Text style={[styles.buttonText, isLast && styles.checkoutText]}>
            {isLast ? "Checkout" : "Next"}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={isLast ? "#000" : "#244180"}
          />
        </View>

        {/* Spinner overlay */}
        {loading && (
          <View style={styles.loaderOverlay}>
            <ActivityIndicator color={isLast ? "#000" : "#244180"} />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

/* ---------- STYLES ---------- */

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
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    position: "relative",
  },

  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  contentHidden: {
    opacity: 0,
  },

  loaderOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: "#244180",
    fontWeight: "600",
  },

  checkoutButton: {
    backgroundColor: "#FFD602",
  },
  buttonDisabled: {
    backgroundColor: "#E5E7EB",
  },
  checkoutText: {
    color: "#000",
  },
});
