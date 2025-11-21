import React, { useState, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBasket } from "@/context/BasketContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useFormik } from "formik";
import * as yup from "yup";
import api from "../services/api";
// import PhoneInput from "react-native-phone-input";
import LoadingScreen from "@/components/LoadingScreen";
import { BasketItem } from "@/services/api";

// Initial form values
const initialState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  company: "",
  country: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  createAccount: "",
  basketItems: [],
  status: true,
};

const formatPrice = (price: number): string => {
  return !isNaN(price)
    ? price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "0.00";
};

const validationSchema = yup.object({
  firstName: yup
    .string()
    .trim()
    .required("First name is required")
    .matches(
      /^[A-Za-z\s-]+$/,
      "First name must contain only letters, spaces, and hyphens"
    )
    .max(40, "First name must be at most 40 characters"),
  lastName: yup
    .string()
    .trim()
    .required("Last name is required")
    .matches(
      /^[A-Za-z\s-]+$/,
      "Last name must contain only letters, spaces, and hyphens"
    )
    .max(40, "Last name must be at most 40 characters"),
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
  phone: yup.string().when("status", {
    is: true,
    then: () => yup.string().required("Phone Number is required"),
  }),
  address: yup
    .string()
    .max(100)
    .when("status", {
      is: true,
      then: () => yup.string().required("Address is required"),
    }),
  country: yup
    .string()
    .max(2)
    .when("status", {
      is: true,
      then: () => yup.string().required("Country is required"),
    }),
  state: yup
    .string()
    .trim()
    .max(40)
    .matches(/^[A-Za-z\s-]+$/)
    .when("status", {
      is: true,
      then: () => yup.string().required("State is required"),
    }),
  city: yup
    .string()
    .trim()
    .max(40)
    .matches(/^[A-Za-z\s'-]+$/)
    .when("status", {
      is: true,
      then: () => yup.string().required("City is required"),
    }),
  zip: yup
    .string()
    .max(20)
    .matches(/^[0-9A-Za-z\s-]+$/)
    .when("status", {
      is: true,
      then: () => yup.string().required("Zip code is required"),
    }),
});

export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();
  const { items } = useBasket();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik({
    initialValues: initialState,
    validationSchema,
    onSubmit: async (values) => {
      try {
        setIsLoading(true);
        const updatedValues = {
          ...values,
          basketItems: items,
        };
        const ROLES = { ADMIN: "ADMIN", SUPERADMIN: "SUPERADMIN" };
        let response;
        if (
          !user?.email ||
          user?.role === ROLES.ADMIN ||
          user?.role === ROLES.SUPERADMIN
        ) {
          // Anonymous/admin/superadmin
          response = await api.post("/basket/checkout-unknown", {
            ...updatedValues,
            paymentGateway: "stripe",
            isAnonymous: true,
          });
          const payload = response.data?.payload;
          const clientSecret = payload?.clientSecret;
          await AsyncStorage.setItem(
            "checkoutDetails",
            JSON.stringify({
              ...updatedValues,
              paymentIntentId: payload?.paymentIntentId,
              donationIds: payload?.donationIds,
              clientSecret,
            })
          );
          router.push("/confirm");
        } else {
          // Normal user
          response = await api.patch("/profile", updatedValues);
          const payload = response.data?.payload;
          const clientSecret = payload?.clientSecret;
          await AsyncStorage.setItem(
            "checkoutDetails",
            JSON.stringify({
              ...updatedValues,
              clientSecret,
            })
          );
          router.push("/confirm");
        }
        setIsLoading(false);
      } catch (error) {
        Alert.alert("Error", (error as any).message || "Something went wrong");
        setIsLoading(false);
      }
    },
  });

  // Totals calculation
  const subtotal = items.reduce(
    (
      acc: number,
      item: BasketItem // Use the correct BasketItem type
    ) => {
      const checkoutType = item.checkoutType || item.Campaign?.checkoutType;
      const total =
        typeof item.total === "number"
          ? item.total
          : parseFloat(item.total || "0");
      const amount =
        typeof item.amount === "number"
          ? item.amount
          : parseFloat(item.amount || "0");
      const quantity =
        typeof item.quantity === "number"
          ? item.quantity
          : parseInt(item.quantity || "1");

      if (checkoutType === "ADEEQAH_GENERAL_SACRIFICE") {
        return acc + total;
      }

      return acc + amount * quantity;
    },
    0
  );
  const processingFee = 0.03;
  const processingAmount = subtotal * processingFee;
  const total = subtotal + processingAmount;

  if (!items) {
    return <LoadingScreen message="Loading checkout..." />;
  }

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top, marginBottom: 100 }]}
    >
      <LinearGradient
        colors={["#264B8B", "#5B8FD8"]}
        style={styles.sectionHeader}
      >
        <Text style={styles.sectionHeaderText}>Personal Information</Text>
      </LinearGradient>

      <View style={styles.sectionContent}>
        {/* First & Last Name */}
        <TextInput
          style={styles.input}
          placeholder="First Name"
          value={formik.values.firstName}
          onChangeText={formik.handleChange("firstName")}
        />
        {formik.touched.firstName && formik.errors.firstName && (
          <Text style={styles.errorText}>{formik.errors.firstName}</Text>
        )}

        <TextInput
          style={styles.input}
          placeholder="Last Name"
          value={formik.values.lastName}
          onChangeText={formik.handleChange("lastName")}
        />
        {formik.touched.lastName && formik.errors.lastName && (
          <Text style={styles.errorText}>{formik.errors.lastName}</Text>
        )}

        {/* Company */}
        <TextInput
          style={styles.input}
          placeholder="Company (Optional)"
          value={formik.values.company}
          onChangeText={formik.handleChange("company")}
        />

        {/* Email */}
        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          value={formik.values.email}
          onChangeText={formik.handleChange("email")}
        />
        {formik.touched.email && formik.errors.email && (
          <Text style={styles.errorText}>{formik.errors.email}</Text>
        )}

        {/* Phone */}
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          keyboardType="phone-pad"
          value={formik.values.phone}
          onChangeText={formik.handleChange("phone")}
        />
        {formik.touched.phone && formik.errors.phone && (
          <Text style={styles.errorText}>{formik.errors.phone}</Text>
        )}

        {/* Address */}
        <TextInput
          style={styles.input}
          placeholder="Street Address"
          value={formik.values.address}
          onChangeText={formik.handleChange("address")}
        />
        {formik.touched.address && formik.errors.address && (
          <Text style={styles.errorText}>{formik.errors.address}</Text>
        )}

        <TextInput
          style={styles.input}
          placeholder="City"
          value={formik.values.city}
          onChangeText={formik.handleChange("city")}
        />
        {formik.touched.city && formik.errors.city && (
          <Text style={styles.errorText}>{formik.errors.city}</Text>
        )}

        <TextInput
          style={styles.input}
          placeholder="State"
          value={formik.values.state}
          onChangeText={formik.handleChange("state")}
        />
        {formik.touched.state && formik.errors.state && (
          <Text style={styles.errorText}>{formik.errors.state}</Text>
        )}

        <TextInput
          style={styles.input}
          placeholder="Post Code"
          value={formik.values.zip}
          onChangeText={formik.handleChange("zip")}
        />
        {formik.touched.zip && formik.errors.zip && (
          <Text style={styles.errorText}>{formik.errors.zip}</Text>
        )}

        {/* Country */}
        <TextInput
          style={styles.input}
          placeholder="Country (2-letter code, e.g. AU)"
          value={formik.values.country}
          onChangeText={formik.handleChange("country")}
          autoCapitalize="characters"
          maxLength={2}
        />
        {formik.touched.country && formik.errors.country && (
          <Text style={styles.errorText}>{formik.errors.country}</Text>
        )}

        {/* Anonymous Checkout */}
        {isAuthenticated && user && (
          <View style={styles.switchContainer}>
            <Switch
              value={isAnonymous}
              onValueChange={setIsAnonymous}
              trackColor={{ false: "#ccc", true: "#264B8B" }}
              thumbColor={isAnonymous ? "#fff" : "#f4f3f4"}
            />
            <Text style={styles.switchText}>Anonymous Checkout</Text>
          </View>
        )}

        {/* Debug logs for Formik errors and touched */}
        {/* {console.log("formik.errors", formik.errors)} */}
        {/* {console.log("formik.touched", formik.touched)} */}

        {/* Submit */}
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={() => formik.handleSubmit()}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.checkoutButtonText}>Continue to Payment</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Order Summary */}
      <LinearGradient
        colors={["#264B8B", "#5B8FD8"]}
        style={styles.sectionHeader}
      >
        <Text style={styles.sectionHeaderText}>Order Summary</Text>
      </LinearGradient>

      <View style={styles.sectionContent}>
        <Text style={styles.summaryRow}>
          Subtotal: ${formatPrice(subtotal)}
        </Text>
        <Text style={styles.summaryRow}>
          Processing Fee (3%): ${formatPrice(processingAmount)}
        </Text>
        <Text style={styles.summaryRowTotal}>Total: ${formatPrice(total)}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  sectionHeader: {
    padding: 12,
    borderRadius: 8,
    margin: 16,
  },
  sectionHeaderText: { fontSize: 18, color: "#fff", fontWeight: "600" },
  sectionContent: { marginHorizontal: 16, marginBottom: 24 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  errorText: { color: "red", fontSize: 12, marginBottom: 6 },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  switchText: { marginLeft: 8, fontSize: 14, color: "#333" },
  checkoutButton: {
    backgroundColor: "#264B8B",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  checkoutButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  summaryRow: { fontSize: 14, color: "#333", marginBottom: 6 },
  summaryRowTotal: { fontSize: 16, fontWeight: "bold", marginTop: 12 },
});
