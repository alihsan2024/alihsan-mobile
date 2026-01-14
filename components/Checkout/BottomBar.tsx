import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  step: 1 | 2 | 3;
  onNext: () => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  total?: number;
  subtotal?: number;
  adminFee?: number;
};

export default function BottomBar({
  step,
  onNext,
  loading = false,
  disabled = false,
  total = 0,
  subtotal = 0,
  adminFee = 0,
}: Props) {
  const isLast = step === 3;
  const [isExpanded, setIsExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const formattedTotal = total.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formattedSubtotal = subtotal.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formattedAdminFee = adminFee.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const toggleExpand = () => {
    const toValue = isExpanded ? 0 : 1;
    setIsExpanded(!isExpanded);
    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const breakdownHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 80],
  });

  const breakdownOpacity = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  const arrowRotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <View style={styles.container}>
      {/* Expandable Breakdown */}
      <Animated.View
        style={[
          styles.breakdownContainer,
          {
            height: breakdownHeight,
            opacity: breakdownOpacity,
          },
        ]}
        pointerEvents={isExpanded ? "auto" : "none"}
      >
        <View style={styles.breakdownContent}>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Subtotal</Text>
            <Text style={styles.breakdownValue}>AUD {formattedSubtotal}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Admin Fee</Text>
            <Text style={styles.breakdownValue}>AUD {formattedAdminFee}</Text>
          </View>
        </View>
      </Animated.View>

      {/* Main Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.totalSection}
          onPress={toggleExpand}
          activeOpacity={0.7}
        >
          <Animated.View
            style={[
              styles.arrowCircle,
              {
                transform: [{ rotate: arrowRotation }],
              },
            ]}
          >
            <Ionicons name="chevron-up" size={14} color="#246BE1" />
          </Animated.View>
          <View style={styles.totalTextContainer}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.total}>AUD {formattedTotal}</Text>
          </View>
        </TouchableOpacity>

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
    </View>
  );
}

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#246BE1",
  },
  breakdownContainer: {
    backgroundColor: "#246BE1",
    overflow: "hidden",
  },
  breakdownContent: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 10,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  breakdownLabel: {
    fontSize: 13,
    color: "#fff",
    opacity: 0.9,
    fontWeight: "500",
  },
  breakdownValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 12,
  },
  totalSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  totalTextContainer: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 11,
    color: "#fff",
    opacity: 0.9,
    marginBottom: 2,
  },
  total: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  arrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    position: "relative",
    minWidth: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
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
    fontSize: 15,
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
