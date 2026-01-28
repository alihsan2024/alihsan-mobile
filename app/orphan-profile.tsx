"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { fetchOrphanById } from "@/store/reduxSlice/orphansSlice";
import { calculateAge, formatOrphanName } from "@/utils/helper";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Modal,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { addBasketItem } from "@/store/reduxSlice/basketSlice";
import { useGetBasketQuery } from "@/store/reduxSlice/api/basketApi";
import HeroBackground from "@/components/ui/GradientImage";

const sponsorshipOptions = [
  { id: "120", label: "Monthly", amount: 120, period: "30 days" },
  { id: "360", label: "Quarterly", amount: 360, period: "90 days" },
  { id: "1440", label: "Yearly", amount: 1440, period: "365 days" },
];

const OrphanProfileScreen = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params as { id: string };
  const [subscriptionPeriod, setSubscriptionPeriod] = useState("30");
  const [activeTab, setActiveTab] = useState("about");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const { orphan, loading, error } = useSelector((state: any) => state.orphans);
  const { basketItems } = useSelector((state: any) => state.basketItem);
  const profileState = useSelector((state: any) => state.profile);
  const user = useSelector((state: any) => state.authentication.user);
  const isAuthenticated = !!user;
  // RTK Query basket refetch for logged-in users
  const { refetch: refetchBasket } = useGetBasketQuery(undefined, {
    skip: !isAuthenticated,
  });

  useEffect(() => {
    if (id) dispatch(fetchOrphanById(id));
  }, [id, dispatch]);

  const handleSponsor = () => {
    if (!isAuthenticated) {
      setShowSuccessMessage(false);
      (navigation as any).navigate("login");
      return;
    }
    // Find selected sponsorship option
    const selectedOption = sponsorshipOptions.find(
      (opt) => opt.id === subscriptionPeriod
    );
    if (!selectedOption) return;
    let periodDays = 30;
    if (subscriptionPeriod === "360") periodDays = 90;
    else if (subscriptionPeriod === "1440") periodDays = 365;
    const basketData = {
      amount: parseFloat(String(selectedOption.amount)),
      total: parseFloat(`${selectedOption.amount * 1}`),
      periodDays,
      isRecurring: false,
      orphanId: orphan.id,
      checkoutType: "ORPHAN",
      name: orphan.name,
      coverImage: orphan.coverImage,
      status: orphan.status,
      quantity: 1,
      sponsorshipType: "child",
      programType: "regular",
      communityImpact: true,
    };
    dispatch(addBasketItem(basketData)).then(() => {
      if (isAuthenticated && refetchBasket) {
        refetchBasket();
      }
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 1500);
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2D7DD2" />
      </View>
    );
  }

  if (error || !orphan) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>
          {error ? "Something went wrong" : "Child not found"}
        </Text>
        <Text style={styles.errorText}>
          {error?.message || "The child you're looking for doesn't exist."}
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>View All Children</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "about":
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>
              About {formatOrphanName(orphan.name)}
            </Text>
            <Text style={styles.sectionText}>{orphan.bio}</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Family Situation</Text>
              <Text style={styles.infoText}>
                {formatOrphanName(orphan.name)} lives with extended family
                members who do their best to provide care, but face significant
                economic challenges.
              </Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Education & Goals</Text>
              <Text style={styles.infoText}>
                {formatOrphanName(orphan.name)} dreams of becoming educated and
                helping others in the community despite facing many challenges.
              </Text>
            </View>
          </View>
        );
      case "details":
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Child Details</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Personal Information</Text>
              <Text style={styles.infoText}>
                Name: {formatOrphanName(orphan.name)}
              </Text>
              <Text style={styles.infoText}>
                Age: {calculateAge(orphan.dateOfBirth)} years
              </Text>
              <Text style={styles.infoText}>Gender: {orphan.gender}</Text>
              <Text style={styles.infoText}>Status: {orphan.status}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Living Situation</Text>
              <Text style={styles.infoText}>Lives with: Extended family</Text>
              <Text style={styles.infoText}>
                Region: {orphan.location || "Central District"}
              </Text>
              <Text style={styles.infoText}>
                Main need: Education & Support
              </Text>
            </View>
          </View>
        );
      case "sponsorship":
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>
              Sponsor {formatOrphanName(orphan.name)}
            </Text>
            <Text style={styles.sectionText}>
              Your sponsorship provides education, healthcare, nutrition, and
              community development support.
            </Text>
            {orphan.status === "available" ? (
              <View>
                <Text style={styles.infoTitle}>
                  Choose your sponsorship plan
                </Text>
                <View style={styles.sponsorshipOptions}>
                  {sponsorshipOptions.map((option) => {
                    const isActive = subscriptionPeriod === option.id;
                    return (
                      <TouchableOpacity
                        key={option.id}
                        style={[
                          styles.sponsorshipButton,
                          isActive && styles.sponsorshipButtonActive,
                        ]}
                        onPress={() => setSubscriptionPeriod(option.id)}
                      >
                        <Text
                          style={
                            isActive
                              ? styles.sponsorshipLabelActive
                              : styles.sponsorshipLabel
                          }
                        >
                          {option.label}
                        </Text>
                        <Text
                          style={
                            isActive
                              ? styles.sponsorshipAmountActive
                              : styles.sponsorshipAmount
                          }
                        >
                          ${option.amount}
                        </Text>
                        <Text
                          style={
                            isActive
                              ? styles.sponsorshipPeriodActive
                              : styles.sponsorshipPeriod
                          }
                        >
                          {option.period}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <TouchableOpacity
                  style={styles.sponsorNowButton}
                  onPress={handleSponsor}
                >
                  <Text style={styles.sponsorNowButtonText}>
                    Sponsor {formatOrphanName(orphan.name)} Now
                  </Text>
                </TouchableOpacity>
                <View style={styles.infoCard}>
                  <Text style={styles.infoTitle}>What you'll receive</Text>
                  <Text style={styles.infoText}>
                    • Welcome kit with photo and child information
                  </Text>
                  <Text style={styles.infoText}>
                    • Regular updates on child's progress
                  </Text>
                  <Text style={styles.infoText}>
                    • Ability to exchange letters
                  </Text>
                  <Text style={styles.infoText}>
                    • Impact reports on community development
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.infoCard}>
                <Text style={styles.sectionText}>
                  {formatOrphanName(orphan.name)} is not currently available for
                  sponsorship.
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  style={styles.backButton}
                >
                  <Text style={styles.backButtonText}>View Other Children</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    >
      {/* HERO */}
      <HeroBackground
        source={{ uri: orphan.coverImage }}
        containerStyle={{ height: 260 }}
        showBack
      >
        <View style={styles.headerContent}>
          <Text style={styles.guthenText}>Child Sponsorship</Text>
          <Text style={styles.headerTitle}>
            {formatOrphanName(orphan.name)}
          </Text>
          <View style={styles.headerMetaRow}>
            {orphan.dateOfBirth && (
              <Text style={styles.headerMetaText}>
                Age {calculateAge(orphan.dateOfBirth)}
              </Text>
            )}
            {orphan.gender && (
              <Text style={styles.headerMetaText}>
                {orphan.gender === "male" ? "Boy" : "Girl"}
              </Text>
            )}
            {orphan.location && (
              <Text style={styles.headerMetaText}>{orphan.location}</Text>
            )}
          </View>
          {orphan.status === "available" && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>Available for sponsorship</Text>
            </View>
          )}
        </View>
      </HeroBackground>

      {/* Stats Banner */}
      <View style={styles.sectionWrapper}>
        <View style={styles.statsBanner}>
          <View style={styles.statsItem}>
            <Text style={styles.statsValue}>$120</Text>
            <Text style={styles.statsLabel}>per month</Text>
          </View>
          <View style={styles.statsDivider} />
          <View style={styles.statsItem}>
            <Text style={styles.statsValue}>1 child</Text>
            <Text style={styles.statsLabel}>sponsored by you</Text>
          </View>
          <View style={styles.statsDivider} />
          <View style={styles.statsItem}>
            <Text style={styles.statsValue}>Ongoing</Text>
            <Text style={styles.statsLabel}>support & care</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "about" && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab("about")}
        >
          <Text
            style={
              activeTab === "about"
                ? styles.tabButtonTextActive
                : styles.tabButtonText
            }
          >
            About
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "details" && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab("details")}
        >
          <Text
            style={
              activeTab === "details"
                ? styles.tabButtonTextActive
                : styles.tabButtonText
            }
          >
            Details
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "sponsorship" && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab("sponsorship")}
        >
          <Text
            style={
              activeTab === "sponsorship"
                ? styles.tabButtonTextActive
                : styles.tabButtonText
            }
          >
            Sponsorship
          </Text>
        </TouchableOpacity>
      </View>

      {renderTabContent()}

      {/* Success Modal */}
      <Modal visible={showSuccessMessage} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.successTitle}>Thank You!</Text>
            <Text style={styles.successText}>
              {formatOrphanName(orphan.name)} has been added to your basket.
            </Text>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  headerContent: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
    zIndex: 1,
  },
  guthenText: {
    fontSize: 22,
    fontFamily: "Guthen Bloots",
    color: "#FFD602",
    marginBottom: 4,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 6,
    fontFamily: "AlbertSans_800ExtraBold",
  },
  headerMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  headerMetaText: {
    color: "#E6ECFF",
    fontSize: 13,
    fontFamily: "AlbertSans_500Medium",
  },
  headerBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  headerBadgeText: {
    color: "#065F46",
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "AlbertSans_600SemiBold",
  },
  sectionWrapper: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  statsBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  statsItem: { alignItems: "flex-start", flex: 1 },
  statsValue: {
    color: "#010D26",
    fontWeight: "800",
    fontSize: 16,
  },
  statsLabel: { color: "#6B7280", fontSize: 12, marginTop: 2 },
  statsDivider: {
    width: 1,
    height: 32,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 8,
  },
  tabsRow: {
    flexDirection: "row",
    marginTop: 16,
    marginHorizontal: 20,
    borderRadius: 999,
    backgroundColor: "#F3F4F6",
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 999,
  },
  tabButtonActive: {
    backgroundColor: "#FFFFFF",
  },
  tabButtonText: {
    color: "#6B7280",
    fontWeight: "500",
    fontSize: 13,
  },
  tabButtonTextActive: {
    color: "#010D26",
    fontWeight: "700",
    fontSize: 13,
  },
  tabContent: { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: {
    color: "#010D26",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  sectionText: { color: "#4B5563", marginBottom: 8, fontSize: 14 },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 1,
  },
  infoTitle: { color: "#010D26", fontWeight: "700", marginBottom: 4 },
  infoText: { color: "#4B5563", fontSize: 13, marginBottom: 2 },
  sponsorshipOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 12,
  },
  sponsorshipButton: {
    flex: 1,
    marginHorizontal: 4,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#F9FAFB",
  },
  sponsorshipButtonActive: {
    backgroundColor: "#246BE1",
    borderColor: "#246BE1",
  },
  sponsorshipLabel: {
    color: "#4B5563",
    fontWeight: "500",
  },
  sponsorshipLabelActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  sponsorshipAmount: {
    color: "#010D26",
    fontSize: 18,
    fontWeight: "700",
  },
  sponsorshipAmountActive: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  sponsorshipPeriod: {
    color: "#6B7280",
    fontSize: 12,
  },
  sponsorshipPeriodActive: {
    color: "#E5E7EB",
    fontSize: 12,
  },
  sponsorNowButton: {
    backgroundColor: "#246BE1",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  sponsorNowButtonText: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
  },
  errorTitle: { color: "#D7263D", fontSize: 22, fontWeight: "bold" },
  errorText: { color: "#D7263D", fontSize: 14, marginBottom: 8 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  successTitle: {
    color: "#38B000",
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 8,
  },
  successText: { color: "#2D7DD2", fontSize: 14 },
});

export default OrphanProfileScreen;
