"use client";

import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";

interface CancelSponsorshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel: () => void;
  sponsorship: any;
  cancelling: boolean;
}

const CancelSponsorshipModal: React.FC<CancelSponsorshipModalProps> = ({
  isOpen,
  onClose,
  onCancel,
  sponsorship,
  cancelling,
}) => {
  if (!isOpen || !sponsorship) return null;

  return (
    <Modal visible={isOpen} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Cancel Sponsorship</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>X</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text>Are you sure you want to cancel this sponsorship?</Text>
            <Text>This action cannot be undone.</Text>

            <View style={styles.buttons}>
              <TouchableOpacity onPress={onClose} style={styles.keepButton}>
                <Text>Keep Sponsorship</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onCancel}
                disabled={cancelling}
                style={styles.cancelButton}
              >
                {cancelling ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text>Yes, Cancel Sponsorship</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(63, 63, 70, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  container: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#6366f1",
  },
  title: { color: "white", fontSize: 18, fontWeight: "bold" },
  closeButton: { color: "white", fontWeight: "bold" },
  content: { padding: 16 },
  buttons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
    gap: 8,
  },
  keepButton: { padding: 12, backgroundColor: "#e5e7eb", borderRadius: 8 },
  cancelButton: { padding: 12, backgroundColor: "#f87171", borderRadius: 8 },
});

export default CancelSponsorshipModal;
