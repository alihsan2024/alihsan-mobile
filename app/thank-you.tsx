import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Linking,
  Share,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Image as ExpoImage } from "expo-image";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { formatPrice } from "@/utils/helper";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";

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

  const handleShare = async (platform: "instagram" | "whatsapp" | "facebook" | "link") => {
    const shareMessage = "I just made a donation to Al-Ihsan Foundation! Join me in making a difference. 🌟";
    const shareUrl = "https://www.alihsan.org.au";
    const fullMessage = `${shareMessage} ${shareUrl}`;

    try {
      switch (platform) {
        case "whatsapp":
          const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(fullMessage)}`;
          const canOpenWhatsApp = await Linking.canOpenURL(whatsappUrl);
          if (canOpenWhatsApp) {
            await Linking.openURL(whatsappUrl);
          } else {
            // Fallback to web WhatsApp
            await Linking.openURL(`https://wa.me/?text=${encodeURIComponent(fullMessage)}`);
          }
          break;
        case "facebook":
          const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
          await Linking.openURL(facebookUrl);
          break;
        case "instagram":
          // Instagram doesn't support direct sharing via URL, use native share
          await Share.share({
            message: fullMessage,
            url: shareUrl,
          });
          break;
        case "link":
          await Clipboard.setStringAsync(shareUrl);
          Alert.alert("Link Copied!", "The link has been copied to your clipboard.");
          break;
      }
    } catch (error) {
      console.error("Error sharing:", error);
      Alert.alert("Error", "Unable to share. Please try again.");
    }
  };

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
            <View style={styles.shareHeader}>
              <View style={styles.shareIconContainer}>
                <Ionicons name="share-social" size={24} color="#246BE1" />
              </View>
              <View style={styles.shareHeaderText}>
                <Text style={styles.shareTitle}>Share Your Impact</Text>
                <Text style={styles.shareSubtitle}>
                  Help spread the word and inspire others to make a difference
                </Text>
              </View>
            </View>

            <View style={styles.shareGrid}>
              <ShareItem 
                icon="logo-instagram" 
                label="Instagram" 
                color="#E4405F"
                onPress={() => handleShare("instagram")}
              />
              <ShareItem 
                icon="logo-whatsapp" 
                label="WhatsApp" 
                color="#25D366"
                onPress={() => handleShare("whatsapp")}
              />
              <ShareItem 
                icon="logo-facebook" 
                label="Facebook" 
                color="#1877F2"
                onPress={() => handleShare("facebook")}
              />
              <ShareItem 
                icon="link" 
                label="Copy Link" 
                color="#246BE1"
                onPress={() => handleShare("link")}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* RETURN HOME SECTION */}
      <View style={[styles.returnHomeSection, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <TouchableOpacity
          style={styles.returnHomeButton}
          onPress={() => router.push("/(tabs)/")}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#246BE1", "#2161CD"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.returnHomeButtonGradient}
          >
            <Ionicons name="home" size={20} color="#FFF" />
            <Text style={styles.returnHomeButtonText}>Return to Home</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const ShareItem = ({ 
  icon, 
  label, 
  color = "#246BE1",
  onPress 
}: { 
  icon: string; 
  label: string;
  color?: string;
  onPress: () => void;
}) => (
  <TouchableOpacity 
    style={styles.shareItem} 
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.shareIconCircle, { backgroundColor: `${color}15` }]}>
      <Ionicons name={icon as any} size={22} color={color} />
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
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  shareHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
    gap: 12,
  },
  shareIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  shareHeaderText: {
    flex: 1,
  },
  shareTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#010D26",
    marginBottom: 4,
    fontFamily: "AlbertSans_700Bold",
  },
  shareSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
    fontFamily: "AlbertSans_400Regular",
  },
  shareGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  shareItem: {
    width: "47%",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  shareIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  shareLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#010D26",
    textAlign: "center",
    fontFamily: "AlbertSans_600SemiBold",
  },

  // Return Home Section
  returnHomeSection: {
    padding: 20,
    paddingTop: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
  },
  returnHomeButton: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#246BE1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  returnHomeButtonGradient: {
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  returnHomeButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFF",
    fontFamily: "AlbertSans_700Bold",
  },
});
