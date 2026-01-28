import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Image as ExpoImage } from "expo-image";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { formatPrice } from "@/utils/helper";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const COVER_IMAGE_URL =
  "https://www.alihsan.org.au/_next/image?url=https%3A%2F%2Falihsan.s3.ap-southeast-2.amazonaws.com%2Fupdated-photos%2F1753924269927-alihsan-1708467468866-alihsan-coverImage.webp&w=1920&q=75";

export default function ThankYouScreen() {
  const [summary, setSummary] = useState<any>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    AsyncStorage.getItem("checkoutSummary").then((data) => {
      if (data) setSummary(JSON.parse(data));
    });
  }, []);

  if (!summary) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const { subtotal, adminFee, total } = summary;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerWrapper}>
        <ExpoImage
          source={{ uri: COVER_IMAGE_URL }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />

        <LinearGradient
          colors={["transparent", "rgba(38,75,139,0.6)", "rgba(38,75,139,0.9)"]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        <View style={styles.headerContent}>
          <Text style={styles.guthenText}>Alhamdulillah</Text>
          <Text style={styles.headerTitle}>Thank You</Text>
          <Text style={styles.headerSubtitle}>
            Your generosity is making a real difference. We are grateful for your support and commitment to helping those in need.
          </Text>
        </View>
      </View>

      {/* CONTENT */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Success Message */}
          <View style={styles.successCard}>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={48} color="#10B981" />
            </View>
            <Text style={styles.successTitle}>Transaction Successful!</Text>
            <Text style={styles.successDescription}>
              Your donation has been processed successfully. Thank you for your generosity and support.
            </Text>
          </View>

          {/* Price Details */}
          <View style={styles.priceCard}>
            <Text style={styles.priceCardTitle}>Payment Summary</Text>
            <View style={styles.priceDivider} />
            
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Subtotal</Text>
              <Text style={styles.priceValue}>${formatPrice(subtotal)}</Text>
            </View>
            
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Admin Fee</Text>
              <Text style={styles.priceValue}>${formatPrice(adminFee)}</Text>
            </View>
            
            <View style={styles.priceDivider} />
            
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, styles.priceTotalLabel]}>Total</Text>
              <Text style={[styles.priceValue, styles.priceTotalValue]}>
                ${formatPrice(total)}
              </Text>
            </View>
          </View>

          {/* Share Section */}
          <View style={styles.shareSection}>
            <Text style={styles.shareTitle}>Share Your Impact</Text>
            <Text style={styles.shareSubtitle}>
              Help spread the word and inspire others to make a difference
            </Text>

            <View style={styles.shareRow}>
              <ShareItem icon="logo-instagram" label="Instagram" />
              <ShareItem icon="logo-whatsapp" label="WhatsApp" />
              <ShareItem icon="logo-facebook" label="Facebook" />
              <ShareItem icon="link" label="Link" />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* RETURN HOME SECTION */}
      <View style={styles.returnHomeSection}>
        <TouchableOpacity
          style={styles.returnHomeButton}
          onPress={() => router.push("/(tabs)/")}
          activeOpacity={0.8}
        >
          <Text style={styles.returnHomeButtonText}>Return to Home</Text>
          <Ionicons name="home-outline" size={20} color="#264B8B" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const ShareItem = ({ icon, label }: { icon: string; label: string }) => (
  <TouchableOpacity style={styles.shareItem} activeOpacity={0.7}>
    <View style={styles.shareIconCircle}>
      <Ionicons name={icon as any} size={24} color="#264B8B" />
    </View>
    <Text style={styles.shareLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    fontFamily: "AlbertSans_400Regular",
  },

  // Header (same style as Zakat Calculator)
  headerWrapper: {
    height: 240,
    width: "100%",
    position: "relative",
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  headerContent: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
    zIndex: 1,
  },
  guthenText: {
    fontSize: 24,
    fontFamily: "Guthen Bloots",
    color: "#FFD602",
    marginBottom: 4,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    fontFamily: "AlbertSans_800ExtraBold",
    marginBottom: 8,
  },
  headerSubtitle: {
    color: "#E6ECFF",
    fontSize: 15,
    lineHeight: 22,
    fontFamily: "AlbertSans_400Regular",
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },

  // Content
  content: {
    padding: 20,
    paddingTop: 24,
    gap: 20,
  },

  // Success Card
  successCard: {
    backgroundColor: "#F0FDF4",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  successIconContainer: {
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#065F46",
    marginBottom: 8,
    fontFamily: "AlbertSans_700Bold",
    textAlign: "center",
  },
  successDescription: {
    fontSize: 14,
    color: "#047857",
    textAlign: "center",
    lineHeight: 20,
    fontFamily: "AlbertSans_400Regular",
  },

  // Price Card
  priceCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  priceCardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#010D26",
    marginBottom: 12,
    fontFamily: "AlbertSans_700Bold",
  },
  priceDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 15,
    color: "#6B7280",
    fontFamily: "AlbertSans_500Medium",
  },
  priceValue: {
    fontSize: 15,
    color: "#010D26",
    fontWeight: "600",
    fontFamily: "AlbertSans_600SemiBold",
  },
  priceTotalLabel: {
    fontSize: 18,
    color: "#010D26",
    fontWeight: "700",
    fontFamily: "AlbertSans_700Bold",
  },
  priceTotalValue: {
    fontSize: 18,
    color: "#264B8B",
    fontWeight: "800",
    fontFamily: "AlbertSans_800ExtraBold",
  },

  // Share Section
  shareSection: {
    marginTop: 8,
  },
  shareTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#010D26",
    marginBottom: 8,
    fontFamily: "AlbertSans_700Bold",
  },
  shareSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 20,
    lineHeight: 20,
    fontFamily: "AlbertSans_400Regular",
  },
  shareRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  shareItem: {
    flex: 1,
    alignItems: "center",
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
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
    fontFamily: "AlbertSans_600SemiBold",
  },

  // Return Home Section
  returnHomeSection: {
    padding: 20,
    paddingBottom: 32,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  returnHomeButton: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  returnHomeButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#264B8B",
    fontFamily: "AlbertSans_700Bold",
  },
});
