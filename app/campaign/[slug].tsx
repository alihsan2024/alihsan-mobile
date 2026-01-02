// import { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   Dimensions,
//   TouchableOpacity,
//   Alert,
//   TextInput,
// } from "react-native";
// import { useLocalSearchParams, useRouter, Stack } from "expo-router";
// import {
//   SafeAreaView,
//   useSafeAreaInsets,
// } from "react-native-safe-area-context";
// import { getCampaignDetails } from "../../utils/api";
// import { Image as ExpoImage } from "expo-image";
// import { useBasket } from "../../context/BasketContext";
// import LoadingScreen from "../../components/LoadingScreen";
// import { Ionicons } from "@expo/vector-icons";
// import CustomHeader from "@/components/CustomHeader";
// import { useAppDispatch } from "@/hooks/useAppDispatch";
// import { addBasketItem, getBasketItems } from "@/store/reduxSlice/basketSlice";
// import { useSelector } from "react-redux";
// import {
//   useAddToBasketMutation,
//   useGetBasketQuery,
// } from "@/store/reduxSlice/api/basketApi";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const { width } = Dimensions.get("window");

// export default function CampaignDetailsScreen() {
//   const { slug } = useLocalSearchParams<{ slug: string }>();
//   const router = useRouter();
//   const insets = useSafeAreaInsets();
//   const [campaign, setCampaign] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [amount, setAmount] = useState("50");
//   const [addingToCart, setAddingToCart] = useState(false);
//   const { addItem, items } = useBasket();
//   const dispatch = useAppDispatch();
//   const { user } = useSelector((state: any) => state.authentication);
//   const isAuthenticated = !!user;
//   const [addToBasket] = useAddToBasketMutation();
//   const [guestBasket, setGuestBasket] = useState<any[]>([]);
//   const { data: basketData } = useGetBasketQuery(undefined, {
//     skip: !isAuthenticated,
//   });

//   useEffect(() => {
//     const loadCampaignDetails = async () => {
//       if (!slug) {
//         setError("Campaign slug is required");
//         setLoading(false);
//         return;
//       }

//       try {
//         setError(null);
//         const data = await getCampaignDetails(slug);
//         setCampaign(data);
//       } catch (err: any) {
//         console.error("Failed to load campaign details:", err);
//         setError(err.message || "Failed to load campaign details");
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadCampaignDetails();
//   }, [slug]);

//   useEffect(() => {
//     if (!isAuthenticated) {
//       AsyncStorage.getItem("guestBasket").then((data) => {
//         setGuestBasket(data ? JSON.parse(data) : []);
//       });
//     }
//   }, [isAuthenticated]);

//   if (loading) return <LoadingScreen message="Loading campaign..." />;
//   if (error)
//     return (
//       <View style={styles.container}>
//         <Text style={styles.errorText}>Error: {error}</Text>
//         <Text style={styles.backText} onPress={() => router.back()}>
//           Go back
//         </Text>
//       </View>
//     );
//   if (!campaign)
//     return (
//       <View style={styles.container}>
//         <Text style={styles.errorText}>Campaign not found</Text>
//         <Text style={styles.backText} onPress={() => router.back()}>
//           Go back
//         </Text>
//       </View>
//     );

//   const campaignData = campaign.campaign || campaign;
//   const media = campaignData?.CampaignMedia || [];
//   const posts = campaignData?.Posts || [];
//   const category = campaignData?.CampaignCategory;
//   const basketItems = isAuthenticated ? basketData?.payload ?? [] : guestBasket;
//   const isInCart = basketItems.some(
//     (item: any) => item.campaignId === campaignData?.id
//   );

