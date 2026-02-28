import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from "react-native";

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
  const message = campaignName
    ? `"${campaignName}" is already in your cart. Replace with this donation?`
    : "This campaign is already in your cart. Replace with this donation?";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <View style={styles.iconWrap}>
            <Ionicons name="cart-outline" size={24} color="#2161CD" />
          </View>
          <Text style={styles.title}>Already in cart</Text>
          <Text style={styles.description} numberOfLines={3}>
            {message}
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>Keep current</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.replaceButton}
              onPress={onReplace}
              activeOpacity={0.8}
            >
              <Text style={styles.replaceText}>Replace</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  card: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 6,
    fontFamily: "AlbertSans_700Bold",
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
    fontFamily: "AlbertSans_400Regular",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    fontFamily: "AlbertSans_600SemiBold",
  },
  replaceButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#2161CD",
    alignItems: "center",
    justifyContent: "center",
  },
  replaceText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: "AlbertSans_600SemiBold",
  },
});
