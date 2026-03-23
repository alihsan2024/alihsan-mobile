import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Pressable,
  Keyboard,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";

const { height: windowHeight } = Dimensions.get("window");

const BANNER_IMAGE_URI =
  "https://alihsan.s3.ap-southeast-2.amazonaws.com/gaza/1766470085564-alihsan-IMG_4983%20Congo%20Blog%202%20Large.jpeg";

function stripHtml(html: string | undefined | null): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function matchScore(campaign: any, q: string): number {
  const name = (campaign.name ?? "").toLowerCase();
  const slug = (campaign.slug ?? "").toLowerCase();
  const desc = stripHtml(campaign.description).toLowerCase();
  if (name.startsWith(q)) return 0;
  const nameIdx = name.indexOf(q);
  if (nameIdx !== -1) return 10 + nameIdx;
  if (slug.startsWith(q)) return 50;
  if (slug.indexOf(q) !== -1) return 60;
  if (desc.indexOf(q) !== -1) return 100;
  return 200;
}

function filterAndSortCampaigns(campaigns: any[], query: string): any[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return [...campaigns].sort((a, b) =>
      (a.name ?? "").localeCompare(b.name ?? "", undefined, { sensitivity: "base" })
    );
  }
  const filtered = campaigns.filter((c) => {
    const name = (c.name ?? "").toLowerCase();
    const slug = (c.slug ?? "").toLowerCase();
    const plainDesc = stripHtml(c.description).toLowerCase();
    return name.includes(q) || slug.includes(q) || plainDesc.includes(q);
  });
  return filtered.sort((a, b) => {
    const diff = matchScore(a, q) - matchScore(b, q);
    if (diff !== 0) return diff;
    return (a.name ?? "").localeCompare(b.name ?? "", undefined, { sensitivity: "base" });
  });
}

function splitHighlight(text: string, query: string): { text: string; highlight: boolean }[] {
  if (!query.trim() || !text) return [{ text, highlight: false }];
  const q = query.trim();
  const lower = text.toLowerCase();
  const idx = lower.indexOf(q.toLowerCase());
  if (idx === -1) return [{ text, highlight: false }];
  const parts: { text: string; highlight: boolean }[] = [];
  if (idx > 0) parts.push({ text: text.slice(0, idx), highlight: false });
  parts.push({ text: text.slice(idx, idx + q.length), highlight: true });
  if (idx + q.length < text.length) parts.push({ text: text.slice(idx + q.length), highlight: false });
  return parts;
}

export type CampaignSearchModalProps = {
  visible: boolean;
  onClose: () => void;
  /** Called when user picks a campaign; parent handles navigation */
  onSelectCampaign: (campaign: any) => void;
  campaigns: any[];
  loading: boolean;
};

/**
 * Full-screen campaign search: debounced query, relevance order, highlighted titles,
 * browse-all when empty, and explicit empty states.
 */
