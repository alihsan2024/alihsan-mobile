import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { useClearBasketMutation } from "@/store/reduxSlice/api/basketApi";
import api from "@/utils/api";

import CheckoutHeader from "@/components/Checkout/CheckoutHeader";
import StepIndicator from "@/components/Checkout/StepIndicator";
import DetailsStep from "@/components/Checkout/DetailsStep";
import PaymentStep from "@/components/Checkout/PaymentStep";
import ConfirmStep from "@/components/Checkout/ConfirmStep";
import BottomBar from "@/components/Checkout/BottomBar";
import ProcessingPaymentModal from "@/components/ui/Modals/ProcessingPaymentModal";
import { useSafeAreaInsets } from "react-native-safe-area-context";
export type PaymentState = {
  paymentType: "card" | "paypal";
  cardDetails: any;
  cardComplete: boolean;
};

export default function CheckoutScreen() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isDetailsValid, setIsDetailsValid] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const insets = useSafeAreaInsets();
  const [paymentState, setPaymentState] = useState<PaymentState>({
    paymentType: "card",
    cardDetails: null,
    cardComplete: false,
  });
  const [loadingIntent, setLoadingIntent] = useState(false);

  const stripe = useStripe();
  const router = useRouter();
  const user = useSelector((s: any) => s.authentication.user);
  const basketItemsFromRedux = useSelector(
    (s: any) => s.basketItem?.basketItems ?? []
  );
  const isAuthenticated = !!user;
  const [clearBasket] = useClearBasketMutation();
  const isCheckoutDisabled =
    (step === 3 && (!clientSecret || loadingIntent)) || loadingPayment;

  /**
   * Create payment intent WHEN entering step 3
   */
  useEffect(() => {
    if (step < 2 || clientSecret) return;

    const initPayment = async () => {
      try {
        setLoadingIntent(true);

        const stored = await AsyncStorage.getItem("checkoutDetails");
        console.log("RAW checkoutDetails (string)", stored);
        if (!stored) throw new Error("Missing checkoutDetails");

        const checkoutDetails = JSON.parse(stored);
        console.log("PARSED checkoutDetails (object)", checkoutDetails);
        let basketItems = basketItemsFromRedux;
        if (!isAuthenticated) {
          const guest = await AsyncStorage.getItem("guestBasket");
          basketItems = guest ? JSON.parse(guest) : [];
        }

        const payload = { ...checkoutDetails, basketItems };

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
          const details = JSON.parse(stored);

          const identityPayload = {
            firstName: details.firstName,
            lastName: details.lastName,
            email: details.email,
            phone: details.phone,

            address: details.address,
            city: details.city,
            state: details.state,
            zip: details.zip,
            country: details.country,
          };

          const res = await api.post("/basket/checkout-unknown", {
            ...payload,
            ...identityPayload, // 👈 THIS IS THE FIX
            paymentGateway: "stripe",
            isAnonymous: true,
          });

          secret = res.data?.payload?.clientSecret;
        }

        setClientSecret(secret ?? null);
      } catch (e) {
        console.log("Intent prefetch failed", e);
        setClientSecret(null);
      } finally {
        setLoadingIntent(false);
      }
    };

    initPayment();
  }, [step]);

  /**
   * BottomBar handler (SINGLE payment trigger)
   */
  const handleNext = async () => {
    // Step 1 → Step 2
    if (step === 1) {
      if (!isDetailsValid) return;
      setStep(2);
      return;
    }

    // Step 2 → Step 3
    if (step === 2) {
      setStep(3);
      return;
    }

    // Step 3 → PAY
    if (step === 3) {
      if (!clientSecret) {
        Alert.alert("Error", "Payment not ready");
        return;
      }

      setLoadingPayment(true);

      // ✅ Force UI update before Stripe work
      await new Promise((resolve) => requestAnimationFrame(resolve));

      const { paymentIntent, error } = await stripe.confirmPayment(
        clientSecret,
        { paymentMethodType: "Card" }
      );

      setLoadingPayment(false);

      if (error) {
        Alert.alert("Payment failed", error.message);
        return;
      }

      if (paymentIntent) {
        let finalBasketItems: any[] = [];

        if (isAuthenticated) {
          // Logged-in users → basket came from API payload
          finalBasketItems = basketItemsFromRedux.length
            ? basketItemsFromRedux
            : await AsyncStorage.getItem("guestBasket").then((d) =>
                d ? JSON.parse(d) : []
              );
        } else {
          // Guest users → basket ALWAYS from AsyncStorage
          const guest = await AsyncStorage.getItem("guestBasket");
          finalBasketItems = guest ? JSON.parse(guest) : [];
        }

        const summary = {
          items: finalBasketItems,
          isAuthenticated,
          createdAt: Date.now(),
        };

        await AsyncStorage.setItem("checkoutSummary", JSON.stringify(summary));

        await AsyncStorage.setItem("checkoutSummary", JSON.stringify(summary));

        if (isAuthenticated) {
          await clearBasket();
        } else {
          await AsyncStorage.removeItem("guestBasket");
        }

        router.push("/thank-you");
      }
    }
  };

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
          {step === 1 && <DetailsStep onValidChange={setIsDetailsValid} />}
          <View style={{ display: step === 2 ? "flex" : "none" }}>
            <PaymentStep
              paymentState={paymentState}
              setPaymentState={setPaymentState}
            />
          </View>
          {step === 3 && <ConfirmStep />}
        </ScrollView>

        <BottomBar
          step={step}
          loading={loadingPayment || loadingIntent}
          onNext={handleNext}
          disabled={isCheckoutDisabled}
        />
      </View>
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 16 },
});
