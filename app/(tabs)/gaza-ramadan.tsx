import React, { useCallback, useEffect, useState } from "react";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSelector } from "react-redux";
import {
  useAddToBasketMutation,
  useGetBasketQuery,
  useRemoveFromBasketMutation,
} from "@/store/reduxSlice/api/basketApi";
import { getCampaignDetails } from "@/utils/api";
import { useToast } from "@/context/ToastContext";
import { Image as ExpoImage } from "expo-image";
import HeroBackground from "@/components/ui/GradientImage";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PRIMARY_300 = "#1F3A8A";

const GAZA_HERO_IMAGE =
  "https://alihsan.s3.ap-southeast-2.amazonaws.com/gaza-ramadan/1769130445607-alihsan-Gaza%20Ramadan%20Package.jpg";

const GAZA_PACK_FEATURES = [
  "Large Food Pack",
  "5 Hot Meals",
  "10 Loaves of Bread",
  "Baby Formula + Nappies",
  "Eid Clothes for a Child",
];

type GazaDonationOption = {
  id: string;
  name: string;
  amount: number;
  description: string;
  slug?: string;
  image: string;
  minQuantity?: number;
  featured: boolean;
};

const DONATION_OPTIONS: GazaDonationOption[] = [
  {
    id: "gaza-ramadan-package",
    name: "Gaza Ramadan Pack",
    amount: 375,
    description: "Large Food Pack, 5 Hot Meals, 10 Loaves of Bread, Baby Formula, Nappies, and Eid Clothes for a Child",
    image: "https://alihsan.s3.ap-southeast-2.amazonaws.com/gaza-ramadan/1769130445607-alihsan-Gaza%20Ramadan%20Package.jpg",
    featured: true,
  },
  {
    id: "food-packs",
    name: "Food Packs",
    slug: "gaza-food-pack",
    amount: 150,
    description: "Essential food supplies for families",
    image: "https://alihsan.s3.ap-southeast-2.amazonaws.com/gaza-ramadan/1768957981816-alihsan-%C3%99%C2%A2%C3%99%C2%A0%C3%99%C2%A2%C3%99%C2%A5_%C3%99%C2%A1%C3%99%C2%A1_%C3%99%C2%A0%C3%99%C2%A3_%C3%99%C2%A1%C3%99%C2%A0_%C3%99%C2%A2%C3%99%C2%A2_IMG_2196.JPG",
    featured: true,
  },
  {
    id: "hot-meals",
    name: "Hot Meals",
    slug: "gaza-hot-meals",
    amount: 11,
    description: "Ready to eat meals at iftar",
    minQuantity: 1,
    image: "https://alihsan.s3.ap-southeast-2.amazonaws.com/gaza-ramadan/1768957945823-alihsan-WhatsApp%20Image%202025-03-04%20at%202.55.38%20AM.jpeg",
    featured: true,
  },
  {
    id: "clothing",
    name: "Clothing",
    slug: "gaza-eid-gifts",
    amount: 75,
    description: "Clothing for children and families",
    image: "https://alihsan.s3.ap-southeast-2.amazonaws.com/gaza-ramadan/1768958016716-alihsan-%C3%99%C2%A2%C3%99%C2%A0%C3%99%C2%A2%C3%99%C2%A4%C3%99%C2%A0%C3%99%C2%A4%C3%99%C2%A1%C3%99%C2%A0_%C3%99%C2%A1%C3%99%C2%A1%C3%99%C2%A0%C3%99%C2%A8%C3%99%C2%A0%C3%99%C2%A4%20Large.jpeg",
    featured: false,
  },
  {
    id: "bread",
    name: "Bread (10 Loaves)",
    slug: "gaza-ramadan-bread",
    amount: 15,
    description: "Fresh bread for families",
    image: "https://alihsan.s3.ap-southeast-2.amazonaws.com/gaza-ramadan/1768958083487-alihsan-WhatsApp%20Image%202025-09-16%20at%205.54.32%20AM%20Large.jpeg",
    featured: false,
  },
  {
    id: "baby-formula",
    name: "Baby Formula",
    slug: "gaza-ramadan-formula",
    amount: 50,
    description: "Essential nutrition for infants",
    image: "https://alihsan.s3.ap-southeast-2.amazonaws.com/gaza-ramadan/1768958083414-alihsan-2025_11_16_10_15_IMG_4627%20Large.jpeg",
    featured: false,
  },
  {
    id: "diapers",
    name: "Diapers",
    slug: "gaza-ramadan-nappies",
    amount: 30,
    description: "Diapers for infants and children",
    image: "https://alihsan.s3.ap-southeast-2.amazonaws.com/gaza-ramadan/1768961071254-alihsan-2025_11_16_15_22_IMG_4839%20Gaza%20Nappies.JPG",
    featured: false,
  },
];

