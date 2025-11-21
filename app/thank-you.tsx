import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Share,
  Linking,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

// Dummy API (replace with your real implementation)
interface UpdatePaypalTokenParams {
  orderId?: string;
  checkoutType?: string;
}
const updatePaypalToken = async ({
  orderId,
  checkoutType,
}: UpdatePaypalTokenParams): Promise<{ success: boolean; message: string }> => {
  // orderId and checkoutType are currently unused
  await new Promise((res) => setTimeout(res, 600));
  return { success: true, message: "Payment completed successfully" };
};

const getBasket = async (): Promise<any[]> => {
  return [];
};

export default function ThankYouScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const {
    token = "",
    result = "",
    checkoutType = "",
    payment_intent = "",
    redirect_status = "",
  } = params;

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(null);

  const APP_URL = "https://yourwebsite.com";
  const shareMessage =
    'I just donated to charity! \n\n"Spend (on charity), o son of Adam, and I shall spend on you"';

  // ----------------------------------
  // HANDLE PAYPAL + STRIPE CONFIRMATION
  // ----------------------------------

  useEffect(() => {
    if (token && result === "true") {
      handlePaypal();
    }
  }, [token, result]);

  useEffect(() => {
    if (payment_intent && redirect_status === "succeeded") {
      handleStripe();
    }
  }, [payment_intent, redirect_status]);

  const handlePaypal = async () => {
    setLoading(true);
    const res = await updatePaypalToken({
      orderId: Array.isArray(token) ? token[0] : token,
      checkoutType: Array.isArray(checkoutType)
        ? checkoutType[0]
        : checkoutType,
    });

    if (res.success) {
      await getBasket();
    }
    setLoading(false);
  };

  const handleStripe = async () => {
    setLoading(true);
    await getBasket();
    setLoading(false);
  };

  // ----------------------------------
  // SHARE BUTTON HANDLERS
  // ----------------------------------

  const shareOnWhatsapp = () => {
    const text = `${shareMessage}\n\n${APP_URL}`;
    Linking.openURL(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`
    );
  };

  const shareOnFacebook = () => {
    Linking.openURL(
      `https://www.facebook.com/sharer.php?u=${encodeURIComponent(APP_URL)}`
    );
  };

  const shareOnTwitter = () => {
    Linking.openURL(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        shareMessage
      )}&url=${encodeURIComponent(APP_URL)}`
    );
  };

  const shareOnLinkedIn = () => {
    Linking.openURL(
      `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
        APP_URL
      )}&summary=${encodeURIComponent(shareMessage)}`
    );
  };

  // ----------------------------------
  // UI
  // ----------------------------------

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        backgroundColor: "#F5F8FF",
        padding: 20,
      }}
    >
      <View
        style={{
          backgroundColor: "white",
          borderRadius: 20,
          padding: 20,
          marginTop: 30,
          elevation: 3,
        }}
      >
        {/* Loader */}
        {loading ? (
          <View style={{ padding: 50, alignItems: "center" }}>
            <ActivityIndicator size="large" color="#4A6CF7" />
          </View>
        ) : (
          <>
            {/* Header */}
            <View style={{ alignItems: "center", marginBottom: 20 }}>
              <Image
                source={require("@/assets/thank-you.png")}
                style={{ width: 150, height: 150 }}
                resizeMode="contain"
              />

              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "700",
                  color: "#265DAB",
                  marginTop: 10,
                }}
              >
                Thank You!
              </Text>

              <View
                style={{
                  width: 60,
                  height: 5,
                  backgroundColor: "#AFC7F9",
                  borderRadius: 20,
                  marginVertical: 10,
                }}
              />

              <Text
                style={{
                  fontSize: 18,
                  color: "#333",
                  textAlign: "center",
                  marginTop: 10,
                }}
              >
                Your donation has been successfully received.
              </Text>
            </View>

            {/* Email message */}
            <View style={{ alignItems: "center", marginVertical: 20 }}>
              <Text style={{ color: "#444", fontSize: 16 }}>
                A receipt has been sent to your email
              </Text>

              {email && (
                <TouchableOpacity
                  onPress={() => Linking.openURL("mailto:" + email)}
                >
                  <Text
                    style={{
                      marginTop: 6,
                      color: "#265DAB",
                      fontWeight: "600",
                    }}
                  >
                    {email}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Home Button */}
            <TouchableOpacity
              onPress={() => router.replace("/")}
              style={{
                backgroundColor: "#265DAB",
                paddingVertical: 14,
                borderRadius: 12,
                alignSelf: "center",
                paddingHorizontal: 30,
                marginBottom: 30,
              }}
            >
              <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
                Return to Home
              </Text>
            </TouchableOpacity>

            {/* Share */}
            <View
              style={{ borderTopWidth: 1, borderColor: "#eee", paddingTop: 20 }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: "#222",
                  textAlign: "center",
                  marginBottom: 15,
                }}
              >
                Share your donation
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 15,
                }}
              >
                <TouchableOpacity
                  onPress={shareOnFacebook}
                  style={{
                    width: 45,
                    height: 45,
                    borderRadius: 50,
                    backgroundColor: "#3B5998",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: "white", fontSize: 20 }}>f</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={shareOnTwitter}
                  style={{
                    width: 45,
                    height: 45,
                    borderRadius: 50,
                    backgroundColor: "black",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: "white", fontSize: 20 }}>t</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={shareOnWhatsapp}
                  style={{
                    width: 45,
                    height: 45,
                    borderRadius: 50,
                    backgroundColor: "#53CC60",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: "white", fontSize: 20 }}>W</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={shareOnLinkedIn}
                  style={{
                    width: 45,
                    height: 45,
                    borderRadius: 50,
                    backgroundColor: "#1275B1",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: "white", fontSize: 20 }}>in</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}
