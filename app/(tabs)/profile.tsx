import React, {
  useEffect,
  useCallback,
  useState,
  useMemo,
  useRef,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Image,
  LayoutAnimation,
  Platform,
  UIManager,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image as ExpoImage } from "expo-image";
import { useRouter } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchProfileData,
  clearCache,
  setProfileDetails,
} from "@/store/reduxSlice/profileStatisticsSlice";
import {
  deleteAccount,
  getProfile,
  logoutUser,
} from "@/store/reduxSlice/authenticationSlice";
import LogoutConfirmationModal from "@/components/ui/Modals/LogoutConfirmationModal";
import DeleteAccountConfirmationModal from "@/components/ui/Modals/DeleteAccountConfirmationModal";
import { useToast } from "@/context/ToastContext";
import { getPaymentsList } from "@/store/reduxSlice/paymentDetailsSlice";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "@/context/AuthContext";

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/** Same hero asset as Help & campaign search for visual consistency */
const GUEST_PROFILE_BANNER_URI =
  "https://alihsan.s3.ap-southeast-2.amazonaws.com/gaza/1766470085564-alihsan-IMG_4983%20Congo%20Blog%202%20Large.jpeg";

/** Must match `tabBarStyle.height` in `app/(tabs)/_layout.tsx` */
const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 88 : 68;

