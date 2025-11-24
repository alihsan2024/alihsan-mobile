"use client";

import React from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";

interface OrphanProfileDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orphan: any;
  selectedSponsorship: any;
}

const OrphanProfileDetailsModal: React.FC<OrphanProfileDetailsModalProps> = ({
  isOpen,
  onClose,
  orphan,
}) => {
  if (!isOpen || !orphan) return null;

  return (
    <Modal visible={isOpen} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Orphan Details</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>X</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.profile}>
              {orphan.cover_image ? (
                <Image
                  source={{ uri: orphan.cover_image }}
                  style={styles.image}
                />
              ) : (
                <FontAwesome
                  name="heart"
                  size={64}
                  color="#e11d48"
                  style={{ marginBottom: 8 }}
                />
              )}
              <Text style={styles.name}>{orphan.name || "Unnamed Orphan"}</Text>
            </View>

            <View style={styles.info}>
              <Text>Gender: {orphan.gender || "N/A"}</Text>
              <Text>
                Age:{" "}
                {orphan.dateOfBirth
                  ? new Date().getFullYear() -
                    new Date(orphan.dateOfBirth).getFullYear()
                  : "N/A"}
              </Text>
              <Text>Location: {orphan.location || "N/A"}</Text>
            </View>
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
    width: "100%",
    maxWidth: 400,
    backgroundColor: "white",
    borderRadius: 12,
    maxHeight: "90%",
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
  profile: { alignItems: "center", marginBottom: 16 },
  image: { width: 120, height: 120, borderRadius: 12, marginBottom: 8 },
  name: { fontSize: 20, fontWeight: "bold", color: "#4f46e5" },
  info: { gap: 8 },
});

export default OrphanProfileDetailsModal;
