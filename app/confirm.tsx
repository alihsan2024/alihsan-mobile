import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSelector } from "react-redux";
import { useClearBasketMutation } from "@/store/reduxSlice/api/basketApi";
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// Remove context usage, use Redux selectors
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  StripeProvider,
  CardField,
  useStripe,
  CardFieldInput,
} from "@stripe/stripe-react-native";
import axios from "axios";

// Dummy icons
const UserIcon = () => <Text>👤</Text>;
const CreditCardIcon = () => <Text>💳</Text>;
const ShieldIcon = () => <Text>🛡️</Text>;
const MastercardIcon = () => <Text>💳</Text>;
const VisacardIcon = () => <Text>💳</Text>;
const PayPalIcon = () => <Text>💰</Text>;
const Edit3Icon = () => <Text>✏️</Text>;

const handlePaypalCheckout = async (data: any) => {
  console.log("Dummy PayPal checkout", data);
  return { success: true, payload: { approvalUrl: "https://paypal.com" } };
};

const ConfirmScreen = () => {
  const user = useSelector((state: any) => state.authentication.user);
  const isAuthenticated = !!user;
  const basketItems = useSelector((state: any) => {
    // Use basket from Redux, fallback to AsyncStorage for guests
    return state.basketItem?.basketItems ?? [];
  });
  const [clearBasket] = useClearBasketMutation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  // Removed params, use items from context
  // items is now basketItems from Redux
  const stripe = useStripe();

  const [paymentType, setPaymentType] = useState<"card" | "paypal">("card");
  const [bankDetails, setBankDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stateLoading, setStateLoading] = useState(false);
  const [recurringFound, setRecurringFound] = useState(false);
  const [checkoutDetails, setCheckoutDetails] = useState<any>(null);
  const [isAnonymous, setIsAnonymous] = useState(false); // Local state for anonymous
  const [cardDetails, setCardDetails] = useState<CardFieldInput.Details | null>(
    null
  );
  const [loadingIntent, setLoadingIntent] = useState(true);

  // Load checkoutDetails from AsyncStorage (React Native)
  useEffect(() => {
    (async () => {
      setLoadingIntent(true);
      try {
        const stored = await import(
          "@react-native-async-storage/async-storage"
        ).then((m) => m.default.getItem("checkoutDetails"));
        const parsed = stored ? JSON.parse(stored) : null;
        setCheckoutDetails(parsed);
        // Role logic: if not logged in, admin, or superadmin, use stored clientSecret
        const ROLES = { ADMIN: "ADMIN", SUPERADMIN: "SUPERADMIN" };
        if (
          !user?.email ||
          user?.role === ROLES.ADMIN ||
          user?.role === ROLES.SUPERADMIN
        ) {
          setClientSecret(parsed?.clientSecret || null);
        } else {
          // Normal user: fetch new clientSecret from /basket/checkout
          setStateLoading(true);
          try {
            const response = await import("../utils/api").then((m) =>
              m.default.post("/basket/checkout", {
                ...parsed,
                paymentGateway: "stripe",
                isAnonymous: false,
              })
            );
            const payload = response.data?.payload;
            setClientSecret(payload?.clientSecret || null);
          } catch (e) {
            setClientSecret(null);
          }
          setStateLoading(false);
        }
      } catch (e) {
        setCheckoutDetails(null);
        setClientSecret(null);
      }
      setLoadingIntent(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const summaryItems =
    basketItems.length > 0 ? basketItems : checkoutDetails?.basketItems ?? [];
  console.log({ summaryItems });

  const totalPoints = summaryItems.reduce((acc: number, item: any) => {
    if (item.checkoutType === "ADEEQAH_GENERAL_SACRIFICE")
      return acc + Number(item.total ?? 0);
    return (
      acc + Number(item.amount ?? item.total ?? 0) * Number(item.quantity ?? 1)
    );
  }, 0);

  useEffect(() => {
    const recurringItems = basketItems.filter((item: any) => item.isRecurring);
    setRecurringFound(recurringItems.length > 0);
  }, [basketItems]);

  const handleDonationProcess = async () => {
    if (!cardDetails?.complete) {
      import("react-native").then(({ Alert }) =>
        Alert.alert("Error", "Please enter complete card details")
      );
      return;
    }
    if (!clientSecret) {
      import("react-native").then(({ Alert }) =>
        Alert.alert("Error", "No client secret")
      );
      return;
    }
    setStateLoading(true);
    const { paymentIntent, error } = await stripe.confirmPayment(clientSecret, {
      paymentMethodType: "Card",
      paymentMethodData: {
        billingDetails: {
          // Optionally pass billing details
        },
      },
    });
    setStateLoading(false);
    if (error) {
      import("react-native").then(({ Alert }) =>
        Alert.alert("Payment failed", error.message)
      );
    } else if (paymentIntent) {
      // Remove cart items for both user types
      if (isAuthenticated) {
        await clearBasket();
      } else {
        await AsyncStorage.removeItem("guestBasket");
      }
      router.push("/thank-you");
    }
  };

  const handlePaypalSubmit = async () => {
    setIsLoading(true);
    const response = await handlePaypalCheckout({ isAnonymous });
    if (response.success) {
      // Redirect to approval URL
      router.push(response.payload.approvalUrl);
    } else {
      import("react-native").then(({ Alert }) =>
        Alert.alert("Error", "PayPal checkout failed")
      );
    }
    setIsLoading(false);
  };

  return (
    <StripeProvider
      publishableKey={
        process.env.EXPO_PUBLIC_STRIPE_KEY || "YOUR_STRIPE_PUBLISHABLE_KEY"
      }
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScrollView
          style={{
            flex: 1,
            paddingTop: insets.top,
            backgroundColor: "#f5f5f5",
          }}
          contentContainerStyle={{
            paddingBottom: 120, // ensures last button stays above keyboard
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Stepper */}
          <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: "600" }}>
              Step 3: Confirm
            </Text>
          </View>

          <View style={{ padding: 16 }}>
            {/* Personal Info */}
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 12,
                overflow: "hidden",
                marginBottom: 16,
              }}
            >
              <LinearGradient
                colors={["#264B8B", "#5B8FD8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  padding: 12,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={{
                      padding: 6,
                      backgroundColor: "rgba(255,255,255,0.6)",
                      borderRadius: 20,
                    }}
                  >
                    <UserIcon />
                  </View>
                  <Text style={{ fontSize: 18, color: "#fff", marginLeft: 8 }}>
                    Personal Information
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => router.push("/basket/checkout")}
                >
                  <Edit3Icon />
                </TouchableOpacity>
              </LinearGradient>
              <View style={{ padding: 12 }}>
                {checkoutDetails ? (
                  <View>
                    <Text>
                      Full Name: {checkoutDetails.firstName}{" "}
                      {checkoutDetails.lastName}
                    </Text>
                    <Text>Email: {checkoutDetails.email}</Text>
                    <Text>Phone: {checkoutDetails.phone}</Text>
                    <Text>Address: {checkoutDetails.address}</Text>
                    <Text>City: {checkoutDetails.city}</Text>
                    <Text>State: {checkoutDetails.state}</Text>
                    <Text>Zip: {checkoutDetails.zip}</Text>
                    <Text>Country: {checkoutDetails.country}</Text>
                  </View>
                ) : (
                  <Text>Loading personal info...</Text>
                )}
              </View>
            </View>

            {/* Payment */}
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 12,
                overflow: "hidden",
                marginBottom: 16,
              }}
            >
              <LinearGradient
                colors={["#264B8B", "#5B8FD8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  padding: 12,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <CreditCardIcon />
                <Text style={{ fontSize: 18, color: "#fff", marginLeft: 8 }}>
                  Payment Details
                </Text>
              </LinearGradient>

              <View style={{ padding: 12 }}>
                <Text>Select Payment Method</Text>
                <View style={{ flexDirection: "row", marginVertical: 12 }}>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      padding: 12,
                      borderWidth: 1,
                      borderColor: paymentType === "card" ? "#264B8B" : "#ccc",
                      borderRadius: 8,
                      marginRight: 8,
                      alignItems: "center",
                    }}
                    onPress={() => {
                      setPaymentType("card");
                      setBankDetails(false);
                    }}
                  >
                    <Text>Card</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      flex: 1,
                      padding: 12,
                      borderWidth: 1,
                      borderColor:
                        paymentType === "paypal" ? "#264B8B" : "#ccc",
                      borderRadius: 8,
                      alignItems: "center",
                    }}
                    onPress={() => {
                      setPaymentType("paypal");
                      setBankDetails(false);
                    }}
                  >
                    <Text>PayPal</Text>
                  </TouchableOpacity>
                </View>

                {/* Card / PayPal / Bank */}
                {paymentType === "card" && !bankDetails ? (
                  <View>
                    {loadingIntent ? (
                      <View style={{ marginVertical: 20 }}>
                        <ActivityIndicator size="large" color="#264B8B" />
                      </View>
                    ) : clientSecret ? (
                      <>
                        <CardField
                          postalCodeEnabled={true}
                          placeholders={{
                            number: "4242 4242 4242 4242",
                          }}
                          cardStyle={{
                            backgroundColor: "#FFFFFF",
                            textColor: "#000000",
                          }}
                          style={{
                            width: "100%",
                            height: 50,
                            marginVertical: 30,
                          }}
                          onCardChange={(details) => setCardDetails(details)}
                        />
                        <TouchableOpacity
                          onPress={handleDonationProcess}
                          style={{
                            padding: 12,
                            backgroundColor: "#264B8B",
                            borderRadius: 8,
                            alignItems: "center",
                          }}
                        >
                          {stateLoading ? (
                            <ActivityIndicator color="#fff" />
                          ) : (
                            <Text style={{ color: "#fff" }}>Pay Now</Text>
                          )}
                        </TouchableOpacity>
                      </>
                    ) : (
                      <Text
                        style={{
                          color: "#888",
                          textAlign: "center",
                          marginVertical: 20,
                        }}
                      >
                        No payment intent found. Please go back and try checkout
                        again.
                      </Text>
                    )}
                  </View>
                ) : null}

                {paymentType === "paypal" ? (
                  <TouchableOpacity
                    onPress={handlePaypalSubmit}
                    style={{
                      padding: 12,
                      backgroundColor: "#003087",
                      borderRadius: 8,
                      alignItems: "center",
                    }}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={{ color: "#fff" }}>Pay with PayPal</Text>
                    )}
                  </TouchableOpacity>
                ) : null}

                {bankDetails ? (
                  <View>
                    <Text>Bank transfer details go here...</Text>
                  </View>
                ) : null}
              </View>
            </View>

            {/* Order Summary */}
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <LinearGradient
                colors={["#264B8B", "#5B8FD8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  padding: 12,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <ShieldIcon />
                <Text style={{ fontSize: 18, color: "#fff", marginLeft: 8 }}>
                  Order Summary
                </Text>
              </LinearGradient>
              <View style={{ padding: 12 }}>
                {summaryItems.map((item: any) => {
                  // For logged-in users, item.Campaign exists
                  const displayName =
                    item.Campaign?.name || item.Orphan?.name || item.name;
                  const displayAmount = item.total ?? item.amount;
                  return (
                    <View
                      key={
                        item.id
                          ? `${item.id}-${displayName}-${displayAmount}`
                          : `${displayName}-${displayAmount}-${Math.random()}`
                      }
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <Text>{displayName}</Text>
                      <Text>${displayAmount}</Text>
                    </View>
                  );
                })}
                <View
                  style={{
                    borderTopWidth: 1,
                    borderColor: "#ccc",
                    marginTop: 8,
                    paddingTop: 8,
                  }}
                >
                  <Text style={{ fontWeight: "bold" }}>
                    Total: ${totalPoints.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </StripeProvider>
  );
};

// Dummy Stripe Checkout Component
const StripeCheckout = ({ clientSecret, onComplete }: any) => {
  useEffect(() => {
    if (clientSecret) {
      console.log("Stripe client secret ready:", clientSecret);
    }
  }, [clientSecret]);

  return (
    <TouchableOpacity
      style={{
        padding: 12,
        backgroundColor: "#264B8B",
        borderRadius: 8,
        alignItems: "center",
      }}
      onPress={onComplete}
    >
      <Text style={{ color: "#fff" }}>Complete Donation</Text>
    </TouchableOpacity>
  );
};

export default ConfirmScreen;
