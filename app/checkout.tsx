import React, { useEffect, useMemo, useState, useCallback } from "react";
import { View, StyleSheet, ScrollView, Alert, Text, Platform, Linking } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
import { useRouter } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import Constants from "expo-constants";
import {
  useClearBasketMutation,
  useGetBasketQuery,
} from "@/store/reduxSlice/api/basketApi";
import { handlePaypalCheckout } from "@/store/reduxSlice/basketSlice";
import api from "@/utils/api";

import CheckoutHeader from "@/components/Checkout/CheckoutHeader";
import StepIndicator from "@/components/Checkout/StepIndicator";
import DetailsStep from "@/components/Checkout/DetailsStep";
import ConfirmStep from "@/components/Checkout/ConfirmStep";
import PaymentStep, { PaymentState } from "@/components/Checkout/PaymentStep";
import BottomBar from "@/components/Checkout/BottomBar";
import ProcessingPaymentModal from "@/components/ui/Modals/ProcessingPaymentModal";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/* ---------- TYPES ---------- */

type CheckoutSummary = {
  items: any[];
  subtotal: number;
  adminFee: number;
  total: number;
};

/* ---------- COMPONENT ---------- */

export default function CheckoutScreen() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isDetailsValid, setIsDetailsValid] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [loadingIntent, setLoadingIntent] = useState(false);
  const [checkoutSummary, setCheckoutSummary] =
    useState<CheckoutSummary | null>(null);
  const [cardComplete, setCardComplete] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [paymentState, setPaymentState] = useState<PaymentState>({
    paymentType: "card",
    cardDetails: null,
    cardComplete: false,
  });

  const [detailsForm, setDetailsForm] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  const insets = useSafeAreaInsets();
  const stripe = useStripe();
  const router = useRouter();
  const dispatch = useDispatch();
  
  // Apple Pay is available on iOS devices
  // The SDK will handle actual device support when presenting Apple Pay
  const isApplePaySupported = Platform.OS === "ios";

  // Get Stripe publishable key
  const stripePublishableKey =
    process.env.EXPO_PUBLIC_STRIPE_KEY ||
    Constants.expoConfig?.extra?.EXPO_PUBLIC_STRIPE_KEY ||
    null;

  if (!stripePublishableKey) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: "center", alignItems: "center", padding: 20 }]}>
        <Text style={{ color: "red", fontSize: 16, textAlign: "center" }}>
          Stripe configuration error. Please check environment variables.
        </Text>
      </View>
    );
  }

  const user = useSelector((s: any) => s.authentication.user);
  const isAuthenticated = !!user;

  const { data: basketData } = useGetBasketQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [clearBasket] = useClearBasketMutation();
  const isStep1Disabled = step === 1 && !isDetailsValid;

  const isCheckoutDisabled =
    (step === 3 && 
      paymentState.paymentType === "card" && 
      (!clientSecret || loadingIntent || !paymentState.cardComplete)) || 
    (step === 3 && 
      paymentState.paymentType === "paypal" && 
      loadingPayment) ||
    (step === 3 && 
      paymentState.paymentType === "applepay" && 
      loadingPayment) ||
    loadingPayment;

  /* ---------- BASKET ITEMS (STABLE) ---------- */

  const basketItems = useMemo<any[]>(() => {
    if (isAuthenticated) {
      return basketData?.payload ?? [];
    }
    return [];
  }, [isAuthenticated, basketData]);

  /* ---------- LOAD GUEST BASKET ONCE ---------- */

  useEffect(() => {
    if (isAuthenticated) return;

    AsyncStorage.getItem("guestBasket").then((data: string | null) => {
      const items = data ? JSON.parse(data) : [];

      if (!items.length) {
        setCheckoutSummary(null);
        return;
      }

      const totals = computeTotals(items);
      setCheckoutSummary({ items, ...totals });
    });
  }, [isAuthenticated]);

  /* ---------- TOTAL CALCULATION ---------- */

  const computeTotals = useCallback(
    (items: any[]) => {
      const processingFee = 0.03;

      const subtotal = items.reduce((sum, item) => {
        if (isAuthenticated) {
          return sum + Number(item.total ?? item.amount ?? 0);
        }
        return sum + Number(item.amount ?? 0) * Number(item.quantity ?? 1);
      }, 0);

      const adminFee = subtotal * processingFee;
      const total = subtotal + adminFee;

      return { subtotal, adminFee, total };
    },
    [isAuthenticated]
  );

  /* ---------- BUILD SUMMARY (LOGGED-IN USERS ONLY) ---------- */

  useEffect(() => {
    if (!isAuthenticated) return;

    if (!basketItems.length) {
      setCheckoutSummary(null);
      return;
    }

    const totals = computeTotals(basketItems);

    setCheckoutSummary((prev) => {
      if (
        prev &&
        prev.subtotal === totals.subtotal &&
        prev.total === totals.total
      ) {
        return prev; // 🔒 prevents infinite loop
      }

      return {
        items: basketItems,
        ...totals,
      };
    });
  }, [basketItems, computeTotals, isAuthenticated]);

  /* ---------- CHECK EMPTY BASKET ---------- */

  useEffect(() => {
    // Skip check if payment was just completed (basket will be empty intentionally)
    if (paymentCompleted) return;

    const checkBasket = async () => {
      let items: any[] = [];
      if (isAuthenticated) {
        items = basketItems;
      } else {
        const guestBasketData = await AsyncStorage.getItem("guestBasket");
        items = guestBasketData ? JSON.parse(guestBasketData) : [];
      }

      // Only navigate back if basket is empty, but don't show alert
      if (items.length === 0) {
        router.back();
      }
    };

    checkBasket();
  }, [isAuthenticated, basketItems, paymentCompleted]);

  /* ---------- STRIPE INTENT ---------- */

  const ensureClientSecret = useCallback(async (): Promise<boolean> => {
    if (clientSecret || loadingIntent || !checkoutSummary) return true;

    try {
      setLoadingIntent(true);

      console.log("=== ensureClientSecret: RETRIEVING DETAILS ===");
      const stored = await AsyncStorage.getItem("checkoutDetails");
      console.log("Stored value exists:", !!stored);
      
      if (!stored) {
        console.error("ERROR: Missing checkoutDetails in AsyncStorage!");
        throw new Error("Missing checkoutDetails");
      }

      const checkoutDetails = JSON.parse(stored);
      console.log("Parsed checkoutDetails in ensureClientSecret:", checkoutDetails);
      
      let secret: string | null = null;

      if (isAuthenticated) {
        // Parse full name to firstName and lastName
        const parts = checkoutDetails.firstName?.trim().split(/\s+/) || [];
        const firstName = parts[0] || "";
        const lastName = parts.slice(1).join(" ") || firstName;

        await api.patch("/profile", {
          firstName,
          lastName,
          email: checkoutDetails.email,
          phone: checkoutDetails.phone,
        });

        const res = await api.post("/basket/checkout", {
          paymentGateway: "stripe",
          isAnonymous: false,
          isMobile: true,
        });
        secret = res.data?.payload?.clientSecret;
      } else {
        // For guest users, need to send basket items with all required fields
        const mappedBasketItems = checkoutSummary.items.map((item) => {
          const mappedItem: any = {
            campaignId: item.campaignId,
            amount: parseFloat(item.amount?.toString() || "0"),
            quantity: parseInt(item.quantity?.toString() || "1"),
            orphanId: item.orphanId || null,
            isRecurring: item.isRecurring || false,
            periodDays: item.periodDays || null,
          };
          
          // Add optional fields if they exist
          if (item.donationItem) mappedItem.donationItem = item.donationItem;
          if (item.isWaleemah) mappedItem.isWaleemah = item.isWaleemah;
          if (item.behalfOf) mappedItem.behalfOf = item.behalfOf;
          if (item.notes) mappedItem.notes = item.notes;
          if (item.name) mappedItem.name = item.name;
          
          return mappedItem;
        });

        const res = await api.post("/basket/checkout-unknown", {
          ...checkoutDetails,
          paymentGateway: "stripe",
          basketItems: mappedBasketItems,
          isMobile: true,
        });
        secret = res.data?.payload?.clientSecret;
      }

      if (!secret) throw new Error("No client secret");

      setClientSecret(secret);
      return true;
    } catch (e) {
      console.log("Failed to prepare payment", e);
      Alert.alert(
        "Payment Error",
        "We couldn't prepare the payment. Please try again."
      );
      return false;
    } finally {
      setLoadingIntent(false);
    }
  }, [clientSecret, loadingIntent, checkoutSummary, isAuthenticated]);

  /* ---------- PREFETCH ON STEP 3 ---------- */

  useEffect(() => {
    if (step === 3 && paymentState.paymentType === "card" && !clientSecret && !loadingIntent) {
      ensureClientSecret();
    }
  }, [step, paymentState.paymentType, ensureClientSecret, clientSecret, loadingIntent]);

  /* ---------- SYNC CARD COMPLETE STATE ---------- */

  useEffect(() => {
    setCardComplete(paymentState.cardComplete);
  }, [paymentState.cardComplete]);

  /* ---------- NAVIGATION ---------- */

  const handleNext = async () => {
    if (step === 1) {
      if (!isDetailsValid) {
        Alert.alert(
          "Missing information",
          "Please fill in your name, email, and phone number to continue."
        );
        return;
      }

      // Update summary for step 2
      let items: any[] = [];
      if (isAuthenticated) {
        items = basketItems;
      } else {
        const guestBasketData = await AsyncStorage.getItem("guestBasket");
        items = guestBasketData ? JSON.parse(guestBasketData) : [];
      }

      const totals = computeTotals(items);
      setCheckoutSummary({ items, ...totals });

      setStep(2);
      return;
    }

    if (step === 2) {
      // Prepare payment intent (safe to call multiple times)
      const ready = await ensureClientSecret();
      if (!ready) return;

      setStep(3);
      return;
    }

    if (step === 3) {
      // Handle Apple Pay payment
      // Note: Apple Pay API methods may vary by Stripe React Native version
      // For now, we'll show the option but handle it as card payment
      // TODO: Implement proper Apple Pay when SDK version supports it
      if (paymentState.paymentType === "applepay" && Platform.OS === "ios") {
        setLoadingPayment(false);
        Alert.alert(
          "Apple Pay",
          "Apple Pay is not yet fully implemented. Please use a credit card or PayPal to complete your payment.",
          [
            {
              text: "OK",
              onPress: () => {
                setPaymentState((s) => ({ ...s, paymentType: "card" }));
              },
            },
          ]
        );
        return;
      }

      // Handle PayPal payment
      if (paymentState.paymentType === "paypal") {
        setLoadingPayment(true);
        try {
          console.log("=== PAYPAL CHECKOUT (STEP 3) ===");
          
          // Get checkout details
          const stored = await AsyncStorage.getItem("checkoutDetails");
          const checkoutDetails = stored ? JSON.parse(stored) : {};

          // Check for orphan items - PayPal is not available for orphan sponsorships
          const items = isAuthenticated ? basketItems : checkoutSummary?.items || [];
          const hasOrphanItem = items.some((item: any) => item.orphanId != null);
          
          if (hasOrphanItem) {
            setLoadingPayment(false);
            Alert.alert(
              "PayPal Not Available",
              "PayPal is not available for orphan sponsorships. Please use a credit card to complete your donation."
            );
            setPaymentState((s) => ({ ...s, paymentType: "card" }));
            return;
          }

          let response;
          if (isAuthenticated) {
            // Authenticated user PayPal checkout
            const result = await dispatch(
              handlePaypalCheckout({
                isAnonymous: false,
              }) as any
            );

            if (result.error) {
              setLoadingPayment(false);
              Alert.alert(
                "PayPal Checkout Failed",
                result.payload?.message || "Something went wrong. Please try again."
              );
              return;
            }

            response = result.payload;
          } else {
            // Guest user PayPal checkout
            const mappedBasketItems = checkoutSummary?.items.map((item) => {
              const mappedItem: any = {
                campaignId: item.campaignId,
                amount: parseFloat(item.amount?.toString() || "0"),
                quantity: parseInt(item.quantity?.toString() || "1"),
                orphanId: item.orphanId || null,
                isRecurring: item.isRecurring || false,
                periodDays: item.periodDays || null,
              };
              
              if (item.donationItem) mappedItem.donationItem = item.donationItem;
              if (item.isWaleemah) mappedItem.isWaleemah = item.isWaleemah;
              if (item.behalfOf) mappedItem.behalfOf = item.behalfOf;
              if (item.notes) mappedItem.notes = item.notes;
              if (item.name) mappedItem.name = item.name;
              
              return mappedItem;
            });

            const res = await api.post("/basket/checkout-unknown", {
              ...checkoutDetails,
              paymentGateway: "paypal",
              basketItems: mappedBasketItems,
              isMobile: true,
            });
            response = res.data;
          }

          if (response?.success && !response?.payload?.error && response?.payload?.approvalUrl) {
            console.log("✅ PayPal checkout successful, opening approval URL");
            
            // Store PayPal order ID and checkout summary for later verification
            if (response.payload.orderId) {
              await AsyncStorage.setItem("paypalOrderId", response.payload.orderId);
            }
            
            // Store checkout summary for thank-you page
            if (checkoutSummary) {
              await AsyncStorage.setItem(
                "checkoutSummary",
                JSON.stringify({
                  ...checkoutSummary,
                  isAuthenticated,
                  createdAt: Date.now(),
                  paypalOrderId: response.payload.orderId,
                })
              );
            }
            
            setLoadingPayment(false);
            
            // Open PayPal approval URL in Expo Web Browser
            try {
              // Dynamically import WebBrowser to handle cases where it might not be available
              let WebBrowser: any;
              try {
                WebBrowser = require("expo-web-browser");
              } catch (importError) {
                console.log("WebBrowser import failed, using Linking fallback:", importError);
                // Fallback to Linking if WebBrowser is not available
                const canOpen = await Linking.canOpenURL(response.payload.approvalUrl);
                if (canOpen) {
                  await Linking.openURL(response.payload.approvalUrl);
                  Alert.alert(
                    "Complete Payment",
                    "You will be redirected to PayPal to complete your payment. Please return to the app after completing the payment.",
                    [
                      {
                        text: "OK",
                        onPress: () => {
                          // Payment status will be updated via webhook
                        },
                      },
                    ]
                  );
                } else {
                  Alert.alert("Error", "Could not open PayPal payment page");
                }
                return;
              }
              
              // Check if WebBrowser is available and has the method
              if (!WebBrowser || !WebBrowser.openBrowserAsync) {
                // Fallback to Linking
                const canOpen = await Linking.canOpenURL(response.payload.approvalUrl);
                if (canOpen) {
                  await Linking.openURL(response.payload.approvalUrl);
                  Alert.alert(
                    "Complete Payment",
                    "You will be redirected to PayPal to complete your payment. Please return to the app after completing the payment.",
                    [
                      {
                        text: "OK",
                        onPress: () => {
                          // Payment status will be updated via webhook
                        },
                      },
                    ]
                  );
                } else {
                  Alert.alert("Error", "Could not open PayPal payment page");
                }
                return;
              }
              
              const result = await WebBrowser.openBrowserAsync(response.payload.approvalUrl, {
                showTitle: false,
                enableBarCollapsing: false,
                presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
              });
              
              console.log("WebBrowser result:", result);
              
              // Check if user cancelled the payment
              if (result.type === 'cancel') {
                // User cancelled or closed the browser without completing payment
                Alert.alert(
                  "Payment Cancelled",
                  "You cancelled the PayPal payment. You can try again when you're ready."
                );
                return;
              }
              
              // If browser was dismissed (user closed it after completing payment)
              // PayPal redirects to the return URL on the web frontend, and when user closes the browser,
              // we assume payment was completed (webhook will process it in the background)
              if (result.type === 'dismiss') {
                // Wait a moment for webhook to process, then navigate to thank-you page
                setTimeout(async () => {
                  // Mark payment as completed to prevent empty cart alert
                  setPaymentCompleted(true);
                  
                  // Clear basket after saving summary
                  try {
                    if (isAuthenticated) {
                      await clearBasket();
                    } else {
                      await AsyncStorage.removeItem("guestBasket");
                    }
                  } catch (basketError) {
                    console.log("Warning: Error clearing basket:", basketError);
                  }
                  
                  // Navigate to thank you page
                  router.replace("/thank-you");
                }, 1500);
              }
            } catch (error: any) {
              setLoadingPayment(false);
              console.log("❌ WebBrowser error:", error);
              Alert.alert(
                "Error",
                "Could not open PayPal payment page. Please try again."
              );
            }
          } else {
            setLoadingPayment(false);
            Alert.alert(
              "PayPal Checkout Failed",
              response?.payload?.error || response?.message || "Something went wrong. Please try again."
            );
          }
        } catch (err: any) {
          setLoadingPayment(false);
          console.log("❌ PayPal checkout exception:", err);
          Alert.alert(
            "PayPal Checkout Failed",
            err?.response?.data?.message || err?.message || "An unexpected error occurred"
          );
        }
        return;
      }

      // Handle Stripe card payment
      if (!clientSecret || !stripe) {
        Alert.alert("Error", "Payment not ready");
        return;
      }

      if (!paymentState.cardComplete) {
        Alert.alert("Error", "Please enter complete card information");
        return;
      }

      setLoadingPayment(true);
      await new Promise((r) => requestAnimationFrame(r));

      try {
        console.log("=== PAYMENT CONFIRMATION (STEP 3) ===");
        console.log("Platform:", Platform.OS);
        console.log("Client secret exists:", !!clientSecret);
        console.log("Card complete:", paymentState.cardComplete);

        // Get checkout details for billing
        const stored = await AsyncStorage.getItem("checkoutDetails");
        const checkoutDetails = stored ? JSON.parse(stored) : {};
        const parts = checkoutDetails.firstName?.trim().split(/\s+/) || [];
        const firstName = parts[0] || "";
        const lastName = parts.slice(1).join(" ") || firstName;

        // Create payment method first
        const { paymentMethod, error: pmError } = await stripe.createPaymentMethod({
          paymentMethodType: "Card",
          paymentMethodData: {
            billingDetails: {
              name: `${firstName} ${lastName}`,
              email: checkoutDetails.email || "",
              phone: checkoutDetails.phone || "",
            },
          },
        });

        if (pmError) {
          console.log("❌ Failed to create payment method:", pmError);
          setLoadingPayment(false);
          Alert.alert("Payment failed", pmError.message);
          return;
        }

        if (!paymentMethod) {
          console.log("❌ Payment method is null");
          setLoadingPayment(false);
          Alert.alert("Payment failed", "Failed to create payment method");
          return;
        }

        console.log("✅ Payment method created:", paymentMethod.id);

        // Confirm payment
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const result = await stripe.confirmPayment(clientSecret, {
          paymentMethodType: "Card",
          paymentMethodData: {
            billingDetails: {
              name: `${firstName} ${lastName}`,
              email: checkoutDetails.email || "",
              phone: checkoutDetails.phone || "",
            },
          },
        });

        setLoadingPayment(false);

        if (result.error) {
          console.log("❌ Payment error details:", result.error);
          Alert.alert("Payment failed", result.error.message);
          return;
        }

        const { paymentIntent } = result;

        console.log("Payment result:", {
          paymentIntent: !!paymentIntent,
          status: paymentIntent?.status,
          checkoutSummary: !!checkoutSummary,
        });

        // Check if payment was successful
        // If paymentIntent exists and there's no error, payment was successful
        if (paymentIntent && checkoutSummary) {
          console.log("✅ Payment successful!");
          console.log("Payment Intent ID:", paymentIntent.id);
          console.log("Payment Intent Status:", paymentIntent.status);
          
          // Save checkout summary before navigation
          await AsyncStorage.setItem(
            "checkoutSummary",
            JSON.stringify({
              ...checkoutSummary,
              isAuthenticated,
              createdAt: Date.now(),
              paymentIntentId: paymentIntent.id,
            })
          );

          // Mark payment as completed before clearing basket to prevent empty cart alert
          setPaymentCompleted(true);

          // Clear basket after saving summary
          try {
            if (isAuthenticated) {
              await clearBasket();
            } else {
              await AsyncStorage.removeItem("guestBasket");
            }
          } catch (basketError) {
            console.log("Warning: Error clearing basket:", basketError);
            // Continue with navigation even if basket clearing fails
          }

          // Navigate to thank you page - use replace to prevent going back
          console.log("Navigating to thank-you page...");
          setTimeout(() => {
            router.replace("/thank-you");
          }, 100);
        } else {
          console.log("❌ Payment intent or checkout summary missing");
          console.log("PaymentIntent:", paymentIntent);
          console.log("CheckoutSummary:", checkoutSummary);
          Alert.alert(
            "Payment Error",
            "There was an issue processing your payment. Please contact support if the payment was deducted."
          );
        }
        console.log("=== END PAYMENT CONFIRMATION ===");
      } catch (err: any) {
        setLoadingPayment(false);
        console.log("❌ Payment exception caught:", err);
        Alert.alert("Payment failed", err?.message || "An unexpected error occurred");
      }
    }
  };

  /* ---------- UI ---------- */

  return (
    <StripeProvider publishableKey={stripePublishableKey}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ProcessingPaymentModal visible={loadingPayment} />
        <CheckoutHeader step={step} setStep={setStep} />

        <StepIndicator
          step={step}
          onStepPress={(s) => setStep(s as 1 | 2 | 3)}
        />

        <ScrollView contentContainerStyle={styles.content}>
          {step === 1 && (
            <DetailsStep
              values={detailsForm}
              onChange={setDetailsForm}
              onValidChange={setIsDetailsValid}
            />
          )}

          {step === 2 && checkoutSummary && (
            <ConfirmStep summary={checkoutSummary} />
          )}

          {step === 3 && (
            <PaymentStep
              paymentState={paymentState}
              setPaymentState={setPaymentState}
              isApplePaySupported={isApplePaySupported}
            />
          )}
        </ScrollView>

        <BottomBar
          step={step}
          loading={loadingPayment || loadingIntent}
          onNext={handleNext}
          disabled={isCheckoutDisabled || isStep1Disabled}
          total={checkoutSummary?.total ?? 0}
          subtotal={checkoutSummary?.subtotal ?? 0}
          adminFee={checkoutSummary?.adminFee ?? 0}
        />
      </View>
    </StripeProvider>
  );
}

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 16, paddingBottom: 16 },
  paymentContainer: {
    width: "100%",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#010D26",
    marginBottom: 8,
    fontFamily: "AlbertSans_700Bold",
  },
  helperText: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 16,
    fontFamily: "AlbertSans_400Regular",
  },
  cardContainer: {
    marginBottom: 24,
  },
  cardField: {
    width: "100%",
    height: 50,
    marginVertical: 8,
  },
  loadingContainer: {
    padding: 12,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    color: "#666666",
    fontFamily: "AlbertSans_400Regular",
  },
});
