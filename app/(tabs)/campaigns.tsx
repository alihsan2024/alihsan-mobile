import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import Feather from "@expo/vector-icons/Feather";
import Earth from "../../assets/earth.svg";
import BabyCarriage from "../../assets/baby-carriage.svg";
import HandHoldingHeart from "../../assets/hand-holding-heart.svg";
import Bell from "../../assets/bell.svg";
import Bullhorn from "../../assets/bullhorn.svg";
import FaucetDrip from "../../assets/faucet-drip.svg";
import BriefcaseMedical from "../../assets/briefcase-medical.svg";
import GraduationCap from "../../assets/graduation-cap.svg";
import HandHoldingMedical from "../../assets/hand-holding-medical.svg";
import StarAndCrecent from "../../assets/star-and-crescent.svg";
import HouseChimney from "../../assets/house-chimney.svg";

const categories = [
  { label: "All", Icon: Earth },
  { label: "Aqeeqah", Icon: BabyCarriage },
  { label: "Expiations", Icon: HandHoldingHeart },
  { label: "Emergency", Icon: Bell },
  { label: "Gaza", Icon: Bullhorn },
  { label: "Water", Icon: FaucetDrip },
  { label: "General", Icon: Bullhorn },
  { label: "Appeals", Icon: BriefcaseMedical },
  { label: "Education", Icon: GraduationCap },
  { label: "Health", Icon: HandHoldingMedical },
  { label: "Ramadan", Icon: StarAndCrecent },
  { label: "Shelter", Icon: HouseChimney },
];

