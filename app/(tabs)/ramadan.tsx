import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSelector } from "react-redux";
import {
  useAddToBasketMutation,
  useGetBasketQuery,
  useRemoveFromBasketMutation,
} from "@/store/reduxSlice/api/basketApi";
import { getCampaignDetails, getRamadanQuickDonations } from "@/utils/api";
import { useToast } from "@/context/ToastContext";
import { Image as ExpoImage } from "expo-image";
import HeroBackground from "@/components/ui/GradientImage";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const PRIMARY_300 = "#1F3A8A";
const HERO_IMAGE =
  "https://alihsan.s3.ap-southeast-2.amazonaws.com/ramadan-quick-donations/1768551048888-alihsan-108%20Large.jpeg";

const FAQ_ITEMS = [
  { question: "What is the Ramadan Appeal?", answer: "It helps provide food packs, cooked iftar meals, and Eid clothing to vulnerable families across the Ummah." },
  { question: "Why is giving during Ramadan so important?", answer: "Charity given in Ramadan carries immense reward and spiritual impact. The Prophet ﷺ was most generous during this month." },
  { question: "Who does this Ramadan Appeal support?", answer: "Families facing poverty, displacement, and food insecurity - including widows, orphans, the elderly, refugees, and communities affected by crisis." },
  { question: "How does my donation help a family during Ramadan?", answer: "It provides food for suhoor and iftar, ready-to-eat meals, and Eid clothes for children." },
  { question: "What is included in a Ramadan Food Pack?", answer: "Staples such as rice, lentils, chickpeas, oil, tea, spices, and other essentials. Fresh items may include chicken, meat, potatoes, and eggs." },
  { question: "What is the Ramadan Combo Pack?", answer: "The $250 pack includes a Large Food Pack, 30 Hot Meals, and Eid clothes for a child." },
  { question: "Are donations delivered before or during Ramadan?", answer: "Where possible, food packs are delivered before Ramadan begins. Distributions continue throughout the month." },
  { question: "How does Al-Ihsan Foundation deliver aid?", answer: "We work with trusted local partners to source, prepare, and distribute aid responsibly." },
  { question: "When does Ramadan 2026 begin in Australia?", answer: "It is expected to begin around 19–20 February, depending on sighting of the moon. Final dates are confirmed in accordance with the Sunnah and the moon‑sighting method each community follows." },
  { question: "How can I stay updated on the impact of my donation?", answer: "We share regular updates on our website, via email, and on social media." },
];

/** Static Iftar donation items (matches AU Next.js RamadanQuickAddToCart) */
const IFTAR_ITEMS = [
  {
    id: "iftar-50",
    title: "Iftar for 50 People",
    amount: 150,
    image:
      "https://alihsan.s3.ap-southeast-2.amazonaws.com/ramadan/1772167803531-alihsan-4ec97e9ee9d4fb10795c864c914c8156e182db57%20%281%29%20Large.jpeg",
  },
  {
    id: "iftar-100",
    title: "Iftar for 100 People",
    amount: 300,
    image:
      "https://alihsan.s3.ap-southeast-2.amazonaws.com/ramadan/1772167803472-alihsan-ae46dbc95b23c92214c09f2311d5860503501f21%20Large.jpeg",
  },
  {
    id: "iftar-200",
    title: "Iftar for 200 People",
    amount: 600,
    image:
      "https://alihsan.s3.ap-southeast-2.amazonaws.com/ramadan/1772167890112-alihsan-iftar50%20%281%29%20Large.jpeg",
  },
];

const TOP_COMBO_TABS = [
  {
    id: "ramadan-trio-pack",
    title: "Ramadan Trio Pack",
    amount: 250,
    badge: "BEST VALUE",
    features: [
      "Full month food pack for a family",
      "30 hot meals for Iftar",
      "Eid Gift for a Child",
    ],
  },
  {
    id: "ramadan-relief-pack",
    title: "Ramadan Relief Pack",
    amount: 550,
    badge: "MOST POPULAR",
    features: [
      "$120 food pack",
      "100 hot meals",
      "Eid gifts",
      "25kg Rice Bag",
      "2kg Box of Dates",
    ],
  },
];

type RamadanQuickItem = {
  id: number;
  title: string;
  description?: string;
  image: string;
  price: number;
  slug: string;
  donationItem: string;
  campaignId: number;
  postText?: string;
  campaign?: {
    id: number;
    name: string;
    slug: string;
    coverImage: string;
    checkoutType?: string;
  };
};

