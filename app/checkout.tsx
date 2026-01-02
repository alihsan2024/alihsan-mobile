// import React, { useState, useEffect, useRef } from "react";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import {
//   View,
//   Text,
//   TextInput,
//   ScrollView,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   Switch,
//   ActivityIndicator,
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { useSelector } from "react-redux";
// import { useGetBasketQuery } from "@/store/reduxSlice/api/basketApi";
// import { useRouter } from "expo-router";
// import { LinearGradient } from "expo-linear-gradient";
// import { useFormik } from "formik";
// import * as yup from "yup";
// import api from "../utils/api";
// // import PhoneInput from "react-native-phone-input";
// import LoadingScreen from "@/components/LoadingScreen";
// import { BasketItem } from "@/utils/api";

// // Initial form values
// const initialState = {
//   firstName: "",
//   lastName: "",
//   email: "",
//   phone: "",
//   company: "",
//   country: "",
//   address: "",
//   city: "",
//   state: "",
//   zip: "",
//   createAccount: "",
//   basketItems: [],
//   status: true,
// };

// const formatPrice = (price: number): string => {
//   return !isNaN(price)
//     ? price.toLocaleString(undefined, {
//         minimumFractionDigits: 2,
//         maximumFractionDigits: 2,
//       })
//     : "0.00";
// };

// const validationSchema = yup.object({
//   firstName: yup
//     .string()
//     .trim()
//     .required("First name is required")
//     .matches(
//       /^[A-Za-z\s-]+$/,
//       "First name must contain only letters, spaces, and hyphens"
//     )
//     .max(40, "First name must be at most 40 characters"),
//   lastName: yup
//     .string()
//     .trim()
//     .required("Last name is required")
//     .matches(
//       /^[A-Za-z\s-]+$/,
//       "Last name must contain only letters, spaces, and hyphens"
//     )
//     .max(40, "Last name must be at most 40 characters"),
//   email: yup
//     .string()
//     .email("Enter a valid email")
//     .required("Email is required"),
//   phone: yup.string().when("status", {
//     is: true,
//     then: () => yup.string().required("Phone Number is required"),
//   }),
//   address: yup
//     .string()
//     .max(100)
//     .when("status", {
//       is: true,
//       then: () => yup.string().required("Address is required"),
//     }),
//   country: yup
//     .string()
//     .max(2)
//     .when("status", {
//       is: true,
//       then: () => yup.string().required("Country is required"),
//     }),
//   state: yup
//     .string()
//     .trim()
//     .max(40)
//     .matches(/^[A-Za-z\s-]+$/)
//     .when("status", {
//       is: true,
//       then: () => yup.string().required("State is required"),
//     }),
//   city: yup
//     .string()
//     .trim()
//     .max(40)
//     .matches(/^[A-Za-z\s'-]+$/)
//     .when("status", {
//       is: true,
//       then: () => yup.string().required("City is required"),
//     }),
//   zip: yup
//     .string()
//     .max(20)
//     .matches(/^[0-9A-Za-z\s-]+$/)
//     .when("status", {
//       is: true,
//       then: () => yup.string().required("Zip code is required"),
//     }),
// });

// export default function CheckoutScreen() {
//   const insets = useSafeAreaInsets();
//   const user = useSelector((state: any) => state.authentication.user);
//   const isAuthenticated = !!user;
//   const { data: basketData } = useGetBasketQuery(undefined, {
//     skip: !isAuthenticated,
//   });
//   const [guestBasket, setGuestBasket] = useState<any[]>([]);
//   useEffect(() => {
//     if (!isAuthenticated) {
//       AsyncStorage.getItem("guestBasket").then((data) => {
//         setGuestBasket(data ? JSON.parse(data) : []);
//       });
//     }
//   }, [isAuthenticated]);
//   const basketItems = isAuthenticated ? basketData?.payload ?? [] : guestBasket;
//   const router = useRouter();

//   const [isAnonymous, setIsAnonymous] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     const loadProfile = async () => {
//       try {
//         if (!isAuthenticated || !user) return;

//         const response = await api.get("/profile");
//         const profile = response.data?.payload;

//         if (profile) {
//           formik.setValues({
//             ...formik.values,
//             firstName: profile.firstName || "",
//             lastName: profile.lastName || "",
//             email: profile.email || "",
//             phone: profile.phone || "",
//             company: profile.company || "",
//             country: profile.country || "",
//             address: profile.address || "",
//             city: profile.city || "",
//             state: profile.state || "",
//             zip: profile.zip || "",
//             status: true,
//           });
//         }
//       } catch (err) {
//         console.log("Failed to load profile:", err);
//       }
//     };

//     loadProfile();
//   }, [isAuthenticated]);

