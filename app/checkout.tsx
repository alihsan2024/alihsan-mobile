import React, { useEffect, useMemo, useState, useCallback } from "react";
import { View, StyleSheet, ScrollView, Alert, Text, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StripeProvider, useStripe, CardField } from "@stripe/stripe-react-native";
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
import ConfirmStep from "@/components/Checkout/ConfirmStep";
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

  const [detailsForm, setDetailsForm] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  const insets = useSafeAreaInsets();
  const stripe = useStripe();
  const router = useRouter();

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
    (step === 3 && (!clientSecret || loadingIntent || !cardComplete)) || loadingPayment;

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
    const checkBasket = async () => {
      let items: any[] = [];
      if (isAuthenticated) {
        items = basketItems;
      } else {
        const guestBasketData = await AsyncStorage.getItem("guestBasket");
        items = guestBasketData ? JSON.parse(guestBasketData) : [];
      }

      if (items.length === 0) {
        Alert.alert("Empty Cart", "Your cart is empty");
        router.back();
      }
    };

    checkBasket();
  }, [isAuthenticated, basketItems]);

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
    if (step === 3 && !clientSecret && !loadingIntent) {
      ensureClientSecret();
    }
  }, [step, ensureClientSecret, clientSecret, loadingIntent]);

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
      if (!clientSecret || !stripe) {
        Alert.alert("Error", "Payment not ready");
        return;
      }

      if (!cardComplete) {
        Alert.alert("Error", "Please enter complete card information");
        return;
      }

      setLoadingPayment(true);
      await new Promise((r) => requestAnimationFrame(r));

      try {
        console.log("=== PAYMENT CONFIRMATION (STEP 3) ===");
        console.log("Platform:", Platform.OS);
        console.log("Client secret exists:", !!clientSecret);
        console.log("Card complete:", cardComplete);

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

        if (paymentIntent && checkoutSummary) {
          console.log("✅ Payment successful!");
          console.log("Payment Intent ID:", paymentIntent.id);
          console.log("Payment Intent Status:", paymentIntent.status);
          
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
            <View style={styles.paymentContainer}>
              <Text style={styles.sectionTitle}>Payment Details</Text>
              <Text style={styles.helperText}>
                Enter your card information to complete the payment
              </Text>
              
              <View style={styles.cardContainer}>
                <CardField
                  postalCodeEnabled={false}
                  placeholders={{
                    number: "4242 4242 4242 4242",
                  }}
                  cardStyle={{
                    backgroundColor: "#FFFFFF",
                    textColor: "#000000",
                    borderWidth: 1,
                    borderColor: "#E0E0E0",
                    borderRadius: 8,
                  }}
                  style={styles.cardField}
                  onCardChange={(details) => {
                    setCardComplete(details.complete);
                  }}
                />
              </View>

              {loadingIntent && (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Preparing payment...</Text>
                </View>
              )}
            </View>
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
