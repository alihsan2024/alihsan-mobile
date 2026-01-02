// import { useEffect, useState, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   RefreshControl,
//   TouchableOpacity,
//   Alert,
// } from "react-native";
// import { useRouter } from "expo-router";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { fetchCampaigns, Campaign } from "../../utils/api";
// import LoadingScreen from "../../components/LoadingScreen";
// import CampaignCard from "@/components/CampaignCard";

// export default function CampaignsScreen() {
//   const [campaigns, setCampaigns] = useState<Campaign[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [refreshing, setRefreshing] = useState(false);

//   const router = useRouter();
//   const insets = useSafeAreaInsets();

//   const lastRefreshRef = useRef(0);
//   const REFRESH_COOLDOWN = 5000;

//   const loadCampaigns = async () => {
//     try {
//       setError(null);
//       const data = await fetchCampaigns();
//       setCampaigns(data);
//     } catch (err: any) {
//       console.error("Failed to load campaigns:", err);
//       setError(err.message || "Failed to load campaigns");
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useEffect(() => {
//     loadCampaigns();
//   }, []);

//   const onRefresh = () => {
//     const now = Date.now();
//     if (now - lastRefreshRef.current < REFRESH_COOLDOWN) {
//       // Alert.alert(
//       //   "Cooldown",
//       //   "Please wait a few seconds before refreshing again."
//       // );
//       return;
//     }

//     lastRefreshRef.current = now;
//     setRefreshing(true);
//     loadCampaigns();
//   };

//   if (loading) {
//     return <LoadingScreen message="Loading campaigns..." />;
//   }

//   if (error) {
//     return (
//       <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
//         <Text style={styles.errorText}>Error: {error}</Text>
//         <Text style={styles.retryText} onPress={loadCampaigns}>
//           Tap to retry
//         </Text>
//       </View>
//     );
//   }

//   return (
//     <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
//       <View style={styles.header}>
//         <Text style={styles.title}>All Campaigns</Text>
//         <Text style={styles.subtitle}>
//           {campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""} found
//         </Text>
//       </View>

//       <ScrollView
//         style={styles.scrollView}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//         }
//         showsVerticalScrollIndicator={false}
//       >
//         <CampaignCard campaigns={campaigns} />
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: "#fff",
//   },
//   header: {
//     marginBottom: 24,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: "bold",
//     color: "#264B8B",
//     marginBottom: 4,
//   },
//   subtitle: {
//     fontSize: 16,
//     color: "#666",
//   },
//   scrollView: {
//     flex: 1,
//   },
//   campaignCard: {
//     backgroundColor: "#f9f9f9",
//     padding: 16,
//     borderRadius: 12,
//     marginBottom: 12,
//     borderLeftWidth: 4,
//     borderLeftColor: "#264B8B",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   campaignName: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#264B8B",
//     marginBottom: 4,
//   },
//   campaignSlug: {
//     fontSize: 12,
//     color: "#999",
//     marginBottom: 8,
//   },
//   campaignDescription: {
//     fontSize: 14,
//     color: "#666",
//     lineHeight: 20,
//   },
//   imageUrl: {
//     fontSize: 10,
//     color: "#999",
//     marginTop: 4,
//   },
//   emptyContainer: {
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 60,
//   },
//   emptyText: {
//     fontSize: 16,
//     color: "#999",
//     textAlign: "center",
//   },
//   errorText: {
//     fontSize: 16,
//     color: "#d32f2f",
//     marginBottom: 12,
//   },
//   retryText: {
//     fontSize: 16,
//     color: "#264B8B",
//     textDecorationLine: "underline",
//   },
// });

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

export default function ActiveAppealsScreen() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        setError(null);
        setLoading(true);
        const data = await fetchCampaigns();
        setCampaigns(data);
      } catch (err: any) {
        setError(err?.message || "Failed to load campaigns");
      } finally {
        setLoading(false);
      }
    };
    loadCampaigns();
  }, []);

  // Filter campaigns by search and category
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
        value={search}
        onChangeText={setSearch}
        showNotificationDot
        variant="outlined"
        placeholder="Search Gaza, Education, or Zakat..."
      />

      {/* Title */}
      <Text style={styles.heading}>Active Appeals</Text>

      {/* Categories */}
      <View style={styles.categories}>
        {categories.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.categoryItem}
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
          <Link key={c.id} href={`/campaign/${c.slug}`} asChild>
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
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 2,
    minHeight: 210,
    flexDirection: "column",
  },
  cardImage: {
    width: "100%",
    height: 110,
  },
  cardContentWrapper: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    padding: 10,
  },
  cardContentTop: {
    flexShrink: 1,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 11,
    color: "#777",
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
