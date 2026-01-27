import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Image as ExpoImage } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

const { width: screenWidth } = Dimensions.get("window");

const tabs = [
  "Emergency",
  "Gaza Campaigns",
  "Water Campaigns",
  "General Campaigns",
  "Orphans",
  "Ramadan",
];

// Simplified products data - matching Next.js structure
const products = [
  // Emergency
  {
    id: 18,
    title: "Emergency Appeal",
    slug: "emergency-appeal",
    price: 50,
    image:
      "https://alihsan.s3.ap-southeast-2.amazonaws.com/projects/1739355360953-alihsan-coverImage.png",
    description: "Provide lifesaving aid to those facing unbearable suffering.",
    postText: "per donation",
    category: "Emergency",
  },
  {
    id: 274,
    title: "Flood Crisis Appeal",
    slug: "flood-crisis",
    price: 60,
    image:
      "https://alihsan.s3.ap-southeast-2.amazonaws.com/projects/1764655336596-alihsan-coverImage.png",
    description: "Catastrophic floods devastate South East Asia.",
    postText: "per pack",
    category: "Emergency",
  },
  // Gaza Campaigns
  {
    id: 188,
    title: "Gaza",
    slug: "gaza",
    price: 100,
    image:
      "https://alihsan.s3.ap-southeast-2.amazonaws.com/projects/1753249055468-alihsan-coverImage.png",
    description: "Support our brothers and sisters in Gaza with emergency aid.",
    postText: "per donation",
    category: "Gaza Campaigns",
  },
  {
    id: 252,
    title: "Gaza Hot Meals",
    slug: "gaza-hotmeals",
    price: 11,
    image:
      "https://alihsan.s3.ap-southeast-2.amazonaws.com/projects/1753400846754-alihsan-coverImage.png",
    description: "Sponsor a hot meal in Gaza.",
    postText: "per meal",
    category: "Gaza Campaigns",
  },
  // Water Campaigns
  {
    id: 25,
    title: "Water Campaign",
    slug: "water-campaign",
    price: 50,
    image:
      "https://alihsan.s3.ap-southeast-2.amazonaws.com/projects/1708565438074-alihsan-coverImage.png",
    description: "Provide clean and safe water to families.",
    postText: "per donation",
    category: "Water Campaigns",
  },
  {
    id: 6,
    title: "Water Wells",
    slug: "waterwells",
    price: 1500,
    image:
      "https://alihsan.s3.ap-southeast-2.amazonaws.com/projects/1764130383174-alihsan-coverImage.png",
    description: "Build a water well and provide communities with clean water.",
    postText: "per well",
    category: "Water Campaigns",
  },
  // General Campaigns
  {
    id: 12,
    title: "Give Sadaqah",
    slug: "general-sadaqah",
    price: 25,
    image:
      "https://alihsan.s3.ap-southeast-2.amazonaws.com/projects/1708467587341-alihsan-coverImage.png",
    description: "A simple act of kindness that benefits you in this life and the next.",
    postText: "per donation",
    category: "General Campaigns",
  },
  {
    id: 3,
    title: "Zakat Al Maal",
    slug: "zakat-al-maal",
    price: 100,
    image:
      "https://alihsan.s3.ap-southeast-2.amazonaws.com/projects/1758000682384-alihsan-coverImage.png",
    description: "Purify your wealth by fulfilling your Zakat obligation.",
    postText: "per donation",
    category: "General Campaigns",
  },
  // Orphans
  {
    id: 11,
    title: "Orphan Appeal",
    slug: "orphan-appeal",
    price: 50,
    image:
      "https://alihsan.s3.ap-southeast-2.amazonaws.com/projects/1708467619047-alihsan-coverImage.png",
    description: "Support orphans with clothing, nutritious meals, education and safe shelter.",
    postText: "per donation",
    category: "Orphans",
  },
  // Ramadan
  {
    id: 281,
    title: "Ramadan 2026",
    slug: "ramadan",
    price: 220,
    image:
      "https://alihsan.s3.ap-southeast-2.amazonaws.com/projects/1708413130267-alihsan-coverImage.png",
    description: "Provide essential food packs, Eid clothes/gifts, and nourishing hot meals this Ramadan.",
    postText: "per combo",
    category: "Ramadan",
  },
];

interface QuickDonationTabsProps {
  onProductPress?: (product: any) => void;
}

export default function QuickDonationTabs({
  onProductPress,
}: QuickDonationTabsProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  const filteredProducts = products.filter(
    (p) => p.category === activeTab
  );

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContent}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && styles.tabActive,
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Products Grid */}
      <View style={styles.productsGrid}>
        {filteredProducts.map((product) => (
          <TouchableOpacity
            key={product.id}
            style={styles.productCard}
            onPress={() => onProductPress?.(product)}
            activeOpacity={0.8}
          >
            <ExpoImage
              source={{ uri: product.image }}
              style={styles.productImage}
              contentFit="cover"
            />
            <View style={styles.productContent}>
              <Text style={styles.productTitle} numberOfLines={2}>
                {product.title}
              </Text>
              <Text style={styles.productDescription} numberOfLines={2}>
                {product.description}
              </Text>
              <View style={styles.productFooter}>
                <Text style={styles.productPrice}>${product.price}</Text>
                <Text style={styles.productPostText}>{product.postText}</Text>
              </View>
              <TouchableOpacity
                style={styles.addToCartButton}
                onPress={() => onProductPress?.(product)}
              >
                <Ionicons name="cart-outline" size={16} color="#010D26" />
                <Text style={styles.addToCartText}>Add to Cart</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#EEF4FF",
    paddingBottom: 40,
    paddingHorizontal: 16,
  },
  tabsContainer: {
    marginBottom: 20,
  },
  tabsScrollContent: {
    paddingHorizontal: 4,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
    marginRight: 8,
  },
  tabActive: {
    backgroundColor: "#1E3A8A",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#010D26B2",
    fontFamily: "AlbertSans_600SemiBold",
  },
  tabTextActive: {
    color: "#fff",
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  productCard: {
    width: (screenWidth - 48) / 2,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: "100%",
    height: 140,
  },
  productContent: {
    padding: 12,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#010D26",
    marginBottom: 6,
    fontFamily: "AlbertSans_700Bold",
  },
  productDescription: {
    fontSize: 12,
    color: "#010D26B2",
    marginBottom: 8,
    lineHeight: 16,
    fontFamily: "AlbertSans_400Regular",
  },
  productFooter: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 10,
    gap: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#010D26",
    fontFamily: "AlbertSans_700Bold",
  },
  productPostText: {
    fontSize: 12,
    color: "#010D26B2",
    fontFamily: "AlbertSans_400Regular",
  },
  addToCartButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFD602",
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  addToCartText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#010D26",
    fontFamily: "AlbertSans_700Bold",
  },
});
