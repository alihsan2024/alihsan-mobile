import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fetchCampaigns, Campaign } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import LoadingScreen from "../../components/LoadingScreen";

export default function HomeScreen() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();

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
    if (!authLoading) {
      loadCampaigns();
    }
  }, [authLoading]);

  const onRefresh = () => {
    setRefreshing(true);
    loadCampaigns();
  };

  if (authLoading || loading) {
    return <LoadingScreen message="Loading..." />;
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
        <Text style={styles.title}>Al-Ihsan</Text>
        <Text style={styles.subtitle}>
          {campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""} available
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {campaigns.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No campaigns available</Text>
          </View>
        ) : (
          campaigns.slice(0, 6).map((campaign) => (
            <TouchableOpacity
              key={campaign.id}
              style={styles.campaignCard}
              onPress={() => router.push(`/campaign/${campaign.slug}`)}
              activeOpacity={0.7}
            >
              <Text style={styles.campaignName}>{campaign.name}</Text>
              <Text style={styles.campaignDescription} numberOfLines={2}>
                {campaign.description ||
                  campaign.descriptionText ||
                  "No description"}
              </Text>
            </TouchableOpacity>
          ))
        )}
        {campaigns.length > 6 && (
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => router.push("/(tabs)/campaigns")}
          >
            <Text style={styles.viewAllText}>View All Campaigns</Text>
          </TouchableOpacity>
        )}
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
    fontSize: 32,
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
    marginBottom: 8,
  },
  campaignDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
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
  viewAllButton: {
    backgroundColor: "#264B8B",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  viewAllText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
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

