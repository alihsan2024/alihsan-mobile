import { Feather } from "@expo/vector-icons";
import React from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity } from "react-native";

type Props = {
  visible: boolean;
  title?: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function RemoveDonationModal({
  visible,
  title = "Remove Donation?",
  description,
  onCancel,
  onConfirm,
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
          <View style={styles.contentContainer}>
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>

            <Text style={styles.description} numberOfLines={4}>
              {description}
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelText}>No, Keep it</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.removeButton]}
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <View style={styles.removeButtonContent}>
                <Text style={styles.removeText}>Yes, Remove</Text>
                <Feather name="chevron-right" size={16} color="#FFFFFF" />
              </View>
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
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    minHeight: 180,
  },

  contentContainer: {
    width: "100%",
    marginBottom: 20,
  },

  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
    marginBottom: 8,
    width: "100%",
  },

  description: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 18,
    width: "100%",
  },

  actions: {
    flexDirection: "row",
    gap: 12,
  },

  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },

  cancelButton: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  removeButton: {
    backgroundColor: "#D14343",
  },

  removeButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },

  cancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
  },

  removeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
});
