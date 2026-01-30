import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSelector } from "react-redux";
import {
  useAddToBasketMutation,
  useGetBasketQuery,
  useRemoveFromBasketMutation,
} from "@/store/reduxSlice/api/basketApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCampaignDetails } from "@/utils/api";
import { LinearGradient } from "expo-linear-gradient";
import { getTopDonation } from "@/store/reduxSlice/quickDonationSlice";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { DimensionValue } from "react-native";
import HeroBackground from "@/components/ui/GradientImage";
import RenderHTML from "react-native-render-html";
import { useToast } from "@/context/ToastContext";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import CampaignLoadingScreen from "@/components/CampaignLoadingScreen";
import ReplaceOrRemoveModal from "@/components/ui/Modals/ReplaceOrRemoveModal";

export default function GazaDonationScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const [problemOpen, setProblemOpen] = useState(true);
  const [impactOpen, setImpactOpen] = useState(true);

  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("50");
  const [addingToCart, setAddingToCart] = useState(false);
  const [guestBasket, setGuestBasket] = useState<any[]>([]);
  const [replaceModalVisible, setReplaceModalVisible] = useState(false);
  const [pendingBasketItem, setPendingBasketItem] = useState<any>(null);
  const [existingCartItem, setExistingCartItem] = useState<any>(null);

  const { user } = useSelector((state: any) => state.authentication);
  const isAuthenticated = !!user;

  const [addToBasket] = useAddToBasketMutation();
  const [removeFromBasket] = useRemoveFromBasketMutation();
  const { data: basketData, refetch: refetchBasket } = useGetBasketQuery(undefined, {
    skip: !isAuthenticated,
  });
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const liveDonations =
    useSelector((state: any) => state.quickDonations?.liveDonations) ?? [];

  useEffect(() => {
    if (campaign?.id) {
      dispatch(
        getTopDonation({
          id: campaign.id,
          live: true,
          sort: "createdAt",
          order: "desc",
          period: "alltime",
        })
      );
    }
  }, [campaign?.id]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getCampaignDetails(slug);
        const campaignData = data?.campaign || data;
        console.log("Campaign data loaded:", {
          id: campaignData?.id,
          name: campaignData?.name,
          amountDonated: campaignData?.amountDonated,
          amount_donated: campaignData?.amount_donated,
          fundraiserGoal: campaignData?.fundraiserGoal,
          mobileGoalAmount: campaignData?.mobileGoalAmount,
        });
        setCampaign(campaignData);
      } catch (e) {
        Alert.alert("Error", "Failed to load campaign");
      } finally {
        setLoading(false);
      }
    };
    if (slug) load();
  }, [slug]);

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

  // Reload basket when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        refetchBasket();
      } else {
        loadGuestBasket();
      }
    }, [isAuthenticated, refetchBasket, loadGuestBasket])
  );

  const basketItems = isAuthenticated ? basketData?.payload ?? [] : guestBasket;

  const isInCart = basketItems.some(
    (item: any) => item.campaignId === campaign?.id
  );

  // Handle both camelCase and snake_case, and ensure proper number conversion
  const raised = Number(
    campaign?.amountDonated ?? 
    campaign?.amount_donated ?? 
    0
  );
  const goal = Number(
    campaign?.mobileGoalAmount ??
      campaign?.mobile_goal_amount ??
      campaign?.goalAmount ??
      campaign?.fundraiserGoal ??
      campaign?.fundraiser_goal ??
      0
  );

  console.log("Campaign amounts:", { raised, goal, amountDonated: campaign?.amountDonated, amount_donated: campaign?.amount_donated });

  const progressPercent = useMemo<DimensionValue>(() => {
    if (!goal) return "0%";
    return `${Math.min((raised / goal) * 100, 100)}%`;
  }, [raised, goal]);

  const handleAmountChange = (text: string) => {
    // Remove any non-numeric characters
    const numericValue = text.replace(/[^0-9]/g, "");
    setAmount(numericValue);
  };

  const handleDonate = async () => {
    const donationAmount = Number(amount);
    if (!donationAmount || donationAmount <= 0) {
      Alert.alert("Invalid amount");
      return;
    }

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
      (item: any) => item.campaignId === campaign?.id
    );

    const basketItem = {
      campaignId: campaign.id,
      amount: donationAmount,
      quantity: 1,
      name: campaign.name,
      coverImage: campaign.coverImage,
      checkoutType: campaign.checkoutType,
    };

    if (existingItem) {
      // Show modal to replace or remove
      setExistingCartItem(existingItem);
      setPendingBasketItem(basketItem);
      setReplaceModalVisible(true);
      return;
    }

    // Add to cart if not already there
    try {
      setAddingToCart(true);
      if (isAuthenticated) {
        await addToBasket({ body: basketItem });
      } else {
        const updated = [...guestBasket, basketItem];
        setGuestBasket(updated);
        await AsyncStorage.setItem("guestBasket", JSON.stringify(updated));
      }
      showToast({
        message: "Added to cart",
        type: "success",
        action: {
          label: "View Cart",
          onPress: () => router.push("/(tabs)/cart"),
        },
      });
    } catch {
      showToast({
        message: "Failed to add to cart",
        type: "error",
      });
    } finally {
      setAddingToCart(false);
    }
  };

  const handleReplace = async () => {
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
  };

  const handleCancelModal = () => {
    setReplaceModalVisible(false);
    setPendingBasketItem(null);
    setExistingCartItem(null);
  };

  if (loading || !campaign) {
    return <CampaignLoadingScreen />;
  }

  console.log(campaign.name);

  return (
    <>
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* ===== HERO ===== */}
      <HeroBackground
        source={{ uri: campaign.coverImage }}
        showBack
        containerStyle={{ height: 320 }}
      >
        <View style={styles.heroText}>
          {(() => {
            // Use brief title if present, otherwise fall back to main mobile title/name
            const rawTitle =
              campaign.campaignBriefTitle ||
              campaign.mobileTitle ||
              campaign.name ||
              "";

            const words = rawTitle.split(" ");
            const firstWord = words[0];
            const restOfTitle = words.slice(1).join(" ");

            return (
              <>
                <Text style={styles.heroTitle}>{firstWord}</Text>
                {restOfTitle && (
                  <Text style={styles.heroSubtitle}>{restOfTitle}</Text>
                )}
              </>
            );
          })()}

          {campaign.impactFigure && campaign.impactFigure > 0 && (
            <Text style={styles.heroMeta}>
              <Text style={styles.heroMetaBold}>
                {campaign.impactFigure.toLocaleString()}
              </Text>{" "}
              {campaign.problemDesc
                ? campaign.problemDesc
                    .replace(/<[^>]*>/g, "")
                    .split(".")[0] // use first sentence to keep it short
                : "Lives Changed"}
            </Text>
          )}
        </View>
      </HeroBackground>

      {/* ===== CONTENT ===== */}
      <View style={styles.content}>
        <Text style={styles.campaignTitle}>
          {campaign.mobileTitle || campaign.name}
        </Text>
        {campaign.mobileSubtitle ? (
          <Text
            style={{
              fontSize: 14,
              color: "#6B7280",
              marginBottom: 8,
            }}
          >
            {campaign.mobileSubtitle}
          </Text>
        ) : null}
        <Text style={styles.raisedAmount}>${raised.toLocaleString()}</Text>
        <Text style={styles.goalText}>of ${goal.toLocaleString()} goal</Text>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: progressPercent }]} />
        </View>

        <View style={styles.dividerWrapper}>
          <View style={styles.divider} />
        </View>

        {/* ===== PROBLEM ===== */}
        <TouchableOpacity
          style={styles.sectionHeader}
          activeOpacity={0.7}
          onPress={() => setProblemOpen((prev) => !prev)}
        >
          <Text style={styles.sectionTitle}>The Problem</Text>
          <Ionicons
            name={problemOpen ? "chevron-up" : "chevron-down"}
            size={18}
            color="#333"
          />
        </TouchableOpacity>

        {problemOpen && (
          campaign.mobileDescription ? (
            <RenderHTML
              contentWidth={Dimensions.get("window").width - 32}
              source={{ html: campaign.mobileDescription }}
              tagsStyles={{
                p: styles.bodyText,
                h3: {
                  ...styles.bodyText,
                  fontSize: 20,
                  fontWeight: "700",
                  textAlign: "center",
                  marginTop: 12,
                },
                h5: {
                  ...styles.bodyText,
                  fontSize: 16,
                  fontWeight: "700",
                  marginTop: 12,
                },
              }}
              classesStyles={{
                "ql-align-center": { textAlign: "center" },
              }}
            />
          ) : (
            <Text style={styles.bodyText}>
              {(
                campaign.problemDesc ||
                campaign.description ||
                ""
              )
                .replace(/<[^>]*>/g, "")
                .replace(
                  /&nbsp;|&amp;|&quot;|&lt;|&gt;/gi,
                  function (entity: string) {
                    switch (entity) {
                      case "&nbsp;":
                        return " ";
                      case "&amp;":
                        return "&";
                      case "&quot;":
                        return '"';
                      case "&lt;":
                        return "<";
                      case "&gt;":
                        return ">";
                      default:
                        return "";
                    }
                  }
                )}
            </Text>
          )
        )}

        <View style={styles.dividerWrapper}>
          <View style={styles.divider} />
        </View>

        {/* ===== IMPACT ===== */}
        <TouchableOpacity
          style={styles.sectionHeader}
          activeOpacity={0.7}
          onPress={() => setImpactOpen((prev) => !prev)}
        >
          <Text style={styles.sectionTitle}>Your Impact</Text>
          <Ionicons
            name={impactOpen ? "chevron-up" : "chevron-down"}
            size={18}
            color="#333"
          />
        </TouchableOpacity>

        {impactOpen && (
          <View
            style={{
              backgroundColor: "#F2F6FF",
              padding: 16,
              borderRadius: 8,
              marginVertical: 16,
            }}
          >
          <Text style={styles.chooseText}>Choose an amount to give</Text>

          <View style={styles.amountRow}>
            {["50", "25", "10"].map((v) => (
              <AmountButton
                key={v}
                label={`$${v}`}
                active={amount === v}
                onPress={() => setAmount(v)}
              />
            ))}
          </View>

          <View style={styles.customAmount}>
            <Text style={styles.currencyPrefix}>$</Text>
            <TextInput
              style={[styles.customInput, { flex: 1, marginRight: 12 }]}
              value={amount}
              onChangeText={handleAmountChange}
              keyboardType="numeric"
              placeholder="Custom Amount"
              placeholderTextColor="#aaa"
            />
            <Text
              style={[
                styles.currency,
                { alignSelf: "center", fontWeight: "600" },
              ]}
            >
              AUD
            </Text>
          </View>
          <TouchableOpacity
            style={styles.donateBtn}
            onPress={handleDonate}
            disabled={addingToCart}
          >
            <Text style={styles.donateText}>
              {isInCart
                ? "View Cart"
                : addingToCart
                ? "Adding..."
                : "Donate Now"}
            </Text>
          </TouchableOpacity>

          <View style={styles.monthlyRow}>
            <View style={styles.checkbox} />
            <Text style={styles.monthlyText}>Make my donation monthly</Text>
          </View>
        </View>
        )}

        <View style={styles.dividerWrapper}>
          <View style={styles.divider} />
        </View>

        <Text style={styles.donationTitle}>Donation</Text>

        {Array.isArray(liveDonations) && liveDonations.length > 0 ? (
          liveDonations.map((donation: any, index: number) => (
            <View key={`liveDonation_${index}`} style={styles.donationRow}>
              <Ionicons
                name="person-circle-outline"
                size={28}
                color="#cfcfcf"
              />

              <View style={styles.donationInfo}>
                <Text style={styles.donorName}>
                  {donation?.isAnonymous
                    ? "Anonymous"
                    : `${donation?.firstName} ${donation?.lastName}`}
                </Text>

                <Text style={styles.timeText}>{donation?.displayTime}</Text>
              </View>

              <Text style={styles.donationValue}>
                AUD {Number(donation?.total || 0).toLocaleString()}
              </Text>
            </View>
          ))
        ) : (
          <Text style={{ marginTop: 12, color: "#888" }}>
            No donations yet. Be the first to donate.
          </Text>
        )}
      </View>
    </ScrollView>
    <ReplaceOrRemoveModal
      visible={replaceModalVisible}
      campaignName={campaign?.name}
      onCancel={handleCancelModal}
      onReplace={handleReplace}
    />
  </>
  );
}

