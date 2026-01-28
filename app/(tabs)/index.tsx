import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
  TextInput,
  ScrollView,
  Alert,
  Animated,
} from "react-native";
import { Image as ExpoImage } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { useEffect, useState, useRef } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import ImageSlider from "@/components/ui/sliders/ImageSlider";
import CampaignSlider from "@/components/ui/sliders/CampaignSlider";
import { DonationAppealModal } from "@/components/ui/Modals/DonationAppealModal";
import { router } from "expo-router";
import { fetchFeaturedCampaigns, getCampaignDetails } from "@/utils/api";
import {
  useAddToBasketMutation,
  useGetBasketQuery,
} from "@/store/reduxSlice/api/basketApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSelector } from "react-redux";
import SupportCampaignsBanner from "@/components/ui/SupportCampaignsBanner";
import QuickLinks from "@/components/ui/QuickLinks";
import CommunityImpactVideo from "@/components/ui/CommunityImpactVideo";

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
    title: "Winter Appeal",
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

const GAZA_CAMPAIGN = {
  id: 188,
  name: "Gaza",
  slug: "gaza",
  checkoutType: "COMMON",
  coverImage:
    "https://alihsan.s3.ap-southeast-2.amazonaws.com/projects/1753249055468-alihsan-coverImage.png",
};

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

  const [selectedIndex, setSelectedIndex] = useState<number | null>(0);
  const [selectedGiving, setSelectedGiving] = useState<number>(0);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(10);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const givingAnimation = useRef(new Animated.Value(0)).current;
  const [featuredCampaigns, setFeaturedCampaigns] = useState<CampaignItem[]>(
    []
  );
  const [isLoadingFeaturedCampaigns, setIsLoadingFeaturedCampaigns] =
    useState(false);
  const { user } = useSelector((state: any) => state.authentication);
  const isAuthenticated = !!user;

  const [addToBasket] = useAddToBasketMutation();
  const { data: basketData } = useGetBasketQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [guestBasket, setGuestBasket] = useState<any[]>([]);
  const [addingToCart, setAddingToCart] = useState(false);

  const GAZA_MODAL_SEEN_KEY = "@alihsan:gaza_modal_seen";

  useEffect(() => {
    if (!isAuthenticated) {
      AsyncStorage.getItem("guestBasket").then((data) => {
        setGuestBasket(data ? JSON.parse(data) : []);
      });
    }
  }, [isAuthenticated]);

  // Show Gaza donation modal only once per install (or until storage is cleared)
  useEffect(() => {
    const checkGazaModal = async () => {
      try {
        const seen = await AsyncStorage.getItem(GAZA_MODAL_SEEN_KEY);
        if (seen !== "true") {
          setIsModalVisible(true);
        }
      } catch (e) {
        // On error, don't block the modal; fail silently
        setIsModalVisible(true);
      }
    };
    checkGazaModal();
  }, []);

  const handleCloseGazaModal = async () => {
    try {
      await AsyncStorage.setItem(GAZA_MODAL_SEEN_KEY, "true");
    } catch (e) {
      // Ignore storage errors
    }
    setIsModalVisible(false);
  };

  const handleGazaDonate = async () => {
    const donationAmount = Number(selectedAmount || customAmount);

    if (!donationAmount || donationAmount <= 0) {
      Alert.alert("Please enter a valid amount");
      return;
    }

    const basketItems = isAuthenticated
      ? basketData?.payload ?? []
      : guestBasket;

    const isInCart = basketItems.some(
      (item: any) => item.campaignId === GAZA_CAMPAIGN.id
    );

    if (isInCart) {
      Alert.alert("Already in cart", "This campaign is already in your cart.", [
        {
          text: "View Cart",
          onPress: () => router.push("/(tabs)/cart"),
        },
        { text: "OK", style: "cancel" },
      ]);
      return;
    }

    const basketItem = {
      campaignId: GAZA_CAMPAIGN.id,
      amount: donationAmount,
      quantity: 1,
      name: GAZA_CAMPAIGN.name,
      coverImage: GAZA_CAMPAIGN.coverImage,
      checkoutType: GAZA_CAMPAIGN.checkoutType,
    };

    try {
      setAddingToCart(true);

      if (isAuthenticated) {
        await addToBasket({ body: basketItem });
      } else {
        const updated = [...guestBasket, basketItem];
        setGuestBasket(updated);
        await AsyncStorage.setItem("guestBasket", JSON.stringify(updated));
      }

      Alert.alert(
        "Added to cart",
        "Your donation has been added to the cart.",
        [
          {
            text: "View Cart",
            onPress: () => router.push("/(tabs)/cart"),
          },
          { text: "OK", style: "cancel" },
        ]
      );
    } catch {
      Alert.alert("Error", "Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  useEffect(() => {
    const loadFeaturedCampaigns = async () => {
      try {
        setIsLoadingFeaturedCampaigns(true);
        const campaigns = await fetchFeaturedCampaigns();
        
        // Transform API response to match CampaignItem interface
        const transformedCampaigns: CampaignItem[] = campaigns.map((campaign: any) => ({
          id: campaign.id,
          slug: campaign.slug,
          image: { uri: campaign.coverImage },
          title: campaign.name,
          donors: 0, // This would need to come from a separate API call if available
          status: "Ongoing",
          amountRaised: `$${Number(campaign.amountDonated || 0).toLocaleString()}`,
          goal: `$${Number(campaign.mobileGoalAmount || campaign.fundraiserGoal || 0).toLocaleString()}`,
        }));

        setFeaturedCampaigns(transformedCampaigns);
      } catch (error) {
        console.error("Error loading featured campaigns:", error);
        setFeaturedCampaigns([]);
      } finally {
        setIsLoadingFeaturedCampaigns(false);
      }
    };

    loadFeaturedCampaigns();
  }, []);

  const handleAmountPress = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount(""); // clear custom input
  };

  const handleCampaignPress = (item: CampaignItem) => {
    router.push(`/campaign/${item.slug}`);
  };

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: 0,
      }}
      contentContainerStyle={{ paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    >
      <DonationAppealModal
        visible={isModalVisible}
        onClose={handleCloseGazaModal}
        image={require("../../assets/modal-image.png")}
        title="Help Children in Need"
        raised={109690.51}
        goal={150000}
      />
      {/* Top Banner Section - "Making a Difference Together" / "Support Our Campaigns" */}
      <SupportCampaignsBanner
        topInset={insets.top}
        onCampaignPress={(campaign) => {
          router.push(`/campaign/${campaign.slug}`);
        }}
        onDonate={async (amount, frequency, campaignSlug) => {
          try {
            setAddingToCart(true);

            // Fetch campaign details
            const campaignData = await getCampaignDetails(campaignSlug);
            const campaign = campaignData?.campaign || campaignData;

            if (!campaign?.id) {
              Alert.alert("Error", "Campaign not found");
              return;
            }

            // Calculate period days based on frequency
            const periodDays = frequency === "monthly" ? 30 : frequency === "weekly" ? 7 : 0;
            const isRecurring = frequency === "monthly" || frequency === "weekly";

            const basketItems = isAuthenticated
              ? basketData?.payload ?? []
              : guestBasket;

            const isInCart = basketItems.some(
              (item: any) => item.campaignId === campaign.id
            );

            if (isInCart) {
              Alert.alert("Already in cart", "This campaign is already in your cart.", [
                {
                  text: "View Cart",
                  onPress: () => router.push("/(tabs)/cart"),
                },
                { text: "OK", style: "cancel" },
              ]);
              return;
            }

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

            if (isAuthenticated) {
              await addToBasket({ body: basketItem });
            } else {
              const updated = [...guestBasket, basketItem];
              setGuestBasket(updated);
              await AsyncStorage.setItem("guestBasket", JSON.stringify(updated));
            }

            Alert.alert(
              "Added to cart",
              "Your donation has been added to the cart.",
              [
                {
                  text: "View Cart",
                  onPress: () => router.push("/(tabs)/cart"),
                },
                { text: "OK", style: "cancel" },
              ]
            );
          } catch (error: any) {
            console.error("Donation error:", error);
            Alert.alert("Error", error?.message || "Failed to add to cart");
          } finally {
            setAddingToCart(false);
          }
        }}
      />
      {/* Main content */}
      <View style={{ paddingTop: 10 }}>
        {/* Categories Section - Below Banner */}
        <View
          style={{
            backgroundColor: "#fff",
            paddingTop: 16,
            paddingHorizontal: PADDING_HORIZONTAL,
            marginTop: 0,
          }}
        >
          <ImageSlider
            data={SLIDER_DATA}
            onPress={(item) => {
              console.log("Pressed:", item.title);
            }}
          />
        </View>
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
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 28,
                  color: "#010D26",
                  fontWeight: "800",
                  marginBottom: 24,
                  fontFamily: "AlbertSans_800ExtraBold",
                }}
              >
                Featured Campaigns
              </Text>
              <TouchableOpacity onPress={() => router.push("/campaigns")}>
                <Text style={{ color: "#010D26" }}>See All</Text>
              </TouchableOpacity>
            </View>

            {featuredCampaigns.length > 0 && (
              <CampaignSlider
                data={featuredCampaigns}
                onPress={handleCampaignPress}
              />
            )}
          </View>
        </View>

        {/* Quick Links Section */}
        <QuickLinks />

        {/* Community Impact Video Section */}
        <View style={{ paddingHorizontal: PADDING_HORIZONTAL, marginTop: 24, marginBottom: 32 }}>
          <CommunityImpactVideo
            videoUrl="https://alihsan.s3.ap-southeast-2.amazonaws.com/homepage-videos/1763512297065-alihsan-winter+appeal+16x9.mp4"
            backgroundImage="https://alihsan.s3.ap-southeast-2.amazonaws.com/projects/dac1a675d19a0d43be37299aebb6dd02.jpg"
            coverImage="https://alihsan.s3.ap-southeast-2.amazonaws.com/media/1765499530018-alihsan-Sri%20Lanka%20Flood.jpeg"
            title="Community Impact"
            headline="Millions are facing hardship. Be the one who brings ease."
            subheadline="Meet the passionate individuals working together to bring kindness, care, and impact to every community we touch."
          />
        </View>
      </View>
    </ScrollView>
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
