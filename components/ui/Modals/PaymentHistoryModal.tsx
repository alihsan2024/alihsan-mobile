"use client";

import React, { useEffect } from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Feather, FontAwesome } from "@expo/vector-icons";

interface PaymentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void;
  selectedSponsorship: any;
  loadingPayments: boolean;
  getGroupedPayments: () => any[];
  openOrphanDetailsModal: (orphan: any) => void;
}

const PaymentHistoryModal: React.FC<PaymentHistoryModalProps> = ({
  isOpen,
  onClose,
  onExport,
  selectedSponsorship,
  loadingPayments,
  getGroupedPayments,
  openOrphanDetailsModal,
}) => {
  if (!isOpen || !selectedSponsorship) return null;

  return (
    <Modal visible={isOpen} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Payment History</Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity onPress={onExport} style={styles.exportButton}>
                <Feather
                  name="download"
                  size={20}
                  color="#6366f1"
                  style={{ marginRight: 4 }}
                />
                <Text>Export</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.closeButton}>X</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Content */}
          <ScrollView style={styles.content}>
            {loadingPayments ? (
              <ActivityIndicator size="large" color="#2161CD" />
            ) : (
              <View>
                <Text>
                  Total Orphans:{" "}
                  {selectedSponsorship.orphanUserAllocations?.length || 0}
                </Text>
                <Text>
                  Total Amount: $
                  {(
                    (selectedSponsorship?.amountInCents / 100) *
                    (selectedSponsorship?.orphanUserAllocations?.length || 0)
                  ).toFixed(2)}
                </Text>

                {/* Orphan List */}
                {selectedSponsorship?.orphanUserAllocations?.map(
                  (allocation: any) => (
                    <TouchableOpacity
                      key={allocation.orphanId}
                      onPress={() => openOrphanDetailsModal(allocation.Orphan)}
                      style={styles.orphanItem}
                    >
                      {allocation.Orphan?.cover_image ? (
                        <Image
                          source={{ uri: allocation.Orphan.cover_image }}
                          style={styles.orphanImage}
                        />
                      ) : (
                        <FontAwesome
                          name="heart"
                          size={32}
                          color="#e11d48"
                          style={{ marginRight: 8 }}
                        />
                      )}
                      <Text>{allocation.Orphan?.name || "Unnamed Orphan"}</Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            )}
          </ScrollView>
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
    backgroundColor: "white",
    borderRadius: 12,
    width: "100%",
    maxHeight: "85%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#6366f1",
  },
  headerTitle: { color: "white", fontSize: 18, fontWeight: "bold" },
  headerButtons: { flexDirection: "row", alignItems: "center" },
  exportButton: { flexDirection: "row", alignItems: "center", marginRight: 8 },
  closeButton: { color: "white", fontSize: 16, fontWeight: "bold" },
  content: { padding: 12 },
  orphanItem: { flexDirection: "row", alignItems: "center", marginVertical: 6 },
  orphanImage: { width: 48, height: 48, borderRadius: 8, marginRight: 8 },
});

export default PaymentHistoryModal;