const GAZA_FAQ_ITEMS = [
  { question: "How will my donation help families in Gaza this Ramadan?", answer: "Your donation supports food packs, hot meals, bread, baby essentials, and Eid clothing. These items help families access suhoor and iftar, care for their children, and observe Ramadan with dignity despite severe hardship." },
  { question: "What is included in the Gaza Ramadan Pack?", answer: "The $375 package includes a Large Food Pack, 5 hot meals, 10 loaves of bread, baby formula, nappies, and Eid clothes for a child — offering comprehensive support for a family throughout Ramadan." },
  { question: "How are food packs and meals delivered inside Gaza?", answer: "Aid is sourced, packed, and distributed through trusted partners and field teams on the ground. They work within current access constraints to ensure support reaches families safely, transparently, and with dignity." },
  { question: "Are donations Zakat‑eligible?", answer: "Yes. Food assistance, baby essentials, and support for families in crisis meet the criteria for Zakat distribution. If you intend your donation as Zakat, simply make that intention in your heart." },
  { question: "Why is Ramadan support especially important in Gaza this year?", answer: "This is the third Ramadan many families are observing under destruction, displacement, and extreme food insecurity. With major charities denied entry and markets unstable, localised support is more critical than ever." },
  { question: "How severe is the hunger crisis in Gaza right now?", answer: "Humanitarian assessments show catastrophic levels of food insecurity: 1.6 million people are in Crisis or worse, 101,000 children are malnourished, and 1 in 4 families eat only one meal a day." },
  { question: "Can I donate on behalf of someone else?", answer: "Yes. You can give sadaqah or Zakat on behalf of a loved one, including as a gift or in honour of someone. The reward is shared with the one you intend it for, insha'Allah." },
  { question: "Is my donation tax‑deductible?", answer: "Yes. Al‑Ihsan Foundation is a registered Australian charity. Donations of $2 or more are tax‑deductible." },
];

const featuredItems = DONATION_OPTIONS.filter((i) => i.featured);
const regularItems = DONATION_OPTIONS.filter((i) => !i.featured);

