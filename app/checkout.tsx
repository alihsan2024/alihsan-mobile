import React, { useEffect, useMemo, useState, useCallback } from "react";
import { View, StyleSheet, ScrollView, Alert, Text, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import Constants from "expo-constants";
import {
  useClearBasketMutation,
  useGetBasketQuery,
} from "@/store/reduxSlice/api/basketApi";
import api from "@/utils/api";

import CheckoutHeader from "@/components/Checkout/CheckoutHeader";
import StepIndicator from "@/components/Checkout/StepIndicator";
import DetailsStep from "@/components/Checkout/DetailsStep";
import PaymentStep from "@/components/Checkout/PaymentStep";
import ConfirmStep from "@/components/Checkout/ConfirmStep";
import BottomBar from "@/components/Checkout/BottomBar";
import ProcessingPaymentModal from "@/components/ui/Modals/ProcessingPaymentModal";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/* ---------- TYPES ---------- */

export type PaymentState = {
  paymentType: "card" | "paypal";
  cardDetails: any;
  cardComplete: boolean;
};

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

  const [detailsForm, setDetailsForm] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  const [paymentState, setPaymentState] = useState<PaymentState>({
    paymentType: "card",
    cardDetails: null,
    cardComplete: false,
  });

  const insets = useSafeAreaInsets();
  const stripe = useStripe();
  const router = useRouter();

  // Log environment variable for debugging
  useEffect(() => {
    const stripeKeyFromEnv = process.env.EXPO_PUBLIC_STRIPE_KEY;
    const stripeKeyFromConstants = Constants.expoConfig?.extra?.EXPO_PUBLIC_STRIPE_KEY;
    const allEnvKeys = Object.keys(process.env).filter(k => k.startsWith("EXPO_PUBLIC_"));
    
    console.log("=== STRIPE ENV CHECK ===");
    console.log("Platform:", Platform.OS);
    console.log("process.env.EXPO_PUBLIC_STRIPE_KEY exists:", !!stripeKeyFromEnv);
    console.log("process.env.EXPO_PUBLIC_STRIPE_KEY value:", stripeKeyFromEnv ? `${stripeKeyFromEnv.substring(0, 20)}...` : "UNDEFINED");
    console.log("Constants.expoConfig?.extra?.EXPO_PUBLIC_STRIPE_KEY:", stripeKeyFromConstants ? `${stripeKeyFromConstants.substring(0, 20)}...` : "UNDEFINED");
    console.log("All EXPO_PUBLIC_* env vars:", allEnvKeys);
    console.log("Constants.expoConfig?.extra keys:", Constants.expoConfig?.extra ? Object.keys(Constants.expoConfig.extra) : "N/A");
    console.log("Stripe object:", stripe ? "Initialized" : "NOT INITIALIZED");
    console.log("=======================");
  }, [stripe]);

  const user = useSelector((s: any) => s.authentication.user);
  const isAuthenticated = !!user;

  const { data: basketData } = useGetBasketQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [clearBasket] = useClearBasketMutation();
  const isStep1Disabled = step === 1 && !isDetailsValid;

  const isCheckoutDisabled =
    (step === 3 && (!clientSecret || loadingIntent)) || loadingPayment;

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
      
      const payload = {
        ...checkoutDetails,
        basketItems: checkoutSummary.items,
      };
      console.log("Payload for API call:", {
        ...payload,
        basketItems: `[${payload.basketItems.length} items]`,
      });

      let secret: string | null = null;

      if (isAuthenticated) {
        await api.patch("/profile", payload);
        const res = await api.post("/basket/checkout", {
          ...payload,
          paymentGateway: "stripe",
          isAnonymous: false,
        });
        secret = res.data?.payload?.clientSecret;
      } else {
        const res = await api.post("/basket/checkout-unknown", {
          ...payload,
          paymentGateway: "stripe",
          isAnonymous: true,
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

  /* ---------- PREFETCH ON STEP 2 ---------- */

  useEffect(() => {
    if (step === 2) {
      // Log details retrieval when entering step 2
      (async () => {
        console.log("=== STEP 2: RETRIEVING DETAILS ===");
        const stored = await AsyncStorage.getItem("checkoutDetails");
        console.log("Raw stored value:", stored);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            console.log("Parsed checkoutDetails:", parsed);
            console.log("Details fields:", {
              firstName: parsed.firstName,
              lastName: parsed.lastName,
              email: parsed.email,
              phone: parsed.phone,
            });
          } catch (e) {
            console.log("Error parsing stored details:", e);
          }
        } else {
          console.log("No checkoutDetails found in AsyncStorage!");
        }
        console.log("Current detailsForm state:", detailsForm);
        console.log("=== END STEP 2 RETRIEVAL ===");
      })();

      ensureClientSecret();
    }
  }, [step, ensureClientSecret, detailsForm]);

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

      setStep(2);
      return;
    }

    if (step === 2) {
      // Block if card details are not complete
      if (paymentState.paymentType === "card" && !paymentState.cardComplete) {
        Alert.alert(
          "Incomplete card details",
          "Please enter complete card information before continuing."
        );
        return;
      }

      // Prepare payment intent (safe to call multiple times)
      const ready = await ensureClientSecret();
      if (!ready) return;

      setStep(3);
      return;
    }

    if (step === 3) {
      if (!clientSecret) {
        Alert.alert("Error", "Payment not ready");
        return;
      }

      // On iOS, we need to create a payment method first or pass payment method data
      if (paymentState.paymentType === "card" && !paymentState.cardComplete) {
        Alert.alert("Error", "Card details are incomplete");
        return;
      }

      setLoadingPayment(true);
      await new Promise((r) => requestAnimationFrame(r));

      try {
        console.log("=== PAYMENT CONFIRMATION (STEP 3) ===");
        console.log("Platform:", Platform.OS);
        console.log("Client secret exists:", !!clientSecret);
        console.log("Client secret preview:", clientSecret ? `${clientSecret.substring(0, 20)}...` : "N/A");
        console.log("Card complete:", paymentState.cardComplete);
        console.log("Card details:", JSON.stringify(paymentState.cardDetails, null, 2));
        console.log("Payment state:", {
          paymentType: paymentState.paymentType,
          cardComplete: paymentState.cardComplete,
          hasCardDetails: !!paymentState.cardDetails,
        });
        console.log("Billing details to send:", {
          name: detailsForm.fullName,
          email: detailsForm.email,
          phone: detailsForm.phone,
        });
        console.log("Stripe object:", stripe ? "Available" : "NULL");
        console.log("Stripe methods:", stripe ? Object.keys(stripe) : "N/A");

        // On iOS, CardField requires creating payment method first
        // The CardField automatically provides card data to createPaymentMethod
        let result;
        const confirmStartTime = Date.now();

        if (Platform.OS === "ios") {
          console.log("iOS detected - creating payment method from CardField first...");
          
          // Step 1: Create payment method - CardField automatically provides the card
          // When you call createPaymentMethod without card data, it uses CardField
          const { paymentMethod, error: pmError } = await stripe.createPaymentMethod({
            paymentMethodType: "Card",
            paymentMethodData: {
              billingDetails: {
                name: detailsForm.fullName,
                email: detailsForm.email,
                phone: detailsForm.phone,
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
          console.log("Full payment method object:", JSON.stringify(paymentMethod, null, 2));

          // Step 2: Confirm payment with the payment method
          // On iOS, after creating payment method, we need to confirm with it
          // The payment method ID needs to be passed to the backend or used differently
          // For now, let's try confirming - Stripe might use the most recent payment method
          console.log("Confirming payment (payment method should be auto-attached)...");
          
          // Add a small delay to ensure payment method is fully processed
          await new Promise(resolve => setTimeout(resolve, 100));
          
          result = await stripe.confirmPayment(clientSecret, {
            paymentMethodType: "Card",
            paymentMethodData: {
              billingDetails: {
                name: detailsForm.fullName,
                email: detailsForm.email,
                phone: detailsForm.phone,
              },
            },
          });
        } else {
          // Android - can use direct confirmation
          console.log("Android detected - using direct confirmation with billing details...");
          result = await stripe.confirmPayment(clientSecret, {
            paymentMethodType: "Card",
            paymentMethodData: {
              billingDetails: {
                name: detailsForm.fullName,
                email: detailsForm.email,
                phone: detailsForm.phone,
              },
            },
          });
        }

        const confirmDuration = Date.now() - confirmStartTime;
        console.log(`confirmPayment completed in ${confirmDuration}ms`);
        console.log("Payment result:", {
          hasError: !!result.error,
          hasPaymentIntent: !!result.paymentIntent,
          errorCode: result.error?.code,
          errorMessage: result.error?.message,
          paymentIntentId: result.paymentIntent?.id,
          paymentIntentStatus: result.paymentIntent?.status,
        });

        setLoadingPayment(false);

        if (result.error) {
          console.log("❌ Payment error details:", {
            code: result.error.code,
            message: result.error.message,
            type: result.error.type,
            declineCode: result.error.declineCode,
            fullError: JSON.stringify(result.error, null, 2),
          });
          Alert.alert("Payment failed", result.error.message);
          return;
        }

        const { paymentIntent } = result;

        if (paymentIntent && checkoutSummary) {
          console.log("✅ Payment successful!");
          console.log("Payment Intent ID:", paymentIntent.id);
          console.log("Payment Intent Status:", paymentIntent.status);
          console.log("Payment Intent Amount:", paymentIntent.amount);
          console.log("Payment Intent Currency:", paymentIntent.currency);
          
          await AsyncStorage.setItem(
            "checkoutSummary",
            JSON.stringify({
              ...checkoutSummary,
              isAuthenticated,
              createdAt: Date.now(),
            })
          );

          if (isAuthenticated) {
            await clearBasket();
          } else {
            await AsyncStorage.removeItem("guestBasket");
          }

          console.log("Navigating to thank-you page...");
          router.push("/thank-you");
        } else {
          console.log("❌ Payment intent or checkout summary missing");
          console.log("Payment intent:", paymentIntent ? "exists" : "null");
          console.log("Checkout summary:", checkoutSummary ? "exists" : "null");
        }
        console.log("=== END PAYMENT CONFIRMATION ===");
      } catch (err: any) {
        setLoadingPayment(false);
        console.log("❌ Payment exception caught:");
        console.log("Error type:", err?.constructor?.name);
        console.log("Error message:", err?.message);
        console.log("Error stack:", err?.stack);
        console.log("Full error object:", JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
        Alert.alert("Payment failed", err?.message || "An unexpected error occurred");
      }
    }
  };

  /* ---------- UI ---------- */

  // Try multiple ways to get the Stripe key
  const stripePublishableKey = 
    process.env.EXPO_PUBLIC_STRIPE_KEY || 
    Constants.expoConfig?.extra?.EXPO_PUBLIC_STRIPE_KEY ||
    null;
  
  if (!stripePublishableKey) {
    console.error("STRIPE ERROR: EXPO_PUBLIC_STRIPE_KEY is not defined in process.env or Constants!");
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: "center", alignItems: "center", padding: 20 }]}>
        <Text style={{ color: "red", fontSize: 16, textAlign: "center" }}>
          Stripe configuration error. Please check environment variables.
        </Text>
        <Text style={{ color: "gray", fontSize: 12, marginTop: 10, textAlign: "center" }}>
          Check console logs for detailed environment variable information.
        </Text>
      </View>
    );
  }

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

          <View style={{ display: step === 2 ? "flex" : "none" }}>
            <PaymentStep
              paymentState={paymentState}
              setPaymentState={setPaymentState}
            />
          </View>

          {step === 3 && checkoutSummary && (
            <ConfirmStep summary={checkoutSummary} />
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
});
