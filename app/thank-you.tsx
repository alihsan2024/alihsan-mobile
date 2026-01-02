// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   Image,
//   ActivityIndicator,
//   Share,
//   Linking,
//   ScrollView,
// } from "react-native";
// import { useLocalSearchParams, useRouter } from "expo-router";

// // Dummy API (replace with your real implementation)
// interface UpdatePaypalTokenParams {
//   orderId?: string;
//   checkoutType?: string;
// }
// const updatePaypalToken = async ({
//   orderId,
//   checkoutType,
// }: UpdatePaypalTokenParams): Promise<{ success: boolean; message: string }> => {
//   // orderId and checkoutType are currently unused
//   await new Promise((res) => setTimeout(res, 600));
//   return { success: true, message: "Payment completed successfully" };
// };

// const getBasket = async (): Promise<any[]> => {
//   return [];
// };

// export default function ThankYouScreen() {
//   const router = useRouter();
//   const params = useLocalSearchParams();

//   const {
//     token = "",
//     result = "",
//     checkoutType = "",
//     payment_intent = "",
//     redirect_status = "",
//   } = params;

//   const [loading, setLoading] = useState(false);
//   const [email, setEmail] = useState(null);

//   const APP_URL = "https://yourwebsite.com";
//   const shareMessage =
//     'I just donated to charity! \n\n"Spend (on charity), o son of Adam, and I shall spend on you"';

//   // ----------------------------------
//   // HANDLE PAYPAL + STRIPE CONFIRMATION
//   // ----------------------------------

//   useEffect(() => {
//     if (token && result === "true") {
//       handlePaypal();
//     }
//   }, [token, result]);

//   useEffect(() => {
//     if (payment_intent && redirect_status === "succeeded") {
//       handleStripe();
//     }
//   }, [payment_intent, redirect_status]);

//   const handlePaypal = async () => {
//     setLoading(true);
//     const res = await updatePaypalToken({
//       orderId: Array.isArray(token) ? token[0] : token,
//       checkoutType: Array.isArray(checkoutType)
//         ? checkoutType[0]
//         : checkoutType,
//     });

//     if (res.success) {
//       await getBasket();
//     }
//     setLoading(false);
//   };

//   const handleStripe = async () => {
//     setLoading(true);
//     await getBasket();
//     setLoading(false);
//   };

//   // ----------------------------------
//   // SHARE BUTTON HANDLERS
//   // ----------------------------------

//   const shareOnWhatsapp = () => {
//     const text = `${shareMessage}\n\n${APP_URL}`;
//     Linking.openURL(
//       `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`
//     );
//   };

//   const shareOnFacebook = () => {
//     Linking.openURL(
//       `https://www.facebook.com/sharer.php?u=${encodeURIComponent(APP_URL)}`
//     );
//   };

//   const shareOnTwitter = () => {
//     Linking.openURL(
//       `https://twitter.com/intent/tweet?text=${encodeURIComponent(
//         shareMessage
//       )}&url=${encodeURIComponent(APP_URL)}`
//     );
//   };

//   const shareOnLinkedIn = () => {
//     Linking.openURL(
//       `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
//         APP_URL
//       )}&summary=${encodeURIComponent(shareMessage)}`
//     );
//   };

//   // ----------------------------------
//   // UI
//   // ----------------------------------

//   return (
//     <ScrollView
//       contentContainerStyle={{
//         flexGrow: 1,
//         backgroundColor: "#F5F8FF",
//         padding: 20,
//       }}
//     >
//       <View
//         style={{
//           backgroundColor: "white",
//           borderRadius: 20,
//           padding: 20,
//           marginTop: 30,
//           elevation: 3,
//         }}
//       >
//         {/* Loader */}
//         {loading ? (
//           <View style={{ padding: 50, alignItems: "center" }}>
//             <ActivityIndicator size="large" color="#4A6CF7" />
//           </View>
//         ) : (
//           <>
//             {/* Header */}
//             <View style={{ alignItems: "center", marginBottom: 20 }}>
//               <Image
//                 source={require("@/assets/thank-you.png")}
//                 style={{ width: 150, height: 150 }}
//                 resizeMode="contain"
//               />