//   const handleAddToCart = async () => {
//     if (!campaignData?.id) {
//       Alert.alert("Error", "Campaign information is missing");
//       return;
//     }
//     const donationAmount = parseFloat(amount);
//     if (isNaN(donationAmount) || donationAmount <= 0) {
//       Alert.alert("Error", "Please enter a valid amount");
//       return;
//     }
//     setAddingToCart(true);
//     try {
//       const checkoutType = campaignData.checkoutType;
//       const basketItem: any = {
//         campaignId: campaignData.id,
//         amount: donationAmount,
//         quantity: 1,
//         name: campaignData.name,
//         coverImage: campaignData.coverImage,
//         description: campaignData.description,
//         checkoutType: campaignData.checkoutType,
//         // add other fields as needed for display
//       };
//       if (checkoutType === "ADEEQAH_GENERAL_SACRIFICE") {
//         Alert.alert(
//           "Special Campaign",
//           "This campaign requires additional information. Please use the web app for this campaign type."
//         );
//         setAddingToCart(false);
//         return;
//       }
//       if (isAuthenticated) {
//         await addToBasket({ body: basketItem });
//       } else {
//         const updated = [...guestBasket, basketItem];
//         setGuestBasket(updated);
//         await AsyncStorage.setItem("guestBasket", JSON.stringify(updated));
//       }
//       Alert.alert("Success", "Campaign added to cart!", [
//         {
//           text: "View Cart",
//           onPress: () => router.push("/(tabs)/cart"),
//         },
//         { text: "OK" },
//       ]);
//     } catch (err: any) {
//       Alert.alert("Error", err.message || "Failed to add to cart");
//     } finally {
//       setAddingToCart(false);
//     }
//   };

//   return (
//     <>
//       {/* Configure screen options in Stack.Screen */}
//       <CustomHeader transparent absolute />
//       <ScrollView
//         style={styles.scrollView}
//         showsVerticalScrollIndicator={false}
//       >
//         {campaignData?.coverImage && (
//           <ExpoImage
//             source={{ uri: campaignData.coverImage }}
//             style={styles.coverImage}
//             contentFit="cover"
//             transition={200}
//             placeholder={{ blurhash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4" }}
//           />
//         )}
//         <View style={styles.content}>
//           <Text style={styles.title}>{campaignData?.name}</Text>
//           {category && (
//             <View style={styles.categoryBadge}>
//               <Text style={styles.categoryText}>{category.name}</Text>
//             </View>
//           )}
//           {campaignData?.description && (
//             <View style={styles.section}>
//               <Text style={styles.description}>
//                 {campaignData.description.replace(/<[^>]*>/g, "")}
//               </Text>
//             </View>
//           )}
//           {campaignData?.descriptionText && (
//             <View style={styles.section}>
//               <Text style={styles.descriptionText}>
//                 {campaignData.descriptionText.replace(/<[^>]*>/g, "")}
//               </Text>
//             </View>
//           )}
//           {media.length > 0 && (
//             <View style={styles.section}>
//               <Text style={styles.sectionTitle}>Gallery</Text>
//               <ScrollView
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//                 style={styles.mediaScroll}
//                 contentContainerStyle={styles.mediaContainer}
//               >
//                 {media.map((item: any, index: number) => (
//                   <ExpoImage
//                     key={item.id || index}
//                     source={{ uri: item.url }}
//                     style={styles.mediaImage}
//                     contentFit="cover"
//                     transition={200}
//                   />
//                 ))}
//               </ScrollView>
//             </View>
//           )}
//           {posts.length > 0 && (
//             <View style={styles.section}>
//               <Text style={styles.sectionTitle}>Updates</Text>
//               {posts.map((post: any, index: number) => (
//                 <View key={post.id || index} style={styles.postCard}>
//                   {post.PostMedia && post.PostMedia.length > 0 && (
//                     <View style={styles.postMediaContainer}>
//                       {post.PostMedia.map((media: any, mediaIndex: number) => (
//                         <ExpoImage
//                           key={media.id || mediaIndex}
//                           source={{ uri: media.url }}
//                           style={styles.postImage}
//                           contentFit="cover"
//                           transition={200}
//                         />
//                       ))}
//                     </View>
//                   )}
//                   {post.text && (
//                     <Text style={styles.postText}>
//                       {post.text.replace(/<[^>]*>/g, "")}
//                     </Text>
//                   )}
//                   {post.displayTime && (
//                     <Text style={styles.postTime}>{post.displayTime}</Text>
//                   )}
//                 </View>
//               ))}
//             </View>
//           )}
//           {campaignData?.Organizer && (
//             <View style={styles.section}>
//               <Text style={styles.sectionTitle}>Organizer</Text>
//               <View style={styles.organizerCard}>
//                 {campaignData.Organizer.profileImage && (
//                   <ExpoImage
//                     source={{ uri: campaignData.Organizer.profileImage }}
//                     style={styles.organizerImage}
//                     contentFit="cover"
//                   />
//                 )}
//                 <View style={styles.organizerInfo}>
//                   <Text style={styles.organizerName}>
//                     {campaignData.Organizer.firstName}{" "}
//                     {campaignData.Organizer.lastName}
//                   </Text>
//                   {campaignData.Organizer.about && (
//                     <Text style={styles.organizerAbout}>
//                       {campaignData.Organizer.about}
//                     </Text>
//                   )}
//                 </View>
//               </View>
//             </View>
//           )}
//           <View style={styles.metadataSection}>
//             {campaignData?.country && (
//               <View style={styles.metadataItem}>
//                 <Text style={styles.metadataLabel}>Country:</Text>
//                 <Text style={styles.metadataValue}>{campaignData.country}</Text>
//               </View>
//             )}
//             {campaignData?.status && (
//               <View style={styles.metadataItem}>
//                 <Text style={styles.metadataLabel}>Status:</Text>
//                 <Text style={styles.metadataValue}>{campaignData.status}</Text>
//               </View>
//             )}
//           </View>
//           <View style={styles.addToCartSection}>
//             <Text style={styles.addToCartTitle}>Make a Donation</Text>
//             <View style={styles.amountContainer}>
//               <Text style={styles.amountLabel}>Amount (AUD)</Text>
//               <TextInput
//                 style={styles.amountInput}
//                 value={amount}
//                 onChangeText={setAmount}
//                 keyboardType="numeric"
//                 placeholder="Enter amount"
//                 placeholderTextColor="#999"
//               />
//             </View>
//             <TouchableOpacity
//               style={[
//                 styles.addToCartButton,
//                 isInCart && styles.addToCartButtonInCart,
//               ]}
//               onPress={handleAddToCart}
//               disabled={addingToCart || isInCart}
//             >
//               <Text style={styles.addToCartButtonText}>
//                 {addingToCart
//                   ? "Adding..."
//                   : isInCart
//                   ? "Already in Cart"
//                   : "Add to Cart"}
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </ScrollView>
//     </>
//   );
// }

