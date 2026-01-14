import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image as RNImage,
  Platform,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const SafeImage = ({
  source,
  style,
  contentFit = "cover",
  onError,
  ...props
}: any) => {
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    setUseFallback(false);
  }, [source]);

  if (useFallback || !source?.uri) {
    return (
      <RNImage
        source={source}
        style={style}
        resizeMode={contentFit}
        onError={onError}
      />
    );
  }

  try {
    return (
      <Image
        source={source}
        style={style}
        contentFit={contentFit}
        onError={() => {
          setUseFallback(true);
          onError?.();
        }}
        transition={200}
        {...props}
      />
    );
  } catch (error) {
    console.warn("expo-image error, falling back to RN Image:", error);
    setUseFallback(true);
    return (
      <RNImage
        source={source}
        style={style}
        resizeMode={contentFit}
        onError={onError}
      />
    );
  }
};
import {
  getDonationDetails,
  getDonationPaymentHistory,
  DonationDetails,
  PaymentHistoryItem,
} from "@/utils/api";

// Format currency
const formatCurrency = (amount: number | string | undefined | null): string => {
  const numAmount =
    typeof amount === "string" ? parseFloat(amount) : amount || 0;
  if (isNaN(numAmount)) return "$0.00";
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount);
};

// Format date
const formatDate = (dateString: string | number | undefined | null): string => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return String(dateString);
    return new Intl.DateTimeFormat("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return String(dateString);
  }
};

// Get recurring label
const getRecurringLabel = (periodDays?: number): string => {
  if (!periodDays) return "One-time";
  switch (periodDays) {
    case 1:
      return "Daily";
    case 7:
      return "Weekly";
    case 9:
      return "Friday's";
    case 10:
      return "Last 10 days";
    case 30:
      return "Monthly";
    case 365:
      return "Yearly";
    default:
      return `Every ${periodDays} days`;
  }
};

interface DonationDetailsModalProps {
  isVisible: boolean;
  onClose: () => void;
  donationId: string | number | null;
}