export default function RamadanPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showToast } = useToast();
  const { user } = useSelector((state: any) => state.authentication);
  const isAuthenticated = !!user;

  const [featuredItems, setFeaturedItems] = useState<RamadanQuickItem[]>([]);
  const [subItems, setSubItems] = useState<RamadanQuickItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [ramadanCampaign, setRamadanCampaign] = useState<any>(null);
  const [activeTopComboTab, setActiveTopComboTab] = useState("ramadan-trio-pack");
  const [trioComboQuantity, setTrioComboQuantity] = useState(1);
  const [cartQuantities, setCartQuantities] = useState<Record<number | string, number>>({});
  const [addingProductId, setAddingProductId] = useState<string | number | null>(null);
  const [guestBasket, setGuestBasket] = useState<any[]>([]);
  const [activeInfoTab, setActiveInfoTab] = useState<"FAQ" | "Information">("Information");
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);

  const [addToBasket] = useAddToBasketMutation();
  const [removeFromBasket] = useRemoveFromBasketMutation();
  const { data: basketData, refetch: refetchBasket } = useGetBasketQuery(undefined, {
    skip: !isAuthenticated,
  });

  const basketItems = isAuthenticated ? basketData?.payload ?? [] : guestBasket;

  const loadGuestBasket = useCallback(async () => {
    if (!isAuthenticated) {
      const data = await AsyncStorage.getItem("guestBasket");
      setGuestBasket(data ? JSON.parse(data) : []);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadGuestBasket();
  }, [loadGuestBasket]);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [donations, ramadanProject] = await Promise.all([
          getRamadanQuickDonations(),
          getCampaignDetails("ramadan", { allowBmt: true }),
        ]);
        setFeaturedItems(donations.featuredItems);
        setSubItems(donations.subItems);
        const campaign = ramadanProject?.campaign ?? ramadanProject;
        setRamadanCampaign(campaign);
        const allIds = [
          ...donations.featuredItems.map((i) => i.id),
          ...donations.subItems.map((i) => i.id),
        ];
        setCartQuantities((prev) => {
          const next = { ...prev };
          allIds.forEach((id) => {
            if (next[id] == null) next[id] = 1;
          });
          return next;
        });
      } catch (e) {
        if (__DEV__) console.error("Ramadan fetch error:", e);
        showToast({ message: "Unable to load Ramadan items", type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [showToast]);

  const activeTopCombo = useMemo(
    () => TOP_COMBO_TABS.find((t) => t.id === activeTopComboTab) ?? TOP_COMBO_TABS[0],
    [activeTopComboTab]
  );

  const getQuantity = (id: number | string) => cartQuantities[id] ?? 1;
  const setQuantity = (id: number | string, delta: number) => {
    setCartQuantities((prev) => {
      const current = prev[id] ?? 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const addRamadanItemToCart = async (params: {
    campaignId: number;
    donationItem: string;
    amount: number;
    quantity: number;
    name: string;
    coverImage: string;
    checkoutType?: string;
  }) => {
    const { campaignId, donationItem, amount, quantity, name, coverImage, checkoutType } = params;
    const basketItem = {
      campaignId,
      donationItem,
      amount,
      quantity,
      name: name || "Ramadan Appeal 2026",
      coverImage,
      checkoutType: checkoutType || "COMMON",
      isRecurring: false,
      periodDays: null,
    };

    const existing = basketItems.find(
      (item: any) => item.campaignId === campaignId && item.donationItem === donationItem
    );
    const isUpdate = !!existing;
    const newQuantity = isUpdate ? (existing?.quantity ?? 0) + quantity : quantity;
    const finalItem = {
      ...basketItem,
      quantity: newQuantity,
      total: amount * newQuantity,
    };

    try {
      if (isAuthenticated) {
        if (existing) {
          await removeFromBasket({ campaignId, donationItem });
          await refetchBasket();
        }
        await addToBasket({ body: { ...basketItem, quantity: newQuantity, total: amount * newQuantity } });
        await refetchBasket();
      } else {
        const withoutThis = guestBasket.filter(
          (item: any) => !(item.campaignId === campaignId && item.donationItem === donationItem)
        );
        const updated = [...withoutThis, finalItem];
        setGuestBasket(updated);
        await AsyncStorage.setItem("guestBasket", JSON.stringify(updated));
      }
      showToast({
        message: existing ? "Cart updated" : "Added to cart",
        type: "success",
        action: { label: "View Cart", onPress: () => router.push("/(tabs)/cart") },
      });
    } catch {
      showToast({ message: "Failed to add to cart", type: "error" });
    }
  };

  const handleTopComboAddToCart = async () => {
    const isRelief = activeTopComboTab === "ramadan-relief-pack";
    const slug = isRelief ? "ramadan-relief-pack" : "ramadan";
    const campaignSource = isRelief
      ? await getCampaignDetails(slug, { allowBmt: true })
      : { campaign: ramadanCampaign };
    const campaign = campaignSource?.campaign ?? campaignSource;
    if (!campaign?.id) {
      showToast({ message: "Campaign not available. Try again.", type: "error" });
      return;
    }
    const name = isRelief ? "Ramadan Relief Pack" : "Ramadan Trio Pack";
    await addRamadanItemToCart({
      campaignId: campaign.id,
      donationItem: name,
      amount: activeTopCombo.amount,
      quantity: trioComboQuantity,
      name: campaign.name || name,
      coverImage: campaign.coverImage || "",
      checkoutType: campaign.checkoutType,
    });
    setTrioComboQuantity(1);
  };

  const handleQuickItemAddToCart = async (item: RamadanQuickItem) => {
    setAddingProductId(item.id);
    try {
      const slug = item.slug || item.campaign?.slug;
      if (!slug) {
        showToast({ message: "Campaign not available.", type: "error" });
        return;
      }
      const data = await getCampaignDetails(slug, { allowBmt: true });
      const campaign = data?.campaign ?? data;
      if (!campaign?.id) {
        showToast({ message: "Campaign not available. Try again.", type: "error" });
        return;
      }
      const qty = getQuantity(item.id);
      await addRamadanItemToCart({
        campaignId: campaign.id,
        donationItem: item.donationItem || item.title,
        amount: item.price,
        quantity: qty,
        name: campaign.name || "Ramadan Appeal 2026",
        coverImage: item.image || campaign.coverImage || "",
        checkoutType: campaign.checkoutType,
      });
    } catch {
      showToast({ message: "Failed to add to cart", type: "error" });
    } finally {
      setAddingProductId(null);
    }
  };

  const handleIftarAddToCart = async (item: (typeof IFTAR_ITEMS)[0]) => {
    setAddingProductId(item.id);
    try {
      const data = await getCampaignDetails("ramadan-hot-meals", { allowBmt: true });
      const campaign = data?.campaign ?? data;
      if (!campaign?.id) {
        showToast({ message: "Campaign not available.", type: "error" });
        return;
      }
      await addRamadanItemToCart({
        campaignId: campaign.id,
        donationItem: item.title,
        amount: item.amount,
        quantity: 1,
        name: campaign.name || "Ramadan Hot Meals",
        coverImage: item.image,
        checkoutType: campaign.checkoutType,
      });
    } catch {
      showToast({ message: "Failed to add to cart", type: "error" });
    } finally {
      setAddingProductId(null);
    }
  };

  if (loading) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top + 100 }]}>
        <ActivityIndicator size="large" color={PRIMARY_300} />
        <Text style={styles.loadingText}>Loading Ramadan appeal…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero - same as campaign slug banner: HeroBackground, Guthen, no safe area top */}
        <View style={styles.heroWrap}>
          <HeroBackground
            source={{ uri: HERO_IMAGE }}
            showBack
            onBackPress={() => router.back()}
            containerStyle={styles.heroBanner}
          >
            <View style={styles.heroText}>
              <Text style={styles.heroTagline}>Bring ease to hardship</Text>
              <Text style={styles.heroTitle}>Ramadan with Ihsan</Text>
            </View>
          </HeroBackground>
        </View>

        {/* Top combo cards */}
        <View style={styles.section}>
          <View style={styles.comboTabs}>
            {TOP_COMBO_TABS.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.comboTab,
                  activeTopComboTab === tab.id && styles.comboTabActive,
                ]}
                onPress={() => setActiveTopComboTab(tab.id)}
              >
                <Text
                  style={[
                    styles.comboTabText,
                    activeTopComboTab === tab.id && styles.comboTabTextActive,
                  ]}
                >
                  {tab.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.comboCard}>
            <View style={styles.comboCardHeader}>
              <Text style={styles.comboCardTitle}>{activeTopCombo.title}</Text>
              <View style={[styles.badge, activeTopCombo.id === "ramadan-trio-pack" && styles.badgeYellow]}>
                <Text style={styles.badgeText}>{activeTopCombo.badge}</Text>
              </View>
            </View>
            {activeTopCombo.features.map((feature, idx) => (
              <View key={idx} style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={18} color="#EAB308" />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
            <View style={styles.comboFooter}>
              <View style={styles.quantityRow}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => setTrioComboQuantity((q) => Math.max(1, q - 1))}
                >
                  <Text style={styles.qtyBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.qtyValue}>{trioComboQuantity}</Text>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => setTrioComboQuantity((q) => q + 1)}
                >
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.addToCartBtn}
                onPress={handleTopComboAddToCart}
                activeOpacity={0.85}
              >
                <Ionicons name="cart" size={18} color="#1f2937" />
                <Text style={styles.addToCartBtnText}>Add to Cart</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.comboTotal}>
              Total: ${(activeTopCombo.amount * trioComboQuantity).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Featured items - original layout: image on top, body with options below */}
        {featuredItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ways to give</Text>
            {featuredItems.map((product) => (
              <View key={product.id} style={styles.featuredCard}>
                <ExpoImage source={{ uri: product.image }} style={styles.featuredImage} contentFit="cover" />
                <View style={styles.featuredBody}>
                  <Text style={styles.featuredTitle}>{product.title}</Text>
                  {product.description ? (
                    <Text style={styles.featuredDesc} numberOfLines={2}>
                      {product.description}
                    </Text>
                  ) : null}
                  <View style={styles.featuredPriceRow}>
                    <Text style={styles.featuredPrice}>${product.price}</Text>
                    <Text style={styles.featuredPer}>{product.postText || "per item"}</Text>
                  </View>
                  <View style={styles.featuredActions}>
                    <View style={styles.quantityRow}>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => setQuantity(product.id, -1)}
                      >
                        <Text style={styles.qtyBtnText}>−</Text>
                      </TouchableOpacity>
                      <Text style={styles.qtyValue}>{getQuantity(product.id)}</Text>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => setQuantity(product.id, 1)}
                      >
                        <Text style={styles.qtyBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      style={styles.addToCartBtn}
                      onPress={() => handleQuickItemAddToCart(product)}
                      disabled={addingProductId === product.id}
                    >
                      {addingProductId === product.id ? (
                        <ActivityIndicator size="small" color="#1f2937" />
                      ) : (
                        <>
                          <Ionicons name="cart" size={16} color="#1f2937" />
                          <Text style={styles.addToCartBtnText}>Add</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.lineTotal}>
                    Total: ${(product.price * getQuantity(product.id)).toFixed(2)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Sub items - increment and Add stuck to far right */}
        {subItems.length > 0 && (
          <View style={styles.section}>
            {subItems.map((product) => (
              <View key={product.id} style={styles.subRow}>
                <Image source={{ uri: product.image }} style={styles.subImage} />
                <View style={styles.subBody}>
                  <Text style={styles.subTitle}>{product.title}</Text>
                  {product.description ? (
                    <Text style={styles.subDesc} numberOfLines={2}>
                      {product.description}
                    </Text>
                  ) : null}
                </View>
                <View style={styles.subActionsRight}>
                  <Text style={styles.subPrice}>${product.price}</Text>
                  <View style={styles.quantityRow}>
                    <TouchableOpacity
                      style={styles.qtyBtnSmall}
                      onPress={() => setQuantity(product.id, -1)}
                    >
                      <Text style={styles.qtyBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyValueSmall}>{getQuantity(product.id)}</Text>
                    <TouchableOpacity
                      style={styles.qtyBtnSmall}
                      onPress={() => setQuantity(product.id, 1)}
                    >
                      <Text style={styles.qtyBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={styles.addBtnSmall}
                    onPress={() => handleQuickItemAddToCart(product)}
                    disabled={addingProductId === product.id}
                  >
                    {addingProductId === product.id ? (
                      <ActivityIndicator size="small" color="#1f2937" />
                    ) : (
                      <>
                        <Ionicons name="cart" size={14} color="#1f2937" />
                        <Text style={styles.addBtnSmallText}>Add</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Iftar row - explore-style cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Iftar meals</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.iftarScroll}
          >
            {IFTAR_ITEMS.map((item) => (
              <View key={item.id} style={styles.iftarCard}>
                <ExpoImage source={{ uri: item.image }} style={styles.iftarImage} contentFit="cover" />
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.5)", "rgba(0,0,0,0.9)"]}
                  locations={[0.35, 0.7, 1]}
                  style={styles.iftarGradient}
                />
                <View style={styles.iftarPriceTag}>
                  <Text style={styles.iftarPriceText}>${item.amount}</Text>
                </View>
                <View style={styles.iftarOverlay}>
                  <Text style={styles.iftarTitle}>{item.title}</Text>
                  <TouchableOpacity
                    style={styles.iftarAddBtn}
                    onPress={() => handleIftarAddToCart(item)}
                    disabled={addingProductId === item.id}
                  >
                    {addingProductId === item.id ? (
                      <ActivityIndicator size="small" color="#010D26" />
                    ) : (
                      <>
                        <Text style={styles.iftarAddBtnText}>Add</Text>
                        <Ionicons name="arrow-forward" size={14} color="#010D26" />
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* FAQ & Information - same layout as Next.js /ramadan */}
        <View style={styles.faqSection}>
          <Text style={styles.faqSectionTitle}>FAQ & Information</Text>
          <View style={styles.faqTabs}>
            <TouchableOpacity
              style={[styles.faqTab, activeInfoTab === "FAQ" && styles.faqTabActive]}
              onPress={() => setActiveInfoTab("FAQ")}
            >
              <Text style={[styles.faqTabText, activeInfoTab === "FAQ" && styles.faqTabTextActive]}>FAQ</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.faqTab, activeInfoTab === "Information" && styles.faqTabActive]}
              onPress={() => setActiveInfoTab("Information")}
            >
              <Text style={[styles.faqTabText, activeInfoTab === "Information" && styles.faqTabTextActive]}>Information</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.faqTabIndicator}>
            <View style={[styles.faqTabIndicatorFill, { width: activeInfoTab === "FAQ" ? "50%" : "100%" }]} />
          </View>

          {activeInfoTab === "FAQ" && (
            <>
              <Text style={styles.faqIntro}>Find answers to common questions about ramadan</Text>
              {FAQ_ITEMS.map((faq, index) => {
                const isOpen = activeFaqIndex === index;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.faqItem, isOpen && styles.faqItemOpen]}
                    onPress={() => setActiveFaqIndex(isOpen ? null : index)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.faqItemHeader}>
                      <View style={[styles.faqItemNumber, isOpen && styles.faqItemNumberActive]}>
                        <Text style={[styles.faqItemNumberText, isOpen && styles.faqItemNumberTextActive]}>{index + 1}</Text>
                      </View>
                      <Text style={styles.faqItemQuestion} numberOfLines={isOpen ? 10 : 2}>{faq.question}</Text>
                      <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={20} color={PRIMARY_300} />
                    </View>
                    {isOpen && (
                      <View style={styles.faqItemBody}>
                        <Text style={styles.faqItemAnswer}>{faq.answer}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </>
          )}

          {activeInfoTab === "Information" && (
            <View style={styles.infoScroll}>
              <Text style={styles.infoMainTitle}>Ramadan Appeal 2026: Feed the Fasting & Support Families with Dignity</Text>
              <Text style={styles.infoMainDesc}>
                This Ramadan, your generosity helps place food on the tables of families across the Ummah - supporting suhoor, iftar, and moments of dignity through food packs, cooked hot meals, and Eid clothing for children.
              </Text>

              <Text style={styles.infoHeading}>What is Ramadan?</Text>
              <Text style={styles.infoBody}>
                Ramadan is the ninth month of the Islamic calendar, a sacred time when Muslims fast, turn deeply to Allah ﷻ, and seek His mercy, forgiveness, and pleasure.
              </Text>
              <View style={styles.infoQuote}>
                <Text style={styles.infoQuoteText}>"O you who believe! Fasting has been prescribed for you as it was prescribed for those before you, so that you may attain Taqwah."</Text>
                <Text style={styles.infoQuoteRef}>- Surah Al-Baqarah 2:183</Text>
              </View>
              <Text style={styles.infoBody}>
                The heart of Ramadan is Taqwa - living with awareness of Allah, guarding ourselves from sin, and striving to please Him in every action we take. Ramadan is a month of worship in all its forms: prayer, fasting, repentance, dua, and patience.
              </Text>

              <Text style={styles.infoHeading}>Who Does Your Ramadan Donation Support?</Text>
              <Text style={styles.infoBody}>This Ramadan, your support reaches people who are fasting through deep hardship:</Text>
              {["Families living in poverty, where daily income barely covers bread", "Widows and elderly individuals without stable support", "Orphans and vulnerable children who have lost routine and safety", "Displaced families forced from their homes by conflict and crisis", "Families in Gaza facing daily hunger and oppression"].map((item, i) => (
                <View key={i} style={styles.infoBulletRow}>
                  <Ionicons name="checkmark-circle" size={20} color={PRIMARY_300} />
                  <Text style={styles.infoBulletText}>{item}</Text>
                </View>
              ))}
              <View style={styles.infoQuote}>
                <Text style={styles.infoQuoteText}>"Whoever provides the food for a fasting person to break his fast with, then for him is the same reward as his (the fasting person's), without anything being diminished from the reward of the fasting person."</Text>
                <Text style={styles.infoQuoteRef}>- Tirmidhi</Text>
              </View>

              <Text style={styles.infoHeading}>What Does a Ramadan Food Pack Include?</Text>
              <Text style={styles.infoBody}>
                Food pack contents vary by country to reflect local diets, availability, and humanitarian conditions. Typical contents include essential staples (rice, flour, lentils, chickpeas, oil, tea, spices) and fresh items where available (chicken, meat, potatoes, eggs). We work closely with trusted local partners to source food responsibly.
              </Text>

              <Text style={styles.infoHeading}>When Does Ramadan Begin in Australia 2026?</Text>
              <Text style={styles.infoBody}>
                Ramadan may begin on different days, based on the sighting of the moon and the method each community follows. It is expected to begin around 19–20 February 2026. Dates are estimates only and will be confirmed by the sighting of the moon, in accordance with the Sunnah.
              </Text>

              <Text style={styles.infoHeading}>Following the Example of the Prophet This Ramadan</Text>
              <View style={styles.infoQuote}>
                <Text style={styles.infoQuoteText}>"The Prophet ﷺ was the most generous of all people, and he used to become even more generous in Ramadan when Jibreel met him."</Text>
                <Text style={styles.infoQuoteRef}>- Sahih al-Bukhari</Text>
              </View>
              <Text style={styles.infoBody}>
                Like the wind that touches everything in its path, gentle yet unstoppable, the Prophet's ﷺ generosity reached every heart. When we give in Ramadan, we walk in that same mercy-filled path.
              </Text>
              <View style={styles.infoCta}>
                <Text style={styles.infoCtaTitle}>Hardship Exists. But So Does Ease.</Text>
                <Text style={styles.infoCtaSub}>Be The Ease This Ramadan.</Text>
                <Text style={styles.infoCtaTag}>Give with Ihsan</Text>
              </View>
            </View>
          )}
        </View>

        <View style={{ height: Math.max(insets.bottom, 8) }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b7280",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 0,
  },
  heroWrap: {
    width: "100%",
    position: "relative",
  },
  heroBanner: {
    height: 320,
  },
  heroText: {
    paddingBottom: 22,
  },
  heroTagline: {
    fontSize: 24,
    fontFamily: "AlbertSans_400Regular",
    color: "#fff",
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 40,
    fontFamily: "Guthen Bloots",
    color: "#FFD602",
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: PRIMARY_300,
    marginBottom: 12,
  },
  comboTabs: {
    flexDirection: "row",
    backgroundColor: "#e5e7eb",
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  comboTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  comboTabActive: {
    backgroundColor: PRIMARY_300,
  },
  comboTabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4b5563",
  },
  comboTabTextActive: {
    color: "#fff",
  },
  comboCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  comboCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  comboCardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
  },
  badge: {
    backgroundColor: "#C7D2FE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeYellow: {
    backgroundColor: "#FFD602",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#000",
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  featureText: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
  },
  comboFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 16,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#d1d5db",
    borderRadius: 10,
    overflow: "hidden",
  },
  qtyBtn: {
    width: 40,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  qtyBtnSmall: {
    width: 28,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  qtyBtnText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#374151",
  },
  qtyValue: {
    width: 36,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  qtyValueSmall: {
    width: 24,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
  },
  addToCartBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#FFD602",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    minHeight: 44,
  },
  addToCartBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1f2937",
  },
  comboTotal: {
    textAlign: "center",
    marginTop: 10,
    fontSize: 13,
    color: "#6b7280",
  },
  featuredCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  featuredImage: {
    width: "100%",
    height: 160,
    backgroundColor: "#e5e7eb",
  },
  featuredBody: {
    padding: 14,
  },
  featuredTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: PRIMARY_300,
    marginBottom: 4,
  },
  featuredDesc: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 8,
  },
  featuredPriceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginBottom: 10,
  },
  featuredPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: PRIMARY_300,
  },
  featuredPer: {
    fontSize: 12,
    color: "#9ca3af",
  },
  featuredActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  lineTotal: {
    marginTop: 8,
    fontSize: 12,
    color: "#6b7280",
  },
  subRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  subImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: "#e5e7eb",
  },
  subBody: {
    flex: 1,
    marginLeft: 10,
    minWidth: 0,
    justifyContent: "center",
  },
  subTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: PRIMARY_300,
    marginBottom: 2,
  },
  subDesc: {
    fontSize: 11,
    color: "#6b7280",
    lineHeight: 14,
  },
  subActionsRight: {
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 6,
    marginLeft: 8,
  },
  subPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: PRIMARY_300,
  },
  addBtnSmall: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: "#FFD602",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    minHeight: 30,
  },
  addBtnSmallText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1f2937",
  },
  iftarScroll: {
    paddingVertical: 8,
    gap: 12,
    paddingRight: 16,
  },
  iftarCard: {
    width: Math.min(280, SCREEN_WIDTH * 0.75),
    borderRadius: 12,
    overflow: "hidden",
    aspectRatio: 4 / 3,
    backgroundColor: "#e5e7eb",
  },
  iftarImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  iftarGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  iftarPriceTag: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  iftarOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
  },
  iftarPriceText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  iftarTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  iftarAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#FFD602",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  iftarAddBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#010D26",
  },
  faqSection: {
    marginTop: 32,
    paddingTop: 24,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: "#E9F0FC",
  },
  faqSectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: PRIMARY_300,
    marginBottom: 16,
  },
  faqTabs: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  faqTab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  faqTabActive: {
    backgroundColor: PRIMARY_300,
    borderColor: PRIMARY_300,
  },
  faqTabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  faqTabTextActive: {
    color: "#fff",
  },
  faqTabIndicator: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E5E7EB",
    marginBottom: 20,
    overflow: "hidden",
  },
  faqTabIndicatorFill: {
    height: "100%",
    backgroundColor: PRIMARY_300,
    borderRadius: 2,
  },
  faqIntro: {
    textAlign: "center",
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },
  faqItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 8,
    overflow: "hidden",
  },
  faqItemOpen: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  faqItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 10,
  },
  faqItemNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  faqItemNumberActive: {
    backgroundColor: PRIMARY_300,
  },
  faqItemNumberText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6B7280",
  },
  faqItemNumberTextActive: {
    color: "#fff",
  },
  faqItemQuestion: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  faqItemBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 0,
  },
  faqItemAnswer: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    paddingLeft: 38,
  },
  infoScroll: {},
  infoMainTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: PRIMARY_300,
    textAlign: "center",
    marginBottom: 12,
  },
  infoMainDesc: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 22,
    marginBottom: 20,
  },
  infoHeading: {
    fontSize: 17,
    fontWeight: "700",
    color: PRIMARY_300,
    marginBottom: 8,
    marginTop: 16,
  },
  infoBody: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 22,
    marginBottom: 12,
  },
  infoQuote: {
    backgroundColor: "#EFF6FF",
    borderLeftWidth: 4,
    borderLeftColor: PRIMARY_300,
    padding: 14,
    borderRadius: 0,
    marginVertical: 12,
  },
  infoQuoteText: {
    fontSize: 14,
    fontWeight: "600",
    color: PRIMARY_300,
    fontStyle: "italic",
    marginBottom: 6,
  },
  infoQuoteRef: {
    fontSize: 12,
    color: "#6B7280",
  },
  infoBulletRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  infoBulletText: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
  },
  infoCta: {
    backgroundColor: PRIMARY_300,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
  },
  infoCtaTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  infoCtaSub: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  infoCtaTag: {
    fontSize: 14,
    color: "rgba(255,255,255,0.95)",
  },
});
