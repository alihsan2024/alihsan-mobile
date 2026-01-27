import React, { useEffect, useMemo, useState, useCallback } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
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

    AsyncStorage.getItem("guestBasket").then((data) => {
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

      const stored = await AsyncStorage.getItem("checkoutDetails");
      if (!stored) throw new Error("Missing checkoutDetails");

      const checkoutDetails = JSON.parse(stored);
      const payload = {
        ...checkoutDetails,
        basketItems: checkoutSummary.items,
      };

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
      ensureClientSecret();
    }
  }, [step, ensureClientSecret]);

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

      setLoadingPayment(true);
      await new Promise((r) => requestAnimationFrame(r));

      const { paymentIntent, error } = await stripe.confirmPayment(
        clientSecret,
        { paymentMethodType: "Card" }
      );

      setLoadingPayment(false);

      if (error) {
        Alert.alert("Payment failed", error.message);
        return;
      }

      if (paymentIntent && checkoutSummary) {
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

        router.push("/thank-you");
      }
    }
  };

  /* ---------- UI ---------- */

  return (
    <StripeProvider publishableKey={process.env.EXPO_PUBLIC_STRIPE_KEY!}>
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
