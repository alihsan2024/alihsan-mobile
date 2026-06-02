import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Dimensions,
  Linking,
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
import { getCampaignDetails } from "@/utils/api";
import { useToast } from "@/context/ToastContext";
import { Image as ExpoImage } from "expo-image";
import QurbanHeroBanner from "@/components/qurban/QurbanHeroBanner";
import {
  MAIN_QURBAN_PRODUCTS,
  QURBAN_IMPACT_TILES,
  QURBAN_TRIO,
  QURBAN_SLUGS,
  GROUP_E_PRODUCT_ID,
  PROPHETIC_QURBAN_BUNDLE_PRICE,
  PROPHETIC_QURBAN_FEATURED,
  ARAFAH_IF_PRODUCT_BASE,
  ARAFAH_IF_PRODUCT_ID,
  ARAFAH_IF_GAZA_IMAGE,
  EXTENDED_RELIEF_QURBAN_IMAGE_TURKEY,
  EXTENDED_RELIEF_QURBAN_IMAGE_LEBANON,
  type QurbanMainProduct,
} from "@/data/qurbanProducts";
import { QURBAN_FAQ_AU } from "@/data/qurbanFaqAu";
import {
  QURBAN_INFO_INTRO,
  QURBAN_TRUST_PILLARS,
  QURBAN_GUARANTEE_ITEMS,
  QURBAN_DHUL_HIJJA_ROWS,
  QURBAN_IMPACT_STATS,
  QURBAN_WHO_REACHES_TAGS,
  QURBAN_INFO_SUNNAH,
  QURBAN_INFO_ARAFAH,
  QURBAN_INFO_EID,
  QURBAN_DATES_FOOTNOTE,
} from "@/data/qurbanInformationAu";
import { QURBAN_WHATSAPP_CHANNEL_URL } from "@/config/qurbanWhatsApp";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const PRIMARY_300 = "#1F3A8A";

/** Expo Image: anchor crop to top, centred horizontally (`object-position: center top`). */
const IMG_TOP_CENTER = { top: "0%" as const, left: "50%" as const };

/** Full-frame focal point: middle centre (`object-position: center`). Group A & B. */
const IMG_CENTER_MIDDLE = "center" as const;

/** Focal point centre-right (`object-position: right center`). Prophetic Qurban hero image. */
const IMG_CENTER_RIGHT = "right" as const;

const GROUP_A_ID = 1;
const GROUP_B_ID = 2;

function formatPhoneForNotes(value: string) {
  const digits = String(value ?? "")
    .trim()
    .replace(/\D/g, "");
  return digits ? `+${digits}` : "";
}

