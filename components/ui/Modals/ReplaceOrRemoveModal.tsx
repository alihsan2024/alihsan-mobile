import { Feather, Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type Props = {
  visible: boolean;
  campaignName?: string;
  onCancel: () => void;
  onReplace: () => void;
};

export default function ReplaceOrRemoveModal({
  visible,
  campaignName,
  onCancel,
  onReplace,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Icon Header */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={["#246BE1", "#064DC3"]}
              style={styles.iconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="cart" size={28} color="#FFD602" />
            </LinearGradient>
          </View>

          <View style={styles.contentContainer}>
            <Text style={styles.title} numberOfLines={2}>
              Campaign Already in Cart
            </Text>

            <Text style={styles.description} numberOfLines={4}>
              {campaignName
                ? `"${campaignName}" is already in your cart. Would you like to replace it with this donation?`
                : "This campaign is already in your cart. Would you like to replace it with this donation?"}
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.replaceButton]}
              onPress={onReplace}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#246BE1", "#064DC3"]}
                style={styles.replaceGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={styles.replaceButtonContent}>
                  <Text style={styles.replaceText}>Replace</Text>
                  <Feather name="arrow-right" size={18} color="#FFFFFF" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },

  iconContainer: {
    alignItems: "center",
    marginBottom: 16,
  },

  iconGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#246BE1",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  contentContainer: {
    width: "100%",
    marginBottom: 24,
    alignItems: "center",
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 12,
    width: "100%",
    letterSpacing: -0.5,
  },

  description: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    width: "100%",
  },

  actions: {
    flexDirection: "row",
    gap: 12,
  },

  button: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    minHeight: 52,
  },

  cancelButton: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },

  replaceButton: {
    overflow: "hidden",
  },

  replaceGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
  },

  replaceButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  cancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },

  replaceText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
});