//               <Text
//                 style={{
//                   fontSize: 28,
//                   fontWeight: "700",
//                   color: "#265DAB",
//                   marginTop: 10,
//                 }}
//               >
//                 Thank You!
//               </Text>

//               <View
//                 style={{
//                   width: 60,
//                   height: 5,
//                   backgroundColor: "#AFC7F9",
//                   borderRadius: 20,
//                   marginVertical: 10,
//                 }}
//               />

//               <Text
//                 style={{
//                   fontSize: 18,
//                   color: "#333",
//                   textAlign: "center",
//                   marginTop: 10,
//                 }}
//               >
//                 Your donation has been successfully received.
//               </Text>
//             </View>

//             {/* Email message */}
//             <View style={{ alignItems: "center", marginVertical: 20 }}>
//               <Text style={{ color: "#444", fontSize: 16 }}>
//                 A receipt has been sent to your email
//               </Text>

//               {email && (
//                 <TouchableOpacity
//                   onPress={() => Linking.openURL("mailto:" + email)}
//                 >
//                   <Text
//                     style={{
//                       marginTop: 6,
//                       color: "#265DAB",
//                       fontWeight: "600",
//                     }}
//                   >
//                     {email}
//                   </Text>
//                 </TouchableOpacity>
//               )}
//             </View>

//             {/* Home Button */}
//             <TouchableOpacity
//               onPress={() => router.replace("/")}
//               style={{
//                 backgroundColor: "#265DAB",
//                 paddingVertical: 14,
//                 borderRadius: 12,
//                 alignSelf: "center",
//                 paddingHorizontal: 30,
//                 marginBottom: 30,
//               }}
//             >
//               <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
//                 Return to Home
//               </Text>
//             </TouchableOpacity>

//             {/* Share */}
//             <View
//               style={{ borderTopWidth: 1, borderColor: "#eee", paddingTop: 20 }}
//             >
//               <Text
//                 style={{
//                   fontSize: 18,
//                   fontWeight: "600",
//                   color: "#222",
//                   textAlign: "center",
//                   marginBottom: 15,
//                 }}
//               >
//                 Share your donation
//               </Text>

//               <View
//                 style={{
//                   flexDirection: "row",
//                   justifyContent: "center",
//                   gap: 15,
//                 }}
//               >
//                 <TouchableOpacity
//                   onPress={shareOnFacebook}
//                   style={{
//                     width: 45,
//                     height: 45,
//                     borderRadius: 50,
//                     backgroundColor: "#3B5998",
//                     alignItems: "center",
//                     justifyContent: "center",
//                   }}
//                 >
//                   <Text style={{ color: "white", fontSize: 20 }}>f</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   onPress={shareOnTwitter}
//                   style={{
//                     width: 45,
//                     height: 45,
//                     borderRadius: 50,
//                     backgroundColor: "black",
//                     alignItems: "center",
//                     justifyContent: "center",
//                   }}
//                 >
//                   <Text style={{ color: "white", fontSize: 20 }}>t</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   onPress={shareOnWhatsapp}
//                   style={{
//                     width: 45,
//                     height: 45,
//                     borderRadius: 50,
//                     backgroundColor: "#53CC60",
//                     alignItems: "center",
//                     justifyContent: "center",
//                   }}
//                 >
//                   <Text style={{ color: "white", fontSize: 20 }}>W</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   onPress={shareOnLinkedIn}
//                   style={{
//                     width: 45,
//                     height: 45,
//                     borderRadius: 50,
//                     backgroundColor: "#1275B1",
//                     alignItems: "center",
//                     justifyContent: "center",
//                   }}
//                 >
//                   <Text style={{ color: "white", fontSize: 20 }}>in</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </>
//         )}
//       </View>
//     </ScrollView>
//   );
// }

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Image as ExpoImage } from "expo-image";

