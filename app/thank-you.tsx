import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Entypo, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Image as ExpoImage } from "expo-image";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { formatPrice } from "@/utils/helper";

export default function ThankYouScreen() {
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    AsyncStorage.getItem("checkoutSummary").then((data) => {
      if (data) setSummary(JSON.parse(data));
    });
  }, []);

  if (!summary) return null;

  const { subtotal, adminFee, total } = summary;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* Solid background */}
        <View style={styles.headerBgColor} />

        {/* Image */}
        <ExpoImage
          source={require("../assets/header-image.png")}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
        />

        {/* Gradient */}
        <LinearGradient
          colors={["rgba(36,107,225,0.55)", "rgba(36,107,225,0.0)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />

        <View style={styles.textOverlay}>
          <Text style={styles.headerTitle}>Alhamdulillah</Text>
          <Text style={styles.headerSubtitle}>Transaction Successful!</Text>
        </View>
      </View>
      {/* ===== CONTENT ===== */}
      <View style={styles.content}>
        <Text style={styles.title}>
          Thanks for your donation! It means a lot.
        </Text>

        <Text style={styles.description}>
          Our generosity is now being put into action. Thank you for making a
          difference.
        </Text>

        {/* ===== PRICE DETAILS ===== */}
        <View style={styles.priceBox}>
          <View style={styles.horizontalLine} />
          <PriceRow label="Subtotal" value={`$${formatPrice(subtotal)}`} />
          <PriceRow label="Admin Fee" value={`$${formatPrice(adminFee)}`} />
          <View style={styles.horizontalLine} />
          <PriceRow label="Total" value={`$${formatPrice(total)}`} bold />
          <View style={styles.horizontalLine} />
        </View>

        {/* ===== SHARE ===== */}
        <View>
          <Text style={styles.shareTitle}>Share</Text>

          <View style={styles.shareRow}>
            <ShareItem icon="logo-instagram" label="Instagram" />
            <ShareItem icon="logo-whatsapp" label="WhatsApp" />
            <ShareItem icon="logo-facebook" label="Facebook" />
            <ShareItem icon="entypo-link" label="Link" />

            <ShareItem icon="ellipsis-horizontal" label="More" />
          </View>
        </View>
      </View>

      {/* ===== BOTTOM BUTTON ===== */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => router.push("/")}
          activeOpacity={0.85}
        >
          <Text style={styles.footerButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ===== PRICE ROW ===== */
const PriceRow = ({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) => (
  <View style={styles.priceRow}>
    <Text style={[styles.priceText, bold && styles.bold]}>{label}</Text>
    <Text style={[styles.priceText, bold && styles.bold]}>{value}</Text>
  </View>
);

const ShareItem = ({ icon, label }: { icon: any; label: string }) => (
  <TouchableOpacity style={styles.shareItem}>
    <View style={styles.shareIconCircle}>
      {icon === "entypo-link" ? (
        <Entypo name="link" size={24} color="#4C63F0" />
      ) : (
        <Ionicons name={icon} size={24} color="#4C63F0" />
      )}
    </View>
    <Text style={styles.shareLabel}>{label}</Text>
  </TouchableOpacity>
);

/* ===== STYLES ===== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },

  /* HEADER */
  header: {
    height: 220,
    justifyContent: "flex-end",
    position: "relative",
  },
  overlay: {
    backgroundColor: "rgba(38,75,139,0.65)",
    padding: 20,
  },
  headerTitle: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "700",
  },
  headerSubtitle: {
    color: "#E8EEFF",
    fontSize: 14,
    marginTop: 4,
  },
  textOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  horizontalLine: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginBottom: 8,
    marginTop: 8,
    width: "100%",
  },
  /* CONTENT */
  content: {
    padding: 20,
    flex: 1,
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  headerBgColor: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "#246BE1", // your requested color
  },

  leftFade: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%", // only fade left half
    height: "100%",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },

  /* PRICE */
  priceBox: {
    paddingVertical: 12,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  priceText: {
    fontSize: 14,
    color: "#333",
  },
  bold: {
    fontWeight: "700",
  },

  /* SHARE */
  shareTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    color: "#0A0F2C",
  },

  shareRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  shareItem: {
    alignItems: "center",
    width: 64,
  },

  shareIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F1F3FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },

  shareLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#0A0F2C",
    textAlign: "center",
  },

  /* FOOTER */
  footer: {
    backgroundColor: "#246BE1",
    paddingHorizontal: 16,
    paddingVertical: 20,
  },

  footerButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  footerButtonText: {
    color: "#244180",
    fontSize: 16,
    fontWeight: "600",
  },
});
