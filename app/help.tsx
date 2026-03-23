import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image as ExpoImage } from "expo-image";
import { StatusBar } from "expo-status-bar";
import * as WebBrowser from "expo-web-browser";

/** Same hero as campaign search modal */
const BANNER_IMAGE_URI =
  "https://alihsan.s3.ap-southeast-2.amazonaws.com/gaza/1766470085564-alihsan-IMG_4983%20Congo%20Blog%202%20Large.jpeg";

const BASE = "https://www.alihsan.org.au";

const URLS = {
  helpCenter: `${BASE}/contact-and-complaints/get-in-touch`,
  policies: `${BASE}/policies`,
  privacy: `${BASE}/privacy-policy`,
  terms: `${BASE}/terms-and-conditions`,
  complaints: `${BASE}/contact-and-complaints/complaints`,
  technicalSupport: `${BASE}/technical-support`,
  safeguarding: `${BASE}/policies/safeguarding-pseah-policy`,
} as const;

type PolicyLink = { id: string; title: string; subtitle?: string; url: string };

const POLICY_LINKS: PolicyLink[] = [
  { id: "policies", title: "All policies", subtitle: "Governance, safeguarding & more", url: URLS.policies },
  { id: "privacy", title: "Privacy Policy", url: URLS.privacy },
  { id: "terms", title: "Terms & Conditions", url: URLS.terms },
  { id: "safeguarding", title: "Safeguarding & PSEAH", subtitle: "Vulnerable persons & reporting standards", url: URLS.safeguarding },
  { id: "complaints", title: "Complaints process", url: URLS.complaints },
  { id: "technical", title: "Technical support", url: URLS.technicalSupport },
];

async function openExternalUrl(url: string) {
  try {
    await WebBrowser.openBrowserAsync(url, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
      toolbarColor: "#246BE1",
      controlsColor: "#FFFFFF",
    });
  } catch {
    Alert.alert("Unable to open link", "Please try again or visit alihsan.org.au in your browser.");
  }
}

export default function HelpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const onOpen = useCallback((url: string) => {
    openExternalUrl(url);
  }, []);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      {/* Top banner — remote image + gradient; inner padding clears back button */}
      <View style={styles.headerWrapper}>
        <ExpoImage
          source={{ uri: BANNER_IMAGE_URI }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
        />
        <LinearGradient
          colors={["transparent", "rgba(38,75,139,0.5)", "rgba(38,75,139,0.92)"]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        <View
          style={[
            styles.bannerInner,
            { paddingTop: Math.max(insets.top, 12) + 4 + 40 + 10 },
          ]}
        >
          <Text style={styles.guthenText}>Al-Ihsan Foundation</Text>
          <Text style={styles.headerTitle}>Help &amp; support</Text>
          <Text style={styles.headerSubtitle}>
            Policies, assistance, and how we protect our community—including child safety reporting and
            safeguarding.
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.bannerBackBtn, { top: Math.max(insets.top, 12) + 4 }]}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={22} color="#010D26" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 20) + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Child safety</Text>
          <View style={styles.card}>
            <View style={styles.cardIconRow}>
              <View style={styles.cardIconBadge}>
                <Ionicons name="people" size={20} color="#246BE1" />
              </View>
              <Text style={styles.cardTitle}>Report concerns in the app</Text>
            </View>
            <Text style={styles.cardText}>
              The Al-Ihsan Foundation App allows you to report child safety concerns in-app. Reports are taken
              seriously and handled in line with our safeguarding and complaints processes.
            </Text>
            <Text style={styles.cardTextMuted}>
              To learn more about reporting requirements, obligations, and how we respond, visit our Help center
              on the website.
            </Text>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => onOpen(URLS.helpCenter)}
              activeOpacity={0.9}
              accessibilityRole="button"
              accessibilityLabel="Open Help center in browser"
            >
              <Ionicons name="open-outline" size={20} color="#010D26" />
              <Text style={styles.primaryBtnText}>Visit Help center</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => onOpen(URLS.safeguarding)}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Open safeguarding policy"
            >
              <Text style={styles.secondaryBtnText}>Read safeguarding policy</Text>
              <Ionicons name="chevron-forward" size={18} color="#246BE1" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Policies &amp; legal</Text>
          <View style={styles.cardFlat}>
            {POLICY_LINKS.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.policyRow, index > 0 && styles.policyRowBorder]}
                onPress={() => onOpen(item.url)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`${item.title}. Opens in browser`}
              >
                <View style={styles.policyTextCol}>
                  <Text style={styles.policyTitle}>{item.title}</Text>
                  {item.subtitle ? <Text style={styles.policySubtitle}>{item.subtitle}</Text> : null}
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={styles.footnote}>
          Links open in an in-app browser ({Platform.OS === "ios" ? "iOS" : "Android"}). Internet required.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },
  headerWrapper: {
    height: 248,
    width: "100%",
    position: "relative",
    overflow: "hidden",
  },
  bannerInner: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 28,
    zIndex: 1,
  },
  bannerBackBtn: {
    position: "absolute",
    left: 16,
    zIndex: 30,
    borderWidth: 1,
    borderColor: "rgba(1, 13, 38, 0.15)",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 6,
  },
  guthenText: {
    fontSize: 22,
    fontFamily: "Guthen Bloots",
    color: "#FFD602",
    marginBottom: 6,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    fontFamily: "AlbertSans_800ExtraBold",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    color: "#E6ECFF",
    fontSize: 15,
    lineHeight: 22,
    fontFamily: "AlbertSans_400Regular",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 22,
  },
  section: {
    marginBottom: 22,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 2,
    fontFamily: "AlbertSans_700Bold",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  cardIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#010D26",
    fontFamily: "AlbertSans_700Bold",
    flex: 1,
  },
  cardText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#374151",
    marginBottom: 10,
    fontFamily: "AlbertSans_400Regular",
  },
  cardTextMuted: {
    fontSize: 14,
    lineHeight: 20,
    color: "#6B7280",
    marginBottom: 16,
    fontFamily: "AlbertSans_400Regular",
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFD602",
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#010D26",
    fontFamily: "AlbertSans_700Bold",
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#246BE1",
    fontFamily: "AlbertSans_600SemiBold",
  },
  cardFlat: {
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  policyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  policyRowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E7EB",
  },
  policyTextCol: {
    flex: 1,
    minWidth: 0,
  },
  policyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    fontFamily: "AlbertSans_600SemiBold",
  },
  policySubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
    fontFamily: "AlbertSans_400Regular",
  },
  footnote: {
    fontSize: 12,
    color: "#94A3B8",
    lineHeight: 18,
    textAlign: "center",
    marginTop: 4,
    paddingHorizontal: 12,
    paddingBottom: 8,
    fontFamily: "AlbertSans_400Regular",
  },
});
