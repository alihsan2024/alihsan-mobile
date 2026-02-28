import React from "react";
import { Modal, View, Text, StyleSheet, ActivityIndicator } from "react-native";

const PRIMARY_BLUE = "#2161CD";

type Props = {
  visible: boolean;
  message?: string;
};

export default function ProcessingPaymentModal({
  visible,
  message = "Processing your payment",
}: Props) {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color={PRIMARY_BLUE} />
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(1, 13, 38, 0.35)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    minWidth: 200,
    maxWidth: 280,
    paddingVertical: 24,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  message: {
    fontSize: 14,
    fontFamily: "AlbertSans_500Medium",
    color: "#374151",
    textAlign: "center",
    marginTop: 16,
    lineHeight: 20,
  },
});
