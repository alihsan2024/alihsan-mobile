import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useSelector((state: any) => state.authentication.user);
  const isAuthenticated = !!user;

  if (!isAuthenticated) {
    return (
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top + 20,
            justifyContent: "center",
          },
        ]}
      >
        <View style={styles.notLoggedInContainer}>
          <Text style={styles.notLoggedInIcon}>👤</Text>
          <Text style={styles.notLoggedInText}>You are not logged in</Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Profile */}
      <View style={styles.profileRow}>
        <Image
          source={{ uri: "https://i.pravatar.cc/150?img=12" }}
          style={styles.avatar}
        />
        <View>
          <Text style={styles.greeting}>Assalamualaikum Jho,</Text>
          <Text style={styles.subGreeting}>Your 2025 impact is amazing.</Text>
        </View>
      </View>

      {/* Donation Summary */}
      <LinearGradient
        colors={["#6A7BFF", "#5663F7"]}
        style={styles.summaryCard}
      >
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryLabel}>Total Donation</Text>
          <Text style={styles.summaryAmount}>AUD 5,240</Text>
        </View>

        <View style={styles.statsRow}>
          {[
            { icon: "hand-left-outline", label: "Zakat", value: "1,549.41" },
            { icon: "wallet-outline", label: "Sadaqah", value: "2,450.00" },
            { icon: "people-outline", label: "Orphan", value: "1,240.59" },
          ].map((item, index) => (
            <View key={index} style={styles.statItem}>
              <View style={styles.statIcon}>
                <Ionicons name={item.icon as any} size={20} color="#4F5DFB" />
              </View>
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      {/* Zakat Tracker */}
      <Text style={styles.sectionTitle}>Zakat Tracker</Text>

      <View style={styles.card}>
        <View style={styles.cardRow}>
          <Image
            source={{ uri: "https://i.pravatar.cc/150?img=32" }}
            style={styles.smallAvatar}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Next Zakat Due : 8 Months</Text>
            <Text style={styles.cardSub}>Based on AUD 1,750 Nisab</Text>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: "65%" }]} />
            </View>
          </View>
          <Text style={styles.link}>Recalculate</Text>
        </View>
      </View>

      {/* Active Sponsorship */}
      <Text style={styles.sectionTitle}>Active Sponsorship</Text>

      <View style={styles.card}>
        <View style={styles.cardRow}>
          <Image
            source={{ uri: "https://i.pravatar.cc/150?img=47" }}
            style={styles.smallAvatar}
          />
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <View>
                <Text style={styles.cardTitle}>
                  Monthly Sponsorship - Amina
                </Text>
                <Text style={styles.cardSub}>
                  Jordan | Support for education & meals
                </Text>
              </View>
              <View>
                <Text style={[styles.link, { textAlign: "right" }]}>Renew</Text>
                <Text style={styles.percent}>80% Funded</Text>
              </View>
            </View>

            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: "80%" }]} />
            </View>

            <Text style={styles.updatedText}>
              Last updated 11:00:01 AM 12/9/2025
            </Text>
          </View>
        </View>
      </View>

      {/* Recent History */}
      <View style={styles.historyHeader}>
        <Text style={styles.sectionTitle}>Recent History</Text>
        <Text style={styles.link}>See All</Text>
      </View>

      {[
        "Monthly Sponsorship - A...",
        "Zakat Al-Maal",
        "Gaza Emergency Food Pa...",
      ].map((title, index) => (
        <View key={index} style={styles.historyItem}>
          <Image
            source={{ uri: "https://i.pravatar.cc/150?img=20" }}
            style={styles.historyImg}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.historyTitle}>{title}</Text>
            <Text style={styles.historySub}>12 Nov 2025 • AUD 50.00</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Distributed</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FC",
    paddingHorizontal: 16,
  },

  notLoggedInContainer: {
    alignItems: "center",
  },
  notLoggedInIcon: {
    fontSize: 80,
    opacity: 0.3,
  },
  notLoggedInText: {
    fontSize: 18,
    color: "#666",
    marginTop: 16,
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: "#264B8B",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: "#111",
  },

  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  greeting: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },
  subGreeting: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },

  summaryCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  summaryLabel: {
    color: "#E0E4FF",
    fontSize: 13,
  },
  summaryAmount: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statIcon: {
    backgroundColor: "#FFF",
    padding: 8,
    borderRadius: 20,
    marginBottom: 6,
  },
  statValue: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 14,
  },
  statLabel: {
    color: "#E0E4FF",
    fontSize: 12,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    marginBottom: 8,
  },

  card: {
    borderWidth: 1,
    borderColor: "#010D261A",
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  cardRow: {
    flexDirection: "row",
  },
  smallAvatar: {
    width: 50,
    height: 55,
    borderRadius: 8,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
  },
  cardSub: {
    fontSize: 12,
    color: "#6B7280",
    marginVertical: 4,
  },

  progressBg: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 6,
  },
  progressFill: {
    height: 6,
    backgroundColor: "#FFD602",
  },

  link: {
    fontSize: 12,
    color: "#010D26",
    fontWeight: "600",
  },

  percent: {
    fontSize: 12,
    color: "#6B7280",
    marginVertical: 4,
  },

  updatedText: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 6,
  },

  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#010D261A",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  historyImg: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 10,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
  },
  historySub: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },

  badge: {
    backgroundColor: "#E8F7EF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11,
    color: "#16A34A",
    fontWeight: "600",
  },
});
