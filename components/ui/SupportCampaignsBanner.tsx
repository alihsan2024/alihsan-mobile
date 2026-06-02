import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Keyboard,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Image as ExpoImage } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import { fetchCampaigns } from "@/utils/api";
import CampaignSearchModal from "@/components/ui/CampaignSearchModal";
import FeaturedStoryBubble from "@/components/stories/FeaturedStoryBubble";

const { width: screenWidth } = Dimensions.get("window");
/** Inner width under gradient (16) + card (16) horizontal padding; two 8px gaps between 3 columns. */
const AMOUNT_GRID_INNER = screenWidth - 64;
const AMOUNT_CELL_WIDTH = Math.floor((AMOUNT_GRID_INNER - 16) / 3);

// Campaign pills under "Support Our Campaigns". Pills set quick-donate campaign; search can still open any campaign.
const campaigns = [
  { label: "Where Most Needed", name: "Where Most Needed In Ramadan", slug: "most-needed", icon: "megaphone", isSpecial: false },
  { label: "Zakat Al Maal", name: "Zakat Al Maal", slug: "zakat-al-maal", icon: "cash", isSpecial: false },
  { label: "Feed the Needy", name: "Feed the Needy", slug: "feed-the-needy", icon: "restaurant", isSpecial: false },
  { label: "Gift of Sight", name: "Gift of Sight", slug: "eye-project", icon: "eye", isSpecial: false },
  { label: "Orphan Appeal", name: "Orphan Appeal", slug: "orphan-appeal", icon: "people", isSpecial: false },
  { label: "Water", name: "Water Campaign", slug: "water-campaign", icon: "water", isSpecial: false },
  { label: "Emergency Appeal", name: "Emergency Appeal", slug: "emergency-appeal", icon: "warning", isSpecial: false },
];

/** Max six presets — 3 per row × 2 rows (Group A uses fixed price in own card). */
const amounts = [10, 25, 50, 200, 500, 1000];
const frequencies = [
  { label: "One-time", value: "onetime" },
  { label: "Monthly", value: "monthly" },
  { label: "Fridays", value: "friday" },
];

/** Campaign shape sufficient for adding to basket (id, name, coverImage, checkoutType). */
export type SupportCampaignForDonate = {
  id: number;
  name: string;
  slug: string;
  coverImage?: string | null;
  checkoutType?: string | null;
};

interface SupportCampaignsBannerProps {
  onDonate?: (amount: number, frequency: string, campaignSlug: string, campaign?: SupportCampaignForDonate | null) => void;
  onCampaignPress?: (campaign: any) => void;
  onMenuPress?: () => void;
  topInset?: number;
  /** Bump when `/stories` was invalidated — Featured bubble refetches full list. */
  storyRefreshSignal?: number;
}

