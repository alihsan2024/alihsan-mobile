import React, { useEffect, useMemo, useState, useRef } from "react";
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
  Animated,
  Linking,
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CampaignLoadingScreen from "@/components/CampaignLoadingScreen";
import ReplaceOrRemoveModal from "@/components/ui/Modals/ReplaceOrRemoveModal";
import ShareCampaignModal from "@/components/ui/Modals/ShareCampaignModal";
import AqeeqahDonationOptions from "@/components/campaign/AqeeqahDonationOptions";

export default function GazaDonationScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"details" | "faq" | "impact">("details");
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);
  const [donationCardExpanded, setDonationCardExpanded] = useState(false);
  const [frequency, setFrequency] = useState<"onetime" | "monthly" | "friday">("onetime");
  const expandAnimation = useRef(new Animated.Value(0)).current;
  const tabIndicatorAnimation = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("50");
  const [addingToCart, setAddingToCart] = useState(false);
  const [guestBasket, setGuestBasket] = useState<any[]>([]);
  const [replaceModalVisible, setReplaceModalVisible] = useState(false);
  const [pendingBasketItem, setPendingBasketItem] = useState<any>(null);
  const [existingCartItem, setExistingCartItem] = useState<any>(null);
  const [shareModalVisible, setShareModalVisible] = useState(false);

  const { user } = useSelector((state: any) => state.authentication);
  const isAuthenticated = !!user;

  const [addToBasket] = useAddToBasketMutation();
  const [removeFromBasket] = useRemoveFromBasketMutation();
  const { data: basketData, refetch: refetchBasket } = useGetBasketQuery(undefined, {
    skip: !isAuthenticated,
  });
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  const liveDonations =
    useSelector((state: any) => state.quickDonations?.liveDonations) ?? [];
  const topDonations =
    useSelector((state: any) => state.quickDonations?.topDonations) ?? [];

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

  // Initialize tab indicator position
  useEffect(() => {
    tabIndicatorAnimation.setValue(0);
  }, []);

  // Reset to details tab and one-time default when slug changes (navigating between campaigns)
  useEffect(() => {
    setActiveTab("details");
    setActiveFaqIndex(null);
    setFrequency("onetime");
    tabIndicatorAnimation.setValue(0);
  }, [slug]);

  useEffect(() => {
    // Clear previous campaign data and set loading when slug changes
    setCampaign(null);
    setLoading(true);
    
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
          donor_count: campaignData?.donor_count,
          donorCount: campaignData?.donorCount,
        });
        setCampaign(campaignData);
      } catch (e: any) {
        const errorMessage = e?.message || "Failed to load campaign";
        const isNetworkError = 
          errorMessage.includes("Network") || 
          errorMessage.includes("network") || 
          errorMessage.includes("timeout") ||
          errorMessage.includes("ECONNREFUSED");
        
        Alert.alert(
          "Unable to Load Campaign",
          isNetworkError 
            ? "Please check your internet connection and try again."
            : "Something went wrong. Please try again later.",
          [
            {
              text: "OK",
              style: "default",
            },
          ]
        );
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
      // Scroll to top when screen comes into focus
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, [isAuthenticated, refetchBasket, loadGuestBasket])
  );

  const basketItems = isAuthenticated ? basketData?.payload ?? [] : guestBasket;

  const isInCart = basketItems.some(
    (item: any) => item.campaignId === campaign?.id
  );

  // Handle both camelCase and snake_case, and ensure proper number conversion
  // Prioritize amount_donated as it's the source of truth from the database
  const raised = Number(
    campaign?.amount_donated ??
    campaign?.amountDonated ?? 
    0
  );
  
  // Goal: fundraiser goal first, then mobile goal, then raised (so progress bar can show for featured campaigns)
  const goal = Number(
    campaign?.fundraiserGoal ??
    campaign?.fundraiser_goal ??
    0
  );
  const mobileGoal = Number(
    campaign?.mobileGoalAmount ?? campaign?.mobile_goal_amount ?? 0
  );
  const effectiveGoal = goal > 0 ? goal : (mobileGoal > 0 ? mobileGoal : raised > 0 ? raised : 0);

  // Use only donor_count for donor count
  const donorCount = Number(
    campaign?.donor_count ??
    campaign?.donorCount ??
    0
  );

  const isFeatured = Boolean(
    campaign?.isFeatured ?? campaign?.is_featured ?? false
  );

  console.log("Donor count:", { 
    donor_count: campaign?.donor_count, 
    donorCount: campaign?.donorCount, 
    calculated: donorCount 
  });

  console.log("Campaign amounts for progress bar:", { 
    raised, 
    goal, 
    amountDonated: campaign?.amountDonated, 
    amount_donated: campaign?.amount_donated,
    progressPercent: goal > 0 ? `${Math.min((raised / goal) * 100, 100)}%` : "0%",
    calculatedRaised: raised,
    calculatedGoal: goal
  });

  const progressPercent = useMemo<DimensionValue>(() => {
    if (!effectiveGoal) return "0%";
    return `${Math.min((raised / effectiveGoal) * 100, 100)}%`;
  }, [raised, effectiveGoal]);

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

    // Calculate period days and recurring flag: monthly = 30, Friday = 9
    const periodDays =
      frequency === "monthly" ? 30 :
      frequency === "friday" ? 9 :
      0;
    const isRecurring = frequency === "monthly" || frequency === "friday";

    const basketItem = {
      campaignId: campaign.id,
      amount: donationAmount,
      quantity: 1,
      name: campaign.name,
      coverImage: campaign.coverImage,
      checkoutType: campaign.checkoutType,
      periodDays,
      isRecurring,
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

  const isAqeeqah = campaign?.checkoutType === "ADEEQAH_GENERAL_SACRIFICE";

  const openAqeeqahOnWeb = () => {
    Linking.openURL("https://www.alihsan.org.au/project/aqeeqah");
  };

  const handleAqeeqahAddToBasket = async (basketItem: any) => {
    let currentBasketItems: any[] = [];
    if (isAuthenticated) {
      const result = await refetchBasket();
      currentBasketItems = result.data?.payload ?? [];
    } else {
      const data = await AsyncStorage.getItem("guestBasket");
      currentBasketItems = data ? JSON.parse(data) : [];
      setGuestBasket(currentBasketItems);
    }
    const existingItem = currentBasketItems.find(
      (item: any) => item.campaignId === campaign?.id
    );
    if (existingItem) {
      setExistingCartItem(existingItem);
      setPendingBasketItem(basketItem);
      setReplaceModalVisible(true);
      return;
    }
    try {
      setAddingToCart(true);
      if (isAuthenticated) {
        await addToBasket({ body: basketItem });
      } else {
        const updated = [...currentBasketItems, basketItem];
        setGuestBasket(updated);
        await AsyncStorage.setItem("guestBasket", JSON.stringify(updated));
      }
      showToast({
        message: "Added to cart",
        type: "success",
        action: { label: "View Cart", onPress: () => router.push("/(tabs)/cart") },
      });
    } catch (err: any) {
      showToast({
        message: err?.message || "Failed to add to cart",
        type: "error",
      });
    } finally {
      setAddingToCart(false);
    }
  };

  const toggleDonationCard = () => {
    const newExpandedState = !donationCardExpanded;
    
    // Always update state first so content is available for animation
    setDonationCardExpanded(newExpandedState);
    
    // Animate after state update
    Animated.timing(expandAnimation, {
      toValue: newExpandedState ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const animatedOpacity = expandAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const animatedHeight = expandAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 300],
  });

  if (loading || !campaign) {
    return <CampaignLoadingScreen />;
  }

  console.log(campaign.name);

  const windowHeight = Dimensions.get("window").height;

  return (
    <View style={[styles.screenWrapper, { height: windowHeight }]}>
    <ScrollView 
      ref={scrollViewRef}
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: donationCardExpanded
          ? 300
          : isAqeeqah
          ? 96
          : 92,
      }}
    >
      {/* ===== HERO ===== */}
      <View style={{ position: "relative" }}>
        <HeroBackground
          source={{ uri: campaign.coverImage }}
          showBack
          onBackPress={() => router.push("/(tabs)/campaigns")}
          containerStyle={{ height: 320 }}
        >
          <View style={styles.heroText}>
            {(() => {
              // Use campaign name at the top
              const rawTitle = campaign.mobileTitle || "";

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
            
            {campaign.mobileSubtitle && (
              <Text
                style={{
                  fontSize: 14,
                  color: "#fff",
                  marginTop: 8,
                  opacity: 0.9,
                }}
              >
                {campaign.mobileSubtitle}
              </Text>
            )}

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
        
        {/* Share Icon */}
        <TouchableOpacity
          style={styles.shareIcon}
          onPress={() => setShareModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="share-outline" size={20} color="#010D264D" />
        </TouchableOpacity>
      </View>

      {/* ===== CONTENT ===== */}
      <View style={styles.content}>
        <Text style={styles.campaignTitle}>
          {campaign.name}
        </Text>
        {isFeatured && raised > 0 && (
          effectiveGoal > 0 ? (
            <>
              <View style={styles.amountGoalRow}>
                <View style={styles.amountLeft}>
                  <Text style={styles.raisedAmount}>${raised.toLocaleString()}</Text>
                  <Text style={styles.goalText}>of ${effectiveGoal.toLocaleString()} goal</Text>
                </View>
                {donorCount > 0 && (
                  <View style={styles.donorCountContainerTop}>
                    <Ionicons name="people" size={16} color="#6B7280" />
                    <Text style={styles.donorCountText}>
                      {donorCount.toLocaleString()} {donorCount === 1 ? 'donor' : 'donors'}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: progressPercent }]} />
              </View>
            </>
          ) : (
            <View style={styles.amountGoalRow}>
              <View style={styles.amountLeft}>
                <Text style={styles.raisedAmount}>${raised.toLocaleString()} raised</Text>
              </View>
              {donorCount > 0 && (
                <View style={styles.donorCountContainerTop}>
                  <Ionicons name="people" size={16} color="#6B7280" />
                  <Text style={styles.donorCountText}>
                    {donorCount.toLocaleString()} {donorCount === 1 ? 'donor' : 'donors'}
                  </Text>
                </View>
              )}
            </View>
          )
        )}

        {/* ===== TABS ===== */}
        <View style={styles.tabContainer}>
          <View style={styles.tabBar}>
            {(["details", "faq", "impact"] as const).map((tab, index) => {
              const isActive = activeTab === tab;
              const tabLabels: Record<typeof tab, string> = {
                details: "Details",
                faq: "FAQ's",
                impact: "Impact",
              };
              return (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tab, { zIndex: 2 }]}
                  onPress={() => {
                    setActiveTab(tab);
                    if (tab !== "faq") setActiveFaqIndex(null);
                    Animated.spring(tabIndicatorAnimation, {
                      toValue: index,
                      useNativeDriver: false,
                      tension: 50,
                      friction: 7,
                    }).start();
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                    {tabLabels[tab]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Animated.View
            style={[
              styles.tabIndicator,
              {
                width: Dimensions.get("window").width / 3,
                transform: [
                  {
                    translateX: tabIndicatorAnimation.interpolate({
                      inputRange: [0, 1, 2],
                      outputRange: [0, Dimensions.get("window").width / 3, (Dimensions.get("window").width / 3) * 2],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>

        {/* ===== TAB CONTENT ===== */}
        <View style={styles.tabContent}>
          {activeTab === "details" && (
            <View style={styles.tabPanel}>
              <View style={styles.detailsPanelInner}>
              {campaign.mobileDescription ? (
                <RenderHTML
                  contentWidth={Dimensions.get("window").width - 32}
                  source={{ html: campaign.mobileDescription }}
                  defaultTextProps={{
                    style: {
                      fontFamily: "AlbertSans_400Regular",
                    },
                  }}
                  tagsStyles={{
                    p: {
                      ...styles.bodyText,
                      marginBottom: 0,
                      marginTop: 0,
                    },
                    br: {
                      lineHeight: 4,
                      height: 4,
                      marginTop: 0,
                      marginBottom: 0,
                    },
                    h3: {
                      ...styles.bodyText,
                      fontSize: 20,
                      fontWeight: "700",
                      fontFamily: "AlbertSans_700Bold",
                      textAlign: "center",
                      marginTop: 12,
                    },
                    h5: {
                      ...styles.bodyText,
                      fontSize: 16,
                      fontWeight: "700",
                      fontFamily: "AlbertSans_700Bold",
                      marginTop: 12,
                    },
                    strong: {
                      ...styles.bodyText,
                      fontWeight: "700",
                      fontFamily: "AlbertSans_700Bold",
                    },
                    b: {
                      ...styles.bodyText,
                      fontWeight: "700",
                      fontFamily: "AlbertSans_700Bold",
                    },
                    em: {
                      ...styles.bodyText,
                      fontStyle: "italic",
                    },
                    i: {
                      ...styles.bodyText,
                      fontStyle: "italic",
                    },
                    ul: {
                      ...styles.bodyText,
                      marginTop: 8,
                      marginBottom: 8,
                    },
                    ol: {
                      ...styles.bodyText,
                      marginTop: 8,
                      marginBottom: 8,
                    },
                    li: {
                      ...styles.bodyText,
                      marginBottom: 4,
                    },
                    a: {
                      ...styles.bodyText,
                      color: "#246BE1",
                      textDecorationLine: "underline",
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
              )}
              </View>
            </View>
          )}

          {activeTab === "faq" && (
            <View style={styles.tabPanel}>
              {(() => {
                const defaultFAQs = [
                  {
                    question: "How will my donation be used?",
                    answer: "Your donation will directly support our campaign efforts, helping us reach our goal and make a meaningful impact in the lives of those we serve. We ensure transparency in all our operations.",
                  },
                  {
                    question: "Is my donation tax-deductible?",
                    answer: "Yes, all donations are tax-deductible. You will receive a receipt via email that you can use for tax purposes.",
                  },
                  {
                    question: "Can I donate anonymously?",
                    answer: "Absolutely! You have the option to make your donation anonymous when completing the donation process. Your privacy is important to us.",
                  },
                  {
                    question: "What payment methods do you accept?",
                    answer: "We accept all major credit cards, debit cards, and bank transfers. All transactions are secure and encrypted.",
                  },
                  {
                    question: "How can I track the impact of my donation?",
                    answer: "You can follow our updates on this campaign page and through our regular email newsletters. We share progress reports and impact stories regularly.",
                  },
                ];

                const faqs = campaign.faq && Array.isArray(campaign.faq) && campaign.faq.length > 0 
                  ? campaign.faq 
                  : defaultFAQs;

                return (
                  <View style={styles.faqAccordionList}>
                    {faqs.map((item: any, index: number) => {
                      const isOpen = activeFaqIndex === index;
                      return (
                        <View key={index} style={[styles.faqAccordionItem, isOpen && styles.faqAccordionItemOpen]}>
                          <TouchableOpacity
                            style={styles.faqAccordionHeader}
                            onPress={() => setActiveFaqIndex(isOpen ? null : index)}
                            activeOpacity={0.7}
                          >
                            <View style={[styles.faqAccordionNumber, isOpen && styles.faqAccordionNumberActive]}>
                              <Text style={[styles.faqAccordionNumberText, isOpen && styles.faqAccordionNumberTextActive]}>
                                {index + 1}
                              </Text>
                            </View>
                            <Text style={styles.faqAccordionQuestion} numberOfLines={isOpen ? 10 : 2}>
                              {item.question || item.Q}
                            </Text>
                            <Ionicons
                              name="chevron-down"
                              size={20}
                              color={isOpen ? "#2161CD" : "#6B7280"}
                              style={[styles.faqAccordionChevron, isOpen && styles.faqAccordionChevronOpen]}
                            />
                          </TouchableOpacity>
                          {isOpen && (
                            <View style={styles.faqAccordionBody}>
                              <Text style={styles.faqAccordionAnswer}>{item.answer || item.A}</Text>
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>
                );
              })()}
            </View>
          )}

          {activeTab === "impact" && (
            <View style={styles.tabPanel}>
              {(() => {
                // Use same raised/effectiveGoal as featured block
                const averageDonation = donorCount > 0 ? raised / donorCount : 0;
                const impactFigure = campaign?.impactFigure || campaign?.impact_figure || 0;
                const progressPercentage = effectiveGoal > 0 ? Math.min((raised / effectiveGoal) * 100, 100) : 0;
                const remainingAmount = effectiveGoal > 0 ? Math.max(effectiveGoal - raised, 0) : 0;

                const hasImpactData = raised > 0 || donorCount > 0 || impactFigure > 0 || effectiveGoal > 0;

                if (!hasImpactData) {
                  return (
                    <View style={styles.impactEmptyState}>
                      <View style={styles.impactEmptyIconContainer}>
                        <Ionicons name="trending-up-outline" size={28} color="#9CA3AF" />
                      </View>
                      <Text style={styles.impactEmptyText}>No impact data yet</Text>
                      <Text style={styles.impactEmptySubtext}>
                        Stats will show here as the campaign progresses
                      </Text>
                    </View>
                  );
                }

                const stats = [];

                if (donorCount > 0) {
                  stats.push({
                    label: "Donors",
                    value: donorCount.toLocaleString(),
                    icon: "people",
                    color: "#10B981",
                    bgColor: "#ECFDF5",
                  });
                }

                if (averageDonation > 0 && donorCount > 0) {
                  stats.push({
                    label: "Avg Donation",
                    value: `$${Math.round(averageDonation).toLocaleString()}`,
                    icon: "trending-up",
                    color: "#F59E0B",
                    bgColor: "#FFFBEB",
                  });
                }

                if (impactFigure > 0) {
                  stats.push({
                    label: "Lives Impacted",
                    value: impactFigure.toLocaleString(),
                    icon: "heart",
                    color: "#EF4444",
                    bgColor: "#FEF2F2",
                  });
                }

                return (
                  <View style={styles.impactCompactContainer}>
                    {isFeatured && raised > 0 && (
                      <View style={styles.impactTotalRaisedCard}>
                        <Text style={styles.impactTotalRaisedLabel}>Total raised</Text>
                        <Text style={styles.impactTotalRaisedValue}>
                          ${raised.toLocaleString()}
                        </Text>
                      </View>
                    )}
                    {stats.length > 0 && (
                      <View style={styles.impactStatsGrid}>
                        {stats.map((stat, index) => (
                          <View key={index} style={styles.impactStatCard}>
                            <View style={[styles.impactStatIconContainer, { backgroundColor: stat.bgColor }]}>
                              <Ionicons name={stat.icon as any} size={16} color={stat.color} />
                            </View>
                            <Text style={styles.impactStatValue}>{stat.value}</Text>
                            <Text style={styles.impactStatLabel}>{stat.label}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                    {isFeatured && effectiveGoal > 0 && (
                      <View style={styles.impactProgressCard}>
                        <View style={styles.impactProgressHeader}>
                          <Text style={styles.impactProgressTitle}>Goal</Text>
                          <Text style={styles.impactProgressPercentage}>
                            {Math.round(progressPercentage)}%
                          </Text>
                        </View>
                        <View style={styles.impactProgressBar}>
                          <View
                            style={[styles.impactProgressFill, { width: `${progressPercentage}%` }]}
                          />
                        </View>
                        <View style={styles.impactProgressDetails}>
                          <View style={styles.impactProgressDetailItem}>
                            <Text style={styles.impactProgressDetailLabel}>Raised</Text>
                            <Text style={styles.impactProgressDetailValue}>
                              ${raised.toLocaleString()}
                            </Text>
                          </View>
                          <View style={styles.impactProgressDetailItem}>
                            <Text style={styles.impactProgressDetailLabel}>Goal</Text>
                            <Text style={styles.impactProgressDetailValue}>
                              ${effectiveGoal.toLocaleString()}
                            </Text>
                          </View>
                          {remainingAmount > 0 && (
                            <View style={styles.impactProgressDetailItem}>
                              <Text style={styles.impactProgressDetailLabel}>Left</Text>
                              <Text style={[styles.impactProgressDetailValue, styles.impactProgressDetailValueMuted]}>
                                ${remainingAmount.toLocaleString()}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    )}
                  </View>
                );
              })()}
            </View>
          )}
        </View>
      </View>
    </ScrollView>

    {/* Fixed Bottom Donation Card - same layout for all: Aqeeqah = "Complete on website", others = amount + Donate */}
    <View
      style={[
        styles.bottomDonationCard,
        isAqeeqah && !donationCardExpanded && styles.bottomDonationCardAqeeqahOnly,
        { paddingBottom: 8 },
      ]}
    >
      {/* Closed State - full width: Aqeeqah = single button (minimal height), others = amount row + Donate + expand */}
      {!donationCardExpanded && (
        <View style={[styles.bottomDonationClosed, isAqeeqah && styles.bottomDonationClosedAqeeqah]}>
          {isAqeeqah ? (
            <TouchableOpacity
              style={styles.bottomDonateBtnClosed}
              onPress={openAqeeqahOnWeb}
              activeOpacity={0.8}
            >
              <Text style={styles.bottomDonateTextClosed}>
                Complete on website
              </Text>
            </TouchableOpacity>
          ) : (
            <>
              <View style={styles.bottomAmountRowClosed}>
                {["10", "25", "50", "100"].map((v) => (
                  <TouchableOpacity
                    key={v}
                    onPress={() => setAmount(v)}
                    style={[
                      styles.bottomAmountButtonClosed,
                      amount === v && styles.bottomAmountButtonClosedActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.bottomAmountButtonTextClosed,
                        amount === v && styles.bottomAmountButtonTextClosedActive,
                      ]}
                    >
                      ${v}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.bottomClosedFooter}>
                <TouchableOpacity
                  style={styles.bottomDonateBtnClosed}
                  onPress={handleDonate}
                  disabled={addingToCart}
                >
                  <Text style={styles.bottomDonateTextClosed}>
                    {isInCart
                      ? "Update Cart"
                      : addingToCart
                      ? "Adding..."
                      : "Donate Now"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.bottomExpandButton}
                  onPress={toggleDonationCard}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chevron-up" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      )}

      {/* Expanded State - only mount when open so closed card has minimal height */}
      {donationCardExpanded && (
      <Animated.View
        style={[
          styles.bottomDonationExpanded,
          {
            opacity: animatedOpacity,
            maxHeight: isAqeeqah ? 450 : animatedHeight,
            overflow: "hidden",
          },
        ]}
        pointerEvents="auto"
      >
        <View>
            {/* Header with Close Button */}
            <View style={styles.bottomExpandedHeader}>
              <Text style={styles.bottomExpandedTitle}>
                {isAqeeqah ? "Aqeeqah donation" : "Choose Donation"}
              </Text>
              <TouchableOpacity
                onPress={toggleDonationCard}
                activeOpacity={0.7}
                style={styles.bottomCloseButton}
              >
                <Ionicons name="chevron-down" size={20} color="#010D26" />
              </TouchableOpacity>
            </View>

          {isAqeeqah ? (
            <AqeeqahDonationOptions
              campaign={campaign}
              onAddToBasket={handleAqeeqahAddToBasket}
              addingToCart={addingToCart}
            />
          ) : (
            <>
          {/* Frequency Options */}
          <View style={styles.bottomFrequencyRow}>
            <TouchableOpacity
              style={[
                styles.bottomFrequencyButton,
                frequency === "onetime" && styles.bottomFrequencyButtonActive,
              ]}
              onPress={() => setFrequency("onetime")}
            >
              <Text
                style={[
                  styles.bottomFrequencyButtonText,
                  frequency === "onetime" && styles.bottomFrequencyButtonTextActive,
                ]}
              >
                One-time
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.bottomFrequencyButton,
                frequency === "monthly" && styles.bottomFrequencyButtonActive,
              ]}
              onPress={() => setFrequency("monthly")}
            >
              <Text
                style={[
                  styles.bottomFrequencyButtonText,
                  frequency === "monthly" && styles.bottomFrequencyButtonTextActive,
                ]}
              >
                Monthly
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.bottomFrequencyButton,
                frequency === "friday" && styles.bottomFrequencyButtonActive,
              ]}
              onPress={() => setFrequency("friday")}
            >
              <Text
                style={[
                  styles.bottomFrequencyButtonText,
                  frequency === "friday" && styles.bottomFrequencyButtonTextActive,
                ]}
              >
                Friday
              </Text>
            </TouchableOpacity>
          </View>

          {/* Amount Buttons */}
          <View style={styles.bottomAmountRow}>
            {["10", "25", "50", "100"].map((v) => (
              <TouchableOpacity
                key={v}
                onPress={() => setAmount(v)}
                style={[
                  styles.bottomAmountButton,
                  amount === v && styles.bottomAmountButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.bottomAmountButtonText,
                    amount === v && styles.bottomAmountButtonTextActive,
                  ]}
                >
                  ${v}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom Amount Input */}
          <View style={styles.bottomCustomAmount}>
            <Text style={styles.bottomCurrencyPrefix}>$</Text>
            <TextInput
              style={styles.bottomCustomInput}
              value={amount}
              onChangeText={handleAmountChange}
              keyboardType="numeric"
              placeholder="Custom Amount"
              placeholderTextColor="#999"
            />
            <Text style={styles.bottomCurrency}>AUD</Text>
          </View>

          {/* Donate Button */}
          <TouchableOpacity
            style={styles.bottomDonateBtn}
            onPress={handleDonate}
            disabled={addingToCart}
          >
            <Text style={styles.bottomDonateText}>
              {isInCart
                ? "Update Cart"
                : addingToCart
                ? "Adding..."
                : "Donate Now"}
            </Text>
          </TouchableOpacity>
            </>
          )}
        </View>
      </Animated.View>
      )}
    </View>

    <ReplaceOrRemoveModal
      visible={replaceModalVisible}
      campaignName={campaign?.name}
      onCancel={handleCancelModal}
      onReplace={handleReplace}
    />

    <ShareCampaignModal
      visible={shareModalVisible}
      campaignName={campaign?.name || ""}
      campaignUrl={`https://alihsan.org.au/project/${slug}`}
      onClose={() => setShareModalVisible(false)}
    />
    </View>
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
  screenWrapper: { flex: 1 },
  container: { flex: 1, backgroundColor: "#fff" },

  /* HERO */
  shareIcon: {
    position: "absolute",
    top: 48,
    right: 16,
    zIndex: 20,
    borderWidth: 1,
    borderColor: "#010D264D",
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
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
  amountGoalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  amountLeft: {
    flex: 1,
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
    width: "100%",
    height: 6,
    backgroundColor: "#eee",
    borderRadius: 3,
    marginBottom: 4,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#f4c430",
    borderRadius: 3,
  },
  donorCountContainerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  donorCountContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  donorCountContainerStandalone: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    marginBottom: 4,
  },
  donorCountText: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: "AlbertSans_400Regular",
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#010D26",
    marginBottom: 0,
  },

  bodyText: {
    fontSize: 14,
    lineHeight: 18,
    color: "#555",
    marginTop: 8,
    marginBottom: 0,
    fontFamily: "AlbertSans_400Regular",
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
  donationCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    overflow: "hidden",
  },
  donationCardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  donationAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  donationInfo: { 
    flex: 1,
  },
  donorName: { 
    fontSize: 15,
    fontWeight: "600",
    color: "#010D26",
    marginBottom: 4,
    fontFamily: "AlbertSans_600SemiBold",
  },
  donationMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeText: { 
    fontSize: 12,
    color: "#9CA3AF",
    fontFamily: "AlbertSans_400Regular",
  },
  donationAmountContainer: {
    alignItems: "flex-end",
  },
  donationValue: { 
    fontSize: 18,
    fontWeight: "700",
    color: "#246BE1",
    fontFamily: "AlbertSans_700Bold",
  },
  donationCurrency: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 2,
    fontFamily: "AlbertSans_400Regular",
  },
  /* IMPACT TAB STYLES */
  impactCompactContainer: {
    gap: 12,
    width: "100%",
    alignSelf: "stretch",
  },
  impactTotalRaisedCard: {
    width: "100%",
    alignSelf: "stretch",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  impactTotalRaisedLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
    fontFamily: "AlbertSans_400Regular",
  },
  impactTotalRaisedValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    fontFamily: "AlbertSans_700Bold",
  },
  impactEmptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  impactEmptyIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  impactEmptyText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 6,
    fontFamily: "AlbertSans_600SemiBold",
  },
  impactEmptySubtext: {
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 18,
    fontFamily: "AlbertSans_400Regular",
  },
  impactStatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    width: "100%",
    alignSelf: "stretch",
  },
  impactStatCard: {
    flex: 1,
    minWidth: "30%",
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  impactStatIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  impactStatValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
    fontFamily: "AlbertSans_700Bold",
  },
  impactStatLabel: {
    fontSize: 11,
    color: "#6B7280",
    fontFamily: "AlbertSans_400Regular",
    textAlign: "center",
  },
  impactProgressCard: {
    width: "100%",
    alignSelf: "stretch",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  impactProgressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  impactProgressTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    fontFamily: "AlbertSans_600SemiBold",
  },
  impactProgressPercentage: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2161CD",
    fontFamily: "AlbertSans_700Bold",
  },
  impactProgressBar: {
    height: 6,
    backgroundColor: "#EEEEEE",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 10,
  },
  impactProgressFill: {
    height: "100%",
    backgroundColor: "#2161CD",
    borderRadius: 3,
  },
  impactProgressDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    width: "100%",
    alignSelf: "stretch",
  },
  impactProgressDetailItem: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
  },
  impactProgressDetailLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    marginBottom: 2,
    fontFamily: "AlbertSans_400Regular",
  },
  impactProgressDetailValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
    fontFamily: "AlbertSans_600SemiBold",
  },
  impactProgressDetailValueMuted: {
    color: "#6B7280",
  },

  /* TABS */
  tabContainer: {
    marginTop: 16,
    marginBottom: 12,
    marginHorizontal: -16,
  },
  tabBar: {
    flexDirection: "row",
    position: "relative",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#9CA3AF",
    fontFamily: "AlbertSans_500Medium",
  },
  tabLabelActive: {
    color: "#111827",
    fontWeight: "600",
    fontFamily: "AlbertSans_600SemiBold",
  },
  tabIndicator: {
    position: "absolute",
    bottom: -1,
    height: 2,
    backgroundColor: "#2161CD",
    borderRadius: 1,
    zIndex: 1,
  },
  tabContent: {
    minHeight: 180,
  },
  tabPanel: {
    paddingBottom: 12,
  },
  detailsPanelInner: {
    paddingRight: 0,
    alignSelf: "stretch",
  },
  faqAccordionList: {
    gap: 8,
  },
  faqAccordionItem: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
    backgroundColor: "#FFF",
  },
  faqAccordionItemOpen: {
    borderColor: "#2161CD",
    backgroundColor: "#FFF",
  },
  faqAccordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
  },
  faqAccordionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  faqAccordionNumberActive: {
    backgroundColor: "#2161CD",
  },
  faqAccordionNumberText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6B7280",
    fontFamily: "AlbertSans_700Bold",
  },
  faqAccordionNumberTextActive: {
    color: "#FFF",
  },
  faqAccordionQuestion: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    lineHeight: 20,
    fontFamily: "AlbertSans_600SemiBold",
  },
  faqAccordionChevron: {
    transform: [{ rotate: "0deg" }],
  },
  faqAccordionChevronOpen: {
    transform: [{ rotate: "180deg" }],
  },
  faqAccordionBody: {
    paddingLeft: 54,
    paddingRight: 14,
    paddingBottom: 14,
    paddingTop: 2,
  },
  faqAccordionAnswer: {
    fontSize: 14,
    lineHeight: 20,
    color: "#6B7280",
    fontFamily: "AlbertSans_400Regular",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 8,
    fontFamily: "AlbertSans_600SemiBold",
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 8,
    textAlign: "center",
    fontFamily: "AlbertSans_400Regular",
    paddingHorizontal: 32,
  },

  /* BOTTOM DONATION CARD - fixed to bottom of screen */
  bottomDonationCard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#F5F5F5",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
    zIndex: 100,
  },
  /* Closed State - minimal height, compact */
  bottomDonationClosed: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 0,
  },
  /* Aqeeqah closed: compact padding around button */
  bottomDonationClosedAqeeqah: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  /* Card when Aqeeqah closed only */
  bottomDonationCardAqeeqahOnly: {
    paddingHorizontal: 16,
  },
  bottomAqeeqahClosed: {
    paddingVertical: 4,
  },
  bottomAqeeqahClosedText: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 6,
    textAlign: "center",
  },
  bottomExpandButtonAqeeqah: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#264B8B",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  bottomExpandButtonAqeeqahText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  bottomAmountRowClosed: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 4,
  },
  bottomAmountButtonClosed: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#fff",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  bottomAmountButtonClosedActive: {
    backgroundColor: "#246BE1",
    borderColor: "#246BE1",
  },
  bottomAmountButtonTextClosed: {
    fontSize: 13,
    fontWeight: "600",
    color: "#010D26",
    fontFamily: "AlbertSans_600SemiBold",
  },
  bottomAmountButtonTextClosedActive: {
    color: "#fff",
    fontWeight: "700",
    fontFamily: "AlbertSans_700Bold",
  },
  bottomClosedFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 0,
  },
  bottomDonateBtnClosed: {
    flex: 1,
    backgroundColor: "#FFD602",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#FFD602",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  bottomDonateTextClosed: {
    fontSize: 15,
    fontWeight: "700",
    color: "#010D26",
    fontFamily: "AlbertSans_700Bold",
  },
  bottomExpandButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  /* Expanded State - compact */
  bottomDonationExpanded: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
  },
  bottomExpandedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  bottomExpandedTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#010D26",
    fontFamily: "AlbertSans_700Bold",
  },
  bottomCloseButton: {
    padding: 4,
  },
  bottomFrequencyRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 6,
  },
  bottomFrequencyButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#fff",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  bottomFrequencyButtonActive: {
    backgroundColor: "#246BE1",
    borderColor: "#246BE1",
  },
  bottomFrequencyButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    fontFamily: "AlbertSans_600SemiBold",
  },
  bottomFrequencyButtonTextActive: {
    color: "#fff",
    fontWeight: "700",
    fontFamily: "AlbertSans_700Bold",
  },
  bottomAmountRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 8,
  },
  bottomAmountButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#fff",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  bottomAmountButtonActive: {
    backgroundColor: "#246BE1",
    borderColor: "#246BE1",
  },
  bottomAmountButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#010D26",
    fontFamily: "AlbertSans_600SemiBold",
  },
  bottomAmountButtonTextActive: {
    color: "#fff",
    fontWeight: "700",
    fontFamily: "AlbertSans_700Bold",
  },
  bottomCustomAmount: {
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  bottomCurrencyPrefix: {
    fontSize: 14,
    color: "#010D26",
    fontWeight: "600",
    marginRight: 6,
    fontFamily: "AlbertSans_600SemiBold",
  },
  bottomCustomInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#010D26",
    fontFamily: "AlbertSans_600SemiBold",
  },
  bottomCurrency: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
    marginLeft: 6,
    fontFamily: "AlbertSans_600SemiBold",
  },
  bottomDonateBtn: {
    backgroundColor: "#FFD602",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#FFD602",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  bottomDonateText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#010D26",
    fontFamily: "AlbertSans_700Bold",
  },
});
