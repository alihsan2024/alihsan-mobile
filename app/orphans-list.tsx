"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { fetchOrphans } from "@/store/reduxSlice/orphansSlice";
import { calculateAge, formatOrphanName } from "@/utils/helper";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { LinearGradient } from "expo-linear-gradient";
import HeroBackground from "@/components/ui/GradientImage";

const OrphanListPage = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const {
    data: orphans,
    loading,
    error,
  } = useSelector((state: any) => state.orphans);

  const [filteredOrphans, setFilteredOrphans] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    status: "all",
    gender: "all",
  });

  useEffect(() => {
    dispatch(fetchOrphans());
  }, [dispatch]);

  useEffect(() => {
    if (orphans && orphans.length > 0) {
      applyFilters();
    } else {
      setFilteredOrphans([]);
    }
  }, [filters, orphans]);

  const applyFilters = () => {
    if (!orphans || orphans.length === 0) {
      setFilteredOrphans([]);
      return;
    }

    let results = [...orphans];

    if (filters.status !== "all") {
      results = results.filter((orphan) =>
        filters.status === "available"
          ? orphan.status === "available"
          : orphan.status === "sponsored"
      );
    }

    if (filters.gender !== "all") {
      results = results.filter((orphan) => {
        if (!orphan.gender) return false;
        return orphan.gender.toLowerCase() === filters.gender.toLowerCase();
      });
    }

    setFilteredOrphans(results);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterType]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      status: "all",
      gender: "all",
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2D7DD2" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Oops!</Text>
        <Text style={styles.errorSubtitle}>Unable to Load Orphans</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Section */}
      <HeroBackground
        source={{
          uri: "https://alihsan.s3.ap-southeast-2.amazonaws.com/projects/1708467619845-alihsan-images.png",
        }}
        containerStyle={{ height: 240 }}
        showBack
      >
        <View style={styles.headerContent}>
          <Text style={styles.guthenText}>Child Sponsorship</Text>
          <Text style={styles.headerTitle}>Transform a Life</Text>
          <Text style={styles.headerSubtitle}>
            Provide education, healthcare, and hope through monthly sponsorship.
          </Text>
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
            <Text style={styles.statsValue}>{orphans.length}+</Text>
            <Text style={styles.statsLabel}>children</Text>
          </View>
          <View style={styles.statsDivider} />
          <View style={styles.statsItem}>
            <Text style={styles.statsValue}>
              {filteredOrphans.filter((o) => o.status === "available").length}
            </Text>
            <Text style={styles.statsLabel}>need sponsors</Text>
          </View>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.sectionWrapper}>
        <View style={styles.filtersCard}>
          <View style={styles.filtersHeaderRow}>
            <Text style={styles.filterTitle}>Filter children</Text>
            {(filters.status !== "all" || filters.gender !== "all") && (
              <TouchableOpacity onPress={resetFilters}>
                <Text style={styles.clearFilters}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.filterPillsRow}>
            {["available", "sponsored"].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterButton,
                  filters.status === status && styles.filterButtonActive,
                ]}
                onPress={() =>
                  handleFilterChange(
                    "status",
                    filters.status === status ? "all" : status
                  )
                }
                activeOpacity={0.8}
              >
                <Text
                  style={
                    filters.status === status
                      ? styles.filterButtonTextActive
                      : styles.filterButtonText
                  }
                >
                  {status === "available" ? "Available" : "Sponsored"}
                </Text>
              </TouchableOpacity>
            ))}
            {["male", "female"].map((gender) => (
              <TouchableOpacity
                key={gender}
                style={[
                  styles.filterButton,
                  filters.gender === gender && styles.filterButtonActive,
                ]}
                onPress={() =>
                  handleFilterChange(
                    "gender",
                    filters.gender === gender ? "all" : gender
                  )
                }
                activeOpacity={0.8}
              >
                <Text
                  style={
                    filters.gender === gender
                      ? styles.filterButtonTextActive
                      : styles.filterButtonText
                  }
                >
                  {gender === "male" ? "Boy" : "Girl"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.showingText}>
            Showing <Text style={styles.bold}>{filteredOrphans.length}</Text>{" "}
            {filteredOrphans.length === 1 ? "child" : "children"}
          </Text>
        </View>
      </View>

      {/* Orphan Cards */}
      <View style={styles.sectionWrapper}>
        <Text style={styles.sectionTitle}>Children waiting for your support</Text>

        {filteredOrphans.length > 0 ? (
          <View style={styles.cardsGrid}>
            {filteredOrphans.map((orphan) => (
              <TouchableOpacity
                key={orphan.id}
                style={styles.card}
                onPress={() =>
                  (navigation as any).navigate("orphan-profile", {
                    id: orphan.id,
                  })
                }
                activeOpacity={0.9}
              >
                <View style={styles.cardImageWrapper}>
                  <Image
                    source={{ uri: orphan.photoUrl || orphan.coverImage }}
                    style={styles.cardImage}
                    resizeMode="cover"
                  />
                  {orphan.status === "available" && (
                    <View style={styles.statusBadgeAvailable}>
                      <Text style={styles.statusBadgeText}>Available</Text>
                    </View>
                  )}
                  {orphan.gender && (
                    <View style={styles.statusBadgeGender}>
                      <Text style={styles.statusBadgeGenderText}>
                        {orphan.gender === "male" ? "Boy" : "Girl"}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {formatOrphanName(orphan.name)}
                  </Text>
                  <View style={styles.cardInfoRow}>
                    {orphan.dateOfBirth && (
                      <Text style={styles.cardSubtitle}>
                        Age {calculateAge(orphan.dateOfBirth)}
                      </Text>
                    )}
                    {orphan.location && (
                      <Text style={styles.cardLocation} numberOfLines={1}>
                        {orphan.location}
                      </Text>
                    )}
                  </View>
                  {orphan.bio && (
                    <Text style={styles.cardBio} numberOfLines={2}>
                      {orphan.bio}
                    </Text>
                  )}
                  <Text style={styles.cardLink}>View profile →</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.centered}>
            <Text style={styles.noMatchTitle}>
              No children match your filters
            </Text>
            <Text style={styles.noMatchText}>
              Try adjusting your filters to see more children.
            </Text>
            <TouchableOpacity onPress={resetFilters} style={styles.resetButton}>
              <Text style={styles.resetButtonText}>Reset Filters</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
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
    fontSize: 24,
    fontFamily: "Guthen Bloots",
    color: "#FFD602",
    marginBottom: 4,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    fontFamily: "AlbertSans_800ExtraBold",
    marginBottom: 8,
  },
  headerSubtitle: {
    color: "#E6ECFF",
    fontSize: 15,
    lineHeight: 22,
    fontFamily: "AlbertSans_400Regular",
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
    fontSize: 18,
  },
  statsLabel: { color: "#6B7280", fontSize: 12, marginTop: 2 },
  statsDivider: {
    width: 1,
    height: 32,
    backgroundColor: "#B3C7E6",
    marginHorizontal: 8,
  },
  filtersCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filtersHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  filterTitle: {
    fontWeight: "700",
    color: "#010D26",
    fontSize: 16,
    fontFamily: "AlbertSans_700Bold",
  },
  filterPillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#F9FAFB",
  },
  filterButtonActive: {
    backgroundColor: "#246BE1",
    borderColor: "#246BE1",
  },
  filterButtonText: {
    color: "#4B5563",
    fontSize: 13,
    fontWeight: "500",
    fontFamily: "AlbertSans_500Medium",
  },
  filterButtonTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 13,
    fontFamily: "AlbertSans_600SemiBold",
  },
  clearFilters: {
    color: "#246BE1",
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "AlbertSans_600SemiBold",
  },
  showingText: {
    color: "#6B7280",
    marginTop: 12,
    fontSize: 13,
    fontFamily: "AlbertSans_400Regular",
  },
  bold: { fontWeight: "bold" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#010D26",
    marginBottom: 12,
  },
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 4,
  },
  card: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardImageWrapper: {
    position: "relative",
    width: "100%",
    height: 140,
    backgroundColor: "#F3F4F6",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  statusBadgeAvailable: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#10B981",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 2,
  },
  statusBadgeGender: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 2,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  statusBadgeText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 10,
    fontFamily: "AlbertSans_700Bold",
  },
  statusBadgeGenderText: {
    color: "#010D26",
    fontWeight: "700",
    fontSize: 10,
    fontFamily: "AlbertSans_700Bold",
  },
  cardContent: { padding: 14 },
  cardTitle: {
    color: "#010D26",
    fontWeight: "700",
    fontSize: 15,
    marginBottom: 6,
    fontFamily: "AlbertSans_700Bold",
  },
  cardInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
    gap: 8,
  },
  cardSubtitle: {
    color: "#6B7280",
    fontSize: 13,
    fontFamily: "AlbertSans_500Medium",
    flex: 1,
  },
  cardLocation: {
    color: "#9CA3AF",
    fontSize: 12,
    fontWeight: "500",
    fontFamily: "AlbertSans_500Medium",
    flex: 1,
    textAlign: "right",
  },
  cardBio: {
    color: "#4B5563",
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 16,
    fontFamily: "AlbertSans_400Regular",
  },
  cardLink: {
    color: "#246BE1",
    fontWeight: "600",
    marginTop: 4,
    fontSize: 13,
    fontFamily: "AlbertSans_600SemiBold",
  },
  errorTitle: { color: "#D7263D", fontSize: 22, fontWeight: "700" },
  errorSubtitle: { color: "#D7263D", fontSize: 16 },
  errorText: { color: "#D7263D", fontSize: 14 },
  noMatchTitle: { color: "#010D26", fontSize: 18, fontWeight: "700" },
  noMatchText: { color: "#6B7280", fontSize: 14, marginBottom: 8 },
  resetButton: {
    backgroundColor: "#246BE1",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
  },
  resetButtonText: { color: "#fff", fontWeight: "600" },
});

export default OrphanListPage;
