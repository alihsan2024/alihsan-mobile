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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const categories = [
  { label: "All", icon: "apps" },
  { label: "Aqeeqah", icon: "restaurant" },
  { label: "Expeditions", icon: "walk" },
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
        const data = await fetchCampaigns();

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

      <Ionicons
        name="chevron-down"
        size={20}
        color="#777"
        style={{ alignSelf: "center", marginBottom: 12 }}
      />
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
          <Link
            key={c.id}
            href={`/campaign/${c.slug}`}
            asChild
            style={{ padding: 8, backgroundColor: "#F2F6FF" }}
          >
            <TouchableOpacity activeOpacity={0.85} style={styles.card}>
              <Image source={{ uri: c.coverImage }} style={styles.cardImage} />
              <View style={styles.cardContentWrapper}>
                <View style={styles.cardContentTop}>
                  <Text style={styles.cardTitle}>{c.name}</Text>
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
                <View style={styles.button}>
                  <Text style={styles.buttonText}>Donate Now</Text>
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
  categoryItem: {
    width: "25%",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 8,
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
  },
  card: {
    width: "48%",
    borderRadius: 10,
    marginBottom: 16,
    overflow: "hidden",
    minHeight: 210,
    flexDirection: "column",
  },
  cardImage: {
    width: "100%",
    height: 110,
    borderRadius: 10,
  },
  cardContentWrapper: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    paddingTop: 10,
  },
  cardContentTop: {
    flexShrink: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
    color: "#010D26",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#010D26",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#FFD600",
    borderRadius: 20,
    paddingVertical: 6,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
