import React, { useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchProfileData,
  setProfileDetails,
} from "@/store/reduxSlice/profileStatisticsSlice";
import { getProfile } from "@/store/reduxSlice/authenticationSlice";

// Format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Format date
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
};

// Get status badge color
const getStatusBadgeStyle = (status: string) => {
  const upperStatus = status?.toUpperCase() || "";
  if (upperStatus === "COMPLETED" || upperStatus === "DISTRIBUTED") {
    return { backgroundColor: "#E8F7EF", color: "#16A34A" };
  }
  if (upperStatus === "ACTIVE") {
    return { backgroundColor: "#EFF6FF", color: "#2563EB" };
  }
  return { backgroundColor: "#FEF3C7", color: "#D97706" };
};

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();

  // Redux state
  const user = useSelector((state: any) => state.authentication.user);
  const authUser = useSelector((state: any) => state.authentication.auth);
  const profileDetails = useSelector(
    (state: any) => state.profileStatistics.profileDetails
  );
  const statistics = useSelector(
    (state: any) => state.profileStatistics.statistics
  );
  const recentDonations = useSelector(
    (state: any) => state.profileStatistics.recentDonations
  );
  const loading = useSelector((state: any) => state.profileStatistics.loading);
  const error = useSelector((state: any) => state.profileStatistics.error);

  const isAuthenticated = !!user || !!authUser;
  const currentUser = user || authUser;

  // Fetch profile data on mount and when user changes
  useEffect(() => {
    if (isAuthenticated) {
      // Fetch profile details
      dispatch(getProfile()).then((action: any) => {
        if (action.payload) {
          dispatch(setProfileDetails(action.payload));
        }
      });

      // Fetch donation statistics and recent donations
      dispatch(fetchProfileData(5));
    }
  }, [isAuthenticated, dispatch]);

  // Refresh handler
  const onRefresh = useCallback(() => {
    if (isAuthenticated) {
      dispatch(getProfile()).then((action: any) => {
        if (action.payload) {
          dispatch(setProfileDetails(action.payload));
        }
      });
      dispatch(fetchProfileData(5));
    }
  }, [isAuthenticated, dispatch]);

  // Get user display name
  const getUserDisplayName = () => {
    if (profileDetails?.firstName) {
      return profileDetails.firstName;
    }
    if (currentUser?.firstName) {
      return currentUser.firstName;
    }
    return "Friend";
  };

  // Get greeting message
  const getGreeting = () => {
    const name = getUserDisplayName();
    const currentYear = new Date().getFullYear();
    return `Assalamualaikum ${name},`;
  };

  if (!isAuthenticated) {
    return (
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top + 20,
            justifyContent: "center",
          },
        ]}
      >
        <View style={styles.notLoggedInContainer}>
          <Text style={styles.notLoggedInIcon}>👤</Text>
          <Text style={styles.notLoggedInText}>You are not logged in</Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Profile */}
      <View style={styles.profileRow}>
        <Image
          source={{
            uri:
              profileDetails?.profileImage ||
              currentUser?.profileImage ||
              "https://i.pravatar.cc/150?img=12",
          }}
          style={styles.avatar}
          contentFit="cover"
        />
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.subGreeting}>
            {statistics.total > 0
              ? `Your ${new Date().getFullYear()} impact is amazing.`
              : "Start making a difference today."}
          </Text>
        </View>
      </View>

      {/* Donation Summary */}
      <LinearGradient
        colors={["#6A7BFF", "#5663F7"]}
        style={styles.summaryCard}
      >
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryLabel}>Total Donation</Text>
          {loading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.summaryAmount}>
              {formatCurrency(statistics.total || 0)}
            </Text>
          )}
        </View>

        <View style={styles.statsRow}>
          {[
            {
              icon: "hand-left-outline",
              label: "Zakat",
              value: statistics.zakat || 0,
            },
            {
              icon: "wallet-outline",
              label: "Sadaqah",
              value: statistics.sadaqah || 0,
            },
            {
              icon: "people-outline",
              label: "Orphan",
              value: statistics.orphan || 0,
            },
          ].map((item, index) => (
            <View key={index} style={styles.statItem}>
              <View style={styles.statIcon}>
                <Ionicons name={item.icon as any} size={20} color="#4F5DFB" />
              </View>
              {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.statValue}>
                  {formatCurrency(item.value)}
                </Text>
              )}
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => dispatch(fetchProfileData(5))}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Recent History */}
      <View style={styles.historyHeader}>
        <Text style={styles.sectionTitle}>Recent History</Text>
        <TouchableOpacity onPress={() => router.push("/user-donations")}>
          <Text style={styles.link}>See All</Text>
        </TouchableOpacity>
      </View>

      {loading && recentDonations.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6A7BFF" />
          <Text style={styles.loadingText}>Loading donations...</Text>
        </View>
      ) : recentDonations.length > 0 ? (
        recentDonations.map((donation, index) => {
          const campaignName =
            donation.Campaign?.name || "Donation" || "Unknown Campaign";
          const coverImage =
            donation.Campaign?.coverImage ||
            "https://i.pravatar.cc/150?img=20";
          const status = donation.status || "COMPLETED";
          const badgeStyle = getStatusBadgeStyle(status);

          return (
            <TouchableOpacity
              key={donation.id || index}
              style={styles.historyItem}
              onPress={() => {
                if (donation.Campaign?.slug) {
                  router.push(`/campaign/${donation.Campaign.slug}`);
                }
              }}
            >
              <Image
                source={{ uri: coverImage }}
                style={styles.historyImg}
                contentFit="cover"
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.historyTitle} numberOfLines={1}>
                  {campaignName.length > 25
                    ? `${campaignName.substring(0, 25)}...`
                    : campaignName}
                </Text>
                <Text style={styles.historySub}>
                  {formatDate(donation.donatedAt || donation.createdAt)} •{" "}
                  {formatCurrency(parseFloat(donation.total) || 0)}
                </Text>
              </View>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: badgeStyle.backgroundColor },
                ]}
              >
                <Text
                  style={[styles.badgeText, { color: badgeStyle.color }]}
                >
                  {status === "COMPLETED" ? "Distributed" : status}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No donations yet</Text>
          <Text style={styles.emptySubText}>
            Start making a difference by donating to a cause
          </Text>
          <TouchableOpacity
            style={styles.donateButton}
            onPress={() => router.push("/(tabs)/campaigns")}
          >
            <Text style={styles.donateButtonText}>Browse Campaigns</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Profile Details Section */}
      <View style={styles.profileDetailsSection}>
        <Text style={styles.sectionTitle}>Profile Details</Text>
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Email</Text>
            <Text style={styles.detailValue}>
              {profileDetails?.email || currentUser?.email || "—"}
            </Text>
          </View>
          {profileDetails?.phone && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Phone</Text>
              <Text style={styles.detailValue}>{profileDetails.phone}</Text>
            </View>
          )}
          {(profileDetails?.address || profileDetails?.city) && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Address</Text>
              <Text style={styles.detailValue}>
                {[
                  profileDetails.address,
                  profileDetails.city,
                  profileDetails.state,
                  profileDetails.country,
                ]
                  .filter(Boolean)
                  .join(", ") || "—"}
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FC",
    paddingHorizontal: 16,
  },

  notLoggedInContainer: {
    alignItems: "center",
  },
  notLoggedInIcon: {
    fontSize: 80,
    opacity: 0.3,
  },
  notLoggedInText: {
    fontSize: 18,
    color: "#666",
    marginTop: 16,
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: "#264B8B",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: "#111",
  },

  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  greeting: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },
  subGreeting: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },

  summaryCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  summaryLabel: {
    color: "#E0E4FF",
    fontSize: 13,
  },
  summaryAmount: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statIcon: {
    backgroundColor: "#FFF",
    padding: 8,
    borderRadius: 20,
    marginBottom: 6,
  },
  statValue: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 12,
  },
  statLabel: {
    color: "#E0E4FF",
    fontSize: 11,
    marginTop: 2,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    marginBottom: 8,
  },

  errorContainer: {
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: "center",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
    marginBottom: 8,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },

  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    color: "#6B7280",
    fontSize: 14,
  },

  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#010D261A",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  historyImg: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 10,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
  },
  historySub: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },

  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 20,
  },
  donateButton: {
    backgroundColor: "#6A7BFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  donateButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },

  profileDetailsSection: {
    marginTop: 8,
    marginBottom: 20,
  },
  detailsCard: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#010D261A",
  },
  detailRow: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    color: "#111",
    fontWeight: "600",
  },
});
