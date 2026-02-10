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

import { useEffect, useState } from "react";
import { fetchCampaigns, Campaign } from "../../utils/api";
import { Link } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ActiveAppealsScreen() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isCategoriesCollapsed, setIsCategoriesCollapsed] = useState(false);
  let campaignsCache: Campaign[] | null = null;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const loadCampaigns = async () => {
      // ✅ Use cache if available
      if (campaignsCache) {
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
    };

    loadCampaigns();
  }, []);

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
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingTop: insets.top + 8,
        paddingBottom: 24,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Search - Same style as Homepage but visible on white background */}
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
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications" size={18} color="#010D264D" />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>

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

      {/* Sort */}
      <View style={styles.sortRow}>
        <Text style={styles.sortText}>Sort By:</Text>
        <Text style={styles.sortValue}>Newest</Text>
      </View>

      {/* Loading/Error States */}
      {loading && (
        <View style={{ alignItems: "center", paddingVertical: 40 }}>
          <ActivityIndicator size="large" color="#4B6BFF" />
        </View>
      )}
      {error && (
        <View style={{ alignItems: "center", paddingVertical: 40 }}>
          <Text style={{ color: "#d32f2f" }}>Error: {error}</Text>
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

          return (
            <Link key={c.id} href={`/campaign/${c.slug}`} asChild>
              <TouchableOpacity activeOpacity={0.85} style={styles.card}>
                <ExpoImage
                  source={{ uri: c.coverImage }}
                  style={styles.cardImage}
                  contentFit="cover"
                />
                <View style={styles.cardContent}>
                  <View style={styles.cardTextContainer}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {displayTitle}
                    </Text>
                    <Text style={styles.cardSubtitle} numberOfLines={2}>
                      {cleanedSubtitle}
                    </Text>
                  </View>
                  <View style={styles.cardFooter}>
                    <TouchableOpacity
                      style={styles.donateButton}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.donateButtonText}>Donate</Text>
                      <Ionicons
                        name="chevron-forward"
                        size={14}
                        color="#010D26"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            </Link>
          );
        })}
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
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,1)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderWidth: 2,
    borderColor: "#010D261A",
  },
  notificationDot: {
    position: "absolute",
    top: 1,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#DD4344",
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

  sortRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sortText: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: "AlbertSans_400Regular",
  },
  sortValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#010D26",
    fontFamily: "AlbertSans_600SemiBold",
  },

  cards: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  card: {
    width: "48%",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    height: 250,
    flexDirection: "column",
  },
  cardImage: {
    width: "100%",
    height: 125,
    flexShrink: 0,
  },
  cardContent: {
    flex: 1,
    padding: 14,
    paddingBottom: 12,
    justifyContent: "space-between",
    overflow: "hidden",
  },
  cardTextContainer: {
    flex: 1,
    minHeight: 0,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
    color: "#010D26",
    lineHeight: 18,
    fontFamily: "AlbertSans_700Bold",
  },
  cardSubtitle: {
    fontSize: 11,
    color: "#6B7280",
    lineHeight: 15,
    fontFamily: "AlbertSans_400Regular",
  },
  cardFooter: {
    justifyContent: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    marginTop: 8,
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
  },
  donateButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#010D26",
    fontFamily: "AlbertSans_700Bold",
  },
});
