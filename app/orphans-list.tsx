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
    ageRange: "all",
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

    if (filters.ageRange !== "all") {
      if (filters.ageRange === "16+") {
        results = results.filter((orphan) => {
          if (!orphan.dateOfBirth) return false;
          const age = calculateAge(orphan.dateOfBirth);
          return age >= 16;
        });
      } else {
        const [minAge, maxAge] = filters.ageRange.split("-").map(Number);
        if (!isNaN(minAge) && !isNaN(maxAge)) {
          results = results.filter((orphan) => {
            if (!orphan.dateOfBirth) return false;
            const age = calculateAge(orphan.dateOfBirth);
            return age >= minAge && age <= maxAge;
          });
        }
      }
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
      ageRange: "all",
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
    <ScrollView style={styles.container}>
      {/* Hero Section */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Sponsor a Child</Text>
        <Text style={styles.heroSubtitle}>
          Change a child's life through monthly sponsorship. Your support
          provides education, healthcare, and hope.
        </Text>
      </View>

      {/* Stats Banner */}
      <View style={styles.statsBanner}>
        <View style={styles.statsItem}>
          <Text style={styles.statsValue}>$120</Text>
          <Text style={styles.statsLabel}>/month</Text>
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

      {/* Filters */}
      <View style={styles.filtersCard}>
        <Text style={styles.filterTitle}>Filter by</Text>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Status:</Text>
          {["all", "available"].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterButton,
                filters.status === status && styles.filterButtonActive,
              ]}
              onPress={() => handleFilterChange("status", status)}
            >
              <Text
                style={
                  filters.status === status
                    ? styles.filterButtonTextActive
                    : styles.filterButtonText
                }
              >
                {status === "all" ? "All" : "Available"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Age:</Text>
          {["all", "0-5", "6-10", "11-15", "16+"].map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.filterButton,
                filters.ageRange === range && styles.filterButtonActive,
              ]}
              onPress={() => handleFilterChange("ageRange", range)}
            >
              <Text
                style={
                  filters.ageRange === range
                    ? styles.filterButtonTextActive
                    : styles.filterButtonText
                }
              >
                {range === "all" ? "All" : range}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Gender:</Text>
          {["all", "male", "female"].map((gender) => (
            <TouchableOpacity
              key={gender}
              style={[
                styles.filterButton,
                filters.gender === gender && styles.filterButtonActive,
              ]}
              onPress={() => handleFilterChange("gender", gender)}
            >
              <Text
                style={
                  filters.gender === gender
                    ? styles.filterButtonTextActive
                    : styles.filterButtonText
                }
              >
                {gender === "all" ? "All" : gender === "male" ? "Boy" : "Girl"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {(filters.status !== "all" ||
          filters.ageRange !== "all" ||
          filters.gender !== "all") && (
          <TouchableOpacity onPress={resetFilters}>
            <Text style={styles.clearFilters}>Clear filters</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.showingText}>
          Showing <Text style={styles.bold}>{filteredOrphans.length}</Text>{" "}
          {filteredOrphans.length === 1 ? "child" : "children"}
        </Text>
      </View>

      {/* Orphan Cards */}
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
                    <Text style={styles.statusBadgeText}>
                      {orphan.gender === "male" ? "Boy" : "Girl"}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>
                  {formatOrphanName(orphan.name)}
                </Text>
                <View style={styles.cardInfoRow}>
                  <Text style={styles.cardSubtitle}>
                    Age {calculateAge(orphan.dateOfBirth)}
                  </Text>
                  {orphan.location && (
                    <Text style={styles.cardLocation}>{orphan.location}</Text>
                  )}
                </View>
                {orphan.bio && <Text style={styles.cardBio}>{orphan.bio}</Text>}
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
  hero: {
    backgroundColor: "#2D7DD2",
    padding: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 1,
  },
  heroSubtitle: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    opacity: 0.9,
  },
  statsBanner: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#E6F0FA",
    marginHorizontal: 16,
    borderRadius: 16,
    marginTop: -24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statsItem: { alignItems: "center", marginHorizontal: 12 },
  statsValue: { color: "#2D7DD2", fontWeight: "bold", fontSize: 20 },
  statsLabel: { color: "#2D7DD2", fontSize: 14, opacity: 0.7 },
  statsDivider: {
    width: 1,
    height: 32,
    backgroundColor: "#B3C7E6",
    marginHorizontal: 8,
  },
  filtersCard: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  filterTitle: {
    fontWeight: "bold",
    color: "#2D7DD2",
    fontSize: 16,
    marginBottom: 8,
  },
  filterRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  filterLabel: { color: "#2D7DD2", fontWeight: "bold", marginRight: 8 },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2D7DD2",
    marginHorizontal: 2,
    backgroundColor: "#F7FAFC",
  },
  filterButtonActive: { backgroundColor: "#2D7DD2" },
  filterButtonText: { color: "#2D7DD2" },
  filterButtonTextActive: { color: "#fff", fontWeight: "bold" },
  clearFilters: {
    color: "#2D7DD2",
    textDecorationLine: "underline",
    marginTop: 8,
    marginLeft: 8,
  },
  showingText: { color: "#2D7DD2", marginTop: 8 },
  bold: { fontWeight: "bold" },
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 8,
  },
  card: {
    width: 170,
    margin: 8,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 8,
  },
  cardImageWrapper: {
    position: "relative",
    width: "100%",
    height: 110,
    backgroundColor: "#E6F0FA",
  },
  cardImage: {
    width: "100%",
    height: "100%",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  statusBadgeAvailable: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#38B000",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 2,
  },
  statusBadgeGender: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 2,
  },
  statusBadgeText: { color: "#2D7DD2", fontWeight: "bold", fontSize: 12 },
  cardContent: { padding: 12 },
  cardTitle: {
    color: "#2D7DD2",
    fontWeight: "bold",
    fontSize: 17,
    marginBottom: 2,
  },
  cardInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  cardSubtitle: { color: "#2D7DD2", fontSize: 14 },
  cardLocation: { color: "#2D7DD2", fontSize: 12, opacity: 0.7 },
  cardBio: { color: "#2D7DD2", fontSize: 12, marginVertical: 4, opacity: 0.8 },
  cardLink: { color: "#2D7DD2", fontWeight: "bold", marginTop: 8 },
  errorTitle: { color: "#D7263D", fontSize: 22, fontWeight: "bold" },
  errorSubtitle: { color: "#D7263D", fontSize: 16 },
  errorText: { color: "#D7263D", fontSize: 14 },
  noMatchTitle: { color: "#2D7DD2", fontSize: 18, fontWeight: "bold" },
  noMatchText: { color: "#2D7DD2", fontSize: 14, marginBottom: 8 },
  resetButton: { backgroundColor: "#2D7DD2", padding: 10, borderRadius: 8 },
  resetButtonText: { color: "#fff", fontWeight: "bold" },
});

export default OrphanListPage;
