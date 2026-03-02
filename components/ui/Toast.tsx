import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export type ToastType = "success" | "error" | "info";

export interface ToastConfig {
  message: string;
  type?: ToastType;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface ToastProps extends ToastConfig {
  visible: boolean;
  onHide: () => void;
}

const TOAST_ACCENT = {
  success: "#22C55E",
  error: "#EF4444",
  info: "#3B82F6",
} as const;

export const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type = "success",
  duration = 3000,
  action,
  onHide,
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-56)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => hideToast(), duration);
      return () => clearTimeout(timer);
    } else {
      hideToast();
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -56,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => onHide());
  };

  if (!visible) return null;

  const iconName =
    type === "success"
      ? "checkmark-circle-outline"
      : type === "error"
      ? "close-circle-outline"
      : "information-circle-outline";
  const accent = TOAST_ACCENT[type];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: insets.top + 6,
          transform: [{ translateY }],
          opacity,
        },
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.toast}>
        <View style={[styles.accent, { backgroundColor: accent }]} />
        <View style={styles.content}>
          <Ionicons name={iconName as any} size={16} color={accent} style={styles.icon} />
          <Text style={styles.message} numberOfLines={2}>
            {message}
          </Text>
        </View>
        {action ? (
          <TouchableOpacity
            style={styles.action}
            onPress={() => {
              action.onPress();
              hideToast();
            }}
            activeOpacity={0.7}
          >
            <Text style={[styles.actionText, { color: accent }]}>{action.label}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 12,
    right: 12,
    zIndex: 9999,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    minHeight: 40,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 3,
    maxWidth: SCREEN_WIDTH - 24,
  },
  accent: {
    width: 2,
    alignSelf: "stretch",
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  icon: {
    opacity: 0.95,
  },
  message: {
    flex: 1,
    fontSize: 13,
    color: "#27272A",
    fontFamily: "AlbertSans_400Regular",
    lineHeight: 18,
  },
  action: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    alignSelf: "stretch",
    justifyContent: "center",
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "AlbertSans_600SemiBold",
  },
});
