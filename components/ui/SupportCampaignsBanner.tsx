import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Image as ExpoImage } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import { fetchCampaigns } from "@/utils/api";

const { width: screenWidth } = Dimensions.get("window");

const campaigns = [
  { label: "Water", name: "Water Campaign", slug: "water-campaign", icon: "💧" },
  { label: "Zakat", name: "Zakat", slug: "zakat-al-maal", icon: "💰" },
  { label: "Aqeeqah", name: "Aqeeqah", slug: "aqeeqah", icon: "🎁" },
  { label: "Interest", name: "Interest", slug: "purify-your-wealth", icon: "📊" },
  { label: "Shelter", name: "Shelter", slug: "shelter-appeal", icon: "🏠" },
  { label: "Education", name: "Education", slug: "education-support", icon: "📚" },
  { label: "Appeals", name: "Appeals", slug: "ramadan-combo-pack", icon: "📢" },
  { label: "Health", name: "Health", slug: "health-and-medical", icon: "🏥" },
];

const amounts = [10, 25, 50, 200, 500, 1000];
const frequencies = [
  { label: "One-time", value: "onetime" },
  { label: "Monthly", value: "monthly" },
  { label: "Weekly", value: "weekly" },
];

interface SupportCampaignsBannerProps {
  onDonate?: (amount: number, frequency: string, campaign: string) => void;
  onCampaignPress?: (campaign: any) => void;
  topInset?: number;
}