export default function DonationDetailsModal({
  isVisible,
  onClose,
  donationId,
}: DonationDetailsModalProps) {
  const insets = useSafeAreaInsets();
  const [donation, setDonation] = useState<DonationDetails | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "payments">("details");

  useEffect(() => {
    if (isVisible && donationId) {
      fetchDonationData();
    } else {
      // Reset state when modal closes
      setDonation(null);
      setPaymentHistory([]);
      setActiveTab("details");
    }
  }, [isVisible, donationId]);

  const fetchDonationData = async () => {
    if (!donationId) return;

    setLoading(true);
    setDonation(null); // Clear previous data
    setPaymentHistory([]);

    try {
      console.log(
        "[DonationModal] Fetching donation details for ID:",
        donationId
      );
      const [donationData, payments] = await Promise.all([
        getDonationDetails(donationId),
        getDonationPaymentHistory(donationId).catch(() => []), // Don't fail if payment history fails
      ]);

      console.log("[DonationModal] Donation data received:", donationData);
      console.log("[DonationModal] Payment history received:", payments);

      if (donationData && Object.keys(donationData).length > 0) {
        setDonation(donationData);
        setPaymentHistory(payments);
      } else {
        console.warn("[DonationModal] Empty donation data received");
        setDonation(null);
      }
    } catch (error: any) {
      console.error("[DonationModal] Error fetching donation data:", error);
      console.error(
        "[DonationModal] Error details:",
        error?.response?.data || error?.message
      );
      setDonation(null);
      setPaymentHistory([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible || !donationId) return null;

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            {
              maxHeight: SCREEN_HEIGHT * 0.9,
              paddingBottom: Math.max(insets.bottom, 20),
            },
          ]}
        >
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View
            style={[styles.header, { paddingTop: Math.max(insets.top, 8) }]}
          >
            <Text style={styles.headerTitle}>Donation Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#111" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6A7BFF" />
              <Text style={styles.loadingText}>
                Loading donation details...
              </Text>
            </View>
          ) : donation && Object.keys(donation).length > 0 ? (
            <View style={styles.scrollContainer}>
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
              >
                {/* Campaign Image */}
                {donation.Campaign?.coverImage && (
                  <SafeImage
                    source={{ uri: donation.Campaign.coverImage }}
                    style={styles.campaignImage}
                    contentFit="cover"
                  />
                )}

                {/* Tabs */}
                <View style={styles.tabContainer}>
                  <TouchableOpacity
                    style={[
                      styles.tab,
                      activeTab === "details" && styles.activeTab,
                    ]}
                    onPress={() => setActiveTab("details")}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        activeTab === "details" && styles.activeTabText,
                      ]}
                    >
                      Details
                    </Text>
                  </TouchableOpacity>
                  {donation.isRecurring && (
                    <TouchableOpacity
                      style={[
                        styles.tab,
                        activeTab === "payments" && styles.activeTab,
                      ]}
                      onPress={() => setActiveTab("payments")}
                    >
                      <Text
                        style={[
                          styles.tabText,
                          activeTab === "payments" && styles.activeTabText,
                        ]}
                      >
                        Payment History
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Tab Content */}
                {activeTab === "details" ? (
                  <View style={styles.detailsContent}>
                    {/* Campaign Name */}
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Campaign</Text>
                      <Text style={styles.detailValue}>
                        {donation.Campaign?.name || "N/A"}
                      </Text>
                    </View>

                    {/* Order Number */}
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Order Number</Text>
                      <Text style={styles.detailValue}>
                        {donation.orderId || "N/A"}
                      </Text>
                    </View>

                    {/* Donation Amount */}
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Donation Amount</Text>
                      <Text style={styles.detailValue}>
                        {formatCurrency(donation.total)}
                      </Text>
                    </View>

                    {/* Processing Fee */}
                    {donation.processingFee && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Processing Fee</Text>
                        <Text style={styles.detailValue}>
                          {formatCurrency(donation.processingFee)}
                        </Text>
                      </View>
                    )}

                    {/* Total Amount */}
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Total Amount</Text>
                      <Text style={[styles.detailValue, styles.totalAmount]}>
                        {formatCurrency(
                          (typeof donation.total === "number"
                            ? donation.total
                            : parseFloat(String(donation.total)) || 0) +
                            (typeof donation.processingFee === "number"
                              ? donation.processingFee
                              : parseFloat(String(donation.processingFee || 0)))
                        )}
                      </Text>
                    </View>

                    {/* Donation Date */}
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Donation Date</Text>
                      <Text style={styles.detailValue}>
                        {formatDate(donation.donatedAt || donation.createdAt)}
                      </Text>
                    </View>

                    {/* Checkout Type */}
                    {donation.Campaign?.checkoutType && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Type</Text>
                        <Text style={styles.detailValue}>
                          {donation.Campaign.checkoutType}
                        </Text>
                      </View>
                    )}

                    {/* Recurring Info */}
                    {donation.isRecurring && (
                      <>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Frequency</Text>
                          <Text style={styles.detailValue}>
                            {getRecurringLabel(donation.periodDays)}
                          </Text>
                        </View>
                        {donation.nextPaymentDate && (
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Next Payment</Text>
                            <Text style={styles.detailValue}>
                              {formatDate(donation.nextPaymentDate)}
                              {donation.Campaign?.isRamadanCampaign
                                ? " (After 8 PM)"
                                : ""}
                            </Text>
                          </View>
                        )}
                        {donation.lastPaymentDate && (
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Last Payment</Text>
                            <Text style={styles.detailValue}>
                              {formatDate(donation.lastPaymentDate)}
                            </Text>
                          </View>
                        )}
                        {donation.endPaymentDate && (
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>End Date</Text>
                            <Text style={styles.detailValue}>
                              {formatDate(donation.endPaymentDate)}
                            </Text>
                          </View>
                        )}
                      </>
                    )}

                    {/* Payment Gateway */}
                    {donation.paymentGateway && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Payment Method</Text>
                        <Text style={styles.detailValue}>
                          {donation.paymentGateway}
                        </Text>
                      </View>
                    )}

                    {/* Payment IDs */}
                    {donation.payment?.stripePaymentIntentId && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>
                          Stripe Payment ID
                        </Text>
                        <Text style={[styles.detailValue, styles.monoText]}>
                          {donation.payment.stripePaymentIntentId}
                        </Text>
                      </View>
                    )}

                    {donation.payment?.paypalTransactionId && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>
                          PayPal Transaction ID
                        </Text>
                        <Text style={[styles.detailValue, styles.monoText]}>
                          {donation.payment.paypalTransactionId}
                        </Text>
                      </View>
                    )}

                    {/* Status */}
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Status</Text>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor:
                              donation.status === "COMPLETED"
                                ? "#E8F7EF"
                                : donation.status === "ACTIVE"
                                ? "#EFF6FF"
                                : "#FEF3C7",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            {
                              color:
                                donation.status === "COMPLETED"
                                  ? "#16A34A"
                                  : donation.status === "ACTIVE"
                                  ? "#2563EB"
                                  : "#D97706",
                            },
                          ]}
                        >
                          {donation.status}
                        </Text>
                      </View>
                    </View>

                    {/* Anonymous */}
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Anonymous</Text>
                      <Text style={styles.detailValue}>
                        {donation.isAnonymous ? "Yes" : "No"}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.paymentsContent}>
                    {paymentHistory.length > 0 ? (
                      <>
                        <Text style={styles.sectionTitle}>Payment History</Text>
                        {paymentHistory.map((payment, index) => (
                          <View
                            key={payment.id || index}
                            style={styles.paymentCard}
                          >
                            <View style={styles.paymentHeader}>
                              <Text style={styles.paymentDate}>
                                {formatDate(payment.donatedAt)}
                              </Text>
                              <View
                                style={[
                                  styles.paymentStatusBadge,
                                  {
                                    backgroundColor:
                                      payment.status === "SUCCESS" ||
                                      payment.status === "succeeded"
                                        ? "#E8F7EF"
                                        : "#FEE2E2",
                                  },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.paymentStatusText,
                                    {
                                      color:
                                        payment.status === "SUCCESS" ||
                                        payment.status === "succeeded"
                                          ? "#16A34A"
                                          : "#DC2626",
                                    },
                                  ]}
                                >
                                  {payment.status}
                                </Text>
                              </View>
                            </View>
                            <Text style={styles.paymentAmount}>
                              {formatCurrency(
                                (payment.total ?? payment.amount ?? 0) as number
                              )}
                            </Text>
                            {payment.paymentReference && (
                              <Text style={styles.paymentReference}>
                                Reference: {payment.paymentReference}
                              </Text>
                            )}
                            {payment.stripePaymentIntentId && (
                              <Text style={styles.paymentReference}>
                                Stripe: {payment.stripePaymentIntentId}
                              </Text>
                            )}
                            {payment.paypalTransactionId && (
                              <Text style={styles.paymentReference}>
                                PayPal: {payment.paypalTransactionId}
                              </Text>
                            )}
                          </View>
                        ))}
                      </>
                    ) : (
                      <View style={styles.emptyContainer}>
                        <Ionicons
                          name="receipt-outline"
                          size={48}
                          color="#9CA3AF"
                        />
                        <Text style={styles.emptyText}>
                          No payment history available
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </ScrollView>
            </View>
          ) : (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={48} color="#DC2626" />
              <Text style={styles.errorText}>
                Failed to load donation details
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={fetchDonationData}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: "100%",
    flexDirection: "column",
    minHeight: SCREEN_HEIGHT * 0.7,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: "#D1D5DB",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    minHeight: 200,
  },
  loadingText: {
    marginTop: 12,
    color: "#6B7280",
    fontSize: 14,
  },
  scrollContainer: {
    flex: 1,
    minHeight: 0, // Important for flex children
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
    flexGrow: 1,
  },
  campaignImage: {
    width: "100%",
    height: 200,
    backgroundColor: "#F3F4F6",
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tab: {
    paddingBottom: 12,
    marginRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#6A7BFF",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  activeTabText: {
    color: "#6A7BFF",
  },
  detailsContent: {
    padding: 20,
  },
  detailRow: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 6,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    color: "#111",
    fontWeight: "600",
  },
  totalAmount: {
    fontSize: 20,
    color: "#6A7BFF",
    fontWeight: "700",
  },
  monoText: {
    fontFamily: "monospace",
    fontSize: 12,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  paymentsContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginBottom: 16,
  },
  paymentCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  paymentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  paymentDate: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  paymentStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  paymentStatusText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginBottom: 8,
  },
  paymentReference: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "monospace",
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    minHeight: 200,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "#DC2626",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: "#6A7BFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