export default function GazaRamadanPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showToast } = useToast();
  const { user } = useSelector((state: any) => state.authentication);
  const isAuthenticated = !!user;

  const [loading, setLoading] = useState(true);
  const [gazaCampaign, setGazaCampaign] = useState<any>(null);
  const [packQuantity, setPackQuantity] = useState(1);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [addingProductId, setAddingProductId] = useState<string | null>(null);
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
    const initQuantities: Record<string, number> = {};
    DONATION_OPTIONS.forEach((item) => {
      initQuantities[item.id] = item.id === "hot-meals" ? 15 : 1;
    });
    setQuantities((prev) => (Object.keys(prev).length === 0 ? initQuantities : prev));
  }, []);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await getCampaignDetails("gaza-ramadan", { allowBmt: true });
        const campaign = data?.campaign ?? data;
        setGazaCampaign(campaign);
      } catch (e) {
        if (__DEV__) console.error("Gaza Ramadan fetch error:", e);
        showToast({ message: "Unable to load Gaza Ramadan.", type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [showToast]);

  const getQty = (id: string) => quantities[id] ?? 1;
  const setQty = (id: string, delta: number) => {
    const item = DONATION_OPTIONS.find((o) => o.id === id);
    const min = item?.minQuantity ?? 1;
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(min, (prev[id] ?? min) + delta),
    }));
  };

  const addGazaItemToCart = async (params: {
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
      name: name || "Gaza Ramadan Appeal 2026",
      coverImage,
      checkoutType: checkoutType || "COMMON",
      isRecurring: false,
      periodDays: null,
    };

    const existing = basketItems.find(
      (item: any) => item.campaignId === campaignId && item.donationItem === donationItem
    );
    const newQuantity = existing ? (existing?.quantity ?? 0) + quantity : quantity;
    const finalItem = { ...basketItem, quantity: newQuantity, total: amount * newQuantity };

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
        setGuestBasket([...withoutThis, finalItem]);
        await AsyncStorage.setItem("guestBasket", JSON.stringify([...withoutThis, finalItem]));
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

  const handlePackAddToCart = async () => {
    if (!gazaCampaign?.id) {
      showToast({ message: "Campaign not available. Try again.", type: "error" });
      return;
    }
    await addGazaItemToCart({
      campaignId: gazaCampaign.id,
      donationItem: "Gaza Ramadan Pack",
      amount: 375,
      quantity: packQuantity,
      name: gazaCampaign.name || "Gaza Ramadan Appeal 2026",
      coverImage: gazaCampaign.coverImage || GAZA_HERO_IMAGE,
      checkoutType: gazaCampaign.checkoutType,
    });
    setPackQuantity(1);
  };

  const handleItemAddToCart = async (item: GazaDonationOption) => {
    setAddingProductId(item.id);
    try {
      if (item.id === "gaza-ramadan-package") {
        if (!gazaCampaign?.id) {
          showToast({ message: "Campaign not available.", type: "error" });
          return;
        }
        const qty = getQty(item.id);
        await addGazaItemToCart({
          campaignId: gazaCampaign.id,
          donationItem: item.name,
          amount: item.amount,
          quantity: qty,
          name: gazaCampaign.name || "Gaza Ramadan Appeal 2026",
          coverImage: item.image,
          checkoutType: gazaCampaign.checkoutType,
        });
        return;
      }
      if (!item.slug) {
        showToast({ message: "Campaign not available.", type: "error" });
        return;
      }
      const data = await getCampaignDetails(item.slug, { allowBmt: true });
      const campaign = data?.campaign ?? data;
      if (!campaign?.id) {
        showToast({ message: "Campaign not available. Try again.", type: "error" });
        return;
      }
      const qty = getQty(item.id);
      await addGazaItemToCart({
        campaignId: campaign.id,
        donationItem: item.name,
        amount: item.amount,
        quantity: qty,
        name: campaign.name || "Gaza Ramadan Appeal 2026",
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
        <Text style={styles.loadingText}>Loading Gaza Ramadan…</Text>
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
        <View style={styles.heroWrap}>
          <HeroBackground
            source={{ uri: GAZA_HERO_IMAGE }}
            showBack
            onBackPress={() => router.back()}
            containerStyle={styles.heroBanner}
          >
            <View style={styles.heroText}>
              <Text style={styles.heroTagline}>Stand with Gaza this Ramadan</Text>
              <Text style={styles.heroTitle}>Gaza Ramadan Appeal</Text>
            </View>
          </HeroBackground>
        </View>

        {/* Gaza Ramadan Pack card */}
        <View style={styles.section}>
          <View style={styles.comboCard}>
            <View style={styles.comboCardHeader}>
              <Text style={styles.comboCardTitle}>Gaza Ramadan Pack</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>MAXIMUM IMPACT</Text>
              </View>
            </View>
            {GAZA_PACK_FEATURES.map((feature, idx) => (
              <View key={idx} style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={18} color="#EAB308" />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
            <View style={styles.comboFooter}>
              <View style={styles.quantityRow}>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => setPackQuantity((q) => Math.max(1, q - 1))}>
                  <Text style={styles.qtyBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.qtyValue}>{packQuantity}</Text>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => setPackQuantity((q) => q + 1)}>
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.addToCartBtn} onPress={handlePackAddToCart} activeOpacity={0.85}>
                <Ionicons name="cart" size={18} color="#1f2937" />
                <Text style={styles.addToCartBtnText}>Add to Cart</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.comboTotal}>Total: ${(375 * packQuantity).toFixed(2)}</Text>
          </View>
        </View>

        {/* Featured items (Food Packs, Hot Meals - exclude pack already in hero) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ways to give</Text>
          {featuredItems
            .filter((i) => i.id !== "gaza-ramadan-package")
            .map((item) => (
              <View key={item.id} style={styles.featuredCard}>
                <ExpoImage source={{ uri: item.image }} style={styles.featuredImage} contentFit="cover" />
                <View style={styles.featuredBody}>
                  <Text style={styles.featuredTitle}>{item.name}</Text>
                  <Text style={styles.featuredDesc} numberOfLines={2}>{item.description}</Text>
                  <View style={styles.featuredPriceRow}>
                    <Text style={styles.featuredPrice}>${item.amount}</Text>
                    <Text style={styles.featuredPer}>{item.id === "hot-meals" ? "per meal" : "per item"}</Text>
                  </View>
                  <View style={styles.featuredActions}>
                    <View style={styles.quantityRow}>
                      <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(item.id, -1)}>
                        <Text style={styles.qtyBtnText}>−</Text>
                      </TouchableOpacity>
                      <Text style={styles.qtyValue}>{getQty(item.id)}</Text>
                      <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(item.id, 1)}>
                        <Text style={styles.qtyBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      style={styles.addToCartBtn}
                      onPress={() => handleItemAddToCart(item)}
                      disabled={addingProductId === item.id}
                    >
                      {addingProductId === item.id ? (
                        <ActivityIndicator size="small" color="#1f2937" />
                      ) : (
                        <>
                          <Ionicons name="cart" size={16} color="#1f2937" />
                          <Text style={styles.addToCartBtnText}>Add</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.lineTotal}>Total: ${(item.amount * getQty(item.id)).toFixed(2)}</Text>
                </View>
              </View>
            ))}
        </View>

        {/* Regular items - compact rows */}
        {regularItems.length > 0 && (
          <View style={styles.section}>
            {regularItems.map((item) => (
              <View key={item.id} style={styles.subRow}>
                <Image source={{ uri: item.image }} style={styles.subImage} />
                <View style={styles.subBody}>
                  <Text style={styles.subTitle}>{item.name}</Text>
                  <Text style={styles.subDesc} numberOfLines={2}>{item.description}</Text>
                </View>
                <View style={styles.subActionsRight}>
                  <Text style={styles.subPrice}>${item.amount}</Text>
                  <View style={styles.quantityRow}>
                    <TouchableOpacity style={styles.qtyBtnSmall} onPress={() => setQty(item.id, -1)}>
                      <Text style={styles.qtyBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyValueSmall}>{getQty(item.id)}</Text>
                    <TouchableOpacity style={styles.qtyBtnSmall} onPress={() => setQty(item.id, 1)}>
                      <Text style={styles.qtyBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={styles.addBtnSmall}
                    onPress={() => handleItemAddToCart(item)}
                    disabled={addingProductId === item.id}
                  >
                    {addingProductId === item.id ? (
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

        {/* FAQ & Information */}
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
              <Text style={styles.faqIntro}>Find answers about Gaza Ramadan appeal</Text>
              {GAZA_FAQ_ITEMS.map((faq, index) => {
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
              <Text style={styles.infoMainTitle}>Gaza Ramadan Appeal 2026: Help Feed Families in Gaza</Text>
              <Text style={styles.infoBody}>
                This Ramadan, your generosity helps place food on the tables of families in Gaza — supporting suhoor and iftar through food packs, hot meals, bread, baby formula, nappies, and Eid clothing. Aid is delivered through trusted partners on the ground.
              </Text>
              <View style={styles.infoCta}>
                <Text style={styles.infoCtaTitle}>Stand with Gaza this Ramadan.</Text>
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
  container: { flex: 1, backgroundColor: "#f9fafb" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 14, color: "#6b7280" },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 0 },
  heroWrap: { width: "100%", position: "relative" },
  heroBanner: { height: 320 },
  heroText: { paddingBottom: 22 },
  heroTagline: { fontSize: 24, fontFamily: "AlbertSans_400Regular", color: "#fff", marginBottom: 4 },
  heroTitle: { fontSize: 40, fontFamily: "Guthen Bloots", color: "#FFD602" },
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: PRIMARY_300, marginBottom: 12 },
  comboCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  comboCardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  comboCardTitle: { fontSize: 18, fontWeight: "700", color: "#111827", flex: 1 },
  badge: { backgroundColor: "#FFD602", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 11, fontWeight: "700", color: "#000" },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  featureText: { fontSize: 14, color: "#374151", flex: 1 },
  comboFooter: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 16 },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#d1d5db",
    borderRadius: 10,
    overflow: "hidden",
  },
  qtyBtn: { width: 40, height: 44, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  qtyBtnSmall: { width: 28, height: 30, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  qtyBtnText: { fontSize: 18, fontWeight: "700", color: "#374151" },
  qtyValue: { width: 36, textAlign: "center", fontSize: 16, fontWeight: "700", color: "#111827" },
  qtyValueSmall: { width: 24, textAlign: "center", fontSize: 12, fontWeight: "700", color: "#111827" },
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
  addToCartBtnText: { fontSize: 15, fontWeight: "700", color: "#1f2937" },
  comboTotal: { textAlign: "center", marginTop: 10, fontSize: 13, color: "#6b7280" },
  featuredCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  featuredImage: { width: "100%", height: 160, backgroundColor: "#e5e7eb" },
  featuredBody: { padding: 14 },
  featuredTitle: { fontSize: 17, fontWeight: "700", color: PRIMARY_300, marginBottom: 4 },
  featuredDesc: { fontSize: 13, color: "#6b7280", marginBottom: 8 },
  featuredPriceRow: { flexDirection: "row", alignItems: "baseline", gap: 6, marginBottom: 10 },
  featuredPrice: { fontSize: 18, fontWeight: "700", color: PRIMARY_300 },
  featuredPer: { fontSize: 12, color: "#9ca3af" },
  featuredActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  lineTotal: { marginTop: 8, fontSize: 12, color: "#6b7280" },
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
  subImage: { width: 56, height: 56, borderRadius: 8, backgroundColor: "#e5e7eb" },
  subBody: { flex: 1, marginLeft: 10, minWidth: 0, justifyContent: "center" },
  subTitle: { fontSize: 14, fontWeight: "700", color: PRIMARY_300, marginBottom: 2 },
  subDesc: { fontSize: 11, color: "#6b7280", lineHeight: 14 },
  subActionsRight: { alignItems: "flex-end", justifyContent: "center", gap: 6, marginLeft: 8 },
  subPrice: { fontSize: 14, fontWeight: "700", color: PRIMARY_300 },
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
  addBtnSmallText: { fontSize: 12, fontWeight: "700", color: "#1f2937" },
  faqSection: {
    marginTop: 32,
    paddingTop: 24,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: "#E9F0FC",
  },
  faqSectionTitle: { fontSize: 18, fontWeight: "700", color: PRIMARY_300, marginBottom: 16 },
  faqTabs: { flexDirection: "row", gap: 12, marginBottom: 8 },
  faqTab: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 999, backgroundColor: "#fff", borderWidth: 1, borderColor: "#E5E7EB" },
  faqTabActive: { backgroundColor: PRIMARY_300, borderColor: PRIMARY_300 },
  faqTabText: { fontSize: 14, fontWeight: "600", color: "#374151" },
  faqTabTextActive: { color: "#fff" },
  faqTabIndicator: { height: 4, borderRadius: 2, backgroundColor: "#E5E7EB", marginBottom: 20, overflow: "hidden" },
  faqTabIndicatorFill: { height: "100%", backgroundColor: PRIMARY_300, borderRadius: 2 },
  faqIntro: { textAlign: "center", fontSize: 14, color: "#6B7280", marginBottom: 16 },
  faqItem: { backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 8, overflow: "hidden" },
  faqItemOpen: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  faqItemHeader: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 14, gap: 10 },
  faqItemNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#E5E7EB", justifyContent: "center", alignItems: "center" },
  faqItemNumberActive: { backgroundColor: PRIMARY_300 },
  faqItemNumberText: { fontSize: 13, fontWeight: "700", color: "#6B7280" },
  faqItemNumberTextActive: { color: "#fff" },
  faqItemQuestion: { flex: 1, fontSize: 14, fontWeight: "600", color: "#111827" },
  faqItemBody: { paddingHorizontal: 14, paddingBottom: 14, paddingTop: 0 },
  faqItemAnswer: { fontSize: 14, color: "#374151", lineHeight: 20, paddingLeft: 38 },
  infoScroll: {},
  infoMainTitle: { fontSize: 20, fontWeight: "700", color: PRIMARY_300, textAlign: "center", marginBottom: 12 },
  infoBody: { fontSize: 14, color: "#374151", lineHeight: 22, marginBottom: 12 },
  infoCta: { backgroundColor: PRIMARY_300, paddingVertical: 20, paddingHorizontal: 16, borderRadius: 16, alignItems: "center", marginTop: 24, marginBottom: 16 },
  infoCtaTitle: { fontSize: 18, fontWeight: "700", color: "#fff", marginBottom: 4 },
  infoCtaTag: { fontSize: 14, color: "rgba(255,255,255,0.95)" },
});