import { useEffect, useState, useRef, useCallback } from "react";
import { fetchCampaigns, Campaign } from "../../utils/api";
import { Link, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

export default function ActiveAppealsScreen() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isCategoriesCollapsed, setIsCategoriesCollapsed] = useState(false);
  let campaignsCache: Campaign[] | null = null;
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  const loadCampaigns = useCallback(async (forceRefresh = false) => {
    // ✅ Use cache if available (unless forcing refresh)
    if (campaignsCache && !forceRefresh) {
      setCampaigns(campaignsCache);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);
      const data = await fetchCampaigns(true); // Only fetch mobile campaigns for explore page

      // ✅ Save to session cache
      campaignsCache = data;

      setCampaigns(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  // Scroll to top when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" ||
      (c.checkoutType &&
        c.checkoutType
          .toLowerCase()
          .includes(selectedCategory.toLowerCase())) ||
      (c.name && c.name.toLowerCase().includes(selectedCategory.toLowerCase()));
    return matchesSearch && matchesCategory;
  });

  return (
    <View style={styles.container}>
      {/* Sticky Search Header */}
      <View style={[styles.stickyHeader, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerBar}>
          <View style={styles.searchWrapper}>
            <View style={styles.searchContainer}>
              <Feather name="search" size={16} color="#6B7280" />
              <TextInput
                placeholder="Search campaigns..."
                placeholderTextColor="#9CA3AF"
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
              />
              {search.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearch("")}
                  style={styles.clearButton}
                >
                  <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollContent}
        contentContainerStyle={{
          paddingTop: insets.top + 72,
          paddingBottom: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={styles.headingContainer}>
          <Text style={styles.guthenText}>Explore</Text>
          <Text style={styles.heading}>Active Appeals</Text>
        </View>

        {/* Categories */}
        {!isCategoriesCollapsed ? (
          <View style={styles.categories}>
            {categories.map((item, index) => {
              const Icon = item.Icon;
              const isSelected = selectedCategory === item.label;

              const activeColor = isSelected ? "#2161CD" : "#6B7280";

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.categoryItem,
                    isSelected && styles.categoryItemSelected,
                  ]}
                  onPress={() => setSelectedCategory(item.label)}
                  activeOpacity={0.7}
                >
                  <Icon width={18} height={18} color={activeColor} />

                  <Text
                    style={[
                      styles.categoryText,
                      isSelected && styles.categoryTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <FlatList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.categoriesHorizontal}
            renderItem={({ item }) => {
              const Icon = item.Icon;
              const isSelected = selectedCategory === item.label;
              const activeColor = isSelected ? "#2161CD" : "#6B7280";

              return (
                <TouchableOpacity
                  style={[
                    styles.categoryItemHorizontal,
                    isSelected && styles.categoryItemSelected,
                  ]}
                  onPress={() => setSelectedCategory(item.label)}
                  activeOpacity={0.7}
                >
                  <Icon
                    width={18}
                    height={18}
                    color={activeColor}
                    style={{ marginBottom: 4 }}
                  />
                  <Text
                    style={[
                      styles.categoryText,
                      isSelected && styles.categoryTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        )}

        <TouchableOpacity
          onPress={() => setIsCategoriesCollapsed(!isCategoriesCollapsed)}
          style={styles.collapseButton}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isCategoriesCollapsed ? "chevron-down" : "chevron-up"}
            size={20}
            color="#6B7280"
          />
        </TouchableOpacity>
        <View style={styles.divider} />

      {/* Loading/Error States */}
      {loading && (
        <View style={{ alignItems: "center", paddingVertical: 40 }}>
          <ActivityIndicator size="large" color="#4B6BFF" />
        </View>
      )}
      {error && (
        <View style={styles.errorContainer}>
          <View style={styles.errorIconContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#DC2626" />
          </View>
          <Text style={styles.errorTitle}>Unable to Load Campaigns</Text>
          <Text style={styles.errorMessage}>
            {error.includes("Network") || error.includes("network") || error.includes("timeout")
              ? "Please check your internet connection and try again."
              : "Something went wrong. Please try again later."}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => loadCampaigns(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={18} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Cards */}
      <View style={styles.cards}>
        {!loading && !error && filteredCampaigns.length === 0 && (
          <Text
            style={{
              textAlign: "center",
              color: "#999",
              width: "100%",
              marginVertical: 40,
            }}
          >
            No campaigns found.
          </Text>
        )}

        {filteredCampaigns.map((c) => {
          const displayTitle = c.name;
          const rawSubtitle = c.mobileSubtitle || c.description || "";
          const cleanedSubtitle = rawSubtitle
            ? rawSubtitle
                .replace(/<[^>]+>/g, "")
                .replace(
                  /&nbsp;|&amp;|&quot;|&lt;|&gt;/gi,
                  function (entity) {
                    switch (entity) {
                      case "&nbsp;":
                        return " ";
                      case "&amp;":
                        return "&";
                      case "&quot;":
                        return '"';
                      case "&lt;":
                        return "<";
                      case "&gt;":
                        return ">";
                      default:
                        return "";
                    }
                  }
                )
            : "";

          const campaignData = c as any;
          const raised = Number(campaignData.amountDonated || campaignData.amount_donated || 0);
          const goal = Number(campaignData.fundraiserGoal || campaignData.fundraiser_goal || 0);
          const donorCount = Number(campaignData.donor_count || campaignData.donorCount || 0);
          const hasGoal = goal > 0;
          const progressPercent = hasGoal ? Math.min((raised / goal) * 100, 100) : 0;

          return (
            <Link key={c.id} href={`/campaign/${c.slug}`} asChild>
              <TouchableOpacity activeOpacity={0.85} style={styles.card}>
                <View style={styles.cardImageContainer}>
                  <ExpoImage
                    source={{ uri: c.coverImage }}
                    style={styles.cardImage}
                    contentFit="cover"
                  />
                  {hasGoal && (
                    <View style={styles.cardProgressOverlay}>
                      <View style={styles.cardProgressBar}>
                        <View 
                          style={[
                            styles.cardProgressFill, 
                            { width: `${progressPercent}%` }
                          ]} 
                        />
                      </View>
                    </View>
                  )}
                </View>
                <View style={styles.cardContent}>
                  <View style={styles.cardTextContainer}>
                    <Text style={styles.cardTitle} numberOfLines={2}>
                      {displayTitle}
                    </Text>
                    {cleanedSubtitle ? (
                      <Text style={styles.cardSubtitle} numberOfLines={2}>
                        {cleanedSubtitle}
                      </Text>
                    ) : null}
                  </View>
                  
                  {(hasGoal || donorCount > 0) && (
                    <View style={styles.cardStats}>
                      {hasGoal && (
                        <View style={styles.cardStatItem}>
                          <Ionicons name="cash-outline" size={12} color="#246BE1" />
                          <Text style={styles.cardStatText}>
                            ${raised.toLocaleString()}
                          </Text>
                        </View>
                      )}
                      {donorCount > 0 && (
                        <View style={styles.cardStatItem}>
                          <Ionicons name="people-outline" size={12} color="#10B981" />
                          <Text style={styles.cardStatText}>
                            {donorCount.toLocaleString()} {donorCount === 1 ? 'donor' : 'donors'}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.donateButton}
                    activeOpacity={0.8}
                    onPress={(e) => {
                      e.stopPropagation();
                      router.push(`/campaign/${c.slug}`);
                    }}
                  >
                    <Text style={styles.donateButtonText}>Donate</Text>
                    <Ionicons
                      name="arrow-forward"
                      size={14}
                      color="#010D26"
                    />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </Link>
          );
        })}
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
  stickyHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Search Bar - Same as Homepage
  headerBar: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 12,
  },
  searchWrapper: {
    flex: 1,
    position: "relative",
  },
  searchContainer: {
    flex: 1,
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchInput: {
    flex: 1,
    color: "#111827",
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "AlbertSans_500Medium",
  },
  clearButton: {
    padding: 4,
  },

  headingContainer: {
    marginVertical: 20,
  },
  guthenText: {
    fontSize: 24,
    fontFamily: "Guthen Bloots",
    color: "#FFD602",
    marginBottom: 4,
  },
  heading: {
    fontSize: 28,
    fontWeight: "800",
    color: "#010D26",
    fontFamily: "AlbertSans_800ExtraBold",
  },

  categories: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 6,
  },
  categoriesHorizontal: {
    paddingVertical: 6,
  },
  categoryItem: {
    width: "23%",
    alignItems: "center",
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: "#F9FAFB",
  },
  categoryItemHorizontal: {
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 6,
    minWidth: 70,
    borderRadius: 10,
    backgroundColor: "#F9FAFB",
  },
  categoryText: {
    fontSize: 11,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 6,
    fontWeight: "500",
    fontFamily: "AlbertSans_500Medium",
  },
  categoryItemSelected: {
    backgroundColor: "#EEF4FF",
    borderWidth: 1,
    borderColor: "#2161CD",
  },
  categoryTextSelected: {
    color: "#2161CD",
    fontWeight: "700",
    fontFamily: "AlbertSans_700Bold",
  },
  collapseButton: {
    alignSelf: "center",
    marginBottom: 12,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 16,
    width: "100%",
  },

  cards: {
    gap: 12,
  },
  card: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    flexDirection: "row",
    alignItems: "stretch",
    minHeight: 120,
  },
  cardImageContainer: {
    width: 120,
    position: "relative",
    overflow: "hidden",
    flexShrink: 0,
    alignSelf: "stretch",
    minHeight: 120,
  },
  cardImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  cardProgressOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 6,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  cardProgressBar: {
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: 2,
    overflow: "hidden",
  },
  cardProgressFill: {
    height: "100%",
    backgroundColor: "#FFD602",
    borderRadius: 2,
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  cardTextContainer: {
    flex: 1,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
    color: "#010D26",
    lineHeight: 20,
    fontFamily: "AlbertSans_700Bold",
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 16,
    fontFamily: "AlbertSans_400Regular",
  },
  cardStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  cardStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardStatText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#010D26",
    fontFamily: "AlbertSans_600SemiBold",
  },
  donateButton: {
    backgroundColor: "#FFD602",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    alignSelf: "flex-start",
  },
  donateButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#010D26",
    fontFamily: "AlbertSans_700Bold",
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  errorIconContainer: {
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#010D26",
    marginBottom: 8,
    fontFamily: "AlbertSans_700Bold",
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
    fontFamily: "AlbertSans_400Regular",
    paddingHorizontal: 20,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#246BE1",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    gap: 8,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: "AlbertSans_700Bold",
  },
});
