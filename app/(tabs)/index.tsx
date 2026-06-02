import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
  TextInput,
  ScrollView,
  Animated,
  ActivityIndicator,
  RefreshControl,
  Keyboard,
} from "react-native";
import { Image as ExpoImage } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { useEffect, useState, useRef, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import ImageSlider from "@/components/ui/sliders/ImageSlider";
import CampaignSlider from "@/components/ui/sliders/CampaignSlider";
import ReplaceOrRemoveModal from "@/components/ui/Modals/ReplaceOrRemoveModal";
import { router } from "expo-router";
import {
  fetchFeaturedCampaigns,
  getCampaignDetails,
  invalidateStoriesCache,
} from "@/utils/api";
import { useStoriesVersionPoll } from "@/hooks/useStoriesVersionPoll";
import {
  useAddToBasketMutation,
  useGetBasketQuery,
  useRemoveFromBasketMutation,
} from "@/store/reduxSlice/api/basketApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSelector } from "react-redux";
import SupportCampaignsBanner from "@/components/ui/SupportCampaignsBanner";
import QuickLinks from "@/components/ui/QuickLinks";
import CommunityImpactVideo from "@/components/ui/CommunityImpactVideo";
import StayConnectedSection, {
  type StayConnectedSectionRef,
} from "@/components/ui/StayConnectedSection";
import StoryRing from "@/components/stories/StoryRing";
import SideMenu from "@/components/ui/SideMenu";
import { useToast } from "@/context/ToastContext";

const ICON_SIZE = 16;
const SIDE_BUTTON_WIDTH = 60;
const PADDING_HORIZONTAL = 20;
const screenWidth = Dimensions.get("window").width;
const HEADER_HEIGHT = 64;

const SLIDER_DATA = [
  {
    id: 1,
    title: "Food Packs",
    image: require("../../assets/FeaturedIcons/FoodPacks.png"),
  },
  {
    id: 2,
    title: "Sponsorship",
    image: require("../../assets/FeaturedIcons/Sponsorships.png"),
  },
  {
    id: 3,
    title: "Gaza Winter",
    image: require("../../assets/FeaturedIcons/WinterAppeal.png"),
  },
  {
    id: 4,
    title: "Gift of Sight",
    image: require("../../assets/FeaturedIcons/GiftOfSight.png"),
  },
];

const campaigns = [
  {
    id: 1,
    image: require("../../assets/card1.png"),
    title: "Help Children in Need",
    donors: 120,
    status: "Ongoing",
    amountRaised: "$5,000",
    goal: "$10,000",
  },
  {
    id: 2,
    image: require("../../assets/card1.png"),
    title: "Support Animal Shelter",
    donors: 85,
    status: "Ongoing",
    amountRaised: "$3,200",
    goal: "$5,000",
  },
  {
    id: 3,
    image: require("../../assets/card1.png"),
    title: "Plant 1000 Trees",
    donors: 200,
    status: "Ongoing",
    amountRaised: "$8,000",
    goal: "$8,000",
  },
];

const BUTTONS = [
  { name: "Waterwells", icon: "droplet" },
  { name: "Zakat", icon: "dollar-sign" },
  { name: "Aqeeqah", icon: "gift" },
  { name: "Interest", icon: "percent" },
  { name: "Zakat Aqeeqah Interest", icon: "layers" },
  { name: "Aqeeqah", icon: "gift" },
  { name: "Waterwells", icon: "droplet" },
  { name: "Zakat", icon: "dollar-sign" },
];

const GIVING_OPTIONS = ["One-time", "Monthly", "Friday"];
const AMOUNTS = [10, 30, 50];

const CARDS = [
  {
    id: 1,
    title: "Al-Ihsan Kitchen",
    image: require("../../assets/card1.png"),
  },
  {
    id: 2,
    title: "Feed the Needy",
    image: require("../../assets/card2.png"),
  },
  {
    id: 3,
    title: "Gift of Sight",
    image: require("../../assets/card1.png"),
  },
  {
    id: 4,
    title: "Feed the Needy",
    image: require("../../assets/card2.png"),
  },
];


export type CampaignItem = {
  id: string | number;
  slug: string;
  image: any;
  title: string;
  donors: number;
  status: string;
  amountRaised: string;
  goal: string;
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const screenHeight = Dimensions.get("window").height;
  const scrollViewRef = useRef<ScrollView>(null);
  const stayConnectedRef = useRef<StayConnectedSectionRef>(null);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(0);
  const [selectedGiving, setSelectedGiving] = useState<number>(0);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(10);
  const [customAmount, setCustomAmount] = useState<string>("");
  const givingAnimation = useRef(new Animated.Value(0)).current;
  const [featuredCampaigns, setFeaturedCampaigns] = useState<CampaignItem[]>(
    []
  );
  const [isLoadingFeaturedCampaigns, setIsLoadingFeaturedCampaigns] =
    useState(false);
  const [featuredCampaignsError, setFeaturedCampaignsError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const lastRefreshTimeRef = useRef<number>(0);
  const isRefreshingRef = useRef<boolean>(false);
  const { user } = useSelector((state: any) => state.authentication);
  const isAuthenticated = !!user;

  const [addToBasket] = useAddToBasketMutation();
  const [removeFromBasket] = useRemoveFromBasketMutation();
  const { data: basketData, refetch: refetchBasket } = useGetBasketQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [guestBasket, setGuestBasket] = useState<any[]>([]);
  const [addingToCart, setAddingToCart] = useState(false);
  const [replaceModalVisible, setReplaceModalVisible] = useState(false);
  const [pendingBasketItem, setPendingBasketItem] = useState<any>(null);
  const [existingCartItem, setExistingCartItem] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [storiesRefreshSignal, setStoriesRefreshSignal] = useState(0);
  const { showToast } = useToast();

  useStoriesVersionPoll(() => setStoriesRefreshSignal((n) => n + 1));

  // Load guest basket helper
  const loadGuestBasket = useCallback(async () => {
    if (!isAuthenticated) {
      const data = await AsyncStorage.getItem("guestBasket");
      setGuestBasket(data ? JSON.parse(data) : []);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadGuestBasket();
  }, [loadGuestBasket]);

  // Load featured campaigns function
  const loadFeaturedCampaigns = useCallback(async () => {
    try {
      setIsLoadingFeaturedCampaigns(true);
      const campaigns = await fetchFeaturedCampaigns();
      
      // Transform API response to match CampaignItem interface
      const transformedCampaigns: CampaignItem[] = campaigns.map((campaign: any) => ({
        id: campaign.id,
        slug: campaign.slug,
        image: { uri: campaign.coverImage },
        title: campaign.name,
        donors: Number(campaign.donor_count || campaign.donorCount || 0),
        status: "Ongoing",
        amountRaised: `$${Number(campaign.amountDonated || 0).toLocaleString()}`,
        goal: `$${Number(campaign.mobileGoalAmount || campaign.fundraiserGoal || 0).toLocaleString()}`,
      }));

      setFeaturedCampaigns(transformedCampaigns);
      setFeaturedCampaignsError(null);
    } catch (error: any) {
      console.error("Error loading featured campaigns:", error);
      setFeaturedCampaigns([]);
      const errorMessage = error?.message || "Failed to load campaigns";
      setFeaturedCampaignsError(
        errorMessage.includes("Network") || errorMessage.includes("network") || errorMessage.includes("timeout")
          ? "Unable to load featured campaigns. Please check your internet connection."
          : "Unable to load featured campaigns. Please try again later."
      );
    } finally {
      setIsLoadingFeaturedCampaigns(false);
    }
  }, []);

  // Reload basket when screen comes into focus; blur email input when leaving
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        refetchBasket();
      } else {
        loadGuestBasket();
      }
      // Scroll to top when screen comes into focus
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      return () => {
        stayConnectedRef.current?.blur();
        Keyboard.dismiss();
      };
    }, [isAuthenticated, refetchBasket, loadGuestBasket])
  );

  useEffect(() => {
    loadFeaturedCampaigns();
  }, [loadFeaturedCampaigns]);

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    // Prevent spam: Don't allow refresh if one is already in progress
    if (isRefreshingRef.current) {
      return;
    }

    // Prevent spam: Check if enough time has passed since last refresh (10 seconds cooldown)
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshTimeRef.current;
    const COOLDOWN_PERIOD = 10000; // 10 seconds

    if (timeSinceLastRefresh < COOLDOWN_PERIOD) {
      // Still in cooldown, ignore the refresh request
      return;
    }

    // Update last refresh time and set refreshing state
    lastRefreshTimeRef.current = now;
    isRefreshingRef.current = true;
    setRefreshing(true);

    try {
      invalidateStoriesCache();
      setStoriesRefreshSignal((n) => n + 1);

      // Add minimum delay to ensure indicator is visible
      const minDelay = new Promise((resolve) => setTimeout(resolve, 1500));

      // Refresh featured campaigns and basket in parallel
      await Promise.all([
        loadFeaturedCampaigns(),
        isAuthenticated ? refetchBasket() : loadGuestBasket(),
        minDelay,
      ]);
    } catch (error) {
      console.error("Error refreshing:", error);
    } finally {
      isRefreshingRef.current = false;
      setRefreshing(false);
    }
  }, [loadFeaturedCampaigns, isAuthenticated, refetchBasket, loadGuestBasket]);

  const handleAmountPress = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount(""); // clear custom input
  };

  const handleCampaignPress = (item: CampaignItem) => {
    router.push(`/campaign/${item.slug}`);
  };

  const { height: windowHeight } = Dimensions.get("window");

  return (
    <>
    <ScrollView
      ref={scrollViewRef}
      style={{
        flex: 1,
        backgroundColor: "#fff",
      }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentContainerStyle={{
        flexGrow: 1,
        paddingBottom: 0,
        minHeight: windowHeight + 1,
      }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#2161CD"
          colors={["#2161CD"]}
          progressBackgroundColor="#FFFFFF"
          progressViewOffset={insets.top}
          titleColor="#2161CD"
        />
      }
      bounces={true}
      alwaysBounceVertical={true}
      scrollEnabled={true}
      overScrollMode="always"
    >
      {/* Top Banner Section - "Making a Difference Together" / "Support Our Campaigns" */}
      <SupportCampaignsBanner
        topInset={insets.top}
        storyRefreshSignal={storiesRefreshSignal}
        onMenuPress={() => setMenuOpen(true)}
        onCampaignPress={(campaign) => {
          router.push(`/campaign/${campaign.slug}`);
        }}
        onDonate={async (amount, frequency, campaignSlug, campaignFromList) => {
          try {
            setAddingToCart(true);

            // Use already-fetched campaign when available (Support Our Campaigns); otherwise fetch details
            let campaign = campaignFromList ?? null;
            if (!campaign?.id) {
              const campaignData = await getCampaignDetails(campaignSlug);
              campaign = campaignData?.campaign || campaignData;
            }

            if (!campaign?.id) {
              showToast({
                message: "Campaign not found",
                type: "error",
              });
              return;
            }

            // Calculate period days based on frequency (9 = every Friday)
            const periodDays = frequency === "monthly" ? 30 : frequency === "friday" ? 9 : 0;
            const isRecurring = frequency === "monthly" || frequency === "friday";

            // Refresh basket data before checking
            let currentBasketItems: any[] = [];
            if (isAuthenticated) {
              const result = await refetchBasket();
              currentBasketItems = result.data?.payload ?? [];
            } else {
              // Load directly from AsyncStorage to get latest data
              const data = await AsyncStorage.getItem("guestBasket");
              currentBasketItems = data ? JSON.parse(data) : [];
              setGuestBasket(currentBasketItems);
            }

            const existingItem = currentBasketItems.find(
              (item: any) => item.campaignId === campaign.id
            );

            const basketItem = {
              campaignId: campaign.id,
              amount: amount,
              quantity: 1,
              name: campaign.name,
              coverImage: campaign.coverImage,
              checkoutType: campaign.checkoutType || "COMMON",
              periodDays: periodDays,
              isRecurring: isRecurring,
            };

            if (existingItem) {
              // Show modal to replace or remove
              setExistingCartItem(existingItem);
              setPendingBasketItem(basketItem);
              setReplaceModalVisible(true);
              setAddingToCart(false);
              return;
            }

            // Add to cart if not already there
            if (isAuthenticated) {
              await addToBasket({ body: basketItem });
            } else {
              const updated = [...guestBasket, basketItem];
              setGuestBasket(updated);
              await AsyncStorage.setItem("guestBasket", JSON.stringify(updated));
            }

            showToast({
              message: "Your donation has been added to the cart",
              type: "success",
              action: {
                label: "View Cart",
                onPress: () => router.push("/(tabs)/cart"),
              },
            });
          } catch (error: any) {
            console.error("Donation error:", error);
            showToast({
              message: error?.message || "Failed to add to cart",
              type: "error",
            });
          } finally {
            setAddingToCart(false);
          }
        }}
      />

      <ReplaceOrRemoveModal
        visible={replaceModalVisible}
        campaignName={pendingBasketItem?.name}
        onCancel={() => {
          setReplaceModalVisible(false);
          setPendingBasketItem(null);
          setExistingCartItem(null);
        }}
        onReplace={async () => {
          if (!pendingBasketItem || !existingCartItem) return;

          try {
            setAddingToCart(true);
            setReplaceModalVisible(false);

            // Remove existing item
            if (isAuthenticated) {
              await removeFromBasket({
                campaignId: existingCartItem.campaignId,
                orphanId: existingCartItem.orphanId,
                donationItem: existingCartItem.donationItem,
              });
              await refetchBasket();
            } else {
              const updated = guestBasket.filter(
                (item: any) => item.campaignId !== existingCartItem.campaignId
              );
              setGuestBasket(updated);
              await AsyncStorage.setItem("guestBasket", JSON.stringify(updated));
            }

            // Add new item
            if (isAuthenticated) {
              await addToBasket({ body: pendingBasketItem });
              await refetchBasket();
            } else {
              const updated = [...guestBasket.filter(
                (item: any) => item.campaignId !== existingCartItem.campaignId
              ), pendingBasketItem];
              setGuestBasket(updated);
              await AsyncStorage.setItem("guestBasket", JSON.stringify(updated));
            }

            showToast({
              message: "Campaign replaced in cart",
              type: "success",
              action: {
                label: "View Cart",
                onPress: () => router.push("/(tabs)/cart"),
              },
            });
          } catch (error: any) {
            showToast({
              message: error?.message || "Failed to replace item",
              type: "error",
            });
          } finally {
            setAddingToCart(false);
            setPendingBasketItem(null);
            setExistingCartItem(null);
          }
        }}
      />

      {/* Main content */}
      <View style={{ paddingTop: 8 }}>
        {/* Categories Section - Below Banner */}
        <View
          style={{
            backgroundColor: "#fff",
            paddingTop: 12,
            paddingHorizontal: PADDING_HORIZONTAL,
            marginTop: 0,
          }}
        >
          <ImageSlider
            data={SLIDER_DATA}
            onPress={(item) => {
              switch (item.title) {
                case "Food Packs":
                  router.push("/campaign/gaza");
                  break;
                case "Sponsorship":
                  router.push("/orphans-list");
                  break;
                case "Gaza Winter":
                  router.push("/campaign/gaza-winter");
                  break;
                case "Gift of Sight":
                  router.push("/campaign/eye-project");
                  break;
                default:
                  console.log("Pressed:", item.title);
              }
            }}
          />
        </View>

        {/* Latest Stories — below categories */}
        <StoryRing refreshSignal={storiesRefreshSignal} />

        <View
          style={{
            height: 1,
            backgroundColor: "#E0E0E0",
            marginBottom: 18,
            marginTop: 20,
            width: screenWidth,
          }}
        />

        {/* Featured Campaigns Section */}
        <View style={{ paddingHorizontal: PADDING_HORIZONTAL, marginBottom: 16 }}>
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <Text
                style={{
                  fontSize: 28,
                  color: "#010D26",
                  fontWeight: "800",
                  fontFamily: "AlbertSans_800ExtraBold",
                }}
              >
                Featured Campaigns
              </Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/campaigns")}>
                <Text style={{ color: "#010D26", fontSize: 14, fontWeight: "600" }}>See All</Text>
              </TouchableOpacity>
            </View>

            {isLoadingFeaturedCampaigns ? (
              <View style={{ paddingVertical: 20, alignItems: "center" }}>
                <ActivityIndicator size="small" color="#2161CD" />
              </View>
            ) : featuredCampaignsError ? (
              <View style={{ paddingVertical: 16, paddingHorizontal: 16, backgroundColor: "#FEF2F2", borderRadius: 8, marginTop: 8 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
                  <Text style={{ fontSize: 13, color: "#DC2626", fontFamily: "AlbertSans_500Medium", flex: 1 }}>
                    {featuredCampaignsError}
                  </Text>
                </View>
              </View>
            ) : featuredCampaigns.length > 0 ? (
              <CampaignSlider
                data={featuredCampaigns}
                onPress={handleCampaignPress}
              />
            ) : null}
          </View>
        </View>

        {/* Quick Links Section */}
        <QuickLinks />

        {/* Community Impact Video Section */}
        <View style={{ paddingHorizontal: PADDING_HORIZONTAL, marginTop: 24, marginBottom: 24 }}>
          <CommunityImpactVideo
            videoUrl="https://alihsan.s3.ap-southeast-2.amazonaws.com/Ramadan+sadaqah+2+16x9.mp4"
            backgroundImage="https://alihsan.s3.ap-southeast-2.amazonaws.com/projects/dac1a675d19a0d43be37299aebb6dd02.jpg"
            coverImage="https://alihsan.s3.ap-southeast-2.amazonaws.com/media/1765499530018-alihsan-Sri%20Lanka%20Flood.jpeg"
            title="Community Impact"
            headline="Millions are facing hardship. Be the one who brings ease."
            subheadline="Meet the passionate individuals working together to bring kindness, care, and impact to every community we touch."
          />
        </View>

        {/* Stay connected and inspire change with Al-Ihsan - matches AU Next.js */}
        <StayConnectedSection ref={stayConnectedRef} />
      </View>
    </ScrollView>

    <SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "70%",
  },
  headerBar: {
    height: HEADER_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  heroTextContainer: {
    marginTop: 4,
    marginBottom: 16,
  },

  heroTitle: {
    fontSize: 56,
    fontWeight: "800",
    color: "#fff",
    lineHeight: 60,
    fontFamily: "AlbertSans_800ExtraBold",
  },

  heroSubtitle: {
    fontSize: 30,
    fontWeight: "600",
    color: "#fff",
    opacity: 0.9,
    marginTop: 4,
  },

  searchContainer: {
    flex: 1,
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.50)",
  },

  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },

  notificationButton: {
    width: 44,
    height: 44,
    marginLeft: 12,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255)",
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

  header: {
    height: HEADER_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sideContainer: {
    width: SIDE_BUTTON_WIDTH,
    alignItems: "center",
    justifyContent: "center",
  },
  logoWrapper: {
    flex: 1,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  amountButton: {
    width: "32%",
    height: 45,
    borderRadius: 10,
    backgroundColor: "rgba(38,75,139,0.1)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden", // important for gradient clipping
  },

  amountGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  amountText: {
    fontWeight: "600",
    color: "#264B8B",
  },

  amountTextSelected: {
    color: "#fff",
    fontWeight: "700",
  },

  logo: { width: "100%", height: "100%" },
  menuButton: {
    width: 50,
    height: 50,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 8,
    columnGap: 8,
    marginBottom: 4,
  },
  gridButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    height: 36,
    borderRadius: 10,
    justifyContent: "flex-start",
    alignSelf: "flex-start",
  },
  gridButtonSelected: { backgroundColor: "#fff" },
  gridButtonUnselected: { backgroundColor: "rgba(255,255,255,0.3)" },
  buttonContent: { flexDirection: "row", alignItems: "center" },
  buttonText: {
    marginLeft: 4,
    fontSize: 10,
    color: "#fff",
    fontWeight: "700",
    flexShrink: 1,
  },
  headerImage: {
    width: "100%",
    height: 200,
    alignSelf: "center",
    marginBottom: 4,
  },
  givingContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
    marginTop: 8,
    padding: 6,
    gap: 6,
  },
  givingButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  givingButtonSelected: {
    backgroundColor: "#fff",
  },
  givingText: { color: "#fff", fontWeight: "600" },
  amountContainer: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  amountTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#264B8B",
    marginBottom: 10,
  },
  amountGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    gap: 8,
  },

  amountButtonSelected: { backgroundColor: "#264B8B" },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(38,75,139,0.3)",
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 45,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  inputLeft: { color: "#264B8B", fontWeight: "600", marginRight: 8 },
  inputMiddle: { flex: 1, height: "100%", color: "#264B8B" },
  inputRight: { color: "#264B8B", fontWeight: "600", marginLeft: 8 },
  donateButton: {
    backgroundColor: "#FFD602",
    borderRadius: 10,
    height: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBgColor: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "#246BE1", // your requested color
  },

  leftFade: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%", // only fade left half
    height: "100%",
  },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  categoryCard: {
    width: "22%",
    alignItems: "center",
  },

  categoryImageWrapper: {
    width: "100%",
    height: 90,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#E9EDFF",
  },

  categoryImage: {
    width: "100%",
    height: "100%",
  },

  categoryTitle: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "500",
    color: "#010D26",
    textAlign: "center",
  },

  donateText: { color: "#010D26", fontWeight: "700", fontSize: 14 },
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  card: {
    width: "48%",
    height: 180,
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    position: "absolute",
    top: 0,
    left: 0,
  },
  cardContent: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    padding: 12,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  cardTitle: {
    color: "#fff",
    fontSize: 20,
    marginBottom: 8,
    fontWeight: "700",
  },
  cardButton: {
    backgroundColor: "#FFD602",
    borderRadius: 8,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    flexDirection: "row",
    gap: 6,
  },
  cardButtonText: {
    color: "#010D26",
    fontWeight: "700",
    fontSize: 12,
  },
  cartButtonWrapper: {
    width: 120,
    height: 120, // ⬅ bigger & better proportion
    alignSelf: "center",
    marginVertical: 12,
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
  },

  cartBackground: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
  },

  cartContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  cartText: {
    marginTop: 4,
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