export default function CampaignSearchModal({
  visible,
  onClose,
  onSelectCampaign,
  campaigns,
  loading,
}: CampaignSearchModalProps) {
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const [inputValue, setInputValue] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(inputValue.trim()), 280);
    return () => clearTimeout(t);
  }, [inputValue]);

  useEffect(() => {
    if (visible) {
      const focus = setTimeout(() => inputRef.current?.focus(), 320);
      return () => clearTimeout(focus);
    }
    setInputValue("");
    setDebouncedQuery("");
  }, [visible]);

  const sortedList = useMemo(
    () => filterAndSortCampaigns(campaigns, debouncedQuery),
    [campaigns, debouncedQuery]
  );

  const showEmpty = !loading && campaigns.length === 0;
  const showNoHits =
    !loading && campaigns.length > 0 && debouncedQuery.length > 0 && sortedList.length === 0;

  const onPick = useCallback(
    (item: any) => {
      Keyboard.dismiss();
      onSelectCampaign(item);
    },
    [onSelectCampaign]
  );

  const renderItem = useCallback(
    ({ item }: { item: any }) => {
      const name = item.name ?? "Campaign";
      const desc = stripHtml(item.description);
      const shortDesc = desc.length > 88 ? `${desc.slice(0, 88)}…` : desc;
      const parts = splitHighlight(name, debouncedQuery);

      return (
        <Pressable
          style={({ pressed }) => [styles.rowOuter, pressed && styles.rowOuterPressed]}
          onPress={() => onPick(item)}
          android_ripple={{ color: "rgba(36, 107, 225, 0.08)" }}
          accessibilityRole="button"
          accessibilityLabel={`Open ${name}`}
        >
          <View style={styles.row}>
            <View style={styles.rowImageWrap}>
              <ExpoImage
                source={
                  item.coverImage || item.cover_image
                    ? { uri: item.coverImage || item.cover_image }
                    : require("../../assets/card1.png")
                }
                style={styles.rowImage}
                contentFit="cover"
                transition={120}
              />
            </View>
            <View style={styles.rowBody}>
              <Text style={styles.rowTitle} numberOfLines={2}>
                {parts.map((p, i) => (
                  <Text key={i} style={p.highlight ? styles.rowTitleHighlight : undefined}>
                    {p.text}
                  </Text>
                ))}
              </Text>
              {shortDesc ? (
                <Text style={styles.rowMeta} numberOfLines={2}>
                  {shortDesc}
                </Text>
              ) : null}
            </View>
            <View style={styles.rowChevronWrap}>
              <Ionicons name="chevron-forward" size={18} color="#246BE1" />
            </View>
          </View>
        </Pressable>
      );
    },
    [debouncedQuery, onPick]
  );

  const keyExtractor = useCallback((item: any, index: number) => {
    const id = item.id ?? item.slug;
    return id != null ? String(id) : `c-${index}`;
  }, []);

  const listHeader = (
    <View style={styles.listHeader}>
      <View style={styles.listHeaderRow}>
        {!debouncedQuery ? (
          <Text style={styles.listHeaderTitle}>All campaigns</Text>
        ) : (
          <>
            <Text style={styles.listHeaderTitle}>
              {sortedList.length} match{sortedList.length !== 1 ? "es" : ""}
            </Text>
            <View style={styles.listHeaderChip}>
              <Text style={styles.listHeaderChipText} numberOfLines={1}>
                “{debouncedQuery}”
              </Text>
            </View>
          </>
        )}
      </View>
      <Text style={styles.listHeaderHint}>Tap a card to view the campaign</Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View style={styles.modalRoot}>
          <StatusBar style="light" />

          {/* Top banner — same visual language as Zakat Calculator / Help */}
          <View style={styles.banner}>
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
            {/* Reserve top space for back button so title text never overlaps it */}
            <View
              style={[
                styles.bannerInner,
                { paddingTop: Math.max(insets.top, 12) + 4 + 40 + 10 },
              ]}
            >
              <Text style={styles.bannerGuthen}>Discover giving</Text>
              <Text style={styles.bannerTitle}>Search campaigns</Text>
              <Text style={styles.bannerSubtitle}>
                Find a cause by name or keyword—browse the full list or narrow results as you type.
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                Keyboard.dismiss();
                onClose();
              }}
              style={[styles.bannerBackBtn, { top: Math.max(insets.top, 12) + 4 }]}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Close search"
            >
              <Ionicons name="chevron-back" size={22} color="#010D26" />
            </TouchableOpacity>
          </View>

          {/* Search field below banner (white strip — not inset with safe area at top) */}
          <View style={styles.searchStrip}>
            <View style={styles.searchField}>
              <View style={styles.searchIconWrap}>
                <Ionicons name="search" size={18} color="#246BE1" />
              </View>
              <TextInput
                ref={inputRef}
                style={styles.searchInput}
                placeholder="Search by name or keyword"
                placeholderTextColor="#94A3B8"
                value={inputValue}
                onChangeText={setInputValue}
                returnKeyType="search"
                autoCorrect={false}
                autoCapitalize="none"
                multiline={false}
                textAlignVertical="center"
                underlineColorAndroid="transparent"
                accessibilityLabel="Campaign search"
              />
              {inputValue.length > 0 ? (
                <TouchableOpacity
                  onPress={() => setInputValue("")}
                  style={styles.clearTouch}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityLabel="Clear search text"
                >
                  <Ionicons name="close-circle" size={22} color="#94A3B8" />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {loading ? (
            <View style={styles.centerState}>
              <ActivityIndicator size="large" color="#246BE1" />
              <Text style={styles.centerSub}>Loading campaigns…</Text>
            </View>
          ) : showEmpty ? (
            <View style={styles.centerState}>
              <Ionicons name="cloud-offline-outline" size={56} color="#D1D5DB" />
              <Text style={styles.centerTitle}>Couldn’t load campaigns</Text>
              <Text style={styles.centerSub}>Check your connection and try again later.</Text>
              <TouchableOpacity style={styles.secondaryBtn} onPress={onClose} activeOpacity={0.85}>
                <Text style={styles.secondaryBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={sortedList}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              ListHeaderComponent={showNoHits ? null : listHeader}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              style={styles.listFlex}
              contentContainerStyle={[
                styles.listContent,
                { paddingBottom: Math.max(insets.bottom, 20) + 8 },
              ]}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator
              initialNumToRender={12}
              windowSize={10}
              ListEmptyComponent={
                showNoHits ? (
                  <View style={styles.emptyWrap}>
                    <Ionicons name="search-outline" size={48} color="#D1D5DB" />
                    <Text style={styles.emptyTitle}>No matches</Text>
                    <Text style={styles.emptySub}>
                      Try another keyword or browse the full list by clearing the search box.
                    </Text>
                  </View>
                ) : null
              }
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  modalRoot: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    minHeight: windowHeight,
  },
  banner: {
    height: 248,
    width: "100%",
    position: "relative",
    overflow: "hidden",
  },
  bannerInner: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 20,
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
  bannerGuthen: {
    fontSize: 22,
    fontFamily: "Guthen Bloots",
    color: "#FFD602",
    marginBottom: 6,
  },
  bannerTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
    fontFamily: "AlbertSans_800ExtraBold",
    marginBottom: 6,
    letterSpacing: -0.4,
  },
  bannerSubtitle: {
    color: "#E6ECFF",
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "AlbertSans_400Regular",
  },
  searchStrip: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 2,
  },
  searchIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(36, 107, 225, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  searchField: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingLeft: 10,
    paddingRight: 8,
    height: 50,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    backgroundColor: "#F8FAFC",
  },
  listFlex: {
    flex: 1,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 15,
    color: "#0F172A",
    fontFamily: "AlbertSans_500Medium",
    paddingHorizontal: 8,
    margin: 0,
    ...Platform.select({
      ios: {
        paddingVertical: 13,
      },
      android: {
        paddingVertical: 0,
        textAlignVertical: "center",
        includeFontPadding: false,
      },
      default: {},
    }),
  },
  clearTouch: {
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingTop: 4,
    paddingHorizontal: 16,
  },
  listHeader: {
    paddingVertical: 14,
    paddingBottom: 18,
  },
  listHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  listHeaderTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#010D26",
    fontFamily: "AlbertSans_800ExtraBold",
    letterSpacing: -0.3,
  },
  listHeaderChip: {
    maxWidth: "100%",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#C7D2FE",
  },
  listHeaderChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#3730A3",
    fontFamily: "AlbertSans_600SemiBold",
  },
  listHeaderHint: {
    marginTop: 6,
    fontSize: 13,
    color: "#64748B",
    fontFamily: "AlbertSans_400Regular",
  },
  rowOuter: {
    marginBottom: 12,
    borderRadius: 18,
    backgroundColor: "#fff",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.9)",
  },
  rowOuterPressed: {
    opacity: 0.94,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingLeft: 14,
    paddingRight: 12,
    gap: 14,
  },
  rowImageWrap: {
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#EEF2FF",
    borderWidth: 1,
    borderColor: "#E0E7FF",
  },
  rowImage: {
    width: 72,
    height: 72,
    backgroundColor: "#E2E8F0",
  },
  rowBody: {
    flex: 1,
    minWidth: 0,
    paddingRight: 4,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    fontFamily: "AlbertSans_700Bold",
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  rowTitleHighlight: {
    color: "#1D4ED8",
    backgroundColor: "rgba(36, 107, 225, 0.12)",
  },
  rowMeta: {
    marginTop: 6,
    fontSize: 13,
    color: "#64748B",
    fontFamily: "AlbertSans_400Regular",
    lineHeight: 18,
  },
  rowChevronWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  separator: {
    height: 0,
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  centerTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "700",
    color: "#374151",
    fontFamily: "AlbertSans_700Bold",
    textAlign: "center",
  },
  centerSub: {
    marginTop: 8,
    fontSize: 15,
    color: "#6B7280",
    fontFamily: "AlbertSans_400Regular",
    textAlign: "center",
  },
  secondaryBtn: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#246BE1",
    borderRadius: 12,
  },
  secondaryBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
    fontFamily: "AlbertSans_700Bold",
  },
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 17,
    fontWeight: "700",
    color: "#374151",
    fontFamily: "AlbertSans_700Bold",
  },
  emptySub: {
    marginTop: 8,
    fontSize: 14,
    color: "#6B7280",
    fontFamily: "AlbertSans_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
});