export default function ThankYouScreen() {
  return (
    <View style={styles.container}>
      {/* ===== TOP IMAGE SECTION ===== */}

      <View style={styles.header}>
        {/* Solid background */}
        <View style={styles.headerBgColor} />

        {/* Image */}
        <ExpoImage
          source={require("../assets/header-image.png")}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
        />

        {/* Gradient */}
        <LinearGradient
          colors={["rgba(36,107,225,0.55)", "rgba(36,107,225,0.0)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />

        {/* TEXT — MUST BE LAST */}
        <View style={styles.textOverlay}>
          <Text style={styles.headerTitle}>Alhamdulillah</Text>
          <Text style={styles.headerSubtitle}>Transaction Successful!</Text>
        </View>
      </View>
      {/* ===== CONTENT ===== */}
      <View style={styles.content}>
        <Text style={styles.title}>
          Thanks for your donation! It means a lot.
        </Text>

        <Text style={styles.description}>
          Our generosity is now being put into action. Thank you for making a
          difference.
        </Text>

        {/* ===== PRICE DETAILS ===== */}
        <View style={styles.priceBox}>
          <PriceRow label="Subtotal" value="$1,340.00" />
          <PriceRow label="Admin Fee" value="$40.20" />
          <PriceRow label="Total" value="$1,380.20" bold />
        </View>

        {/* ===== SHARE ===== */}
        <View style={styles.shareSection}>
          <Text style={styles.shareTitle}>Share</Text>

          <View style={styles.shareRow}>
            <ShareItem icon="logo-instagram" label="Instagram" />
            <ShareItem icon="logo-whatsapp" label="WhatsApp" />
            <ShareItem icon="logo-facebook" label="Facebook" />
            <ShareItem icon="link-outline" label="Link" />
            <ShareItem icon="ellipsis-horizontal" label="More" />
          </View>
        </View>
      </View>

      {/* ===== BOTTOM BUTTON ===== */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/")}
        >
          <Text style={styles.buttonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ===== PRICE ROW ===== */
const PriceRow = ({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) => (
  <View style={styles.priceRow}>
    <Text style={[styles.priceText, bold && styles.bold]}>{label}</Text>
    <Text style={[styles.priceText, bold && styles.bold]}>{value}</Text>
  </View>
);

const ShareItem = ({ icon, label }: { icon: any; label: string }) => (
  <TouchableOpacity style={styles.shareItem}>
    <View style={styles.shareIconCircle}>
      <Ionicons name={icon} size={24} color="#4C63F0" />
    </View>
    <Text style={styles.shareLabel}>{label}</Text>
  </TouchableOpacity>
);

/* ===== STYLES ===== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },

  /* HEADER */
  header: {
    height: 220,
    justifyContent: "flex-end",
    position: "relative",
  },
  overlay: {
    backgroundColor: "rgba(38,75,139,0.65)",
    padding: 20,
  },
  headerTitle: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "700",
  },
  headerSubtitle: {
    color: "#E8EEFF",
    fontSize: 14,
    marginTop: 4,
  },
  textOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },

  /* CONTENT */
  content: {
    padding: 20,
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  headerBgColor: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "#246BE1", // your requested color
  },

  leftFade: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%", // only fade left half
    height: "100%",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },

  /* PRICE */
  priceBox: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#EEE",
    paddingVertical: 12,
    marginBottom: 20,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  priceText: {
    fontSize: 14,
    color: "#333",
  },
  bold: {
    fontWeight: "700",
  },

  /* SHARE */
  shareSection: {
    marginTop: 4,
  },

  shareTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    color: "#0A0F2C",
  },

  shareRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  shareItem: {
    alignItems: "center",
    width: 64,
  },

  shareIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F1F3FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },

  shareLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#0A0F2C",
    textAlign: "center",
  },

  /* FOOTER */
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#EEE",
  },
  button: {
    backgroundColor: "#5B66F0",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "600",
  },
});