export default function QurbanPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showToast } = useToast();
  const { user } = useSelector((state: any) => state.authentication);
  const isAuthenticated = !!user;

  const [loading, setLoading] = useState(true);
  const [guestBasket, setGuestBasket] = useState<any[]>([]);
  const [cartQuantities, setCartQuantities] = useState<Record<number, number>>({});
  const [addingKey, setAddingKey] = useState<string | null>(null);

  const [groupECountry, setGroupECountry] = useState<"turkey" | "lebanon">("turkey");
  const [lebanonQurbanMode, setLebanonQurbanMode] = useState<"donate" | "nominate">("donate");
  const [lebanonRecipientDetails, setLebanonRecipientDetails] = useState({
    name: "",
    mainMobile: "",
    secondContact: "",
  });

  const [arafahOption, setArafahOption] = useState<"standard" | "gaza">("standard");
  const [propheticQty, setPropheticQty] = useState(1);
  const [trioQty, setTrioQty] = useState(1);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);
  const [activeInfoTab, setActiveInfoTab] = useState<"FAQ" | "Information">("FAQ");

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
    const init = async () => {
      setLoading(true);
      try {
        const ids = MAIN_QURBAN_PRODUCTS.map((p) => p.id);
        setCartQuantities((prev) => {
          const next = { ...prev };
          ids.forEach((id) => {
            if (next[id] == null) next[id] = 1;
          });
          next[ARAFAH_IF_PRODUCT_ID] = next[ARAFAH_IF_PRODUCT_ID] ?? 1;
          return next;
        });
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const isGroupELebanonSelected = groupECountry === "lebanon";
  const isLebanonNominationSelected =
    isGroupELebanonSelected && lebanonQurbanMode === "nominate";
  const isLebanonRecipientComplete =
    Boolean(lebanonRecipientDetails.name.trim()) &&
    Boolean(lebanonRecipientDetails.mainMobile.trim()) &&
    Boolean(lebanonRecipientDetails.secondContact.trim());
  const isLebanonQurbanReady =
    !isGroupELebanonSelected ||
    lebanonQurbanMode === "donate" ||
    (isLebanonNominationSelected && isLebanonRecipientComplete);

  const groupEPrice = useMemo(
    () => MAIN_QURBAN_PRODUCTS.find((p) => p.id === GROUP_E_PRODUCT_ID)?.price ?? 750,
    [],
  );

  const getQuantity = (id: number) => cartQuantities[id] ?? 1;
  const setQuantity = (id: number, delta: number) => {
    setCartQuantities((prev) => {
      const current = prev[id] ?? 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const addLineToBasket = async (params: {
    slug: string;
    donationItem: string;
    amount: number;
    quantity: number;
    coverImage: string;
    fallbackName: string;
    notes?: string;
    loadingKey: string;
  }) => {
    const {
      slug,
      donationItem,
      amount,
      quantity,
      coverImage,
      fallbackName,
      notes,
      loadingKey,
    } = params;
    setAddingKey(loadingKey);
    try {
      const data = await getCampaignDetails(slug, { allowBmt: true });
      const campaign = data?.campaign ?? data;
      if (!campaign?.id) {
        showToast({ message: "Campaign not available. Try again.", type: "error" });
        return;
      }
      const basketItem: Record<string, unknown> = {
        campaignId: campaign.id,
        donationItem,
        amount,
        quantity,
        name: campaign.name || fallbackName,
        coverImage: coverImage || campaign.coverImage || "",
        checkoutType: campaign.checkoutType || "KURBAN",
        isRecurring: false,
        periodDays: null,
      };
      if (notes) basketItem.notes = notes;

      const existing = basketItems.find(
        (item: any) =>
          item.campaignId === campaign.id && item.donationItem === donationItem,
      );
      const isUpdate = !!existing;
      const newQuantity = isUpdate ? (existing?.quantity ?? 0) + quantity : quantity;
      const finalItem = {
        ...basketItem,
        quantity: newQuantity,
        total: amount * newQuantity,
      };

      if (isAuthenticated) {
        if (existing) {
          await removeFromBasket({ campaignId: campaign.id, donationItem });
          await refetchBasket();
        }
        await addToBasket({
          body: {
            ...basketItem,
            quantity: newQuantity,
            total: amount * newQuantity,
          } as any,
        });
        await refetchBasket();
      } else {
        const withoutThis = guestBasket.filter(
          (item: any) =>
            !(item.campaignId === campaign.id && item.donationItem === donationItem),
        );
        const updated = [...withoutThis, finalItem];
        setGuestBasket(updated);
        await AsyncStorage.setItem("guestBasket", JSON.stringify(updated));
      }
      showToast({
        message: isUpdate ? "Cart updated" : "Added to cart",
        type: "success",
        action: { label: "View Cart", onPress: () => router.push("/(tabs)/cart") },
      });
    } catch {
      showToast({ message: "Failed to add to cart", type: "error" });
    } finally {
      setAddingKey(null);
    }
  };

  const buildGroupECheckout = useCallback(
    (product: QurbanMainProduct) => {
      if (!isGroupELebanonSelected) {
        return {
          slug: QURBAN_SLUGS.groupETurkey,
          donationItem: "QURBAN E - Türkiye",
          notes: undefined as string | undefined,
        };
      }
      const formatPhone = formatPhoneForNotes;
      const recipient =
        lebanonQurbanMode === "nominate"
          ? {
              name: lebanonRecipientDetails.name.trim(),
              mainMobile: formatPhone(lebanonRecipientDetails.mainMobile),
              secondContact: formatPhone(lebanonRecipientDetails.secondContact),
            }
          : null;
      const donationItem = recipient
        ? `QURBAN E - Lebanon (Nominate: ${recipient.name})`
        : "QURBAN E - Lebanon (Donate)";
      const notes = recipient
        ? [
            `Recipient: ${recipient.name}`,
            `Main Mobile: ${recipient.mainMobile}`,
            `Second Contact: ${recipient.secondContact}`,
            `Collection: In person — Tripoli area`,
            `Qurban Type: Group E Lebanon`,
          ].join("\n---\n")
        : [`Giving Mode: Donate to those in need`, `Qurban Type: Group E Lebanon`].join(
            "\n---\n",
          );
      return {
        slug: QURBAN_SLUGS.groupELebanon,
        donationItem,
        notes,
      };
    },
    [isGroupELebanonSelected, lebanonQurbanMode, lebanonRecipientDetails],
  );

  const handleMainProductAdd = async (product: QurbanMainProduct) => {
    if (product.id === GROUP_E_PRODUCT_ID && !isLebanonQurbanReady) {
      showToast({
        message: "Please complete Lebanon recipient details or switch to Donate.",
        type: "error",
      });
      return;
    }
    const qty = getQuantity(product.id);
    if (product.id === GROUP_E_PRODUCT_ID) {
      const built = buildGroupECheckout(product);
      await addLineToBasket({
        slug: built.slug,
        donationItem: built.donationItem,
        amount: groupEPrice,
        quantity: qty,
        coverImage:
          groupECountry === "lebanon"
            ? EXTENDED_RELIEF_QURBAN_IMAGE_LEBANON
            : EXTENDED_RELIEF_QURBAN_IMAGE_TURKEY,
        fallbackName: product.title,
        notes: built.notes,
        loadingKey: `main-${product.id}`,
      });
      return;
    }
    await addLineToBasket({
      slug: product.slug,
      donationItem: product.donationItem,
      amount: product.price,
      quantity: qty,
      coverImage: product.image,
      fallbackName: product.title,
      loadingKey: `main-${product.id}`,
    });
  };

  const handleImpactTileAdd = async (tile: (typeof QURBAN_IMPACT_TILES)[0]) => {
    await addLineToBasket({
      slug: tile.slug,
      donationItem: tile.donationItem,
      amount: tile.price,
      quantity: 1,
      coverImage: tile.image,
      fallbackName: tile.title,
      loadingKey: `impact-${tile.id}`,
    });
  };

  const handleTrioAdd = async () => {
    await addLineToBasket({
      slug: QURBAN_TRIO.slug,
      donationItem: QURBAN_TRIO.donationItem,
      amount: QURBAN_TRIO.price,
      quantity: trioQty,
      coverImage: QURBAN_TRIO.image,
      fallbackName: QURBAN_TRIO.title,
      loadingKey: "trio",
    });
    setTrioQty(1);
  };

  const handlePropheticAdd = async () => {
    const groupA = MAIN_QURBAN_PRODUCTS[0];
    const qtyBundles = propheticQty;
    const unitPrice = groupA.price;
    const shareCount = qtyBundles * 2;
    await addLineToBasket({
      slug: groupA.slug,
      donationItem: "Prophetic Qurban",
      amount: unitPrice,
      quantity: shareCount,
      coverImage: PROPHETIC_QURBAN_FEATURED.image,
      fallbackName: "Prophetic Qurban",
      loadingKey: "prophetic",
    });
    setPropheticQty(1);
  };

  const handleArafahAdd = async () => {
    const qty = getQuantity(ARAFAH_IF_PRODUCT_ID);
    const isGaza = arafahOption === "gaza";
    await addLineToBasket({
      slug: isGaza ? QURBAN_SLUGS.hotMealsGaza : QURBAN_SLUGS.arafahIftar,
      donationItem: isGaza
        ? "Day of Arafah Iftar - Gaza (5 Meals)"
        : "Day of Arafah Iftar - 30 Hot Meals",
      amount: isGaza ? 55 : 90,
      quantity: qty,
      coverImage: isGaza ? ARAFAH_IF_GAZA_IMAGE : ARAFAH_IF_PRODUCT_BASE.image,
      fallbackName: isGaza ? "Day of Arafah Iftar — Gaza" : "Day of Arafah Iftar",
      loadingKey: "arafah",
    });
  };

  if (loading) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top + 100 }]}>
        <ActivityIndicator size="large" color={PRIMARY_300} />
        <Text style={styles.loadingText}>Loading Qurban…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <QurbanHeroBanner />

        {/* Prophetic Qurban */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prophetic Qurban</Text>
          <LinearGradient
            colors={["#0f172a", "#1e3a5f"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.propheticCard}
          >
            <ExpoImage
              source={{ uri: PROPHETIC_QURBAN_FEATURED.image }}
              style={styles.propheticImage}
              contentFit="cover"
              contentPosition={IMG_CENTER_RIGHT}
            />
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.85)"]}
              style={styles.propheticGradient}
            />
            <View style={styles.propheticOverlay}>
              <Text style={styles.propheticLocation}>{PROPHETIC_QURBAN_FEATURED.location}</Text>
              <Text style={styles.propheticTitle}>{PROPHETIC_QURBAN_FEATURED.title}</Text>
              <Text style={styles.propheticBody}>{PROPHETIC_QURBAN_FEATURED.body}</Text>
              <View style={styles.propheticFooter}>
                <View style={styles.quantityRow}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => setPropheticQty((q) => Math.max(1, q - 1))}
                  >
                    <Text style={styles.qtyBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyValue}>{propheticQty}</Text>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => setPropheticQty((q) => q + 1)}>
                    <Text style={styles.qtyBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.addToCartBtn}
                  onPress={handlePropheticAdd}
                  disabled={addingKey === "prophetic"}
                >
                  {addingKey === "prophetic" ? (
                    <ActivityIndicator size="small" color="#1f2937" />
                  ) : (
                    <>
                      <Ionicons name="cart" size={18} color="#1f2937" />
                      <Text style={styles.addToCartBtnText}>
                        {PROPHETIC_QURBAN_FEATURED.ctaLabel}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
              <Text style={styles.propheticTotal}>
                Total: ${(PROPHETIC_QURBAN_BUNDLE_PRICE * propheticQty).toFixed(2)} (2 × Group A per bundle)
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Main tiers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose your Qurban</Text>
          {MAIN_QURBAN_PRODUCTS.map((product) => (
            <View key={product.id} style={styles.featuredCard}>
              <ExpoImage
                source={{
                  uri:
                    product.id === GROUP_E_PRODUCT_ID
                      ? groupECountry === "lebanon"
                        ? EXTENDED_RELIEF_QURBAN_IMAGE_LEBANON
                        : EXTENDED_RELIEF_QURBAN_IMAGE_TURKEY
                      : product.image,
                }}
                style={styles.featuredImage}
                contentFit="cover"
                contentPosition={
                  product.id === GROUP_A_ID || product.id === GROUP_B_ID
                    ? IMG_CENTER_MIDDLE
                    : IMG_TOP_CENTER
                }
              />
              <View style={styles.featuredBody}>
                <Text style={styles.featuredTitle}>{product.title}</Text>
                <Text style={styles.featuredDesc}>{product.description}</Text>
                {product.id === GROUP_E_PRODUCT_ID ? (
                  <View style={styles.groupESection}>
                    <Text style={styles.groupELabel}>Distribution</Text>
                    <View style={styles.segmentRow}>
                      <TouchableOpacity
                        style={[
                          styles.segmentBtn,
                          groupECountry === "turkey" && styles.segmentBtnActive,
                        ]}
                        onPress={() => setGroupECountry("turkey")}
                      >
                        <Text
                          style={[
                            styles.segmentBtnText,
                            groupECountry === "turkey" && styles.segmentBtnTextActive,
                          ]}
                        >
                          Türkiye
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.segmentBtn,
                          groupECountry === "lebanon" && styles.segmentBtnActive,
                        ]}
                        onPress={() => setGroupECountry("lebanon")}
                      >
                        <Text
                          style={[
                            styles.segmentBtnText,
                            groupECountry === "lebanon" && styles.segmentBtnTextActive,
                          ]}
                        >
                          Lebanon
                        </Text>
                      </TouchableOpacity>
                    </View>
                    {isGroupELebanonSelected ? (
                      <>
                        <View style={styles.segmentRow}>
                          <TouchableOpacity
                            style={[
                              styles.segmentBtn,
                              lebanonQurbanMode === "donate" && styles.segmentBtnActive,
                            ]}
                            onPress={() => setLebanonQurbanMode("donate")}
                          >
                            <Text
                              style={[
                                styles.segmentBtnText,
                                lebanonQurbanMode === "donate" && styles.segmentBtnTextActive,
                              ]}
                            >
                              Donate
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.segmentBtn,
                              lebanonQurbanMode === "nominate" && styles.segmentBtnActive,
                            ]}
                            onPress={() => setLebanonQurbanMode("nominate")}
                          >
                            <Text
                              style={[
                                styles.segmentBtnText,
                                lebanonQurbanMode === "nominate" && styles.segmentBtnTextActive,
                              ]}
                            >
                              Nominate pickup
                            </Text>
                          </TouchableOpacity>
                        </View>
                        {isLebanonNominationSelected ? (
                          <View style={styles.lebanonForm}>
                            <TextInput
                              style={styles.input}
                              placeholder="Recipient full name"
                              placeholderTextColor="#9ca3af"
                              value={lebanonRecipientDetails.name}
                              onChangeText={(t) =>
                                setLebanonRecipientDetails((s) => ({ ...s, name: t }))
                              }
                            />
                            <TextInput
                              style={styles.input}
                              placeholder="Main mobile"
                              placeholderTextColor="#9ca3af"
                              keyboardType="phone-pad"
                              value={lebanonRecipientDetails.mainMobile}
                              onChangeText={(t) =>
                                setLebanonRecipientDetails((s) => ({ ...s, mainMobile: t }))
                              }
                            />
                            <TextInput
                              style={styles.input}
                              placeholder="Second contact number"
                              placeholderTextColor="#9ca3af"
                              keyboardType="phone-pad"
                              value={lebanonRecipientDetails.secondContact}
                              onChangeText={(t) =>
                                setLebanonRecipientDetails((s) => ({ ...s, secondContact: t }))
                              }
                            />
                          </View>
                        ) : null}
                      </>
                    ) : null}
                  </View>
                ) : null}

                <View style={styles.featuredPriceRow}>
                  <Text style={styles.featuredPrice}>
                    $
                    {product.id === GROUP_E_PRODUCT_ID ? groupEPrice : product.price}
                  </Text>
                  <Text style={styles.featuredPer}>per share</Text>
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
                    onPress={() => handleMainProductAdd(product)}
                    disabled={addingKey === `main-${product.id}`}
                  >
                    {addingKey === `main-${product.id}` ? (
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
                  Total: $
                  {(
                    (product.id === GROUP_E_PRODUCT_ID ? groupEPrice : product.price) *
                    getQuantity(product.id)
                  ).toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Qurban Trio */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Qurban Trio</Text>
          <View style={styles.trioCard}>
            <ExpoImage
              source={{ uri: QURBAN_TRIO.image }}
              style={styles.trioImage}
              contentFit="cover"
              contentPosition={IMG_TOP_CENTER}
            />
            <View style={styles.trioBody}>
              <Text style={styles.trioTitle}>{QURBAN_TRIO.title}</Text>
              <Text style={styles.trioDesc}>{QURBAN_TRIO.description}</Text>
              <Text style={styles.trioPrice}>${QURBAN_TRIO.price}</Text>
              <View style={styles.featuredActions}>
                <View style={styles.quantityRow}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => setTrioQty((q) => Math.max(1, q - 1))}
                  >
                    <Text style={styles.qtyBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyValue}>{trioQty}</Text>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => setTrioQty((q) => q + 1)}>
                    <Text style={styles.qtyBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.addToCartBtn}
                  onPress={handleTrioAdd}
                  disabled={addingKey === "trio"}
                >
                  {addingKey === "trio" ? (
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
                Total: ${(QURBAN_TRIO.price * trioQty).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Impact tiles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>More ways to give</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.impactScroll}
          >
            {QURBAN_IMPACT_TILES.map((tile) => (
              <View key={tile.id} style={styles.impactCard}>
                <ExpoImage
                  source={{ uri: tile.image }}
                  style={styles.impactImage}
                  contentFit="cover"
                  contentPosition={IMG_TOP_CENTER}
                />
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.75)"]}
                  style={styles.impactGradient}
                />
                <View style={styles.impactOverlay}>
                  <Text style={styles.impactTitle}>{tile.title}</Text>
                  <Text style={styles.impactPrice}>
                    ${tile.price}
                    {tile.postText ? ` ${tile.postText}` : ""}
                  </Text>
                  <TouchableOpacity
                    style={styles.impactAddBtn}
                    onPress={() => handleImpactTileAdd(tile)}
                    disabled={addingKey === `impact-${tile.id}`}
                  >
                    {addingKey === `impact-${tile.id}` ? (
                      <ActivityIndicator size="small" color="#010D26" />
                    ) : (
                      <Text style={styles.impactAddText}>Add</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Day of Arafah */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Day of Arafah Iftar</Text>
          <View style={styles.arafahCard}>
            <ExpoImage
              source={{
                uri:
                  arafahOption === "gaza"
                    ? ARAFAH_IF_GAZA_IMAGE
                    : ARAFAH_IF_PRODUCT_BASE.image,
              }}
              style={styles.arafahImage}
              contentFit="cover"
              contentPosition={IMG_TOP_CENTER}
            />
            <View style={styles.arafahBody}>
              <View style={styles.segmentRow}>
                <TouchableOpacity
                  style={[styles.segmentBtn, arafahOption === "standard" && styles.segmentBtnActive]}
                  onPress={() => setArafahOption("standard")}
                >
                  <Text
                    style={[
                      styles.segmentBtnText,
                      arafahOption === "standard" && styles.segmentBtnTextActive,
                    ]}
                  >
                    30 meals ($90)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.segmentBtn, arafahOption === "gaza" && styles.segmentBtnActive]}
                  onPress={() => setArafahOption("gaza")}
                >
                  <Text
                    style={[
                      styles.segmentBtnText,
                      arafahOption === "gaza" && styles.segmentBtnTextActive,
                    ]}
                  >
                    Gaza 5 meals ($55)
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.featuredActions}>
                <View style={styles.quantityRow}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => setQuantity(ARAFAH_IF_PRODUCT_ID, -1)}
                  >
                    <Text style={styles.qtyBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyValue}>{getQuantity(ARAFAH_IF_PRODUCT_ID)}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => setQuantity(ARAFAH_IF_PRODUCT_ID, 1)}
                  >
                    <Text style={styles.qtyBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.addToCartBtn}
                  onPress={handleArafahAdd}
                  disabled={addingKey === "arafah"}
                >
                  {addingKey === "arafah" ? (
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
                Total: $
                {(
                  (arafahOption === "gaza" ? 55 : 90) * getQuantity(ARAFAH_IF_PRODUCT_ID)
                ).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* FAQ & Information — aligned with AU Next.js + Ramadan mobile tabs */}
        <View style={styles.faqSectionWrap}>
          <Text style={styles.faqSectionTitle}>FAQ & Information</Text>
          <View style={styles.faqTabs}>
            <TouchableOpacity
              style={[styles.faqTab, activeInfoTab === "FAQ" && styles.faqTabActive]}
              onPress={() => {
                setActiveInfoTab("FAQ");
                setActiveFaqIndex(null);
              }}
            >
              <Text style={[styles.faqTabText, activeInfoTab === "FAQ" && styles.faqTabTextActive]}>FAQ</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.faqTab, activeInfoTab === "Information" && styles.faqTabActive]}
              onPress={() => {
                setActiveInfoTab("Information");
                setActiveFaqIndex(null);
              }}
            >
              <Text
                style={[styles.faqTabText, activeInfoTab === "Information" && styles.faqTabTextActive]}
              >
                Information
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.faqTabIndicator}>
            <View
              style={[
                styles.faqTabIndicatorFill,
                {
                  width: "50%",
                  marginLeft: activeInfoTab === "FAQ" ? 0 : "50%",
                },
              ]}
            />
          </View>

          {activeInfoTab === "FAQ" && (
            <>
              <Text style={styles.faqIntro}>Common questions about Qurban 2026 (same as our website).</Text>
              {QURBAN_FAQ_AU.map((faq, index) => {
                const isOpen = activeFaqIndex === index;
                return (
                  <TouchableOpacity
                    key={faq.question}
                    style={[styles.faqItem, isOpen && styles.faqItemOpen]}
                    onPress={() => setActiveFaqIndex(isOpen ? null : index)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.faqItemHeader}>
                      <View style={[styles.faqItemNumber, isOpen && styles.faqItemNumberActive]}>
                        <Text style={[styles.faqItemNumberText, isOpen && styles.faqItemNumberTextActive]}>
                          {index + 1}
                        </Text>
                      </View>
                      <Text style={styles.faqItemQuestion} numberOfLines={isOpen ? 10 : 2}>
                        {faq.question}
                      </Text>
                      <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={20} color={PRIMARY_300} />
                    </View>
                    {isOpen ? (
                      <View style={styles.faqItemBody}>
                        {faq.bullets && faq.paragraphs[0] ? (
                          <Text style={styles.faqPara}>{faq.paragraphs[0]}</Text>
                        ) : null}
                        {faq.bullets ? (
                          <View style={styles.faqBulletList}>
                            {faq.bullets.map((b) => (
                              <View key={b} style={styles.faqBulletRow}>
                                <Text style={styles.faqBulletDot}>•</Text>
                                <Text style={styles.faqBulletText}>{b}</Text>
                              </View>
                            ))}
                          </View>
                        ) : null}
                        {(faq.bullets ? faq.paragraphs.slice(1) : faq.paragraphs).map((p, i) => (
                          <Text key={i} style={[styles.faqPara, i > 0 && styles.faqParaGap]}>
                            {p}
                          </Text>
                        ))}
                        {faq.showWhatsappCta ? (
                          <TouchableOpacity
                            style={styles.whatsappBtn}
                            onPress={() => Linking.openURL(QURBAN_WHATSAPP_CHANNEL_URL)}
                            activeOpacity={0.85}
                          >
                            <Ionicons name="logo-whatsapp" size={20} color="#fff" />
                            <Text style={styles.whatsappBtnText}>WhatsApp channel — live updates</Text>
                          </TouchableOpacity>
                        ) : null}
                      </View>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </>
          )}

          {activeInfoTab === "Information" && (
            <View style={styles.infoScroll}>
              <Text style={styles.infoMainTitle}>{QURBAN_INFO_INTRO.title}</Text>
              {QURBAN_INFO_INTRO.paragraphs.map((p, i) => (
                <Text key={i} style={styles.infoBody}>
                  {p}
                </Text>
              ))}

              <Text style={styles.infoHeading}>Al-Ihsan Foundation — a trusted choice</Text>
              <Text style={styles.infoBody}>
                For over a decade we’ve delivered Qurban with ihsan — excellence, sincerity, and Islamic integrity.
                Your sacrifice reaches those facing hardship, displacement, and poverty.
              </Text>
              {QURBAN_TRUST_PILLARS.map((pillar) => (
                <View key={pillar.title} style={styles.infoPillarCard}>
                  <Text style={styles.infoPillarTitle}>{pillar.title}</Text>
                  <Text style={styles.infoPillarText}>{pillar.text}</Text>
                </View>
              ))}

              <Text style={styles.infoHeading}>The Al-Ihsan Guarantee</Text>
              <Text style={styles.infoBody}>
                We don’t only facilitate a donation — we manage your <Text style={styles.infoBold}>Amanah</Text>.
              </Text>
              <View style={styles.guaranteeGrid}>
                {QURBAN_GUARANTEE_ITEMS.map((g) => (
                  <View key={g.title} style={styles.guaranteeCard}>
                    <Text style={styles.guaranteeCheck}>✓</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.guaranteeTitle}>{g.title}</Text>
                      <Text style={styles.guaranteeBody}>{g.body}</Text>
                    </View>
                  </View>
                ))}
              </View>
              <Text style={styles.infoTagline}>This is Qurban with Ihsan</Text>

              <Text style={styles.infoHeading}>Donate with confidence</Text>
              <Text style={styles.infoBody}>
                Registered with the ACNC; Deductible Gift Recipient (DGR) Item 1. ABN 53 168 960 361. Donations of
                $2+ are tax-deductible in Australia; tax receipts are emailed after you give.
              </Text>

              <Text style={styles.infoHeading}>Who your Qurban reaches</Text>
              <Text style={styles.infoBody}>
                Fresh meat is a rarity year-round in many places. Your Qurban brings protein, relief, and dignity at
                Eid.
              </Text>
              <View style={styles.tagWrap}>
                {QURBAN_WHO_REACHES_TAGS.map((tag) => (
                  <View key={tag} style={styles.tagChip}>
                    <Text style={styles.tagChipText}>{tag}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.infoHeading}>Impact you helped deliver (2025)</Text>
              <View style={styles.statGrid}>
                {QURBAN_IMPACT_STATS.map((s) => (
                  <View key={s.l} style={styles.statCard}>
                    <Text style={styles.statNum}>{s.n}</Text>
                    <Text style={styles.statLabel}>{s.l}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.infoHeading}>Dhul Hijjah & Qurban dates 2026</Text>
              <View style={styles.tableCard}>
                <View style={styles.tableHead}>
                  <Text style={[styles.tableCell, styles.tableHeadText]}>Event</Text>
                  <Text style={[styles.tableCell, styles.tableHeadText]}>Saudi</Text>
                  <Text style={[styles.tableCell, styles.tableHeadText]}>Australia</Text>
                </View>
                {QURBAN_DHUL_HIJJA_ROWS.map(([ev, sa, au]) => (
                  <View key={ev} style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.tableEv]}>{ev}</Text>
                    <Text style={styles.tableCell}>{sa}</Text>
                    <Text style={styles.tableCell}>{au}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.tableFoot}>{QURBAN_DATES_FOOTNOTE}</Text>

              <TouchableOpacity
                style={styles.whatsappBanner}
                onPress={() => Linking.openURL(QURBAN_WHATSAPP_CHANNEL_URL)}
                activeOpacity={0.9}
              >
                <Ionicons name="logo-whatsapp" size={22} color="#fff" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.whatsappBannerTitle}>Stay in the loop</Text>
                  <Text style={styles.whatsappBannerSub}>Get live Qurban updates on WhatsApp</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              </TouchableOpacity>

              <Text style={styles.infoHeading}>{QURBAN_INFO_SUNNAH.title}</Text>
              <Text style={styles.infoBody}>{QURBAN_INFO_SUNNAH.body}</Text>
              <View style={styles.infoQuote}>
                <Text style={styles.infoQuoteText}>{QURBAN_INFO_SUNNAH.quote}</Text>
              </View>
              <Text style={styles.infoBody}>{QURBAN_INFO_SUNNAH.footer}</Text>

              <Text style={styles.infoHeading}>{QURBAN_INFO_ARAFAH.title}</Text>
              <Text style={styles.infoBody}>{QURBAN_INFO_ARAFAH.body}</Text>
              <View style={styles.infoQuote}>
                <Text style={styles.infoQuoteText}>{QURBAN_INFO_ARAFAH.quote}</Text>
              </View>

              <Text style={styles.infoHeading}>{QURBAN_INFO_EID.title}</Text>
              {QURBAN_INFO_EID.paragraphs.map((p, i) => (
                <Text key={i} style={styles.infoBody}>
                  {p}
                </Text>
              ))}

              <View style={styles.infoCta}>
                <Text style={styles.infoCtaTitle}>Hardship exists. But so does ease.</Text>
                <Text style={styles.infoCtaSub}>Be the ease this Eid al-Adha.</Text>
                <Text style={styles.infoCtaTag}>Give with Ihsan</Text>
              </View>
            </View>
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 14, color: "#6b7280" },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 6 },
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  propheticCard: {
    borderRadius: 16,
    overflow: "hidden",
    minHeight: 320,
  },
  propheticImage: { ...StyleSheet.absoluteFillObject, width: "100%", height: 360 },
  propheticGradient: { ...StyleSheet.absoluteFillObject },
  propheticOverlay: {
    padding: 16,
    justifyContent: "flex-end",
    minHeight: 320,
  },
  propheticLocation: { color: "#fde68a", fontSize: 13, fontWeight: "600" },
  propheticTitle: { color: "#fff", fontSize: 22, fontWeight: "800", marginTop: 4 },
  propheticBody: { color: "rgba(255,255,255,0.92)", fontSize: 14, marginTop: 8, lineHeight: 20 },
  propheticFooter: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 14 },
  propheticTotal: { color: "rgba(255,255,255,0.95)", fontSize: 14, marginTop: 10, fontWeight: "600" },
  featuredCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  featuredImage: { width: "100%", height: 180 },
  featuredBody: { padding: 14 },
  featuredTitle: { fontSize: 17, fontWeight: "700", color: "#111827" },
  featuredDesc: { fontSize: 13, color: "#6b7280", marginTop: 4 },
  featuredPriceRow: { flexDirection: "row", alignItems: "baseline", gap: 6, marginTop: 10 },
  featuredPrice: { fontSize: 22, fontWeight: "800", color: PRIMARY_300 },
  featuredPer: { fontSize: 13, color: "#6b7280" },
  featuredActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    gap: 8,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    padding: 4,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  qtyBtnText: { fontSize: 18, fontWeight: "700", color: "#374151" },
  qtyValue: { minWidth: 28, textAlign: "center", fontWeight: "700", color: "#111" },
  addToCartBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#fde047",
    paddingVertical: 12,
    borderRadius: 10,
  },
  addToCartBtnText: { fontWeight: "700", color: "#1f2937", fontSize: 15 },
  lineTotal: { marginTop: 8, fontSize: 13, color: "#6b7280", fontWeight: "600" },
  groupESection: { marginTop: 10, marginBottom: 4 },
  groupELabel: { fontSize: 12, fontWeight: "600", color: "#4b5563", marginBottom: 6 },
  segmentRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
  },
  segmentBtnActive: { backgroundColor: PRIMARY_300 },
  segmentBtnText: { fontSize: 13, fontWeight: "600", color: "#374151" },
  segmentBtnTextActive: { color: "#fff" },
  lebanonForm: { gap: 8, marginTop: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#fff",
  },
  trioCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  trioImage: { width: SCREEN_WIDTH * 0.36, height: 180 },
  trioBody: { flex: 1, padding: 12, justifyContent: "center" },
  trioTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  trioDesc: { fontSize: 12, color: "#6b7280", marginTop: 4 },
  trioPrice: { fontSize: 20, fontWeight: "800", color: PRIMARY_300, marginTop: 8 },
  impactScroll: { paddingBottom: 8, gap: 12 },
  impactCard: {
    width: 200,
    height: 240,
    borderRadius: 14,
    overflow: "hidden",
    marginRight: 12,
    backgroundColor: "#e5e7eb",
  },
  impactImage: { ...StyleSheet.absoluteFillObject },
  impactGradient: { ...StyleSheet.absoluteFillObject },
  impactOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    padding: 12,
  },
  impactTitle: { color: "#fff", fontWeight: "700", fontSize: 15 },
  impactPrice: { color: "#fde68a", fontSize: 13, marginTop: 4, fontWeight: "600" },
  impactAddBtn: {
    alignSelf: "flex-start",
    marginTop: 8,
    backgroundColor: "#fde047",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  impactAddText: { fontWeight: "700", color: "#010D26", fontSize: 13 },
  arafahCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  arafahImage: { width: "100%", height: 160 },
  arafahBody: { padding: 14 },
  faqSectionWrap: {
    marginTop: 28,
    paddingTop: 24,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: "#E9F0FC",
  },
  faqSectionTitle: { fontSize: 18, fontWeight: "700", color: PRIMARY_300, marginBottom: 16 },
  faqTabs: { flexDirection: "row", gap: 12, marginBottom: 8 },
  faqTab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  faqTabActive: { backgroundColor: PRIMARY_300, borderColor: PRIMARY_300 },
  faqTabText: { fontSize: 14, fontWeight: "600", color: "#374151" },
  faqTabTextActive: { color: "#fff" },
  faqTabIndicator: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E5E7EB",
    marginBottom: 16,
    overflow: "hidden",
    flexDirection: "row",
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
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  faqItemOpen: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderColor: PRIMARY_300,
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
  faqItemNumberActive: { backgroundColor: PRIMARY_300 },
  faqItemNumberText: { fontSize: 13, fontWeight: "700", color: "#6B7280" },
  faqItemNumberTextActive: { color: "#fff" },
  faqItemQuestion: { flex: 1, fontSize: 14, fontWeight: "600", color: "#111827" },
  faqItemBody: { paddingHorizontal: 14, paddingBottom: 14, paddingTop: 0 },
  faqPara: { fontSize: 14, color: "#374151", lineHeight: 21 },
  faqParaGap: { marginTop: 10 },
  faqBulletList: { marginVertical: 8, paddingLeft: 4 },
  faqBulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 6 },
  faqBulletDot: { fontSize: 16, color: PRIMARY_300, marginTop: -2 },
  faqBulletText: { flex: 1, fontSize: 14, color: "#374151", lineHeight: 21 },
  whatsappBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    alignSelf: "flex-start",
    marginTop: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#25D366",
  },
  whatsappBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  infoScroll: {},
  infoMainTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: PRIMARY_300,
    marginBottom: 12,
    textAlign: "center",
  },
  infoHeading: {
    fontSize: 17,
    fontWeight: "700",
    color: PRIMARY_300,
    marginTop: 18,
    marginBottom: 8,
  },
  infoBody: { fontSize: 14, color: "#374151", lineHeight: 22, marginBottom: 10 },
  infoBold: { fontWeight: "700", color: "#111827" },
  infoPillarCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  infoPillarTitle: { fontSize: 15, fontWeight: "700", color: "#111827" },
  infoPillarText: { fontSize: 13, color: "#4b5563", marginTop: 6, lineHeight: 20 },
  guaranteeGrid: { gap: 10, marginTop: 8 },
  guaranteeCard: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  guaranteeCheck: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
    backgroundColor: PRIMARY_300,
    width: 26,
    height: 26,
    borderRadius: 13,
    textAlign: "center",
    lineHeight: 26,
    overflow: "hidden",
  },
  guaranteeTitle: { fontSize: 14, fontWeight: "700", color: "#111827" },
  guaranteeBody: { fontSize: 13, color: "#4b5563", marginTop: 4, lineHeight: 20 },
  infoTagline: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "700",
    color: PRIMARY_300,
    marginVertical: 14,
  },
  tagWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8, marginBottom: 8 },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  tagChipText: { fontSize: 12, fontWeight: "600", color: "#374151" },
  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10, justifyContent: "space-between" },
  statCard: {
    flexBasis: "31%",
    flexGrow: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    minWidth: 100,
  },
  statNum: { fontSize: 22, fontWeight: "800", color: PRIMARY_300 },
  statLabel: { fontSize: 11, color: "#4b5563", textAlign: "center", marginTop: 6, lineHeight: 15 },
  tableCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: 8,
  },
  tableHead: {
    flexDirection: "row",
    backgroundColor: "rgba(36,107,225,0.12)",
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  tableCell: { flex: 1, fontSize: 11, color: "#374151" },
  tableHeadText: { fontWeight: "700", color: "#111827", fontSize: 11 },
  tableEv: { flex: 1.2 },
  tableFoot: { fontSize: 11, fontStyle: "italic", color: "#6b7280", marginTop: 8, lineHeight: 16 },
  whatsappBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#25D366",
    padding: 16,
    borderRadius: 14,
    marginVertical: 16,
  },
  whatsappBannerTitle: { color: "#fff", fontWeight: "700", fontSize: 15 },
  whatsappBannerSub: { color: "rgba(255,255,255,0.92)", fontSize: 13, marginTop: 2 },
  infoQuote: {
    backgroundColor: "#EFF6FF",
    borderLeftWidth: 4,
    borderLeftColor: PRIMARY_300,
    padding: 14,
    marginVertical: 10,
    borderRadius: 4,
  },
  infoQuoteText: { fontSize: 14, color: PRIMARY_300, fontStyle: "italic", lineHeight: 21 },
  infoCta: {
    backgroundColor: PRIMARY_300,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 8,
  },
  infoCtaTitle: { color: "#fff", fontSize: 16, fontWeight: "700", textAlign: "center" },
  infoCtaSub: { color: "#FDE047", fontSize: 15, fontWeight: "600", marginTop: 6 },
  infoCtaTag: { color: "rgba(255,255,255,0.9)", fontSize: 13, marginTop: 8 },
});