const AmountButton = ({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity onPress={onPress} style={{ flex: 1, marginHorizontal: 1 }}>
    <LinearGradient
      colors={active ? ["#246BE1", "#064DC3"] : ["#f4f4f4", "#eaeaea"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[
        styles.amountButton,
        { paddingVertical: 12, borderRadius: 10, alignItems: "center" },
      ]}
    >
      <Text
        style={[
          styles.amountLabel,
          active && { color: "#fff", fontWeight: "700" },
        ]}
      >
        {label}
      </Text>
    </LinearGradient>
  </TouchableOpacity>
);

/* Styles */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  /* HERO */
  hero: {
    height: 300,
    paddingTop: 54,
    paddingHorizontal: 16,
    justifyContent: "space-between",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroText: { paddingBottom: 22 },
  heroTitle: {
    fontSize: 40,
    fontFamily: "Guthen Bloots",
    color: "#FFD602",
  },
  heroSubtitle: {
    fontSize: 26,
    fontWeight: "600",
    color: "#fff",
    marginTop: -4,
  },

  heroMeta: {
    marginTop: 10,
    fontSize: 13,
    color: "#fff",
  },
  heroMetaBold: { fontWeight: "700", color: "#f4c430" },

  /* CONTENT */
  content: { padding: 16, position: "relative" },
  campaignTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#010D26",
    marginBottom: 8,
    fontFamily: "AlbertSans_700Bold",
  },
  raisedAmount: {
    fontSize: 22,
    fontWeight: "800",
    color: "#246BE1",
    fontFamily: "AlbertSans_800ExtraBold",
    marginBottom: 4,
  },
  goalText: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
  },
  dividerWrapper: {
    marginVertical: 20,
    marginLeft: -16,
    marginRight: -16,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    width: "100%",
  },

  progressTrack: {
    height: 6,
    backgroundColor: "#eee",
    borderRadius: 3,
    marginVertical: 14,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#f4c430",
    borderRadius: 3,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#010D26",
  },

  bodyText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#555",
    marginTop: 8,
  },

  chooseText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "600",
    color: "#010D26",
  },

  amountRow: {
    flexDirection: "row",
    marginTop: 12,
    gap: 4,
  },
  amountButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  amountButtonActive: {
    backgroundColor: "#f4c430",
    borderColor: "#f4c430",
  },
  amountLabel: {
    fontWeight: "600",
    color: "#333",
  },
  amountLabelActive: { color: "#000" },

  customAmount: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  customLabel: { color: "#999" },
  currencyPrefix: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
    marginRight: 8,
    alignSelf: "center",
  },
  customInput: { fontWeight: "600" },
  currency: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
    marginLeft: 4,
  },

  donateBtn: {
    marginTop: 16,
    backgroundColor: "#f4c430",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  donateText: {
    fontSize: 16,
    fontWeight: "700",
  },

  monthlyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 4,
    marginRight: 8,
  },
  monthlyText: { fontSize: 13, color: "#555" },

  donationTitle: {
    marginTop: 22,
    fontSize: 16,
    fontWeight: "700",
  },
  donationRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  donationInfo: { flex: 1, marginLeft: 10 },
  donorName: { fontSize: 14, fontWeight: "600" },
  timeText: { fontSize: 12, color: "#888" },
  donationValue: { fontWeight: "700" },
});
