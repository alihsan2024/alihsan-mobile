import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
  TextInput,
  ScrollView,
} from "react-native";
import { Image as ExpoImage } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import ImageSlider from "@/components/ui/sliders/ImageSlider";
import CampaignSlider from "@/components/ui/sliders/CampaignSlider";
import { ProgressModal } from "@/components/ui/Modals/DonationAppealModal";
import { router } from "expo-router";

const ICON_SIZE = 16;
const SIDE_BUTTON_WIDTH = 60;
const PADDING_HORIZONTAL = 20;
const screenWidth = Dimensions.get("window").width;
const HEADER_HEIGHT = 64;

const SLIDER_DATA = [
  {
    id: 1,
    title: "Zakat",
    image: require("../../assets/card1.png"),
  },
  {
    id: 2,
    title: "Sponsorship",
    image: require("../../assets/card2.png"),
  },
  {
    id: 3,
    title: "Emergency",
    image: require("../../assets/card1.png"),
  },
  {
    id: 4,
    title: "Infaq",
    image: require("../../assets/card1.png"),
  },
  {
    id: 5,
    title: "Infaq",
    image: require("../../assets/card1.png"),
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
const AMOUNTS = [50, 25, 10];

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
  const [selectedAmount, setSelectedAmount] = useState<number | null>(50);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isModalVisible, setIsModalVisible] = useState(true);

  const handleAmountPress = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount(""); // clear custom input
  };

  const handleCampaignPress = (item: CampaignItem) => {
    console.log("Selected campaign:", item);
    // Navigate or show details
  };

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: insets.top,
      }}
      contentContainerStyle={{ paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    >
      <ProgressModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        image={require("../../assets/modal-image.png")}
        title="Help Children in Need"
        raised={109690.51}
        goal={150000}
        onDonate={() => console.log("Donate pressed")}
      />
      {/* Background images */}
      {/* Background images */}
      <View
        style={{
          width: "100%",
          minHeight: screenHeight * 0.6,
          position: "absolute",
        }}
      >
        {/* Solid background color */}
        <View style={styles.headerBgColor} />

        {/* Header image */}
        <ExpoImage
          source={require("../../assets/header-image.png")}
          style={styles.background}
          contentFit="cover"
        />

        {/* Left fade overlay (50%) */}
        <LinearGradient
          colors={[
            "rgba(36,107,225,0.5)", // left (50% visible)
            "rgba(36,107,225,0.0)", // right (fully clear)
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.leftFade}
          pointerEvents="none"
        />
      </View>

      {/* Main content */}
      <View style={{ paddingHorizontal: PADDING_HORIZONTAL, paddingTop: 10 }}>
        {/* Header Bar */}
        <View style={styles.headerBar}>
          {/* Search */}
          <View style={styles.searchContainer}>
            <Feather name="search" size={16} color="#fff" />
            <TextInput
              placeholder="Search"
              placeholderTextColor="rgba(255,255,255,0.6)"
              style={styles.searchInput}
            />
          </View>

          {/* Notification */}
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications" size={18} color="#010D264D" />
            {/* Optional dot */}
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        <View style={styles.heroTextContainer}>
          <Text style={styles.heroTitle}>Gaza</Text>
          <Text style={styles.heroSubtitle}>is being Starved</Text>
        </View>

        {/* Header */}
        {/* <View style={styles.header}>
          <View style={styles.sideContainer}>
            <TouchableOpacity style={styles.menuButton}>
              <SimpleLineIcons name="grid" size={ICON_SIZE} color="white" />
            </TouchableOpacity>
          </View>
          <View style={styles.logoWrapper}>
            <ExpoImage
              source={require("../../assets/logo-white.png")}
              style={styles.logo}
            />
          </View>
          <View style={styles.sideContainer}>
            <TouchableOpacity style={styles.menuButton}>
              <Feather name="bell" size={ICON_SIZE} color="white" />
            </TouchableOpacity>
          </View>
        </View> */}

        {/* Buttons Grid */}
        {/* <View style={styles.buttonGrid}>
          {BUTTONS.map((btn, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.gridButton,
                selectedIndex === idx
                  ? styles.gridButtonSelected
                  : styles.gridButtonUnselected,
              ]}
              onPress={() => setSelectedIndex(idx)}
              OngoingOpacity={0.8}
            >
              <View style={styles.buttonContent}>
                <Feather
                  name={btn.icon}
                  size={ICON_SIZE}
                  color={selectedIndex === idx ? "#010D26" : "#fff"}
                />
                <Text
                  style={[
                    styles.buttonText,
                    selectedIndex === idx && { color: "#010D26" },
                  ]}
                >
                  {btn.name}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View> */}

        {/* Bottom image */}
        {/* <ExpoImage
          source={require("../../assets/header-image.png")}
          style={styles.headerImage}
          contentFit="contain"
        /> */}

        {/* Giving options */}
        <View style={styles.givingContainer}>
          {GIVING_OPTIONS.map((option, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.givingButton,
                selectedGiving === idx && styles.givingButtonSelected,
                idx === 0
                  ? { borderTopLeftRadius: 10, borderBottomLeftRadius: 10 }
                  : {},
                idx === GIVING_OPTIONS.length - 1
                  ? { borderTopRightRadius: 10, borderBottomRightRadius: 10 }
                  : {},
              ]}
              onPress={() => setSelectedGiving(idx)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.givingText,
                  selectedGiving === idx && {
                    color: "#264B8B",
                    fontWeight: "700",
                  },
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Amount container */}
        <View style={styles.amountContainer}>
          <Text style={styles.amountTitle}>Choose an amount to give</Text>

          {/* Grid of amount buttons */}
          <View style={styles.amountGrid}>
            {AMOUNTS.map((amt, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.amountButton}
                onPress={() => handleAmountPress(amt)}
                activeOpacity={0.85}
              >
                {selectedAmount === amt ? (
                  <LinearGradient
                    colors={["#246BE1", "#064DC3"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.amountGradient}
                  >
                    <Text style={styles.amountTextSelected}>$ {amt}</Text>
                  </LinearGradient>
                ) : (
                  <Text style={styles.amountText}>$ {amt}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom input */}
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Custom Amount"
              keyboardType="numeric"
              value={customAmount}
              onChangeText={(text) => {
                setCustomAmount(text);
                setSelectedAmount(null);
              }}
              style={styles.inputMiddle}
            />
            <Text style={styles.inputRight}>AUD</Text>
          </View>

          {/* Donate button */}
          <TouchableOpacity style={styles.donateButton} activeOpacity={0.8}>
            <Text style={styles.donateText}>Donate Now</Text>
          </TouchableOpacity>
        </View>

        <ImageSlider
          data={SLIDER_DATA}
          onPress={(item) => {
            console.log("Pressed:", item.title);
          }}
        />
        <View
          style={{
            height: 1,
            backgroundColor: "#E0E0E0",
            marginBottom: 18,
            width: "100%",
          }}
        />

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
                fontSize: 24,
                fontWeight: "700",
                marginBottom: 10,
              }}
            >
              Featured Campaigns
            </Text>
            <Text>See All</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/zakat-calculator")}
            style={{
              backgroundColor: "#264B8B",
              padding: 12,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>
              Go to Zakat Calculator
            </Text>
          </TouchableOpacity>
          <CampaignSlider data={campaigns} onPress={handleCampaignPress} />
        </View>

        {/* Cards Grid */}
        {/* <View style={styles.cardsGrid}>
          {CARDS.map((card) => (
            <View key={card.id} style={styles.card}>
              <ExpoImage source={card.image} style={styles.cardImage} />
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <TouchableOpacity style={styles.cardButton} activeOpacity={0.8}>
                  <Text style={styles.cardButtonText}>Donate</Text>
                  <Feather name="arrow-right" size={20} color="black" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View> */}
        {/* <TouchableOpacity
          style={styles.cartButtonWrapper}
          activeOpacity={0.85}
          onPress={() => {
            // handle cart press
          }}
        >
          <ExpoImage
            source={require("../../assets/cart-bg-btn.png")}
            style={styles.cartBackground}
            contentFit="cover"
          />

          <View style={styles.cartContent}>
            <Feather name="shopping-cart" size={24} color="#fff" />
            <Text style={styles.cartText}>Cart</Text>
          </View>
        </TouchableOpacity> */}
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
    marginBottom: 16,
  },
  heroTextContainer: {
    marginTop: 12,
    marginBottom: 20,
  },

  heroTitle: {
    fontSize: 56,
    fontWeight: "800",
    color: "#fff",
    lineHeight: 60,
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
  },

  notificationDot: {
    position: "absolute",
    top: 10,
    right: 10,
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
    marginBottom: 4,
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
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 16,
    padding: 2,
  },
  givingButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  givingButtonSelected: { backgroundColor: "#fff" },
  givingText: { color: "#fff", fontWeight: "600" },
  amountContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  amountTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#264B8B",
    marginBottom: 10,
  },
  amountGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 12,
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
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  inputLeft: { color: "#264B8B", fontWeight: "600", marginRight: 8 },
  inputMiddle: { flex: 1, height: "100%", color: "#264B8B", fontWeight: "600" },
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

  donateText: { color: "#010D26", fontWeight: "700", fontSize: 16 },
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