const GUEST_BENEFITS: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  description: string;
}[] = [
  {
    icon: "receipt-outline",
    title: "Donation history",
    description: "Every gift, date, and campaign in one timeline.",
  },
  {
    icon: "repeat-outline",
    title: "Recurring gifts",
    description: "Schedule weekly or monthly support you can change anytime.",
  },
  {
    icon: "document-text-outline",
    title: "Tax receipts",
    description: "Download PDF invoices whenever you need them.",
  },
  {
    icon: "notifications-outline",
    title: "Project updates",
    description: "Stories and impact from the programmes you support.",
  },
  {
    icon: "settings-outline",
    title: "Your profile",
    description: "Update contact details and preferences in a tap.",
  },
];

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
  const { height: windowHeight } = useWindowDimensions();
  const dispatch = useDispatch();
  const appDispatch = useAppDispatch();

  // Redux state
  const user = useSelector((state: any) => state.authentication.user);
  const authUser = useSelector((state: any) => state.authentication.auth);
  const profileDetails = useSelector(
    (state: any) => state.profileStatistics.profileDetails,
  );
  const statistics = useSelector(
    (state: any) => state.profileStatistics.statistics,
  );
  const recentDonations = useSelector(
    (state: any) => state.profileStatistics.recentDonations,
  );
  const loading = useSelector((state: any) => state.profileStatistics.loading);
  const error = useSelector((state: any) => state.profileStatistics.error);
  const paymentRows = useSelector(
    (state: any) => state.paymentDetails.paymentList.rows,
  );
  const paymentsLoading = useSelector(
    (state: any) => state.paymentDetails.paymentList.loading,
  );

  const isAuthenticated = !!user || !!authUser;
  const currentUser = user || authUser;
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);
  const { showToast } = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<Set<string | number>>(
    new Set(),
  );
  const scrollViewRef = useRef<ScrollView>(null);
  const notLoggedInScrollViewRef = useRef<ScrollView>(null);

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

      // Fetch payments for payment history (includes orderId)
      const farPastDate = new Date(2000, 0, 1).getTime().toString();
      appDispatch(
        getPaymentsList({
          page: "1",
          fromdate: farPastDate,
          limit: 50, // Fetch more to account for grouping by orderId
        }),
      );
    }
  }, [isAuthenticated, dispatch, appDispatch]);

  // Refresh handler
  const onRefresh = useCallback(() => {
    if (!isAuthenticated) return;
    setRefreshing(true);
    dispatch(clearCache());
    dispatch(getProfile())
      .then((action: any) => {
        if (action.payload) {
          dispatch(setProfileDetails(action.payload));
        }
      })
      .finally(() => {
        Promise.all([
          dispatch(fetchProfileData(5)),
          appDispatch(
            getPaymentsList({
              page: "1",
              fromdate: new Date(2000, 0, 1).getTime().toString(),
              limit: 50,
            }),
          ),
        ]).finally(() => {
          setRefreshing(false);
        });
      });
  }, [isAuthenticated, dispatch, appDispatch]);

  // Scroll to top when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      notLoggedInScrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, []),
  );

  // Status bar: light on guest hero, dark when logged in; reset when leaving tab
  useFocusEffect(
    useCallback(() => {
      if (!isAuthenticated) {
        setStatusBarStyle("light");
      } else {
        setStatusBarStyle("dark");
      }
      return () => {
        setStatusBarStyle("auto");
      };
    }, [isAuthenticated]),
  );

  const groupedOrders = useMemo(() => {
    const grouped: Record<
      string,
      {
        orderId: string | number;
        totalAmount: number;
        paymentDate: string;
        items: any[];
      }
    > = {};

    // Use payments from getPaymentsList (includes orderId) instead of recentDonations
    const paymentsToGroup =
      paymentRows && Array.isArray(paymentRows) ? paymentRows : [];

    // Helper function to check if payment is a processing fee
    const isProcessingFee = (payment: any) => {
      const notes = payment?.notes || payment?.Donation?.notes || "";
      const campaignId = payment?.campaignId || payment?.Campaign?.id;
      const donationItem =
        payment?.donationItem || payment?.Donation?.donationItem || "";
      return (
        notes.toLowerCase().includes("processing fee") ||
        campaignId === 259 ||
        donationItem.toLowerCase().includes("processing fee") ||
        donationItem.toLowerCase().includes("admin fee")
      );
    };

    paymentsToGroup.forEach((payment: any) => {
      // Get orderId from Donation object (payments API structure)
      const orderId = payment?.Donation?.orderId || payment?.orderId;

      // Only group by orderId - skip payments without orderId
      if (!orderId) {
        console.warn("Payment missing orderId, skipping:", payment);
        return;
      }

      const date = payment?.updatedAt || payment?.createdAt;
      const isFee = isProcessingFee(payment);

      if (!grouped[orderId]) {
        grouped[orderId] = {
          orderId,
          totalAmount: 0,
          paymentDate: date || "",
          items: [],
        };
      }

      // Include all payments (including processing fees) in the items array
      grouped[orderId].items.push(payment);
      // Total = sum of all items (donations + fees)
      grouped[orderId].totalAmount += Number(payment?.total) || 0;

      if (date) {
        const paymentDate = new Date(date);
        const currentOrderDate = new Date(grouped[orderId].paymentDate || date);
        if (paymentDate < currentOrderDate) {
          grouped[orderId].paymentDate = date;
        }
      }
    });

    const sorted = Object.values(grouped).sort(
      (a, b) =>
        new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime(),
    );
    // Return only top 5 orders for profile page preview
    return sorted.slice(0, 5);
  }, [paymentRows]);

  const toggleOrderExpansion = (orderId: string | number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

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

  // Handle sign out button press - show confirmation modal
  const handleSignOutPress = () => {
    setShowLogoutModal(true);
  };

  // Handle confirmed sign out
  const handleConfirmSignOut = async () => {
    setShowLogoutModal(false);
    try {
      const result = await dispatch(logoutUser());
      if (logoutUser.fulfilled.match(result)) {
        router.replace("/(tabs)/");
      } else {
        console.error("Logout failed:", result.error);
        // Still navigate even if logout has issues
        router.replace("/(tabs)/");
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Navigate anyway to ensure user can continue
      router.replace("/(tabs)/");
    }
  };

  const handleDeleteAccountPress = () => {
    setShowDeleteAccountModal(true);
  };

  const handleCancelDeleteAccount = () => {
    if (!deleteAccountLoading) setShowDeleteAccountModal(false);
  };

  const handleConfirmDeleteAccount = async () => {
    if (!authUser?.id) {
      showToast({ message: "Unable to delete account. Please sign in again.", type: "error" });
      return;
    }
    setDeleteAccountLoading(true);
    try {
      await appDispatch(deleteAccount(String(authUser.id))).unwrap();
      setShowDeleteAccountModal(false);
      showToast({
        message: "Your account has been deleted.",
        type: "success",
        duration: 2800,
      });
      setTimeout(() => {
        router.replace("/(tabs)/");
      }, 450);
    } catch (error: unknown) {
      const message =
        typeof error === "string"
          ? error
          : error && typeof error === "object" && "message" in error
            ? String((error as { message: string }).message)
            : "Could not delete account. Please try again.";
      showToast({ message, type: "error" });
    } finally {
      setDeleteAccountLoading(false);
    }
  };

  if (!isAuthenticated) {
    /** Match visible tab scene height so the scroll body isn’t a short strip with a grey void below. */
    const guestScrollMinHeight =
      windowHeight - TAB_BAR_HEIGHT - insets.top;
    /** Hero + overlap: sheet pulls up into hero; bottom is square to meet the tab bar. */
    const GUEST_HERO_HEIGHT = 220;
    const GUEST_HERO_OVERLAP = 18;
    const guestSheetMinHeight = Math.max(
      0,
      guestScrollMinHeight - GUEST_HERO_HEIGHT + GUEST_HERO_OVERLAP,
    );

    return (
        <View style={styles.guestRoot}>
          <ScrollView
            ref={notLoggedInScrollViewRef}
            style={styles.notLoggedInScroll}
            contentContainerStyle={[
              styles.notLoggedInContent,
              {
                flexGrow: 1,
                backgroundColor: "#E8EDF2",
                minHeight: guestScrollMinHeight,
                paddingBottom: 0,
              },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.guestHero}>
              <ExpoImage
                source={{ uri: GUEST_PROFILE_BANNER_URI }}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
              />
              <LinearGradient
                colors={[
                  "rgba(1,13,38,0.2)",
                  "rgba(38,75,139,0.65)",
                  "rgba(1,13,38,0.92)",
                ]}
                locations={[0, 0.42, 1]}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
              />
              <View style={styles.guestHeroInner}>
                <Text style={styles.guestHeroGuthen}>Together</Text>
                <Text style={styles.guestHeroTitle}>
                  Your generosity, in one place
                </Text>
                <Text style={styles.guestHeroSubtitle}>
                  Track gifts, receipts, and project news — synced with your web
                  account.
                </Text>
              </View>
            </View>

            <View style={styles.guestSheetWrap}>
              <View
                style={[
                  styles.guestSheet,
                  {
                    minHeight: guestSheetMinHeight,
                    paddingBottom: 16 + insets.bottom,
                  },
                ]}
              >
                <Text style={styles.guestSheetIntro}>
                  {`Sign in to see your donation history and manage your profile. New here? Create an account in a minute — it's free.`}
                </Text>

                <View style={styles.guestCtaRow}>
                  <TouchableOpacity
                    style={styles.guestSignInButton}
                    onPress={() => router.push("/login")}
                    activeOpacity={0.88}
                  >
                    <Ionicons name="log-in-outline" size={17} color="#010D26" />
                    <Text style={styles.guestSignInButtonText} numberOfLines={1}>
                      Sign in
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.guestCreateButton}
                    onPress={() => router.push("/signup")}
                    activeOpacity={0.88}
                  >
                    <Ionicons
                      name="person-add-outline"
                      size={17}
                      color="#264B8B"
                    />
                    <Text style={styles.guestCreateButtonText} numberOfLines={1}>
                      Sign up
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.guestDivider} />

                <View style={styles.guestBenefitsHeader}>
                  <Text style={styles.guestBenefitsTitle}>Member benefits</Text>
                  <Text style={styles.guestBenefitsSub}>
                    Everything below is included with your account.
                  </Text>
                </View>

                <View style={styles.guestBenefitsPanel}>
                  {GUEST_BENEFITS.map((item, index) => (
                    <View
                      key={item.title}
                      style={[
                        styles.guestBenefitRow,
                        index === GUEST_BENEFITS.length - 1 &&
                          styles.guestBenefitRowLast,
                      ]}
                    >
                      <View style={styles.guestBenefitIconWrap}>
                        <Ionicons name={item.icon} size={15} color="#2563EB" />
                      </View>
                      <View style={styles.guestBenefitText}>
                        <Text style={styles.guestBenefitTitle}>{item.title}</Text>
                        <Text style={styles.guestBenefitDescription}>
                          {item.description}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>

                <View style={styles.guestTrustFooter}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={16}
                    color="#64748B"
                  />
                  <Text style={styles.guestTrustText}>
                    Secure sign-in · We never sell your data
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.scrollContentInner}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.push("/(tabs)/")}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={22} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Profile</Text>
            <TouchableOpacity
              style={styles.signOutButton}
              onPress={handleSignOutPress}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={20} color="#DC2626" />
            </TouchableOpacity>
          </View>

          {/* Donation Summary Card - Credit Card Style */}
          <View style={styles.creditCardContainer}>
            <LinearGradient
              colors={["#5089E7", "#2161CD"]}
              style={styles.creditCard}
            >
              {/* Card Top with Logo */}
              <View style={styles.cardTop}>
                <Image
                  source={require("../../assets/logo-white.png")}
                  style={styles.cardLogo}
                  resizeMode="contain"
                />
                <View style={styles.cardPattern}>
                  <View style={styles.cardDot} />
                  <View style={styles.cardDot} />
                  <View style={styles.cardDot} />
                  <View style={styles.cardDot} />
                </View>
              </View>

              {/* Card Content */}
              <View style={styles.cardContent}>
                <View style={styles.cardContentLeft}>
                  <Text style={styles.cardLabel}>Total Donation</Text>
                </View>
                <View style={styles.cardContentRight}>
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.cardAmount}>
                      {formatCurrency(statistics.total || 0)}
                    </Text>
                  )}
                </View>
              </View>

              {/* Card Footer with Stats */}
              <View style={styles.cardFooter}>
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
                  <View key={index} style={styles.cardStatItem}>
                    <View style={styles.cardStatIcon}>
                      <Ionicons
                        name={item.icon as any}
                        size={14}
                        color="#FFD602"
                      />
                    </View>
                    {loading ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Text style={styles.cardStatValue}>
                        {formatCurrency(item.value)}
                      </Text>
                    )}
                    <Text style={styles.cardStatLabel}>{item.label}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>
          </View>

          {/* Profile */}
          <View style={styles.profileRow}>
            <Image
              source={{
                uri: "https://static.vecteezy.com/system/resources/thumbnails/005/544/718/small/profile-icon-design-free-vector.jpg",
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

          {/* Payment History Section */}
          <View style={styles.paymentHistorySection}>
            <View style={styles.paymentHistoryHeader}>
              <Text style={styles.paymentHistoryTitle}>Payment History</Text>
              <TouchableOpacity
                style={styles.seeAllButton}
                onPress={() => router.push("/(tabs)/one-time-user-donations")}
                activeOpacity={0.7}
              >
                <Text style={styles.seeAllText}>See all</Text>
                <Ionicons name="chevron-forward" size={14} color="#2161CD" />
              </TouchableOpacity>
            </View>

            {(loading || paymentsLoading) && groupedOrders.length === 0 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2161CD" />
                <Text style={styles.loadingText}>Loading donations...</Text>
              </View>
            ) : groupedOrders.length > 0 ? (
              <View style={styles.orderList}>
                {groupedOrders.map((order, index) => {
                  const isExpanded = expandedOrders.has(order.orderId);
                  // Helper function to check if payment is a processing fee
                  const isProcessingFee = (item: any) => {
                    const notes = item?.notes || item?.Donation?.notes || "";
                    const campaignId = item?.campaignId || item?.Campaign?.id;
                    const donationItem =
                      item?.donationItem || item?.Donation?.donationItem || "";
                    return (
                      notes.toLowerCase().includes("processing fee") ||
                      campaignId === 259 ||
                      donationItem.toLowerCase().includes("processing fee") ||
                      donationItem.toLowerCase().includes("admin fee")
                    );
                  };
                  // Filter out processing fee items and get the first non-processing-fee item
                  const nonProcessingFeeItems = order.items.filter(
                    (item: any) => !isProcessingFee(item),
                  );
                  const primaryItem =
                    nonProcessingFeeItems[0] || order.items[0];

                  // Get unique campaigns (excluding processing fees)
                  const uniqueCampaigns = new Map<string, number>();
                  nonProcessingFeeItems.forEach((item: any) => {
                    const campaignName = item?.Campaign?.name
                      ? item.Campaign.name
                      : item?.orphan_id
                        ? "Orphan Sponsorship"
                        : "Donation";
                    uniqueCampaigns.set(
                      campaignName,
                      (uniqueCampaigns.get(campaignName) || 0) + 1,
                    );
                  });
                  const campaignCount = uniqueCampaigns.size;
                  const totalItems = nonProcessingFeeItems.length;

                  const primaryCampaignName = primaryItem?.Campaign?.name
                    ? primaryItem.Campaign.name
                    : primaryItem?.orphan_id
                      ? "Orphan Sponsorship"
                      : "Donation";

                  // Build campaign name with count
                  const otherCount = campaignCount > 1 ? campaignCount - 1 : 0;

                  const coverImage =
                    (primaryItem?.Campaign as any)?.coverImage ||
                    "https://alihsan.s3.ap-southeast-2.amazonaws.com/projects/1708467963799-alihsan-coverImage.png";
                  const orderStatus =
                    primaryItem?.status ||
                    primaryItem?.Donation?.status ||
                    "COMPLETED";
                  const statusUpper = String(orderStatus).toUpperCase();
                  const statusLabel =
                    statusUpper === "COMPLETED" ? "Completed" : statusUpper;
                  const statusStyle = getStatusBadgeStyle(orderStatus);
                  const amountLabel = `AUD $${Number(order.totalAmount).toFixed(2)}`;

                  return (
                    <View key={order.orderId || index} style={styles.orderCard}>
                      <TouchableOpacity
                        style={styles.orderHeader}
                        onPress={() => toggleOrderExpansion(order.orderId)}
                        activeOpacity={0.7}
                      >
                        <Image
                          source={{ uri: coverImage }}
                          style={styles.orderImage}
                        />
                        <View style={styles.orderInfo}>
                          <Text style={styles.orderTitle} numberOfLines={1}>
                            {primaryCampaignName}
                            {otherCount > 0 && (
                              <Text style={styles.orderOtherCampaigns}>
                                {" "}
                                +{otherCount}
                              </Text>
                            )}
                          </Text>
                          <Text style={styles.orderMetaText}>
                            {formatDate(order.paymentDate)} · {amountLabel}
                          </Text>
                        </View>
                        <View style={styles.orderRight}>
                          <View
                            style={[
                              styles.orderStatusBadge,
                              { backgroundColor: statusStyle.backgroundColor },
                            ]}
                          >
                            <Text
                              style={[
                                styles.orderStatusText,
                                { color: statusStyle.color },
                              ]}
                            >
                              {statusLabel}
                            </Text>
                          </View>
                          <Ionicons
                            name={isExpanded ? "chevron-up" : "chevron-down"}
                            size={18}
                            color="#9CA3AF"
                          />
                        </View>
                      </TouchableOpacity>

                      {isExpanded && (
                        <View style={styles.orderDetails}>
                          <View style={styles.orderDetailsHeader}>
                            <Text style={styles.orderDetailsTitle}>
                              Order #{order.orderId}
                            </Text>
                          </View>
                          <View style={styles.orderDetailsList}>
                            {order.items.map((item: any, itemIndex: number) => {
                              const isFee = isProcessingFee(item);
                              return (
                                <View
                                  key={item.id}
                                  style={[
                                    styles.paymentRow,
                                    itemIndex === order.items.length - 1 &&
                                      styles.paymentRowLast,
                                  ]}
                                >
                                  <Text
                                    style={[
                                      styles.paymentName,
                                      isFee && styles.paymentNameFee,
                                    ]}
                                    numberOfLines={1}
                                  >
                                    {isFee
                                      ? "Processing fee"
                                      : item?.Campaign?.name
                                        ? item.Campaign.name
                                        : item?.orphan_id
                                          ? "Orphan Sponsorship"
                                          : "Donation"}
                                  </Text>
                                  <Text
                                    style={[
                                      styles.paymentTotal,
                                      isFee && styles.paymentTotalFee,
                                    ]}
                                  >
                                    $
                                    {Number(
                                      item?.total || item?.Donation?.total || 0,
                                    ).toFixed(2)}
                                  </Text>
                                </View>
                              );
                            })}
                          </View>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
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
          </View>

          {/* Profile Details Section */}
          <View style={styles.profileDetailsSection}>
            <Text style={styles.profileDetailsSectionTitle}>
              Profile Details
            </Text>
            <View style={styles.detailsCard}>
              <View
                style={[
                  styles.detailRow,
                  !profileDetails?.phone &&
                    !(profileDetails?.address || profileDetails?.city) &&
                    styles.detailRowLast,
                ]}
              >
                <Text style={styles.detailLabel}>Email</Text>
                <Text style={styles.detailValue} numberOfLines={1}>
                  {profileDetails?.email || currentUser?.email || "—"}
                </Text>
              </View>
              {profileDetails?.phone ? (
                <View
                  style={[
                    styles.detailRow,
                    !(profileDetails?.address || profileDetails?.city) &&
                      styles.detailRowLast,
                  ]}
                >
                  <Text style={styles.detailLabel}>Phone</Text>
                  <Text style={styles.detailValue}>{profileDetails.phone}</Text>
                </View>
              ) : null}
              {profileDetails?.address || profileDetails?.city ? (
                <View style={[styles.detailRow, styles.detailRowLast]}>
                  <Text style={styles.detailLabel}>Address</Text>
                  <Text style={styles.detailValue} numberOfLines={2}>
                    {[
                      profileDetails?.address,
                      profileDetails?.city,
                      profileDetails?.state,
                      profileDetails?.country,
                    ]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          <View style={styles.deleteSection}>
            <Text style={styles.deleteSectionTitle}>Danger Zone</Text>

            <TouchableOpacity
              style={styles.deleteAccountButton}
              onPress={handleDeleteAccountPress}
              activeOpacity={0.85}
            >
              <Ionicons name="trash-outline" size={18} color="#DC2626" />
              <Text style={styles.deleteAccountText}>Delete Account</Text>
            </TouchableOpacity>

            <Text style={styles.deleteWarningText}>
              This will deactivate your account and remove items from your
              basket.
            </Text>
          </View>

          {/* Logout Confirmation Modal */}
          <LogoutConfirmationModal
            visible={showLogoutModal}
            onCancel={() => setShowLogoutModal(false)}
            onConfirm={handleConfirmSignOut}
          />

          <DeleteAccountConfirmationModal
            visible={showDeleteAccountModal}
            loading={deleteAccountLoading}
            onCancel={handleCancelDeleteAccount}
            onConfirm={handleConfirmDeleteAccount}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  scrollContentInner: {
    paddingHorizontal: 20,
  },

  // Header Banner (same as Zakat Calculator)
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
    alignItems: "flex-start",
  },
  guthenText: {
    fontSize: 24,
    fontFamily: "Guthen Bloots",
    color: "#FFD602",
    marginBottom: 4,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 40,
    fontWeight: "800",
    fontFamily: "AlbertSans_800ExtraBold",
    marginBottom: 8,
    textAlign: "left",
  },
  headerSubtitle: {
    color: "#E6ECFF",
    fontSize: 15,
    lineHeight: 22,
    fontFamily: "AlbertSans_400Regular",
  },

  // Not Logged In Content (compact buttons + fuller layout)
  guestRoot: {
    flex: 1,
    backgroundColor: "#E8EDF2",
  },
  notLoggedInScroll: {
    flex: 1,
    backgroundColor: "#E8EDF2",
  },
  notLoggedInContent: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  guestHero: {
    width: "100%",
    height: 220,
    position: "relative",
    overflow: "hidden",
  },
  guestHeroInner: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingBottom: 26,
    paddingTop: 12,
  },
  guestHeroGuthen: {
    fontSize: 24,
    fontFamily: "Guthen Bloots",
    color: "#FFD602",
    marginBottom: 4,
  },
  guestHeroTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    fontFamily: "AlbertSans_800ExtraBold",
    marginBottom: 8,
    lineHeight: 28,
    letterSpacing: -0.2,
  },
  guestHeroSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    fontFamily: "AlbertSans_400Regular",
    lineHeight: 20,
    maxWidth: 360,
  },
  guestSheetWrap: {
    marginTop: -18,
    marginHorizontal: 0,
    marginBottom: 0,
    width: "100%",
    alignSelf: "stretch",
    zIndex: 2,
  },
  guestSheet: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingHorizontal: 22,
    paddingTop: 24,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: 0,
    borderColor: "#E5E7EB",
  },
  guestSheetIntro: {
    fontSize: 14,
    color: "#475569",
    fontFamily: "AlbertSans_400Regular",
    lineHeight: 22,
    marginBottom: 20,
  },
  guestCtaRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 4,
  },
  guestDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E2E8F0",
    marginVertical: 22,
  },
  guestBenefitsHeader: {
    marginBottom: 14,
  },
  guestBenefitsTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
    fontFamily: "AlbertSans_700Bold",
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  guestBenefitsSub: {
    fontSize: 13,
    color: "#64748B",
    fontFamily: "AlbertSans_400Regular",
    lineHeight: 19,
  },
  guestSignInButton: {
    flex: 1,
    minWidth: 0,
    backgroundColor: "#FFD602",
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(1,13,38,0.06)",
  },
  guestSignInButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#010D26",
    fontFamily: "AlbertSans_700Bold",
  },
  guestCreateButton: {
    flex: 1,
    minWidth: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  guestCreateButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#264B8B",
    fontFamily: "AlbertSans_600SemiBold",
  },
  guestBenefitsPanel: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingVertical: 4,
  },
  guestBenefitRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E2E8F0",
    gap: 12,
  },
  guestBenefitRowLast: {
    borderBottomWidth: 0,
  },
  guestBenefitIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  guestBenefitText: {
    flex: 1,
    minWidth: 0,
  },
  guestBenefitTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0F172A",
    fontFamily: "AlbertSans_600SemiBold",
    marginBottom: 2,
    lineHeight: 17,
  },
  guestBenefitDescription: {
    fontSize: 12,
    color: "#64748B",
    fontFamily: "AlbertSans_400Regular",
    lineHeight: 16,
  },
  guestTrustFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 8,
    marginTop: "auto",
    paddingTop: 18,
    paddingHorizontal: 4,
    paddingBottom: 2,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E2E8F0",
  },
  guestTrustText: {
    fontSize: 12,
    color: "#64748B",
    fontFamily: "AlbertSans_400Regular",
    textAlign: "center",
    lineHeight: 17,
    flexShrink: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: "#111",
  },
  signOutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
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
    borderWidth: 2,
    borderColor: "#E5E7EB",
    backgroundColor: "#F3F4F6",
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

  creditCardContainer: {
    marginTop: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  creditCard: {
    borderRadius: 16,
    padding: 20,
    minHeight: 160,
    justifyContent: "space-between",
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  cardLogo: {
    width: 120,
    height: 34,
  },
  cardPattern: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  cardDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardContentLeft: {
    flex: 1,
  },
  cardContentRight: {
    alignItems: "flex-end",
  },
  cardLabel: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
    fontWeight: "500",
    fontFamily: "AlbertSans_500Medium",
    letterSpacing: 0.5,
  },
  cardAmount: {
    color: "#FFF",
    fontSize: 32,
    fontWeight: "800",
    fontFamily: "AlbertSans_800ExtraBold",
    letterSpacing: -0.5,
    textAlign: "right",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
  },
  cardStatItem: {
    alignItems: "center",
    flex: 1,
  },
  cardStatIcon: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 6,
    borderRadius: 6,
    marginBottom: 6,
  },
  cardStatValue: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 11,
    fontFamily: "AlbertSans_700Bold",
    marginBottom: 2,
  },
  cardStatLabel: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 10,
    fontFamily: "AlbertSans_400Regular",
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
  link: {
    color: "#2161CD",
    fontSize: 14,
    fontWeight: "600",
  },

  // Payment History section
  paymentHistorySection: {
    marginTop: 20,
    marginBottom: 24,
  },
  paymentHistoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  paymentHistoryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    fontFamily: "AlbertSans_700Bold",
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  seeAllText: {
    color: "#2161CD",
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "AlbertSans_600SemiBold",
  },
  orderList: {
    gap: 8,
  },
  orderCard: {
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  orderHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  orderImage: {
    width: 44,
    height: 44,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: "#E8E8E8",
  },
  orderInfo: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
  },
  orderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  orderTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    fontFamily: "AlbertSans_600SemiBold",
    marginBottom: 2,
  },
  orderOtherCampaigns: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
    fontFamily: "AlbertSans_500Medium",
  },
  orderMetaText: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "AlbertSans_400Regular",
  },
  orderStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  orderStatusText: {
    fontWeight: "600",
    fontSize: 10,
    fontFamily: "AlbertSans_600SemiBold",
  },
  orderDetails: {
    marginHorizontal: 12,
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  orderDetailsHeader: {
    marginBottom: 10,
  },
  orderDetailsTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9CA3AF",
    fontFamily: "AlbertSans_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  orderDetailsList: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  paymentRowLast: {
    borderBottomWidth: 0,
  },
  paymentName: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
    fontFamily: "AlbertSans_500Medium",
    flex: 1,
    marginRight: 8,
  },
  paymentNameFee: {
    color: "#9CA3AF",
    fontFamily: "AlbertSans_400Regular",
  },
  paymentTotal: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
    fontFamily: "AlbertSans_600SemiBold",
  },
  paymentTotalFee: {
    color: "#6B7280",
    fontWeight: "500",
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
    marginTop: 24,
    marginBottom: 24,
  },
  profileDetailsSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    fontFamily: "AlbertSans_700Bold",
    marginBottom: 10,
  },
  detailsCard: {
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  detailRowLast: {
    borderBottomWidth: 0,
  },
  detailLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
    fontFamily: "AlbertSans_500Medium",
    marginRight: 12,
    minWidth: 56,
  },
  detailValue: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    color: "#111827",
    fontWeight: "500",
    fontFamily: "AlbertSans_500Medium",
    textAlign: "right",
  },
  deleteSection: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },

  deleteSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#DC2626",
    marginBottom: 10,
  },

  deleteAccountButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    backgroundColor: "#FEF2F2",
    paddingVertical: 12,
    borderRadius: 10,
  },

  deleteAccountText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "600",
  },

  deleteWarningText: {
    marginTop: 8,
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
});
