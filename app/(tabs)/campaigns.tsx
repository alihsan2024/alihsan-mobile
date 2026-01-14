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

const categories = [
  { label: "All", icon: "apps" },
  { label: "Aqeeqah", icon: "restaurant" },
  { label: "Expiations", icon: "walk" },
  { label: "Emergency", icon: "alert-circle" },
  { label: "Gaza", icon: "flag" },
  { label: "Water", icon: "water" },
  { label: "General", icon: "megaphone" },
  { label: "Appeals", icon: "heart" },
  { label: "Education", icon: "school" },
  { label: "Health", icon: "medkit" },
  { label: "Ramadhan", icon: "moon" },
  { label: "Shelter", icon: "home" },
];

import { useEffect, useState } from "react";
import { fetchCampaigns, Campaign } from "../../utils/api";
import { Link } from "expo-router";
import HeaderSearchBar from "@/components/ui/HeaderSearchBar";
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
      {/* Search */}
      {/* <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#999" />
        <TextInput
          placeholder="Search Gaza, Education, or Zakat..."
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
        <Ionicons name="notifications-outline" size={20} color="#333" />
      </View> */}
      <HeaderSearchBar
        variant="outlined"
        placeholder="Search Gaza, Education, or Zakat..."
        onNotificationPress={() => {}}
      />

      {/* Title */}
      <Text style={styles.heading}>Active Appeals</Text>

      {/* Categories */}
      {!isCategoriesCollapsed ? (
        <View style={styles.categories}>
          {categories.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.categoryItem,
                selectedCategory === item.label && {
                  backgroundColor: "#E3F0FF",
                  borderRadius: 8,
                },
              ]}
              onPress={() => setSelectedCategory(item.label)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={item.icon as any}
                size={20}
                color={selectedCategory === item.label ? "#246BE1" : "#777"}
                style={{ marginBottom: 6 }}
              />
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === item.label && {
                    color: "#246BE1",
                    fontWeight: "bold",
                  },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.categoriesHorizontal}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryItemHorizontal,
                selectedCategory === item.label && {
                  backgroundColor: "#E3F0FF",
                  borderRadius: 8,
                },
              ]}
              onPress={() => setSelectedCategory(item.label)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={item.icon as any}
                size={20}
                color={selectedCategory === item.label ? "#246BE1" : "#777"}
                style={{ marginBottom: 6 }}
              />
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === item.label && {
                    color: "#246BE1",
                    fontWeight: "bold",
                  },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity
        onPress={() => setIsCategoriesCollapsed(!isCategoriesCollapsed)}
        style={{ alignSelf: "center", marginBottom: 12, padding: 4 }}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isCategoriesCollapsed ? "chevron-down" : "chevron-up"}
          size={20}
          color="#777"
        />
      </TouchableOpacity>
      <View
        style={{
          height: 1,
          backgroundColor: "#E0E0E0",
          marginVertical: 10,
          width: "100%",
        }}
      />

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

        {filteredCampaigns.map((c) => (
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
                    {c.name}
                  </Text>
                  <Text style={styles.cardSubtitle} numberOfLines={2}>
                    {c.description
                      ? c.description
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
                      : ""}
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
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F3F3",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },

  heading: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 16,
  },

  categories: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  categoriesHorizontal: {
    paddingVertical: 8,
  },
  categoryItem: {
    width: "25%",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 8,
  },
  categoryItemHorizontal: {
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    minWidth: 70,
  },
  categoryText: {
    fontSize: 11,
    color: "#444",
    textAlign: "center",
  },

  sortRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 6,
    marginBottom: 12,
  },
  sortText: {
    fontSize: 12,
    color: "#777",
  },
  sortValue: {
    fontSize: 12,
    fontWeight: "500",
  },

  cards: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  card: {
    width: "48%",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    height: 240,
    flexDirection: "column",
  },
  cardImage: {
    width: "100%",
    height: 120,
    flexShrink: 0,
  },
  cardContent: {
    height: 120,
    padding: 12,
    justifyContent: "space-between",
    overflow: "hidden",
  },
  cardTextContainer: {
    flex: 1,
    minHeight: 0,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 4,
    color: "#010D26",
    lineHeight: 16,
  },
  cardSubtitle: {
    fontSize: 11,
    color: "#6B7280",
    lineHeight: 14,
  },
  cardFooter: {
    height: 32,
    justifyContent: "center",
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
  },
});
