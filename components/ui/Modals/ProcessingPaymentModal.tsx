import React from "react";
import { Modal, View, Text, StyleSheet, ActivityIndicator } from "react-native";

type Props = {
  visible: boolean;
};

export default function ProcessingPaymentModal({ visible }: Props) {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color="#264B8B" />
          <Text style={styles.text}>Processing your payment</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: 260,
    paddingVertical: 28,
    paddingHorizontal: 24,
    borderRadius: 14,
    backgroundColor: "#F4F7FB",
    alignItems: "center",
  },
  text: {
    marginTop: 16,
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
});
