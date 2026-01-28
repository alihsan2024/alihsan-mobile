import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const insets = useSafeAreaInsets();
  const isLast = step === 3;
  const [isExpanded, setIsExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const formatCurrency = (value: number): string => {
    return `$${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

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
    outputRange: [0, 70],
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
    <LinearGradient
      colors={["#264B8B", "#1E3A8A"]}
      style={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) }]}
    >
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
            <Text style={styles.breakdownValue}>
              {formatCurrency(subtotal)}
            </Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Admin Fee</Text>
            <Text style={styles.breakdownValue}>
              {formatCurrency(adminFee)}
            </Text>
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
            <Ionicons name="chevron-up" size={12} color="#264B8B" />
          </Animated.View>
          <View style={styles.totalTextContainer}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.total}>{formatCurrency(total)}</Text>
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
              {isLast ? "Complete Payment" : "Next"}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={isLast ? "#010D26" : "#264B8B"}
            />
          </View>

          {/* Spinner overlay */}
          {loading && (
            <View style={styles.loaderOverlay}>
              <ActivityIndicator color={isLast ? "#010D26" : "#264B8B"} />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  breakdownContainer: {
    overflow: "hidden",
  },
  breakdownContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  breakdownLabel: {
    fontSize: 13,
    color: "#E0E4FF",
    fontFamily: "AlbertSans_500Medium",
  },
  breakdownValue: {
    fontSize: 13,
    color: "#fff",
    fontFamily: "AlbertSans_700Bold",
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    gap: 12,
  },
  totalSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  totalTextContainer: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 11,
    color: "#E0E4FF",
    marginBottom: 2,
    fontFamily: "AlbertSans_400Regular",
  },
  total: {
    fontSize: 18,
    color: "#FFD602",
    fontFamily: "AlbertSans_800ExtraBold",
  },
  arrowCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    position: "relative",
    minWidth: 120,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
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
    color: "#264B8B",
    fontSize: 14,
    fontFamily: "AlbertSans_700Bold",
  },
  checkoutButton: {
    backgroundColor: "#FFD602",
  },
  buttonDisabled: {
    backgroundColor: "#E5E7EB",
    opacity: 0.6,
  },
  checkoutText: {
    color: "#010D26",
  },
});
