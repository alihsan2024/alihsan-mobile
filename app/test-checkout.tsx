import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { StripeProvider, useStripe, CardField } from "@stripe/stripe-react-native";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { useGetBasketQuery } from "@/store/reduxSlice/api/basketApi";
import api from "@/utils/api";

// Get Stripe publishable key
const stripePublishableKey =
  process.env.EXPO_PUBLIC_STRIPE_KEY ||
  Constants.expoConfig?.extra?.EXPO_PUBLIC_STRIPE_KEY ||
  null;

export default function TestCheckoutPage() {
  if (!stripePublishableKey) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Stripe configuration error. Please check environment variables.
        </Text>
      </View>
    );
  }

  return (
    <StripeProvider publishableKey={stripePublishableKey}>
      <TestCheckoutContent />
    </StripeProvider>
  );
}

function TestCheckoutContent() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLoadingSecret, setIsLoadingSecret] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [cardDetails, setCardDetails] = useState<any>(null);
  const [message, setMessage] = useState<string | null>(null);

  const stripe = useStripe();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useSelector((state: any) => state.authentication);
  const isAuthenticated = !!user;

  const { data: basketData } = useGetBasketQuery(undefined, {
    skip: !isAuthenticated,
  });

  // Load basket items
  useEffect(() => {
    const loadBasketAndCheckout = async () => {
      try {
        setIsLoadingSecret(true);
        setMessage(null);

        let basketItems: any[] = [];

        if (isAuthenticated) {
          // Get basket from API
          basketItems = basketData?.payload ?? [];
        } else {
          // Get guest basket from storage
          const guestBasketData = await AsyncStorage.getItem("guestBasket");
          basketItems = guestBasketData ? JSON.parse(guestBasketData) : [];
        }

        if (basketItems.length === 0) {
          Alert.alert("Empty Cart", "Your cart is empty");
          router.back();
          return;
        }

        console.log("🛒 Basket items for checkout:", JSON.stringify(basketItems, null, 2));

        // Prepare checkout payload
        let checkoutPayload: any;
        
        if (isAuthenticated) {
          // For authenticated users, backend gets basket from DB
          // Just send payment gateway info
          checkoutPayload = {
            paymentGateway: "stripe",
            isAnonymous: false,
          };
        } else {
          // For guest users, need to send basket items and user details
          // Try to get from storage or use defaults for testing
          const checkoutDetails = await AsyncStorage.getItem("checkoutDetails");
          let firstName = "Test";
          let lastName = "User";
          let email = "test@example.com";
          
          if (checkoutDetails) {
            const details = JSON.parse(checkoutDetails);
            firstName = details.firstName || firstName;
            lastName = details.lastName || lastName;
            email = details.email || email;
          }
          
          // Map basket items with all required fields
          const mappedBasketItems = basketItems.map((item) => {
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

          console.log("📦 Mapped basket items:", JSON.stringify(mappedBasketItems, null, 2));

          checkoutPayload = {
            firstName,
            lastName,
            email,
            paymentGateway: "stripe",
            basketItems: mappedBasketItems,
          };
        }

        // Call appropriate checkout endpoint
        let response;
        if (isAuthenticated) {
          response = await api.post("/basket/checkout", checkoutPayload);
        } else {
          response = await api.post("/basket/checkout-unknown", checkoutPayload);
        }

        const secret = response.data?.payload?.clientSecret;
        if (!secret) {
          throw new Error("No client secret received");
        }

        setClientSecret(secret);
      } catch (error: any) {
        console.error("Checkout error:", error);
        Alert.alert(
          "Checkout Error",
          error.response?.data?.message || error.message || "Failed to initialize checkout"
        );
      } finally {
        setIsLoadingSecret(false);
      }
    };

    loadBasketAndCheckout();
  }, [isAuthenticated, basketData]);

  const handleSubmit = async () => {
    if (!stripe || !clientSecret) {
      Alert.alert("Error", "Payment not ready");
      return;
    }

    if (!cardComplete) {
      Alert.alert("Error", "Please enter complete card information");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Create payment method first
      const { paymentMethod, error: pmError } = await stripe.createPaymentMethod({
        paymentMethodType: "Card",
      });

      if (pmError) {
        setMessage(pmError.message);
        setLoading(false);
        return;
      }

      if (!paymentMethod) {
        setMessage("Failed to create payment method");
        setLoading(false);
        return;
      }

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmPayment(clientSecret, {
        paymentMethodType: "Card",
      });

      if (error) {
        setMessage(error.message);
      } else if (paymentIntent) {
        setMessage("Payment succeeded!");
        
        // Calculate totals for thank you page
        let basketItems: any[] = [];
        if (isAuthenticated) {
          basketItems = basketData?.payload ?? [];
        } else {
          const guestBasketData = await AsyncStorage.getItem("guestBasket");
          basketItems = guestBasketData ? JSON.parse(guestBasketData) : [];
        }

        const processingFee = 0.03;
        const subtotal = basketItems.reduce((sum, item) => {
          if (isAuthenticated) {
            return sum + Number(item.total ?? item.amount ?? 0);
          }
          return sum + Number(item.amount ?? 0) * Number(item.quantity ?? 1);
        }, 0);
        const adminFee = subtotal * processingFee;
        const total = subtotal + adminFee;

        // Save checkout summary for thank you page
        await AsyncStorage.setItem(
          "checkoutSummary",
          JSON.stringify({
            items: basketItems,
            subtotal,
            adminFee,
            total,
            isAuthenticated,
            createdAt: Date.now(),
          })
        );

        // Clear basket
        if (isAuthenticated) {
          // Clear authenticated basket via API
          try {
            await api.delete("/basket/clear");
          } catch (e) {
            console.error("Error clearing basket:", e);
          }
        } else {
          await AsyncStorage.removeItem("guestBasket");
        }

        // Navigate to thank you page
        console.log("✅ Payment successful! Navigating to thank-you page...");
        router.push("/thank-you");
      }
    } catch (err: any) {
      setMessage(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Test Checkout</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {isLoadingSecret ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Preparing checkout...</Text>
          </View>
        ) : !clientSecret ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Failed to initialize checkout</Text>
          </View>
        ) : (
          <View style={styles.paymentContainer}>
            <Text style={styles.sectionTitle}>Payment Details</Text>
            
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
                  setCardDetails(details);
                  setCardComplete(details.complete);
                }}
              />
            </View>

            {message && (
              <View
                style={[
                  styles.messageContainer,
                  message.includes("succeeded")
                    ? styles.successMessage
                    : styles.errorMessage,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.includes("succeeded")
                      ? styles.successText
                      : styles.errorText,
                  ]}
                >
                  {message}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.submitButton,
                (loading || !cardComplete || !stripe) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={loading || !cardComplete || !stripe}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Pay Now</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.helperText}>
              Use test card: 4242 4242 4242 4242
            </Text>
            <Text style={styles.helperText}>
              Any future expiry date, any CVC
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: "#007AFF",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666666",
  },
  errorContainer: {
    padding: 20,
    alignItems: "center",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 16,
    textAlign: "center",
  },
  paymentContainer: {
    width: "100%",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 16,
  },
  cardContainer: {
    marginBottom: 24,
  },
  cardField: {
    width: "100%",
    height: 50,
    marginVertical: 8,
  },
  submitButton: {
    backgroundColor: "#FFD602",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  submitButtonDisabled: {
    backgroundColor: "#E5E7EB",
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#010D26",
    fontSize: 16,
    fontWeight: "700",
  },
  helperText: {
    fontSize: 12,
    color: "#666666",
    textAlign: "center",
    marginTop: 8,
  },
  messageContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  successMessage: {
    backgroundColor: "#D4EDDA",
  },
  errorMessage: {
    backgroundColor: "#F8D7DA",
  },
  messageText: {
    fontSize: 14,
    textAlign: "center",
  },
  successText: {
    color: "#155724",
  },
});
