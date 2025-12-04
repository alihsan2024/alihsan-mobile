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
    <ScrollView style={styles.container}>
      <View style={styles.heroSection}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>Back to all children</Text>
        </TouchableOpacity>
        <View style={styles.heroContent}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>
              {formatOrphanName(orphan.name)}
            </Text>
            <View style={styles.heroBadges}>
              <Text style={styles.heroBadge}>
                Age {calculateAge(orphan.dateOfBirth)}
              </Text>
              {orphan.status === "available" && (
                <Text style={[styles.heroBadge, styles.heroBadgeAvailable]}>
                  Available
                </Text>
              )}
            </View>
            <Text style={styles.heroBio}>{orphan.bio}</Text>
            {orphan.status === "available" && (
              <TouchableOpacity
                style={styles.sponsorNowButton}
                onPress={() => setActiveTab("sponsorship")}
              >
                <Text style={styles.sponsorNowButtonText}>
                  Sponsor {formatOrphanName(orphan.name)}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <Image
            source={{ uri: orphan.coverImage }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>
      </View>

      {/* Stats Banner */}
      <View style={styles.statsBanner}>
        <Text style={styles.statsValue}>$120/month</Text>
        <Text style={styles.statsValue}>4x community impact</Text>
        <Text style={styles.statsValue}>15+ years experience</Text>
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
  container: { flex: 1, backgroundColor: "#F7FAFC" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  heroSection: {
    backgroundColor: "#E6F0FA",
    padding: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: { marginBottom: 8, alignSelf: "flex-start", padding: 8 },
  backButtonText: { color: "#2D7DD2", fontWeight: "bold", fontSize: 14 },
  heroContent: { flexDirection: "row", alignItems: "center" },
  heroTitle: {
    color: "#2D7DD2",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  heroBadges: { flexDirection: "row", gap: 8, marginBottom: 8 },
  heroBadge: {
    backgroundColor: "#fff",
    color: "#2D7DD2",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
  },
  heroBadgeAvailable: { backgroundColor: "#38B000", color: "#fff" },
  heroBio: { color: "#2D7DD2", marginBottom: 8 },
  heroImage: {
    width: 120,
    height: 120,
    borderRadius: 16,
    marginLeft: 16,
    backgroundColor: "#E6F0FA",
  },
  statsBanner: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#B3C7E6",
  },
  statsValue: { color: "#2D7DD2", fontWeight: "bold", fontSize: 16 },
  tabsRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#B3C7E6",
    marginTop: 16,
  },
  tabButton: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabButtonActive: { borderBottomWidth: 2, borderColor: "#2D7DD2" },
  tabButtonText: { color: "#2D7DD2", fontWeight: "bold" },
  tabButtonTextActive: { color: "#2D7DD2", fontWeight: "bold" },
  tabContent: { padding: 16 },
  sectionTitle: {
    color: "#2D7DD2",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  sectionText: { color: "#2D7DD2", marginBottom: 8 },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 1,
  },
  infoTitle: { color: "#2D7DD2", fontWeight: "bold", marginBottom: 4 },
  infoText: { color: "#2D7DD2", fontSize: 14, marginBottom: 2 },
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
    borderColor: "#2D7DD2",
    backgroundColor: "#F7FAFC",
  },
  sponsorshipButtonActive: { backgroundColor: "#2D7DD2" },
  sponsorshipLabel: {
    color: "#2D7DD2",
    fontWeight: "bold",
  },
  sponsorshipLabelActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  sponsorshipAmount: {
    color: "#2D7DD2",
    fontSize: 18,
    fontWeight: "bold",
  },
  sponsorshipAmountActive: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  sponsorshipPeriod: {
    color: "#2D7DD2",
    fontSize: 12,
  },
  sponsorshipPeriodActive: {
    color: "#fff",
    fontSize: 12,
  },
  sponsorNowButton: {
    backgroundColor: "#2D7DD2",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  sponsorNowButtonText: {
    color: "#fff",
    fontWeight: "bold",
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
