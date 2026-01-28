import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity } from "react-native";

type Props = {
  visible: boolean;
  title?: string;
  description?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function LogoutConfirmationModal({
  visible,
  title = "Sign Out?",
  description = "Are you sure you want to sign out? You'll need to log in again to access your account.",
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
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="log-out-outline" size={24} color="#DC2626" />
            </View>
          </View>

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
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.logoutButton]}
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <View style={styles.logoutButtonContent}>
                <Text style={styles.logoutText}>Sign Out</Text>
                <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
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
    padding: 24,
    minHeight: 200,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    width: "100%",
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 8,
    width: "100%",
    fontFamily: "AlbertSans_700Bold",
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    width: "100%",
    fontFamily: "AlbertSans_400Regular",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  cancelButton: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  logoutButton: {
    backgroundColor: "#DC2626",
  },
  logoutButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
    fontFamily: "AlbertSans_600SemiBold",
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    fontFamily: "AlbertSans_700Bold",
  },
});