//   const formik = useFormik({
//     initialValues: initialState,
//     validationSchema,
//     onSubmit: async (values) => {
//       try {
//         setIsLoading(true);
//         const updatedValues = {
//           ...values,
//           basketItems: basketItems,
//         };
//         const ROLES = { ADMIN: "ADMIN", SUPERADMIN: "SUPERADMIN" };
//         let response;
//         if (
//           !user?.email ||
//           user?.role === ROLES.ADMIN ||
//           user?.role === ROLES.SUPERADMIN ||
//           !isAuthenticated
//         ) {
//           // Anonymous/admin/superadmin
//           response = await api.post("/basket/checkout-unknown", {
//             ...updatedValues,
//             paymentGateway: "stripe",
//             isAnonymous: true,
//           });
//           const payload = response.data?.payload;
//           const clientSecret = payload?.clientSecret;
//           await AsyncStorage.setItem(
//             "checkoutDetails",
//             JSON.stringify({
//               ...updatedValues,
//               paymentIntentId: payload?.paymentIntentId,
//               donationIds: payload?.donationIds,
//               clientSecret,
//             })
//           );
//           router.push("/confirm");
//         } else {
//           // Normal user
//           response = await api.patch("/profile", updatedValues);
//           const payload = response.data?.payload;
//           const clientSecret = payload?.clientSecret;
//           await AsyncStorage.setItem(
//             "checkoutDetails",
//             JSON.stringify({
//               ...updatedValues,
//               clientSecret,
//             })
//           );
//           router.push("/confirm");
//         }
//         setIsLoading(false);
//       } catch (error) {
//         Alert.alert("Error", (error as any).message || "Something went wrong");
//         setIsLoading(false);
//       }
//     },
//   });

//   // Totals calculation
//   const subtotal = basketItems.reduce(
//     (
//       acc: number,
//       item: BasketItem // Use the correct BasketItem type
//     ) => {
//       const checkoutType = item.checkoutType || item.Campaign?.checkoutType;
//       const total =
//         typeof item.total === "number"
//           ? item.total
//           : parseFloat(item.total || "0");
//       const amount =
//         typeof item.amount === "number"
//           ? item.amount
//           : parseFloat(item.amount || "0");
//       const quantity =
//         typeof item.quantity === "number"
//           ? item.quantity
//           : parseInt(item.quantity || "1");

//       if (checkoutType === "ADEEQAH_GENERAL_SACRIFICE") {
//         return acc + total;
//       }

//       return acc + amount * quantity;
//     },
//     0
//   );
//   const processingFee = 0.03;
//   const processingAmount = subtotal * processingFee;
//   const total = subtotal + processingAmount;

//   if (!basketItems) {
//     return <LoadingScreen message="Loading checkout..." />;
//   }

//   return (
//     <ScrollView
//       style={[styles.container, { paddingTop: insets.top, marginBottom: 100 }]}
//     >
//       <LinearGradient
//         colors={["#264B8B", "#5B8FD8"]}
//         style={styles.sectionHeader}
//       >
//         <Text style={styles.sectionHeaderText}>Personal Information</Text>
//       </LinearGradient>

//       <View style={styles.sectionContent}>
//         {/* First & Last Name */}
//         <TextInput
//           style={styles.input}
//           placeholder="First Name"
//           value={formik.values.firstName}
//           onChangeText={formik.handleChange("firstName")}
//           autoComplete="name-given"
//           textContentType="givenName"
//           autoCapitalize="words"
//         />

//         {formik.touched.firstName && formik.errors.firstName && (
//           <Text style={styles.errorText}>{formik.errors.firstName}</Text>
//         )}

//         <TextInput
//           style={styles.input}
//           placeholder="Last Name"
//           value={formik.values.lastName}
//           onChangeText={formik.handleChange("lastName")}
//           autoComplete="name-family"
//           textContentType="familyName"
//           autoCapitalize="words"
//         />

//         {formik.touched.lastName && formik.errors.lastName && (
//           <Text style={styles.errorText}>{formik.errors.lastName}</Text>
//         )}

//         {/* Company */}
//         <TextInput
//           style={styles.input}
//           placeholder="Company (Optional)"
//           value={formik.values.company}
//           onChangeText={formik.handleChange("company")}
//           autoComplete="organization"
//           textContentType="organizationName"
//         />

//         {/* Email */}
//         <TextInput
//           style={styles.input}
//           placeholder="Email"
//           keyboardType="email-address"
//           value={formik.values.email}
//           onChangeText={formik.handleChange("email")}
//           autoComplete="email"
//           textContentType="emailAddress"
//           autoCapitalize="none"
//         />

//         {formik.touched.email && formik.errors.email && (
//           <Text style={styles.errorText}>{formik.errors.email}</Text>
//         )}

//         {/* Phone */}
//         <TextInput
//           style={styles.input}
//           placeholder="Phone Number"
//           keyboardType="phone-pad"
//           value={formik.values.phone}
//           onChangeText={formik.handleChange("phone")}
//           autoComplete="tel"
//           textContentType="telephoneNumber"
//         />

