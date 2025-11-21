import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fetchCampaigns, Campaign } from "../../services/api";
import LoadingScreen from "../../components/LoadingScreen";
import CampaignCard from "@/components/CampaignCard";

export default function CampaignsScreen() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();
  const insets = useSafeAreaInsets();

  const lastRefreshRef = useRef(0);
  const REFRESH_COOLDOWN = 5000;

  const loadCampaigns = async () => {
    try {
      setError(null);
      const data = await fetchCampaigns();
      setCampaigns(data);
    } catch (err: any) {
      console.error("Failed to load campaigns:", err);
      setError(err.message || "Failed to load campaigns");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const onRefresh = () => {
    const now = Date.now();
    if (now - lastRefreshRef.current < REFRESH_COOLDOWN) {
      // Alert.alert(
      //   "Cooldown",
      //   "Please wait a few seconds before refreshing again."
      // );
      return;
    }

    lastRefreshRef.current = now;
    setRefreshing(true);
    loadCampaigns();
  };

  if (loading) {
    return <LoadingScreen message="Loading campaigns..." />;
  }

  if (error) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <Text style={styles.retryText} onPress={loadCampaigns}>
          Tap to retry
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <View style={styles.header}>
        <Text style={styles.title}>All Campaigns</Text>
        <Text style={styles.subtitle}>
          {campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""} found
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <CampaignCard campaigns={campaigns} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#264B8B",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  scrollView: {
    flex: 1,
  },
  campaignCard: {
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#264B8B",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  campaignName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#264B8B",
    marginBottom: 4,
  },
  campaignSlug: {
    fontSize: 12,
    color: "#999",
    marginBottom: 8,
  },
  campaignDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  imageUrl: {
    fontSize: 10,
    color: "#999",
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#d32f2f",
    marginBottom: 12,
  },
  retryText: {
    fontSize: 16,
    color: "#264B8B",
    textDecorationLine: "underline",
  },
});
