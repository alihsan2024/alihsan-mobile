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
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <View style={styles.notLoggedInContainer}>
          {/* Main Content Card */}
          <View style={styles.notLoggedInCard}>
            {/* Decorative Top Section with Gradient */}
            <LinearGradient
              colors={["#EEF4FF", "#FFFFFF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardTopSection}
            >
              <View style={styles.notLoggedInIconContainer}>
                <View style={styles.notLoggedInIconCircle}>
                  <LinearGradient
                    colors={["#264B8B", "#4066FF"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.iconGradient}
                  >
                    <Ionicons name="person" size={36} color="#fff" />
                  </LinearGradient>
                </View>
              </View>

              {/* Guthen Font Welcome Text */}
              <Text style={styles.guthenWelcomeText}>Welcome</Text>
              <Text style={styles.notLoggedInHeading}>
                Join Our Community
              </Text>
            </LinearGradient>

            <View style={styles.cardContent}>
              <Text style={styles.notLoggedInDescription}>
                Sign in to access your profile, track your donations, and make a lasting impact.
              </Text>

              {/* Action Buttons */}
              <View style={styles.notLoggedInActions}>
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={() => router.push("/login")}
                  activeOpacity={0.8}
                >
                  <Ionicons name="log-in-outline" size={16} color="#fff" />
                  <Text style={styles.loginButtonText}>Sign In</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.signUpButton}
                  onPress={() => router.push("/signup")}
                  activeOpacity={0.8}
                >
                  <Ionicons name="person-add-outline" size={16} color="#010D26" />
                  <Text style={styles.signUpButtonText}>Create Account</Text>
                </TouchableOpacity>
              </View>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>Benefits</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Benefits Section - Compact Grid */}
              <View style={styles.benefitsSection}>
                <View style={styles.benefitsGrid}>
                  <View style={styles.benefitItem}>
                    <View style={styles.benefitIconContainer}>
                      <Ionicons name="receipt-outline" size={16} color="#264B8B" />
                    </View>
                    <Text style={styles.benefitText}>Track donations</Text>
                  </View>
                  <View style={styles.benefitItem}>
                    <View style={styles.benefitIconContainer}>
                      <Ionicons name="repeat-outline" size={16} color="#264B8B" />
                    </View>
                    <Text style={styles.benefitText}>Recurring gifts</Text>
                  </View>
                  <View style={styles.benefitItem}>
                    <View style={styles.benefitIconContainer}>
                      <Ionicons name="document-text-outline" size={16} color="#264B8B" />
                    </View>
                    <Text style={styles.benefitText}>Project updates</Text>
                  </View>
                  <View style={styles.benefitItem}>
                    <View style={styles.benefitIconContainer}>
                      <Ionicons name="settings-outline" size={16} color="#264B8B" />
                    </View>
                    <Text style={styles.benefitText}>Manage profile</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
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
            donation.Campaign?.coverImage || "https://i.pravatar.cc/150?img=20";
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
                <Text style={[styles.badgeText, { color: badgeStyle.color }]}>
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
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },

  notLoggedInContainer: {
    flex: 1,
    justifyContent: "center",
  },
  notLoggedInHeader: {
    width: "100%",
    marginBottom: 16,
  },
  notLoggedInTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#010D26",
    fontFamily: "AlbertSans_800ExtraBold",
  },
  notLoggedInCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  cardTopSection: {
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  cardContent: {
    padding: 16,
  },
  notLoggedInIconContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  notLoggedInIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: "hidden",
    shadowColor: "#264B8B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  iconGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  guthenWelcomeText: {
    fontSize: 22,
    fontFamily: "Guthen Bloots",
    color: "#FFD602",
    marginBottom: 4,
    textAlign: "center",
  },
  notLoggedInHeading: {
    fontSize: 20,
    fontWeight: "800",
    color: "#010D26",
    textAlign: "center",
    fontFamily: "AlbertSans_800ExtraBold",
  },
  notLoggedInDescription: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 16,
    fontFamily: "AlbertSans_400Regular",
  },
  notLoggedInActions: {
    width: "100%",
    gap: 10,
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: "#264B8B",
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "AlbertSans_700Bold",
  },
  signUpButton: {
    backgroundColor: "#FFD602",
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  signUpButtonText: {
    color: "#010D26",
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "AlbertSans_700Bold",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 14,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9CA3AF",
    fontFamily: "AlbertSans_600SemiBold",
  },
  benefitsSection: {
    width: "100%",
  },
  benefitsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "48%",
    paddingVertical: 2,
  },
  benefitIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EEF4FF",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  benefitText: {
    fontSize: 12,
    color: "#374151",
    fontFamily: "AlbertSans_500Medium",
    lineHeight: 16,
    flex: 1,
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