//         {formik.touched.phone && formik.errors.phone && (
//           <Text style={styles.errorText}>{formik.errors.phone}</Text>
//         )}

//         {/* Address */}
//         <TextInput
//           style={styles.input}
//           placeholder="Street Address"
//           value={formik.values.address}
//           onChangeText={formik.handleChange("address")}
//           autoComplete="street-address"
//           textContentType="fullStreetAddress"
//         />

//         {formik.touched.address && formik.errors.address && (
//           <Text style={styles.errorText}>{formik.errors.address}</Text>
//         )}

//         <TextInput
//           style={styles.input}
//           placeholder="City"
//           value={formik.values.city}
//           onChangeText={formik.handleChange("city")}
//           autoComplete="address-line2"
//           textContentType="addressCity"
//         />

//         {formik.touched.city && formik.errors.city && (
//           <Text style={styles.errorText}>{formik.errors.city}</Text>
//         )}

//         <TextInput
//           style={styles.input}
//           placeholder="State"
//           value={formik.values.state}
//           onChangeText={formik.handleChange("state")}
//           autoComplete="address-line1"
//           textContentType="addressState"
//         />

//         {formik.touched.state && formik.errors.state && (
//           <Text style={styles.errorText}>{formik.errors.state}</Text>
//         )}

//         <TextInput
//           style={styles.input}
//           placeholder="Post Code"
//           value={formik.values.zip}
//           onChangeText={formik.handleChange("zip")}
//           autoComplete="postal-code"
//           textContentType="postalCode"
//         />

//         {formik.touched.zip && formik.errors.zip && (
//           <Text style={styles.errorText}>{formik.errors.zip}</Text>
//         )}

//         {/* Country */}
//         <TextInput
//           style={styles.input}
//           placeholder="Country (2-letter code, e.g. AU)"
//           value={formik.values.country}
//           onChangeText={formik.handleChange("country")}
//           autoCapitalize="characters"
//           autoComplete="country"
//           textContentType="countryName"
//           maxLength={2}
//         />

//         {formik.touched.country && formik.errors.country && (
//           <Text style={styles.errorText}>{formik.errors.country}</Text>
//         )}

//         {/* Anonymous Checkout */}
//         {isAuthenticated && user && (
//           <View style={styles.switchContainer}>
//             <Switch
//               value={isAnonymous}
//               onValueChange={setIsAnonymous}
//               trackColor={{ false: "#ccc", true: "#264B8B" }}
//               thumbColor={isAnonymous ? "#fff" : "#f4f3f4"}
//             />
//             <Text style={styles.switchText}>Anonymous Checkout</Text>
//           </View>
//         )}

//         {/* Debug logs for Formik errors and touched */}
//         {/* {console.log("formik.errors", formik.errors)} */}
//         {/* {console.log("formik.touched", formik.touched)} */}

//         {/* Submit */}
//         <TouchableOpacity
//           style={styles.checkoutButton}
//           onPress={() => formik.handleSubmit()}
//         >
//           {isLoading ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <Text style={styles.checkoutButtonText}>Continue to Payment</Text>
//           )}
//         </TouchableOpacity>
//       </View>

//       {/* Order Summary */}
//       <LinearGradient
//         colors={["#264B8B", "#5B8FD8"]}
//         style={styles.sectionHeader}
//       >
//         <Text style={styles.sectionHeaderText}>Order Summary</Text>
//       </LinearGradient>

//       <View style={styles.sectionContent}>
//         <Text style={styles.summaryRow}>
//           Subtotal: ${formatPrice(subtotal)}
//         </Text>
//         <Text style={styles.summaryRow}>
//           Processing Fee (3%): ${formatPrice(processingAmount)}
//         </Text>
//         <Text style={styles.summaryRowTotal}>Total: ${formatPrice(total)}</Text>
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#f5f5f5" },
//   sectionHeader: {
//     padding: 12,
//     borderRadius: 8,
//     margin: 16,
//   },
//   sectionHeaderText: { fontSize: 18, color: "#fff", fontWeight: "600" },
//   sectionContent: { marginHorizontal: 16, marginBottom: 24 },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 12,
//     backgroundColor: "#fff",
//   },
//   errorText: { color: "red", fontSize: 12, marginBottom: 6 },
//   switchContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginVertical: 12,
//   },
//   switchText: { marginLeft: 8, fontSize: 14, color: "#333" },
//   checkoutButton: {
//     backgroundColor: "#264B8B",
//     padding: 16,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 12,
//   },
//   checkoutButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
//   summaryRow: { fontSize: 14, color: "#333", marginBottom: 6 },
//   summaryRowTotal: { fontSize: 16, fontWeight: "bold", marginTop: 12 },
// });

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
      <View style={styles.container}>
        <ProcessingPaymentModal visible={loadingPayment} />
        <CheckoutHeader />

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