export default function SupportCampaignsBanner({
  onDonate,
  onCampaignPress,
  topInset = 0,
}: SupportCampaignsBannerProps) {
  const [selectedCampaign, setSelectedCampaign] = useState(campaigns[0].slug);
  const [selectedAmount, setSelectedAmount] = useState(amounts[0]);
  const [selectedFrequency, setSelectedFrequency] = useState(frequencies[0].value);
  const [searchQuery, setSearchQuery] = useState("");
  const [allCampaigns, setAllCampaigns] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch all campaigns on mount
  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        const campaignsData = await fetchCampaigns();
        setAllCampaigns(campaignsData || []);
      } catch (error) {
        console.error("Error loading campaigns:", error);
      }
    };
    loadCampaigns();
  }, []);

  // Filter campaigns based on search query
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const filtered = allCampaigns.filter((campaign) =>
        campaign.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered.slice(0, 5)); // Limit to 5 results
      setShowDropdown(true);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  }, [searchQuery, allCampaigns]);

  const handleCampaignPress = (campaign: any) => {
    setSelectedCampaign(campaign.slug);
    onCampaignPress?.(campaign);
  };

  const handleSearchResultPress = (campaign: any) => {
    setSearchQuery("");
    setShowDropdown(false);
    router.push(`/campaign/${campaign.slug}`);
  };

  const handleDonate = () => {
    onDonate?.(selectedAmount, selectedFrequency, selectedCampaign);
  };

  return (
    <View style={styles.container}>
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
          {/* Search Bar and Notification */}
          <View style={styles.headerBar}>
            <View style={styles.searchWrapper}>
              <View style={styles.searchContainer}>
                <Feather name="search" size={16} color="#fff" />
                <TextInput
                  placeholder="Search campaigns..."
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onFocus={() => {
                    if (searchQuery.trim().length >= 2) {
                      setShowDropdown(true);
                    }
                  }}
                  onBlur={() => {
                    // Delay to allow click on dropdown item
                    setTimeout(() => setShowDropdown(false), 200);
                  }}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      setSearchQuery("");
                      setShowDropdown(false);
                    }}
                    style={styles.clearButton}
                  >
                    <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.8)" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications" size={18} color="#010D264D" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          </View>

          {/* Dropdown - rendered as sibling to appear on top */}
          {showDropdown && searchResults.length > 0 && (
            <View style={[styles.dropdown, { top: (topInset || 0) + 24 + 44 + 8 }]}>
              <ScrollView
                style={styles.dropdownScrollView}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
              >
                {searchResults.map((item, index) => (
                  <TouchableOpacity
                    key={item.id?.toString() || item.slug || index.toString()}
                    style={[
                      styles.dropdownItem,
                      index === searchResults.length - 1 && styles.dropdownItemLast,
                    ]}
                    onPress={() => handleSearchResultPress(item)}
                    activeOpacity={0.8}
                  >
                    <ExpoImage
                      source={
                        item.coverImage || item.cover_image
                          ? { uri: item.coverImage || item.cover_image }
                          : require("../../assets/card1.png")
                      }
                      style={styles.dropdownItemImage}
                      contentFit="cover"
                    />
                    <View style={styles.dropdownItemContent}>
                      <Text style={styles.dropdownItemText} numberOfLines={2}>
                        {item.name}
                      </Text>
                      {item.description && (
                        <Text style={styles.dropdownItemDescription} numberOfLines={1}>
                          {item.description.replace(/<[^>]*>/g, "").substring(0, 60)}...
                        </Text>
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#6B7280" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.content}>
            {/* Left Content */}
            <View style={styles.leftContent}>
              {/* Hero Text */}
              <View style={styles.heroTextContainer}>
                <Text style={styles.guthenText}>Making a Difference Together</Text>
                <Text style={styles.mainHeading}>Support Our Campaigns</Text>
              </View>

              {/* Campaign Pills - Commented out for now */}
              {/* <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.campaignPillsContainer}
              >
                {campaigns.map((campaign) => {
                  const isActive = selectedCampaign === campaign.slug;
                  return (
                    <TouchableOpacity
                      key={campaign.slug}
                      style={[
                        styles.campaignPill,
                        isActive && styles.campaignPillActive,
                      ]}
                      onPress={() => handleCampaignPress(campaign)}
                    >
                      <Text style={styles.campaignIcon}>{campaign.icon}</Text>
                      <Text
                        style={[
                          styles.campaignPillText,
                          isActive && styles.campaignPillTextActive,
                        ]}
                      >
                        {campaign.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView> */}
            </View>

            {/* Right Content - Donation Card */}
            <View style={styles.donationCard}>
              {/* Frequency Tabs */}
              <View style={styles.frequencyTabs}>
                {frequencies.map((freq) => (
                  <TouchableOpacity
                    key={freq.value}
                    style={[
                      styles.frequencyTab,
                      selectedFrequency === freq.value && styles.frequencyTabActive,
                    ]}
                    onPress={() => setSelectedFrequency(freq.value)}
                  >
                    <Text
                      style={[
                        styles.frequencyTabText,
                        selectedFrequency === freq.value && styles.frequencyTabTextActive,
                      ]}
                    >
                      {freq.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Amount Selection */}
              <View style={styles.amountContainer}>
                <Text style={styles.amountLabel}>Choose an amount</Text>
                <View style={styles.amountGrid}>
                  {amounts.map((amount) => (
                    <TouchableOpacity
                      key={amount}
                      style={[
                        styles.amountButton,
                        selectedAmount === amount && styles.amountButtonActive,
                      ]}
                      onPress={() => setSelectedAmount(amount)}
                    >
                      <Text
                        style={[
                          styles.amountText,
                          selectedAmount === amount && styles.amountTextActive,
                        ]}
                      >
                        ${amount}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Donate Button */}
              <TouchableOpacity
                style={styles.donateButton}
                onPress={handleDonate}
                activeOpacity={0.8}
              >
                <Ionicons name="heart" size={16} color="#010D26" />
                <Text style={styles.donateButtonText}>Donate Now</Text>
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
  },
  backgroundContainer: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
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
    marginBottom: 8,
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
  campaignPillsContainer: {
    paddingHorizontal: 4,
    gap: 8,
  },
  campaignPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    marginRight: 8,
  },
  campaignPillActive: {
    backgroundColor: "#fff",
  },
  campaignIcon: {
    fontSize: 16,
  },
  campaignPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
    fontFamily: "AlbertSans_600SemiBold",
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
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  frequencyTabActive: {
    backgroundColor: "#264B8B",
  },
  frequencyTabText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#010D26B2",
    fontFamily: "AlbertSans_600SemiBold",
  },
  frequencyTabTextActive: {
    color: "#fff",
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
  },
  amountButton: {
    width: (screenWidth - 80) / 3,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  amountButtonActive: {
    backgroundColor: "#264B8B",
  },
  amountText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#010D26",
    fontFamily: "AlbertSans_600SemiBold",
  },
  amountTextActive: {
    color: "#fff",
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
  donateButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#010D26",
    fontFamily: "AlbertSans_700Bold",
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 12,
  },
  searchWrapper: {
    flex: 1,
    position: "relative",
  },
  searchContainer: {
    flex: 1,
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "AlbertSans_500Medium",
  },
  clearButton: {
    padding: 4,
  },
  dropdown: {
    position: "absolute",
    left: 16,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 30,
    maxHeight: 400,
    overflow: "hidden",
    zIndex: 99999,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  dropdownScrollView: {
    maxHeight: 400,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    gap: 12,
  },
  dropdownItemLast: {
    borderBottomWidth: 0,
  },
  dropdownItemImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  dropdownItemContent: {
    flex: 1,
    gap: 4,
  },
  dropdownItemText: {
    fontSize: 15,
    color: "#010D26",
    fontWeight: "600",
    fontFamily: "AlbertSans_600SemiBold",
    lineHeight: 20,
  },
  dropdownItemDescription: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "400",
    fontFamily: "AlbertSans_400Regular",
    lineHeight: 16,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,1)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderWidth: 2,
    borderColor: "#010D261A",
  },
  notificationDot: {
    position: "absolute",
    top: 1,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#DD4344",
  },
});
