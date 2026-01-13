import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import HeroBackground from "@/components/ui/GradientImage";

export default function SponsorshipDetailScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* ===== HEADER IMAGE ===== */}
      <HeroBackground
        source={require("../assets/header-image.png")}
        containerStyle={{ height: 220 }}
        showBack
      >
        <TouchableOpacity style={styles.backBtn} onPress={router.back}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
      </HeroBackground>

      {/* ===== CONTENT ===== */}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Monthly Sponsorship – Amina</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Distributed</Text>
          </View>
        </View>

        <Text style={styles.metaText}>15 Oct 2025 • AUD 50.00</Text>
        <View style={styles.horizontalLine} />
        <Text style={styles.description}>
          Funding education, meals, and healthcare for Amina in Jordan for the
          month of November.
        </Text>
        <View style={styles.horizontalLine} />

        {/* ===== TIMELINE ===== */}
        <View style={{ paddingHorizontal: 16 }}>
          <View style={styles.timeline}>
            {/* Education */}
            <View style={styles.timelineRow}>
              <View style={[styles.timelineIndicator]}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineLine} />
              </View>

              <View style={styles.timelineContent}>
                <View style={styles.timelineHeader}>
                  <Text style={styles.timelineTitle}>Education Update</Text>
                  <Text style={styles.timelineSeparator}>•</Text>
                  <Text style={styles.timelineDate}>15 Oct 2025</Text>
                </View>

                <Text style={styles.timelineText}>
                  Alhamdulillah, Amina has successfully completed her
                  second-term exams with a distinction in Mathematics and
                  Science.
                </Text>
              </View>
            </View>

            {/* Health */}
            <View style={styles.timelineRow}>
              <View style={styles.timelineIndicator}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineLine} />
              </View>

              <View style={styles.timelineContent}>
                <View style={styles.timelineHeader}>
                  <Text style={styles.timelineTitle}>Health & Nutrition</Text>
                  <Text style={styles.timelineSeparator}>•</Text>
                  <Text style={styles.timelineDate}>15 Oct 2025</Text>
                </View>

                <Text style={styles.timelineText}>
                  This month, your donation provided Amina with a fresh daily
                  school meal and her quarterly health check-up. She is growing
                  healthy and strong.
                </Text>
              </View>
            </View>

            {/* Living */}
            <View style={styles.timelineRow}>
              <View style={styles.timelineIndicator}>
                <View style={styles.timelineDot} />
              </View>

              <View style={styles.timelineContent}>
                <View style={styles.timelineHeader}>
                  <Text style={styles.timelineTitle}>Living Condition</Text>
                  <Text style={styles.timelineSeparator}>•</Text>
                  <Text style={styles.timelineDate}>15 Oct 2025</Text>
                </View>

                <Text style={styles.timelineText}>
                  New winter clothing and a sturdy school desk were delivered to
                  her family’s shelter last week.
                </Text>
              </View>
            </View>
          </View>

          {/* ===== MESSAGE CARD ===== */}
          <View style={styles.messageCard}>
            <Image
              source={require("../assets/orphan-message.png")}
              style={styles.messageAvatar}
            />

            <View style={styles.messageContent}>
              <Text style={styles.messageTitle}>A Message from Amina</Text>
              <Text style={styles.messageText} numberOfLines={2}>
                Thank you for helping me go to school. I want to be a teacher
                when I grow up so I can help others.
              </Text>
            </View>
          </View>

          {/* ===== MONTHLY CONTRIBUTION ===== */}
          <View style={styles.contributionCard}>
            {/* Header */}
            <View style={styles.contributionHeader}>
              <Text style={styles.contributionTitle}>Monthly Contribution</Text>
              <Text style={styles.contributionAmount}>AUD 50.00</Text>
            </View>

            <View style={styles.contributionDivider} />

            {/* Breakdown */}
            <View style={styles.contributionRow}>
              <Text style={styles.contributionLabel}>Education & Supplies</Text>
              <Text style={styles.contributionValue}>25.00</Text>
            </View>

            <View style={styles.contributionRow}>
              <Text style={styles.contributionLabel}>
                Nutrition & Healthcare
              </Text>
              <Text style={styles.contributionValue}>15.00</Text>
            </View>

            <View style={styles.contributionRow}>
              <Text style={styles.contributionLabel}>Family Support Fund</Text>
              <Text style={styles.contributionValue}>10.00</Text>
            </View>

            <View style={styles.contributionDivider} />

            {/* Footer */}
            <View style={styles.updatedRow}>
              <Image
                source={require("../assets/refresh.png")}
                style={{ width: 12, height: 12, marginRight: 6 }}
              />
              <Text style={styles.updatedText}>
                Last updated at 11:00:01 AM 12/9/2025
              </Text>
            </View>
          </View>

          {/* ===== ACTION BUTTONS ===== */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.secondaryBtn}>
              <Text style={styles.secondaryText}>Share</Text>
              <Image
                source={require("../assets/share.png")}
                style={{ width: 12, height: 12, marginRight: 6 }}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn}>
              <Text style={styles.secondaryText}>Write a Message</Text>
              <Image
                source={require("../assets/message.png")}
                style={{ width: 12, height: 12, marginRight: 6 }}
              />
            </TouchableOpacity>
          </View>

          {/* ===== TAX RECEIPT ===== */}
          <TouchableOpacity style={styles.primaryBtn}>
            <Image
              source={require("../assets/file-pdf.png")}
              style={{ width: 20, height: 20 }}
            />
            <Text style={styles.primaryText}>Download Tax Receipt</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  imageWrapper: { position: "relative" },
  headerImage: { width: "100%", height: 220 },
  backBtn: {
    position: "absolute",
    top: 48,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },

  content: { paddingVertical: 16 },

  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  title: { fontSize: 18, fontWeight: "700" },
  statusBadge: {
    backgroundColor: "#E7F6EC",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: { color: "#1E9E4A", fontSize: 12, fontWeight: "600" },

  metaText: {
    marginTop: 6,
    color: "#666",
    fontSize: 13,
    paddingHorizontal: 16,
  },
  description: { color: "#444", lineHeight: 20, paddingHorizontal: 16 },

  /* ===== TIMELINE ===== */
  timeline: { marginTop: 24 },

  timelineRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  timelineIndicator: {
    width: 28,
    alignItems: "center",
    marginRight: 15,
  },

  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#2563EB",
    marginTop: 6,
  },

  timelineLine: {
    marginTop: 6, // GAP between dot and line
    width: 2,
    flex: 1,
    backgroundColor: "#2563EB",
  },

  timelineContent: {
    flex: 1,
    paddingBottom: 28,
  },

  timelineHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  timelineTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },

  timelineSeparator: {
    marginHorizontal: 8,
    color: "#94A3B8",
    fontSize: 16,
  },

  timelineDate: {
    fontSize: 14,
    color: "#94A3B8",
  },

  timelineText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#334155",
  },

  /* ===== CARDS ===== */
  card: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 14,
    marginTop: 20,
  },

  messageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  horizontalLine: {
    height: 1,
    backgroundColor: "#010D26",
    width: "100%",
    marginVertical: 12,
    opacity: 0.1,
  },
  messageCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    padding: 12,
    marginTop: 20,
    backgroundColor: "#FFFFFF",
  },

  messageAvatar: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 12,
  },

  messageContent: {
    flex: 1,
  },

  messageTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#010D26",
    marginBottom: 4,
  },

  messageText: {
    fontSize: 14,
    color: "#010D26",
    opacity: 0.4,
    lineHeight: 20,
  },

  avatar: { width: 32, height: 32, borderRadius: 16, marginRight: 10 },
  cardTitle: { fontWeight: "700" },
  cardText: { color: "#555", lineHeight: 20 },

  contributionCard: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    padding: 16,
    marginTop: 20,
    backgroundColor: "#FFFFFF",
  },

  contributionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  contributionTitle: {
    fontSize: 16,
    color: "#010D26",
  },

  contributionAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#010D26",
  },

  contributionDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },

  contributionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 6,
  },

  contributionLabel: {
    fontSize: 16,
    color: "#010D26",
  },

  contributionValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#010D26",
  },

  updatedRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  amount: { fontWeight: "700" },

  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  hero: {
    height: 220,
    paddingTop: 48,
  },

  updatedText: {
    fontSize: 11,
    color: "#888",
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },

  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 6,
  },

  secondaryText: { fontWeight: "600", color: "#244180" },

  primaryBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4C430",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },

  primaryText: { fontWeight: "700", color: "#010D26" },
});
