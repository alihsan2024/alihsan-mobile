import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
  Platform,
} from "react-native";
import * as Clipboard from "expo-clipboard";

type Props = {
  visible: boolean;
  campaignName: string;
  campaignUrl: string;
  onClose: () => void;
};

export default function ShareCampaignModal({
  visible,
  campaignName,
  campaignUrl,
  onClose,
}: Props) {
  const handleCopyLink = async () => {
    try {
      await Clipboard.setStringAsync(campaignUrl);
      Alert.alert("Link Copied", "Campaign link has been copied to your clipboard");
      onClose();
    } catch (error) {
      Alert.alert("Error", "Failed to copy link");
    }
  };

  const handleNativeShare = async () => {
    try {
      const result = await Share.share({
        message: `Check out this campaign: ${campaignName}\n\n${campaignUrl}`,
        url: campaignUrl,
        title: campaignName,
      });

      if (result.action === Share.sharedAction) {
        onClose();
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to share");
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={styles.card}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Share Campaign</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.campaignName} numberOfLines={2}>
              {campaignName}
            </Text>
            <Text style={styles.url} numberOfLines={1}>
              {campaignUrl}
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleNativeShare}
              activeOpacity={0.8}
            >
              <View style={styles.shareButtonIcon}>
                <Ionicons name="share-outline" size={20} color="#010D26" />
              </View>
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.copyButton}
              onPress={handleCopyLink}
              activeOpacity={0.8}
            >
              <View style={styles.copyButtonIcon}>
                <Ionicons name="copy-outline" size={20} color="#246BE1" />
              </View>
              <Text style={styles.copyButtonText}>Copy Link</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#010D26",
    fontFamily: "AlbertSans_700Bold",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  campaignName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#010D26",
    marginBottom: 8,
    fontFamily: "AlbertSans_600SemiBold",
  },
  url: {
    fontSize: 13,
    color: "#6B7280",
    fontFamily: "AlbertSans_400Regular",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  shareButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFD602",
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  shareButtonIcon: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  shareButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#010D26",
    fontFamily: "AlbertSans_700Bold",
  },
  copyButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF4FF",
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  copyButtonIcon: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  copyButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#246BE1",
    fontFamily: "AlbertSans_600SemiBold",
  },
});
