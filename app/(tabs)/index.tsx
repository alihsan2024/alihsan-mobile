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

const ICON_SIZE = 16;
const SIDE_BUTTON_WIDTH = 60;
const PADDING_HORIZONTAL = 20;
const screenWidth = Dimensions.get("window").width;
const HEADER_HEIGHT = 64;

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
const AMOUNTS = [500, 250, 150, 50, 25, 10];

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

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const screenHeight = Dimensions.get("window").height;

  const [selectedIndex, setSelectedIndex] = useState<number | null>(0);
  const [selectedGiving, setSelectedGiving] = useState<number>(0);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(500);
  const [customAmount, setCustomAmount] = useState<string>("");

  const handleAmountPress = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount(""); // clear custom input
  };

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: insets.top,
        marginBottom: 70,
      }}
      contentContainerStyle={{ paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Background images */}
      <View
        style={{
          width: "100%",
          minHeight: screenHeight * 0.7,
          position: "absolute",
        }}
      >
        <ExpoImage
          source={require("../../assets/background.png")}
          style={styles.background}
        />
        <ExpoImage
          source={require("../../assets/content-background.png")}
          style={styles.overlay}
          pointerEvents="none"
        />
      </View>

      {/* Main content */}
      <View style={{ paddingHorizontal: PADDING_HORIZONTAL, paddingTop: 10 }}>
        {/* Header */}
        <View style={styles.header}>
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
        </View>

        {/* Buttons Grid */}
        <View style={styles.buttonGrid}>
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
              activeOpacity={0.8}
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
        </View>

        {/* Bottom image */}
        <ExpoImage
          source={require("../../assets/header-image.png")}
          style={styles.headerImage}
          contentFit="contain"
        />

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
                style={[
                  styles.amountButton,
                  selectedAmount === amt && styles.amountButtonSelected,
                ]}
                onPress={() => handleAmountPress(amt)}
              >
                <Text
                  style={[
                    styles.amountText,
                    selectedAmount === amt && {
                      color: "#fff",
                      fontWeight: "700",
                    },
                  ]}
                >
                  $ {amt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom input */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLeft}>$ Other</Text>
            <TextInput
              placeholder="0"
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

        {/* Cards Grid */}
        <View style={styles.cardsGrid}>
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
        </View>
        <TouchableOpacity
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

          {/* Overlay content */}
          <View style={styles.cartContent}>
            <Feather name="shopping-cart" size={24} color="#fff" />
            <Text style={styles.cartText}>Cart</Text>
          </View>
        </TouchableOpacity>
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
    marginTop: 20,
    marginBottom: 20,
    textAlign: "center",
  },
  amountGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  amountButton: {
    width: "30%",
    height: 50,
    borderRadius: 10,
    backgroundColor: "rgba(38,75,139,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  amountButtonSelected: { backgroundColor: "#264B8B" },
  amountText: { fontWeight: "600", color: "#264B8B" },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(38,75,139,0.3)",
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 45,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  inputLeft: { color: "#264B8B", fontWeight: "600", marginRight: 8 },
  inputMiddle: { flex: 1, height: "100%", color: "#264B8B", fontWeight: "600" },
  inputRight: { color: "#264B8B", fontWeight: "600", marginLeft: 8 },
  donateButton: {
    backgroundColor: "#FFD602",
    borderRadius: 10,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
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
