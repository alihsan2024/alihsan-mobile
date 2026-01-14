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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSelector } from "react-redux";
import {
  useAddToBasketMutation,
  useGetBasketQuery,
} from "@/store/reduxSlice/api/basketApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCampaignDetails } from "@/utils/api";
import { LinearGradient } from "expo-linear-gradient";
import { getTopDonation } from "@/store/reduxSlice/quickDonationSlice";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { DimensionValue } from "react-native";
import HeroBackground from "@/components/ui/GradientImage";

export default function GazaDonationScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const [problemOpen, setProblemOpen] = useState(true);

  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("50");
  const [addingToCart, setAddingToCart] = useState(false);
  const [guestBasket, setGuestBasket] = useState<any[]>([]);

  const { user } = useSelector((state: any) => state.authentication);
  const isAuthenticated = !!user;

  const [addToBasket] = useAddToBasketMutation();
  const { data: basketData } = useGetBasketQuery(undefined, {
    skip: !isAuthenticated,
  });
  const dispatch = useAppDispatch();
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
        setCampaign(data?.campaign || data);
      } catch (e) {
        Alert.alert("Error", "Failed to load campaign");
      } finally {
        setLoading(false);
      }
    };
    if (slug) load();
  }, [slug]);

  useEffect(() => {
    if (!isAuthenticated) {
      AsyncStorage.getItem("guestBasket").then((data) => {
        setGuestBasket(data ? JSON.parse(data) : []);
      });
    }
  }, [isAuthenticated]);

  const basketItems = isAuthenticated ? basketData?.payload ?? [] : guestBasket;

  const isInCart = basketItems.some(
    (item: any) => item.campaignId === campaign?.id
  );

  const raised = Number(campaign?.raisedAmount || 0);
  const goal = Number(campaign?.goalAmount || 0);

  const progressPercent = useMemo<DimensionValue>(() => {
    if (!goal) return "0%";
    return `${Math.min((raised / goal) * 100, 100)}%`;
  }, [raised, goal]);

  const handleDonate = async () => {
    const donationAmount = Number(amount);
    if (!donationAmount || donationAmount <= 0) {
      Alert.alert("Invalid amount");
      return;
    }

    if (isInCart) {
      router.push("/(tabs)/cart");
      return;
    }

    const basketItem = {
      campaignId: campaign.id,
      amount: donationAmount,
      quantity: 1,
      name: campaign.name,
      coverImage: campaign.coverImage,
      checkoutType: campaign.checkoutType,
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
      Alert.alert("Success", "Added to cart", [
        { text: "View Cart", onPress: () => router.push("/(tabs)/cart") },
        { text: "OK" },
      ]);
    } catch {
      Alert.alert("Error", "Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading || !campaign) return null;

  console.log(campaign.name);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* ===== HERO ===== */}
      <HeroBackground
        source={{ uri: campaign.coverImage }}
        showBack
        containerStyle={{ height: 320 }}
      >
        <View style={styles.heroText}>
          {campaign.campaignBriefTitle ? (
            <>
              {(() => {
                const words = campaign.campaignBriefTitle.split(" ");
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
            </>
          ) : (
            <>
              <Text style={styles.heroTitle}>Gaza</Text>
              <Text style={styles.heroSubtitle}>is being Starved</Text>
            </>
          )}

          <Text style={styles.heroMeta}>
            <Text style={styles.heroMetaBold}>
              {campaign.impactFigure
                ? campaign.impactFigure.toLocaleString()
                : campaign.totalDonors || 254_786}
            </Text>{" "}
            Lives Changed
          </Text>
        </View>
      </HeroBackground>

      {/* ===== CONTENT ===== */}
      <View style={styles.content}>
        <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 8 }}>
          {campaign.name}
        </Text>
        <Text style={styles.raisedAmount}>${raised.toLocaleString()}</Text>
        <Text style={styles.goalText}>of ${goal.toLocaleString()} goal</Text>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: progressPercent }]} />
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
          <Text style={styles.bodyText}>
            {campaign.problemDesc
              ? campaign.problemDesc
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
                  )
              : campaign.description
                  ?.replace(/<[^>]*>/g, "")
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
        )}

        {/* ===== IMPACT ===== */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Impact</Text>
          <Ionicons name="chevron-down" size={18} color="#333" />
        </View>

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
            <TextInput
              style={[styles.customInput, { flex: 1, marginRight: 12 }]}
              value={amount}
              onChangeText={setAmount}
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
  <TouchableOpacity onPress={onPress} style={{ flex: 1, marginHorizontal: 2 }}>
    <LinearGradient
      colors={active ? ["#246BE1", "#064DC3"] : ["#f4f4f4", "#eaeaea"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
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
    fontWeight: "800",
    color: "#fff",
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
  content: { padding: 16 },
  raisedAmount: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111",
  },
  goalText: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
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
    marginTop: 20,
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
    gap: 8,
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
