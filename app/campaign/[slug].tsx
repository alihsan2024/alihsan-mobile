import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { getCampaignDetails } from "../../services/api";
import { Image as ExpoImage } from "expo-image";
import { useBasket } from "../../context/BasketContext";
import LoadingScreen from "../../components/LoadingScreen";
import { Ionicons } from "@expo/vector-icons";
import CustomHeader from "@/components/CustomHeader";

const { width } = Dimensions.get("window");

export default function CampaignDetailsScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState("50");
  const [addingToCart, setAddingToCart] = useState(false);
  const { addItem, items } = useBasket();

  useEffect(() => {
    const loadCampaignDetails = async () => {
      if (!slug) {
        setError("Campaign slug is required");
        setLoading(false);
        return;
      }

      try {
        setError(null);
        const data = await getCampaignDetails(slug);
        setCampaign(data);
      } catch (err: any) {
        console.error("Failed to load campaign details:", err);
        setError(err.message || "Failed to load campaign details");
      } finally {
        setLoading(false);
      }
    };

    loadCampaignDetails();
  }, [slug]);

  if (loading) return <LoadingScreen message="Loading campaign..." />;
  if (error)
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <Text style={styles.backText} onPress={() => router.back()}>
          Go back
        </Text>
      </View>
    );
  if (!campaign)
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Campaign not found</Text>
        <Text style={styles.backText} onPress={() => router.back()}>
          Go back
        </Text>
      </View>
    );

  const campaignData = campaign.campaign || campaign;
  const media = campaignData?.CampaignMedia || [];
  const posts = campaignData?.Posts || [];
  const category = campaignData?.CampaignCategory;
  const isInCart = items.some((item) => item.campaignId === campaignData?.id);

  const handleAddToCart = async () => {
    if (!campaignData?.id) {
      Alert.alert("Error", "Campaign information is missing");
      return;
    }
    const donationAmount = parseFloat(amount);
    if (isNaN(donationAmount) || donationAmount <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }
    setAddingToCart(true);
    try {
      const checkoutType = campaignData.checkoutType;
      const basketItem: any = {
        campaignId: campaignData.id,
        amount: donationAmount,
        quantity: 1,
      };
      if (checkoutType === "ADEEQAH_GENERAL_SACRIFICE") {
        Alert.alert(
          "Special Campaign",
          "This campaign requires additional information. Please use the web app for this campaign type."
        );
        setAddingToCart(false);
        return;
      }
      await addItem(basketItem);
      Alert.alert("Success", "Campaign added to cart!", [
        {
          text: "View Cart",
          onPress: () => router.push("/(tabs)/cart"),
        },
        { text: "OK" },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <>
      {/* Configure screen options in Stack.Screen */}
      <CustomHeader transparent absolute />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {campaignData?.coverImage && (
          <ExpoImage
            source={{ uri: campaignData.coverImage }}
            style={styles.coverImage}
            contentFit="cover"
            transition={200}
            placeholder={{ blurhash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4" }}
          />
        )}
        <View style={styles.content}>
          <Text style={styles.title}>{campaignData?.name}</Text>
          {category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{category.name}</Text>
            </View>
          )}
          {campaignData?.description && (
            <View style={styles.section}>
              <Text style={styles.description}>
                {campaignData.description.replace(/<[^>]*>/g, "")}
              </Text>
            </View>
          )}
          {campaignData?.descriptionText && (
            <View style={styles.section}>
              <Text style={styles.descriptionText}>
                {campaignData.descriptionText.replace(/<[^>]*>/g, "")}
              </Text>
            </View>
          )}
          {media.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Gallery</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.mediaScroll}
                contentContainerStyle={styles.mediaContainer}
              >
                {media.map((item: any, index: number) => (
                  <ExpoImage
                    key={item.id || index}
                    source={{ uri: item.url }}
                    style={styles.mediaImage}
                    contentFit="cover"
                    transition={200}
                  />
                ))}
              </ScrollView>
            </View>
          )}
          {posts.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Updates</Text>
              {posts.map((post: any, index: number) => (
                <View key={post.id || index} style={styles.postCard}>
                  {post.PostMedia && post.PostMedia.length > 0 && (
                    <View style={styles.postMediaContainer}>
                      {post.PostMedia.map((media: any, mediaIndex: number) => (
                        <ExpoImage
                          key={media.id || mediaIndex}
                          source={{ uri: media.url }}
                          style={styles.postImage}
                          contentFit="cover"
                          transition={200}
                        />
                      ))}
                    </View>
                  )}
                  {post.text && (
                    <Text style={styles.postText}>
                      {post.text.replace(/<[^>]*>/g, "")}
                    </Text>
                  )}
                  {post.displayTime && (
                    <Text style={styles.postTime}>{post.displayTime}</Text>
                  )}
                </View>
              ))}
            </View>
          )}
          {campaignData?.Organizer && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Organizer</Text>
              <View style={styles.organizerCard}>
                {campaignData.Organizer.profileImage && (
                  <ExpoImage
                    source={{ uri: campaignData.Organizer.profileImage }}
                    style={styles.organizerImage}
                    contentFit="cover"
                  />
                )}
                <View style={styles.organizerInfo}>
                  <Text style={styles.organizerName}>
                    {campaignData.Organizer.firstName}{" "}
                    {campaignData.Organizer.lastName}
                  </Text>
                  {campaignData.Organizer.about && (
                    <Text style={styles.organizerAbout}>
                      {campaignData.Organizer.about}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          )}
          <View style={styles.metadataSection}>
            {campaignData?.country && (
              <View style={styles.metadataItem}>
                <Text style={styles.metadataLabel}>Country:</Text>
                <Text style={styles.metadataValue}>{campaignData.country}</Text>
              </View>
            )}
            {campaignData?.status && (
              <View style={styles.metadataItem}>
                <Text style={styles.metadataLabel}>Status:</Text>
                <Text style={styles.metadataValue}>{campaignData.status}</Text>
              </View>
            )}
          </View>
          <View style={styles.addToCartSection}>
            <Text style={styles.addToCartTitle}>Make a Donation</Text>
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>Amount (AUD)</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="Enter amount"
                placeholderTextColor="#999"
              />
            </View>
            <TouchableOpacity
              style={[
                styles.addToCartButton,
                isInCart && styles.addToCartButtonInCart,
              ]}
              onPress={handleAddToCart}
              disabled={addingToCart || isInCart}
            >
              <Text style={styles.addToCartButtonText}>
                {addingToCart
                  ? "Adding..."
                  : isInCart
                  ? "Already in Cart"
                  : "Add to Cart"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, backgroundColor: "#fff" },
  coverImage: { width: "100%", height: 300, backgroundColor: "#f0f0f0" },
  content: { padding: 20 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#264B8B",
    marginBottom: 12,
    lineHeight: 34,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#264B8B",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  categoryText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  section: { marginBottom: 32 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#264B8B",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
    marginBottom: 16,
  },
  descriptionText: { fontSize: 16, color: "#333", lineHeight: 24 },
  mediaScroll: { marginHorizontal: -20 },
  mediaContainer: { paddingHorizontal: 20, gap: 12 },
  mediaImage: {
    width: width * 0.7,
    height: 200,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
  },
  postCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#264B8B",
  },
  postMediaContainer: { marginBottom: 12, gap: 8 },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    marginBottom: 8,
  },
  postText: { fontSize: 15, color: "#333", lineHeight: 22, marginBottom: 8 },
  postTime: { fontSize: 12, color: "#999", fontStyle: "italic" },
  organizerCard: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  organizerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#e0e0e0",
  },
  organizerInfo: { flex: 1 },
  organizerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#264B8B",
    marginBottom: 4,
  },
  organizerAbout: { fontSize: 14, color: "#666", lineHeight: 20 },
  metadataSection: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  metadataItem: { flexDirection: "row", marginBottom: 8 },
  metadataLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginRight: 8,
    minWidth: 80,
  },
  metadataValue: { fontSize: 14, color: "#333", flex: 1 },
  addToCartSection: {
    marginTop: 32,
    padding: 20,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  addToCartTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#264B8B",
    marginBottom: 16,
  },
  amountContainer: { marginBottom: 16 },
  amountLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  amountInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  addToCartButton: {
    backgroundColor: "#264B8B",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  addToCartButtonInCart: { backgroundColor: "#999" },
  addToCartButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  errorText: { fontSize: 16, color: "#d32f2f", marginBottom: 12 },
  backText: { fontSize: 16, color: "#264B8B", textDecorationLine: "underline" },
});