// const styles = StyleSheet.create({
//   scrollView: { flex: 1, backgroundColor: "#fff" },
//   container: { flex: 1, backgroundColor: "#fff" },
//   coverImage: { width: "100%", height: 300, backgroundColor: "#f0f0f0" },
//   content: { padding: 20 },
//   title: {
//     fontSize: 28,
//     fontWeight: "bold",
//     color: "#264B8B",
//     marginBottom: 12,
//     lineHeight: 34,
//   },
//   categoryBadge: {
//     alignSelf: "flex-start",
//     backgroundColor: "#264B8B",
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//     marginBottom: 20,
//   },
//   categoryText: { color: "#fff", fontSize: 12, fontWeight: "600" },
//   section: { marginBottom: 32 },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: "600",
//     color: "#264B8B",
//     marginBottom: 12,
//   },
//   description: {
//     fontSize: 16,
//     color: "#333",
//     lineHeight: 24,
//     marginBottom: 16,
//   },
//   descriptionText: { fontSize: 16, color: "#333", lineHeight: 24 },
//   mediaScroll: { marginHorizontal: -20 },
//   mediaContainer: { paddingHorizontal: 20, gap: 12 },
//   mediaImage: {
//     width: width * 0.7,
//     height: 200,
//     borderRadius: 12,
//     backgroundColor: "#f0f0f0",
//   },
//   postCard: {
//     backgroundColor: "#f9f9f9",
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     borderLeftWidth: 3,
//     borderLeftColor: "#264B8B",
//   },
//   postMediaContainer: { marginBottom: 12, gap: 8 },
//   postImage: {
//     width: "100%",
//     height: 200,
//     borderRadius: 8,
//     backgroundColor: "#f0f0f0",
//     marginBottom: 8,
//   },
//   postText: { fontSize: 15, color: "#333", lineHeight: 22, marginBottom: 8 },
//   postTime: { fontSize: 12, color: "#999", fontStyle: "italic" },
//   organizerCard: {
//     flexDirection: "row",
//     backgroundColor: "#f9f9f9",
//     borderRadius: 12,
//     padding: 16,
//     gap: 12,
//   },
//   organizerImage: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     backgroundColor: "#e0e0e0",
//   },
//   organizerInfo: { flex: 1 },
//   organizerName: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#264B8B",
//     marginBottom: 4,
//   },
//   organizerAbout: { fontSize: 14, color: "#666", lineHeight: 20 },
//   metadataSection: {
//     backgroundColor: "#f9f9f9",
//     borderRadius: 12,
//     padding: 16,
//     marginTop: 8,
//   },
//   metadataItem: { flexDirection: "row", marginBottom: 8 },
//   metadataLabel: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#666",
//     marginRight: 8,
//     minWidth: 80,
//   },
//   metadataValue: { fontSize: 14, color: "#333", flex: 1 },
//   addToCartSection: {
//     marginTop: 32,
//     padding: 20,
//     backgroundColor: "#f9f9f9",
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: "#e0e0e0",
//   },
//   addToCartTitle: {
//     fontSize: 20,
//     fontWeight: "600",
//     color: "#264B8B",
//     marginBottom: 16,
//   },
//   amountContainer: { marginBottom: 16 },
//   amountLabel: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#333",
//     marginBottom: 8,
//   },
//   amountInput: {
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 8,
//     padding: 16,
//     fontSize: 16,
//     backgroundColor: "#fff",
//   },
//   addToCartButton: {
//     backgroundColor: "#264B8B",
//     padding: 16,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   addToCartButtonInCart: { backgroundColor: "#999" },
//   addToCartButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
//   errorText: { fontSize: 16, color: "#d32f2f", marginBottom: 12 },
//   backText: { fontSize: 16, color: "#264B8B", textDecorationLine: "underline" },
// });

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

  /* ------------------ LOAD CAMPAIGN ------------------ */
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

  /* ------------------ LOAD GUEST BASKET ------------------ */
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

  /* ------------------ PROGRESS ------------------ */
  const raised = Number(campaign?.raisedAmount || 0);
  const goal = Number(campaign?.goalAmount || 0);

  const progressPercent = useMemo(() => {
    if (!goal) return "0%";
    return `${Math.min((raised / goal) * 100, 100)}%`;
  }, [raised, goal]);

  /* ------------------ ADD TO CART ------------------ */
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

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* ===== HERO ===== */}
      <ImageBackground
        source={{ uri: campaign.coverImage }}
        style={styles.hero}
      >
        <TouchableOpacity style={styles.backBtn} onPress={router.back}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>

        <View style={styles.heroText}>
          <Text style={styles.heroTitle}>Gaza</Text>
          <Text style={styles.heroSubtitle}>is being Starved</Text>

          <Text style={styles.heroMeta}>
            <Text style={styles.heroMetaBold}>
              {campaign.totalDonors || 254_786}
            </Text>{" "}
            Lives Changed
          </Text>
        </View>
      </ImageBackground>

      {/* ===== CONTENT ===== */}
      <View style={styles.content}>
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
            {campaign.description
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

        {/* ===== DONATIONS ===== */}
        <Text style={styles.donationTitle}>Donation</Text>

        {[1, 2, 3, 4, 5].map((_, i) => (
          <View key={i} style={styles.donationRow}>
            <Ionicons name="person-circle-outline" size={28} color="#cfcfcf" />

            <View style={styles.donationInfo}>
              <Text style={styles.donorName}>Anonymous</Text>
              <Text style={styles.timeText}>5 Minutes ago</Text>
            </View>

            <Text style={styles.donationValue}>$25</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

/* ---------- Amount Button ---------- */
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
  heroMetaBold: { fontWeight: "700" },

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
    fontSize: 17,
    fontWeight: "700",
  },

  bodyText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#555",
    marginTop: 8,
  },

  chooseText: {
    marginTop: 10,
    fontSize: 14,
    color: "#444",
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
