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

export const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type = "success",
  duration = 3000,
  action,
  onHide,
}) => {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      hideToast();
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  if (!visible) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return "checkmark-circle";
      case "error":
        return "close-circle";
      case "info":
        return "information-circle";
      default:
        return "checkmark-circle";
    }
  };

  const getColors = () => {
    switch (type) {
      case "success":
        return {
          background: "#E8F7EF",
          icon: "#16A34A",
          text: "#166534",
          border: "#BBF7D0",
        };
      case "error":
        return {
          background: "#FEE2E2",
          icon: "#DC2626",
          text: "#991B1B",
          border: "#FECACA",
        };
      case "info":
        return {
          background: "#EFF6FF",
          icon: "#2161CD",
          text: "#1E40AF",
          border: "#BFDBFE",
        };
      default:
        return {
          background: "#E8F7EF",
          icon: "#16A34A",
          text: "#166534",
          border: "#BBF7D0",
        };
    }
  };

  const colors = getColors();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: insets.top + 12,
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
      pointerEvents="box-none"
    >
      <View style={[styles.toast, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <View style={styles.content}>
          <Ionicons name={getIcon() as any} size={20} color={colors.icon} />
          <Text style={[styles.message, { color: colors.text }]} numberOfLines={2}>
            {message}
          </Text>
        </View>
        {action && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.icon }]}
            onPress={() => {
              action.onPress();
              hideToast();
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.actionText}>{action.label}</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: "center",
  },
  toast: {
    width: "100%",
    maxWidth: SCREEN_WIDTH - 32,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "AlbertSans_600SemiBold",
    lineHeight: 20,
  },
  actionButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    fontFamily: "AlbertSans_700Bold",
  },
});
