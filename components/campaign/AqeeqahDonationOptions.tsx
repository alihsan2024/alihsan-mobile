import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";

const AQEEQAH_WEB_URL = "https://www.alihsan.org.au/project/aqeeqah";

interface AqeeqahDonationOptionsProps {
  campaign: any;
  onAddToBasket: (payload: any) => Promise<void>;
  addingToCart: boolean;
}

/**
 * Aqeeqah donation options – directs users to complete on website.
 */
export default function AqeeqahDonationOptions({
  campaign,
  onAddToBasket,
  addingToCart,
}: AqeeqahDonationOptionsProps) {
  const openOnWeb = () => Linking.openURL(AQEEQAH_WEB_URL);

  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>
        Choose goat or sheep, quantity, country & more on our website.
      </Text>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={openOnWeb}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryButtonText}>Complete on website</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  placeholder: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: "#FFD602",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 4,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#010D26",
  },
});