export default function SupportCampaignsBanner({
  onDonate,
  onCampaignPress,
  onMenuPress,
  topInset = 0,
  storyRefreshSignal = 0,
}: SupportCampaignsBannerProps) {
  const [selectedCampaign, setSelectedCampaign] = useState("most-needed");
  const [selectedAmount, setSelectedAmount] = useState(50);
  const [selectedFrequency, setSelectedFrequency] = useState(frequencies[0].value);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [allCampaigns, setAllCampaigns] = useState<any[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [pillsAtEnd, setPillsAtEnd] = useState(false);

  // Fetch all campaigns on mount
  useEffect(() => {
    const loadCampaigns = async () => {
      setCampaignsLoading(true);
      try {
        const campaignsData = await fetchCampaigns();
        setAllCampaigns(campaignsData || []);
      } catch (error) {
        console.error("Error loading campaigns:", error);
      } finally {
        setCampaignsLoading(false);
      }
    };
    loadCampaigns();
  }, []);

  const handlePillPress = (campaign: (typeof campaigns)[number]) => {
    setSelectedCampaign(campaign.slug);
    setSelectedAmount((prev) => (amounts.includes(prev) ? prev : 50));
  };

  const navigateToCampaign = (campaign: any) => {
    Keyboard.dismiss();
    if (campaign.slug === "gaza-ramadan") {
      router.push("/(tabs)/gaza-ramadan");
    } else if (campaign.slug === "ramadan") {
      router.push("/(tabs)/ramadan");
    } else if (campaign.slug === "qurban" || campaign.slug === "qurban-2026") {
      router.push("/(tabs)/qurban-2026");
    } else {
      router.push(`/campaign/${campaign.slug}`);
    }
  };

  const handleDonate = () => {
    const campaign = allCampaigns.find((c) => (c.slug || c.Slug) === selectedCampaign);
    const campaignForBasket =
      campaign && campaign.id
        ? {
            id: campaign.id,
            name: campaign.name ?? campaign.Name,
            slug: campaign.slug ?? campaign.Slug ?? selectedCampaign,
            coverImage: campaign.coverImage ?? campaign.cover_image ?? null,
            checkoutType: campaign.checkoutType ?? campaign.CheckoutType ?? "COMMON",
          }
        : null;
    onDonate?.(selectedAmount, selectedFrequency, selectedCampaign, campaignForBasket);
  };

  return (
    <View style={styles.container}>
      <CampaignSearchModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
        onSelectCampaign={(campaign) => {
          setSearchModalVisible(false);
          navigateToCampaign(campaign);
        }}
        campaigns={allCampaigns}
        loading={campaignsLoading}
      />
      {/* Background with gradient */}
      <View style={styles.backgroundContainer}>
        <ExpoImage
          source={{
            uri: "https://alihsan.s3.ap-southeast-2.amazonaws.com/gaza/1766468664003-alihsan-IMG_3894%20-%20Blog%201.JPG",
          }}
          style={styles.backgroundImage}
          contentFit="cover"
        />
        {/* Blue Gradient Overlay */}
        <LinearGradient
          colors={["rgba(36, 107, 225, 1)", "rgba(36, 107, 225, 0.5)", "rgba(36, 107, 225, 0.1)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradient, { paddingTop: (topInset || 0) + 24 }]}
        >
          {/* Hamburger opens the side menu; search opens the campaign
              search modal; featured bubble opens last-24h stories. */}
          <View style={styles.headerBar}>
            {onMenuPress ? (
              <TouchableOpacity
                style={styles.menuButton}
                onPress={onMenuPress}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Open menu"
              >
                <Ionicons name="menu" size={24} color="#fff" />
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              style={styles.searchTrigger}
              onPress={() => setSearchModalVisible(true)}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Search campaigns"
              accessibilityHint="Opens a full screen search to find campaigns by name or keyword"
            >
              <Feather name="search" size={16} color="#fff" importantForAccessibility="no" />
              <View style={styles.searchTriggerTextWrap}>
                <Text
                  style={styles.searchTriggerText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  maxFontSizeMultiplier={1.15}
                  {...(Platform.OS === "ios"
                    ? { adjustsFontSizeToFit: true, minimumFontScale: 0.85 }
                    : {})}
                  {...(Platform.OS === "android" ? { textBreakStrategy: "simple" as const } : {})}
                >
                  Search campaigns
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.85)" />
            </TouchableOpacity>
            <FeaturedStoryBubble refreshSignal={storyRefreshSignal} />
          </View>

          <View style={styles.content}>
            {/* Left Content */}
            <View style={styles.leftContent}>
              {/* Hero Text */}
              <View style={styles.heroTextContainer}>
                <Text style={styles.guthenText}>Making a Difference Together</Text>
                <Text style={styles.mainHeading}>Support Our Campaigns</Text>
              </View>

              {/* Campaign Pills - compact, full-width scroll; white fade on right until scrolled to end */}
              <View style={styles.campaignPillsWrap}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.campaignPillsContent}
                  style={styles.campaignPillsScroll}
                  onScroll={(e) => {
                    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
                    const atEnd = layoutMeasurement.width + contentOffset.x >= contentSize.width - 8;
                    setPillsAtEnd(atEnd);
                  }}
                  scrollEventThrottle={16}
                >
                  {campaigns.map((campaign) => {
                    const isActive = selectedCampaign === campaign.slug;
                    const isSpecial = campaign.isSpecial;
                    return (
                      <TouchableOpacity
                        key={campaign.slug}
                        style={[
                          styles.campaignPill,
                          isSpecial && styles.campaignPillSpecial,
                          isActive && !isSpecial && styles.campaignPillActive,
                          isActive && isSpecial && styles.campaignPillSpecialActive,
                        ]}
                        onPress={() => handlePillPress(campaign)}
                        activeOpacity={0.85}
                      >
                        <Ionicons
                          name={
                            campaign.icon === "flame" ? "flame" :
                            campaign.icon === "megaphone" ? "megaphone" :
                            campaign.icon === "cash" ? "cash" :
                            campaign.icon === "restaurant" ? "nutrition" :
                            campaign.icon === "eye" ? "eye" :
                            campaign.icon === "people" ? "people" :
                            campaign.icon === "water" ? "water" :
                            "warning"
                          }
                          size={12}
                          color={isSpecial ? "#010D26" : isActive ? "#010D26" : "#fff"}
                        />
                        <Text
                          style={[
                            styles.campaignPillText,
                            isSpecial && styles.campaignPillTextSpecial,
                            isActive && !isSpecial && styles.campaignPillTextActive,
                          ]}
                          numberOfLines={1}
                        >
                          {campaign.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
                {!pillsAtEnd && (
                  <LinearGradient
                    colors={["transparent", "#E5E7EB"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.campaignPillsFade}
                    pointerEvents="none"
                  />
                )}
              </View>
            </View>

            {/* Right Content — quick donate */}
            <View style={styles.donationCard}>
                  {/* Frequency Tabs */}
                  <View style={styles.frequencyTabs}>
                    {frequencies.map((freq) => {
                      const isSelected = selectedFrequency === freq.value;
                      return (
                        <TouchableOpacity
                          key={freq.value}
                          style={styles.frequencyTab}
                          onPress={() => setSelectedFrequency(freq.value)}
                          activeOpacity={0.85}
                        >
                          {isSelected ? (
                            <LinearGradient
                              colors={["#246BE1", "#064DC3"]}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 0, y: 1 }}
                              style={styles.frequencyTabGradient}
                            >
                              <Text style={styles.frequencyTabTextActive}>
                                {freq.label}
                              </Text>
                            </LinearGradient>
                          ) : (
                            <Text style={styles.frequencyTabText}>
                              {freq.label}
                            </Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Amount Selection */}
                  <View style={styles.amountContainer}>
                    <Text style={styles.amountLabel}>Choose an amount</Text>
                    <View style={styles.amountGrid}>
                      {amounts.map((amount) => {
                        const isSelected = selectedAmount === amount;
                        return (
                          <TouchableOpacity
                            key={amount}
                            style={styles.amountButton}
                            onPress={() => setSelectedAmount(amount)}
                            activeOpacity={0.85}
                          >
                            {isSelected ? (
                              <LinearGradient
                                colors={["#246BE1", "#064DC3"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 0, y: 1 }}
                                style={styles.amountGradient}
                              >
                                <Text style={styles.amountTextActive}>
                                  ${amount}
                                </Text>
                              </LinearGradient>
                            ) : (
                              <Text style={styles.amountText}>
                                ${amount}
                              </Text>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* Donate Button */}
                  <TouchableOpacity
                    style={[styles.donateButton, campaignsLoading && styles.donateButtonDisabled]}
                    onPress={handleDonate}
                    activeOpacity={0.8}
                    disabled={campaignsLoading}
                  >
                    {campaignsLoading ? (
                      <>
                        <ActivityIndicator size="small" color="#2161CD" />
                        <Text style={styles.donateButtonText} numberOfLines={1}>
                          Loading...
                        </Text>
                      </>
                    ) : (
                      <>
                        <Ionicons name="heart" size={16} color="#010D26" />
                        <Text style={styles.donateButtonText} numberOfLines={1}>
                          Donate to {campaigns.find((c) => c.slug === selectedCampaign)?.label ?? "Campaign"}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    minHeight: 550,
    position: "relative",
    overflow: "visible",
  },
  backgroundContainer: {
    width: "100%",
    minHeight: 550,
    position: "relative",
    overflow: "hidden",
  },
  backgroundImage: {
    width: "100%",
    minHeight: 550,
    position: "absolute",
    top: 0,
    left: 0,
  },
  gradient: {
    width: "100%",
    minHeight: 550,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
    position: "relative",
    zIndex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    gap: 12,
  },
  leftContent: {
    flex: 1,
    justifyContent: "center",
  },
  heroTextContainer: {
    alignItems: "flex-start",
    marginBottom: 12,
  },
  guthenText: {
    fontSize: 20,
    fontFamily: "Guthen Bloots",
    color: "#FFD602",
    marginBottom: 1,
    textAlign: "left",
  },
  mainHeading: {
    fontSize: 36,
    fontWeight: "800",
    color: "#fff",
    fontFamily: "AlbertSans_800ExtraBold",
    textAlign: "left",
    lineHeight: 40,
  },
  campaignPillsWrap: {
    position: "relative",
    width: screenWidth,
    marginLeft: -16,
  },
  campaignPillsScroll: {
    width: screenWidth,
  },
  campaignPillsContent: {
    paddingLeft: 16,
    paddingRight: 24,
    gap: 6,
    paddingVertical: 2,
  },
  campaignPillsFade: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 48,
  },
  campaignPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  campaignPillSpecial: {
    backgroundColor: "#FFD602",
    borderWidth: 1.5,
    borderColor: "rgba(230, 194, 0, 0.8)",
  },
  campaignPillSpecialActive: {
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  campaignPillActive: {
    backgroundColor: "#fff",
  },
  campaignPillText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
    fontFamily: "AlbertSans_600SemiBold",
  },
  campaignPillTextSpecial: {
    color: "#010D26",
    fontWeight: "700",
    fontFamily: "AlbertSans_700Bold",
  },
  campaignPillTextActive: {
    color: "#010D26",
  },
  donationCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  frequencyTabs: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  frequencyTab: {
    flex: 1,
    borderRadius: 8,
    overflow: "hidden",
  },
  frequencyTabGradient: {
    width: "100%",
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  frequencyTabText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#010D26B2",
    fontFamily: "AlbertSans_600SemiBold",
    paddingVertical: 10,
    textAlign: "center",
  },
  frequencyTabTextActive: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "AlbertSans_700Bold",
  },
  amountContainer: {
    marginBottom: 16,
  },
  amountLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#010D26",
    marginBottom: 12,
    fontFamily: "AlbertSans_700Bold",
  },
  amountGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "flex-start",
  },
  amountButton: {
    width: AMOUNT_CELL_WIDTH,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  amountGradient: {
    width: "100%",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  amountText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#010D26",
    fontFamily: "AlbertSans_600SemiBold",
    paddingVertical: 12,
  },
  amountTextActive: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "AlbertSans_700Bold",
  },
  donateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFD602",
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  donateButtonDisabled: {
    opacity: 0.85,
  },
  donateButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#010D26",
    fontFamily: "AlbertSans_700Bold",
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 10,
    zIndex: 10,
  },
  helpButton: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.58)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
  },
  menuButton: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.58)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
  },
  searchTrigger: {
    flex: 1,
    height: 50,
    maxHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.58)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
    overflow: "hidden",
  },
  searchTriggerTextWrap: {
    flex: 1,
    minWidth: 0,
    height: 50,
    justifyContent: "center",
    overflow: "hidden",
  },
  searchTriggerText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "AlbertSans_600SemiBold",
    lineHeight: Platform.OS === "android" ? 18 : 16,
    paddingVertical: 0,
    ...Platform.select({
      android: { includeFontPadding: false },
      default: {},
    }),
  },
});
