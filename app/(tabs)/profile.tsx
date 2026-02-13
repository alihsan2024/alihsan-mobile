import React, { useEffect, useCallback, useState, useMemo, useRef } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image as ExpoImage } from "expo-image";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchProfileData,
  clearCache,
  setProfileDetails,
} from "@/store/reduxSlice/profileStatisticsSlice";
import { getProfile, logoutUser } from "@/store/reduxSlice/authenticationSlice";
import LogoutConfirmationModal from "@/components/ui/Modals/LogoutConfirmationModal";
import { generateInvoice } from "@/store/reduxSlice/myDonationSlice";
import { getPaymentsList } from "@/store/reduxSlice/paymentDetailsSlice";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useFocusEffect } from "@react-navigation/native";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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
  const appDispatch = useAppDispatch();

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
  const paymentRows = useSelector(
    (state: any) => state.paymentDetails.paymentList.rows
  );
  const paymentsLoading = useSelector(
    (state: any) => state.paymentDetails.paymentList.loading
  );

  const isAuthenticated = !!user || !!authUser;
  const currentUser = user || authUser;
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<Set<string | number>>(
    new Set()
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
        })
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
            })
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
    }, [])
  );

  const handleDownloadInvoice = (donationId: string | number) => {
    if (!donationId) return;
    dispatch(generateInvoice({ donationId }) as any);
  };

  const handleResendInvoice = (donationId: string | number) => {
    if (!donationId) return;
    dispatch(generateInvoice({ donationId }) as any);
  };

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
    const paymentsToGroup = paymentRows && Array.isArray(paymentRows) ? paymentRows : [];

    // Helper function to check if payment is a processing fee
    const isProcessingFee = (payment: any) => {
      const notes = payment?.notes || payment?.Donation?.notes || "";
      const campaignId = payment?.campaignId || payment?.Campaign?.id;
      const donationItem = payment?.donationItem || payment?.Donation?.donationItem || "";
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
      
      // Only add to totalAmount if it's not a processing fee
      if (!isFee) {
        grouped[orderId].totalAmount += Number(payment?.total) || 0;
      }

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
        new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
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

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        {/* Header Banner - Same as Zakat Calculator */}
        <View style={styles.headerWrapper}>
          <ExpoImage
            source={{
              uri: "https://alihsan.s3.ap-southeast-2.amazonaws.com/projects/1708467963799-alihsan-coverImage.png",
            }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />

          <LinearGradient
            colors={["transparent", "rgba(38,75,139,0.6)", "rgba(38,75,139,0.9)"]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />

          <View style={styles.headerContent}>
            <Text style={styles.guthenText}>Welcome</Text>
            <Text style={[styles.headerTitle, { color: "#fff", textAlign: "left" }]}>Join Our Community</Text>
            <Text style={styles.headerSubtitle}>
              Sign in to access your profile, track your donations, and make a lasting impact.
            </Text>
          </View>
        </View>

        {/* Content Section */}
        <ScrollView
          ref={notLoggedInScrollViewRef}
          style={styles.notLoggedInScroll}
          contentContainerStyle={styles.notLoggedInContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Action Buttons */}
          <View style={styles.notLoggedInActions}>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => router.push("/login")}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#264B8B", "#4066FF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
                <Ionicons name="log-in-outline" size={20} color="#fff" />
                <Text style={styles.loginButtonText}>Sign In</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signUpButton}
              onPress={() => router.push("/signup")}
              activeOpacity={0.8}
            >
              <View style={styles.signUpButtonContent}>
                <Ionicons name="person-add-outline" size={20} color="#010D26" />
                <Text style={styles.signUpButtonText}>Create Account</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Benefits Section */}
          <View style={styles.benefitsSection}>
            <Text style={styles.benefitsTitle}>Why Join Us?</Text>
            <View style={styles.benefitsGrid}>
              <View style={styles.benefitCard}>
                <LinearGradient
                  colors={["#EEF4FF", "#F8FAFF"]}
                  style={styles.benefitCardGradient}
                >
                  <View style={styles.benefitIconContainer}>
                    <Ionicons name="receipt-outline" size={24} color="#264B8B" />
                  </View>
                  <Text style={styles.benefitText}>Track donations</Text>
                  <Text style={styles.benefitDescription}>
                    Monitor all your contributions in one place
                  </Text>
                </LinearGradient>
              </View>

              <View style={styles.benefitCard}>
                <LinearGradient
                  colors={["#EEF4FF", "#F8FAFF"]}
                  style={styles.benefitCardGradient}
                >
                  <View style={styles.benefitIconContainer}>
                    <Ionicons name="repeat-outline" size={24} color="#264B8B" />
                  </View>
                  <Text style={styles.benefitText}>Recurring gifts</Text>
                  <Text style={styles.benefitDescription}>
                    Set up monthly or weekly donations
                  </Text>
                </LinearGradient>
              </View>

              <View style={styles.benefitCard}>
                <LinearGradient
                  colors={["#EEF4FF", "#F8FAFF"]}
                  style={styles.benefitCardGradient}
                >
                  <View style={styles.benefitIconContainer}>
                    <Ionicons name="document-text-outline" size={24} color="#264B8B" />
                  </View>
                  <Text style={styles.benefitText}>Project updates</Text>
                  <Text style={styles.benefitDescription}>
                    Stay informed about your impact
                  </Text>
                </LinearGradient>
              </View>

              <View style={styles.benefitCard}>
                <LinearGradient
                  colors={["#EEF4FF", "#F8FAFF"]}
                  style={styles.benefitCardGradient}
                >
                  <View style={styles.benefitIconContainer}>
                    <Ionicons name="settings-outline" size={24} color="#264B8B" />
                  </View>
                  <Text style={styles.benefitText}>Manage profile</Text>
                  <Text style={styles.benefitDescription}>
                    Update your information anytime
                  </Text>
                </LinearGradient>
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
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn}>
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
                  <Ionicons name={item.icon as any} size={14} color="#FFD602" />
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

      {/* Recent History */}
      <View style={styles.historyHeader}>
        <Text style={styles.sectionTitle}>Payment History</Text>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/one-time-user-donations")}
        >
          <Text style={styles.link}>See All</Text>
        </TouchableOpacity>
      </View>

      {(loading || paymentsLoading) && groupedOrders.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6A7BFF" />
          <Text style={styles.loadingText}>Loading donations...</Text>
        </View>
      ) : groupedOrders.length > 0 ? (
        groupedOrders.map((order, index) => {
          const isExpanded = expandedOrders.has(order.orderId);
          // Helper function to check if payment is a processing fee
          const isProcessingFee = (item: any) => {
            const notes = item?.notes || item?.Donation?.notes || "";
            const campaignId = item?.campaignId || item?.Campaign?.id;
            const donationItem = item?.donationItem || item?.Donation?.donationItem || "";
            return (
              notes.toLowerCase().includes("processing fee") ||
              campaignId === 259 ||
              donationItem.toLowerCase().includes("processing fee") ||
              donationItem.toLowerCase().includes("admin fee")
            );
          };
          // Filter out processing fee items and get the first non-processing-fee item
          const nonProcessingFeeItems = order.items.filter((item: any) => !isProcessingFee(item));
          const primaryItem = nonProcessingFeeItems[0] || order.items[0];
          
          // Get unique campaigns (excluding processing fees)
          const uniqueCampaigns = new Map<string, number>();
          nonProcessingFeeItems.forEach((item: any) => {
            const campaignName = item?.Campaign?.name
              ? item.Campaign.name
              : item?.orphan_id
              ? "Orphan Sponsorship"
              : "Donation";
            uniqueCampaigns.set(campaignName, (uniqueCampaigns.get(campaignName) || 0) + 1);
          });
          const campaignCount = uniqueCampaigns.size;
          const totalItems = nonProcessingFeeItems.length;
          
          const primaryCampaignName =
            primaryItem?.Campaign?.name
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
          const amountLabel = `AUD $${Number(order.totalAmount).toFixed(2)}`;

          return (
            <View key={order.orderId || index} style={styles.orderCard}>
              <TouchableOpacity
                style={styles.orderHeader}
                onPress={() => toggleOrderExpansion(order.orderId)}
                activeOpacity={0.7}
              >
                    <View style={styles.orderHeaderLeft}>
                  <Image source={{ uri: coverImage }} style={styles.orderImage} />
                  <View style={styles.orderInfo}>
                    <View style={styles.orderTitleRow}>
                      <Text style={styles.orderTitle} numberOfLines={1}>
                        {primaryCampaignName}
                      </Text>
                      {otherCount > 0 && (
                        <Text style={styles.orderOtherCampaigns}>
                          {" "}+ {otherCount} other{otherCount !== 1 ? "s" : ""}
                        </Text>
                      )}
                    </View>
                    <View style={styles.orderMetaRow}>
                      <Text style={styles.orderMetaText}>
                        {formatDate(order.paymentDate)}
                      </Text>
                      <Text style={styles.orderMetaDot}>•</Text>
                      <Text style={styles.orderMetaText}>
                        {totalItems} item{totalItems !== 1 ? "s" : ""}
                      </Text>
                      <Text style={styles.orderMetaDot}>•</Text>
                      <Text style={styles.orderMetaAmount}>
                        {amountLabel}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.orderStatusBadge}>
                  <Text style={styles.orderStatusText}>{statusLabel}</Text>
                </View>
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.orderDetails}>
                  <View style={styles.orderDetailsHeader}>
                    <Text style={styles.orderDetailsTitle}>Order Items</Text>
                    <Text style={styles.orderDetailsSubtitle}>Order #{order.orderId}</Text>
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
                          <View style={styles.paymentRowLeft}>
                            <View style={styles.paymentIconContainer}>
                              <Ionicons 
                                name={isFee ? "card-outline" : "gift-outline"} 
                                size={16} 
                                color={isFee ? "#9CA3AF" : "#246BE1"} 
                              />
                            </View>
                            <View style={styles.paymentInfo}>
                              <Text style={styles.paymentName}>
                                {isFee
                                  ? "Processing Fee"
                                  : item?.Campaign?.name
                                  ? item.Campaign.name
                                  : item?.orphan_id
                                  ? "Orphan Sponsorship"
                                  : "Donation"}
                              </Text>
                              {!isFee && (
                                <Text style={styles.paymentId}>
                                  {item?.Campaign?.name ? "Campaign" : "Donation"}
                                </Text>
                              )}
                            </View>
                          </View>
                          <Text style={[styles.paymentTotal, isFee && styles.paymentTotalFee]}>
                            ${Number(item?.total || item?.Donation?.total || 0).toFixed(2)}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                  <View style={styles.orderDetailsDivider} />
                  <TouchableOpacity
                    style={styles.resendButton}
                    onPress={() => handleResendInvoice(primaryItem?.donationId || primaryItem?.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="mail-outline" size={16} color="#246BE1" />
                    <Text style={styles.resendButtonText}>
                      Resend Invoice
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
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
            <View style={styles.detailIconContainer}>
              <Ionicons name="mail-outline" size={18} color="#246BE1" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Email</Text>
              <Text style={styles.detailValue}>
                {profileDetails?.email || currentUser?.email || "—"}
              </Text>
            </View>
          </View>
          
          {profileDetails?.phone && (
            <>
              <View style={styles.detailDivider} />
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <Ionicons name="call-outline" size={18} color="#246BE1" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Phone</Text>
                  <Text style={styles.detailValue}>{profileDetails.phone}</Text>
                </View>
              </View>
            </>
          )}
          
          {(profileDetails?.address || profileDetails?.city) && (
            <>
              <View style={styles.detailDivider} />
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <Ionicons name="location-outline" size={18} color="#246BE1" />
                </View>
                <View style={styles.detailContent}>
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
              </View>
            </>
          )}
        </View>
      </View>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmationModal
        visible={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmSignOut}
      />
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

  // Not Logged In Content
  notLoggedInScroll: {
    flex: 1,
  },
  notLoggedInContent: {
    padding: 20,
    paddingTop: 24,
  },
  notLoggedInActions: {
    width: "100%",
    gap: 12,
    marginBottom: 32,
  },
  loginButton: {
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#264B8B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonGradient: {
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "AlbertSans_700Bold",
  },
  signUpButton: {
    backgroundColor: "#FFD602",
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#FFD602",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  signUpButtonContent: {
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  signUpButtonText: {
    color: "#010D26",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "AlbertSans_700Bold",
  },
  benefitsSection: {
    width: "100%",
    marginTop: 8,
  },
  benefitsTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#010D26",
    fontFamily: "AlbertSans_800ExtraBold",
    marginBottom: 20,
    textAlign: "center",
  },
  benefitsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  benefitCard: {
    width: "48%",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  benefitCardGradient: {
    padding: 16,
    alignItems: "center",
    minHeight: 140,
    justifyContent: "center",
  },
  benefitIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#264B8B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  benefitText: {
    fontSize: 15,
    color: "#010D26",
    fontFamily: "AlbertSans_700Bold",
    marginBottom: 6,
    textAlign: "center",
  },
  benefitDescription: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "AlbertSans_400Regular",
    textAlign: "center",
    lineHeight: 16,
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

  orderCard: {
    backgroundColor: "#fff",
    marginTop: 8,
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 2,
  },
  orderHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  orderImage: {
    width: 48,
    height: 48,
    borderRadius: 10,
    marginRight: 8,
  },
  orderInfo: {
    flex: 1,
    marginRight: 8,
  },
  orderStatusBadge: {
    backgroundColor: "#E6F7D9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  orderStatusText: {
    color: "#3C7A2A",
    fontWeight: "600",
    fontSize: 11,
  },
  orderTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  orderTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  orderOtherCampaigns: {
    fontSize: 11,
    fontWeight: "400",
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  orderMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  orderMetaText: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  orderMetaDot: {
    marginHorizontal: 8,
    color: "#9CA3AF",
    fontSize: 11,
  },
  orderMetaAmount: {
    fontSize: 11,
    color: "#0F172A",
    fontWeight: "700",
  },
  orderDetails: {
    marginTop: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  orderDetailsHeader: {
    marginBottom: 12,
  },
  orderDetailsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#010D26",
    fontFamily: "AlbertSans_700Bold",
    marginBottom: 4,
  },
  orderDetailsSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "AlbertSans_400Regular",
  },
  orderDetailsList: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 8,
    marginBottom: 12,
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  paymentRowLast: {
    borderBottomWidth: 0,
  },
  paymentRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  paymentIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#010D26",
    fontFamily: "AlbertSans_600SemiBold",
    marginBottom: 2,
  },
  paymentId: {
    fontSize: 11,
    color: "#9CA3AF",
    fontFamily: "AlbertSans_400Regular",
  },
  paymentTotal: {
    fontSize: 15,
    fontWeight: "700",
    color: "#010D26",
    fontFamily: "AlbertSans_700Bold",
  },
  paymentTotalFee: {
    color: "#9CA3AF",
  },
  orderDetailsDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },
  resendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    gap: 8,
  },
  resendButtonText: {
    color: "#246BE1",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "AlbertSans_600SemiBold",
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
    marginBottom: 20,
  },
  detailsCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 0,
  },
  detailIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500",
    fontFamily: "AlbertSans_500Medium",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: "#010D26",
    fontWeight: "600",
    fontFamily: "AlbertSans_600SemiBold",
    lineHeight: 20,
  },
  detailDivider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 12,
    marginLeft: 48,
  },
});
