import React from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Button from "../Button";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function ZakatSummaryModal({ visible, onClose }: Props) {
  return (
    <Modal transparent animationType="slide" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* ===== TOP BLUE SECTION ===== */}
          <View style={styles.topContainer}>
            <Text style={styles.title}>Your estimated Zakat Payment</Text>

            {/* Amount Box */}
            <View style={styles.amountBox}>
              <Text style={styles.amountText}>AUD 1,639.41</Text>
            </View>

            {/* Breakdown rows */}
            {[
              { label: "Total Assets", value: "121349.97" },
              { label: "Total Liabilities", value: "3.00" },
              { label: "Zakatable Wealth", value: "121346.97" },
              { label: "Zakat Owed", value: "3033.67" },
            ].map((item, index) => (
              <View key={index} style={styles.row}>
                <Text style={styles.rowTextLeft}>{item.label}</Text>
                <Text style={styles.rowTextRight}>{item.value}</Text>
              </View>
            ))}

            {/* Buttons */}
            <View style={{ marginTop: 16 }}>
              <Button label="Pay Zakat Now" variant="secondary" />
              {/* <TouchableOpacity style={styles.payButton}>
              <Text style={styles.payButtonText}>Pay Zakat Now</Text>
            </TouchableOpacity> */}

              <TouchableOpacity
                onPress={onClose}
                style={{
                  backgroundColor: "#FFFFFF1A",
                  borderRadius: 12,
                  paddingVertical: 12,
                  marginTop: 8,
                  alignItems: "center",
                }}
              >
                <Text style={styles.resetText}>Reset</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.gap} />

          {/* ===== BOTTOM WHITE SECTION ===== */}
          <View style={styles.bottomContainer}>
            <Text style={styles.subTitle}>
              Calculation is Based on Silver NISAB
            </Text>

            {/* Nisab rows */}
            {[
              { label: "Zakat Due", value: "AUD 1,639.41" },
              { label: "Nisab Threshold", value: "AUD 1,722.93" },
            ].map((item, index) => (
              <View key={index} style={styles.rowDark}>
                <Text style={styles.darkText}>{item.label}</Text>
                <Text style={styles.darkText}>{item.value}</Text>
              </View>
            ))}

            {/* Nisab Boxes */}
            <View style={styles.nisabRow}>
              <View style={styles.goldBox}>
                <Text style={styles.nisabText}>Gold Nisab:</Text>
                <Text style={styles.nisabText}>17,697.48 AUD</Text>
              </View>

              <View style={styles.silverBox}>
                <Text style={styles.nisabTextDark}>Silver Nisab:</Text>
                <Text style={styles.nisabTextDark}>1,722.93 AUD</Text>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Ionicons name="reload" size={16} color="#555" />
              <Text style={styles.footerText}>
                Prices were last updated at 11:00:01 AM 12/9/2025
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#fff",
    minWidth: 320,
    width: "90%",
    alignSelf: "center",
    elevation: 10,
  },

  gap: {
    height: 12, // adjust gap size
    backgroundColor: "transparent",
  },
  /* ===== TOP SECTION ===== */
  topContainer: {
    backgroundColor: "#1E6EF2",
    padding: 20,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 12,
  },
  amountBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginBottom: 16,
  },
  amountText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E6EF2",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.4)",
    paddingVertical: 8,
  },
  rowTextLeft: {
    color: "#FFFFFFCC",
    fontSize: 14,
  },
  rowTextRight: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  payButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 16,
    alignItems: "center",
  },
  payButtonText: {
    color: "#1E6EF2",
    fontWeight: "700",
    fontSize: 16,
  },
  resetText: {
    color: "#fff",
    textAlign: "center",
    textDecorationLine: "underline",
  },

  /* ===== BOTTOM SECTION ===== */
  bottomContainer: {
    backgroundColor: "#fff",
    padding: 12,
  },
  subTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  rowDark: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingVertical: 8,
  },
  darkText: {
    fontSize: 14,
    color: "#333",
  },
  nisabRow: {
    flexDirection: "row",
    marginTop: 16,
    gap: 6,
  },
  goldBox: {
    flex: 1,
    backgroundColor: "#FFD60233",
    padding: 6,
    borderRadius: 10,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  silverBox: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DDD",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  nisabText: {
    fontSize: 12,
    fontWeight: "600",
  },
  nisabTextDark: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    gap: 6,
  },
  footerText: {
    fontSize: 12,
    color: "#666",
  },
});
