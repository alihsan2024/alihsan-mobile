import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Share,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { formatPrice } from "@/utils/helper";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";
import Button from "@/components/ui/Button";

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

  const { total } = summary;

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
          {/* Confirmation message - simple like AU Next.js */}
          <Text style={styles.confirmationText}>
            Your donation has been successfully received.
          </Text>

          {/* Compact payment summary */}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total paid</Text>
            <Text style={styles.summaryValue}>${formatPrice(total)}</Text>
          </View>

          <Text style={styles.receiptNote}>
            A receipt has been sent to your email.
          </Text>

          {/* Share your donation - simple row like AU Next.js */}
          <View style={styles.shareRow}>
            <Text style={styles.shareLabel}>Share your donation</Text>
            <View style={styles.shareIcons}>
              <ShareIcon
                icon="logo-facebook"
                color="#1877F2"
                onPress={() => handleShare("facebook")}
              />
              <ShareIcon
                icon="logo-whatsapp"
                color="#25D366"
                onPress={() => handleShare("whatsapp")}
              />
              <ShareIcon
                icon="logo-instagram"
                color="#E4405F"
                onPress={() => handleShare("instagram")}
              />
              <ShareIcon
                icon="link"
                color="#246BE1"
                onPress={() => handleShare("link")}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* RETURN HOME */}
      <View style={[styles.returnHomeSection, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Button
          variant="primary"
          label="Return to Home"
          leftIcon={<Ionicons name="home-outline" size={18} color="#FFF" />}
          onPress={() => router.push("/(tabs)/")}
          style={styles.returnHomeButton}
        />
      </View>
    </View>
  );
}

const ShareIcon = ({
  icon,
  color,
  onPress,
}: {
  icon: string;
  color: string;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[styles.shareIconButton, { backgroundColor: color }]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Ionicons name={icon as any} size={20} color="#FFF" />
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
    padding: 24,
    paddingTop: 28,
    alignItems: "center",
  },
  confirmationText: {
    fontSize: 18,
    fontFamily: "AlbertSans_600SemiBold",
    color: "#374151",
    textAlign: "center",
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 15,
    color: "#6B7280",
    fontFamily: "AlbertSans_400Regular",
  },
  summaryValue: {
    fontSize: 18,
    fontFamily: "AlbertSans_700Bold",
    color: "#264B8B",
  },
  receiptNote: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: "AlbertSans_400Regular",
    marginBottom: 28,
  },
  shareRow: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 24,
    alignItems: "center",
    width: "100%",
  },
  shareLabel: {
    fontSize: 16,
    fontFamily: "AlbertSans_600SemiBold",
    color: "#374151",
    marginBottom: 16,
  },
  shareIcons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  shareIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },

  returnHomeSection: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  returnHomeButton: {
    width: "100%",
  },
});
