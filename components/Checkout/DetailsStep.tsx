import React, { useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSelector } from "react-redux";
import { useFormik } from "formik";
import * as yup from "yup";
import api from "@/utils/api";
import Input from "../ui/inputs/input";

type Props = {
  values: {
    fullName: string;
    email: string;
    phone: string;
  };
  onChange: (values: Props["values"]) => void;
  onValidChange?: (isValid: boolean) => void;
};

type FormValues = {
  fullName: string;
  email: string;
  phone: string;
};

const validationSchema = yup.object({
  fullName: yup.string().trim().required("Full name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup.string().required("Phone number is required"),
});

const DetailsStep = ({ values, onChange, onValidChange }: Props) => {
  const prevValuesRef = useRef<FormValues | null>(null);
  const user = useSelector((state: any) => state.authentication.user);
  const isAuthenticated = !!user;

  const formik = useFormik<FormValues>({
    initialValues: values,
    validationSchema,
    validateOnMount: true,
    onSubmit: () => {},
  });
  useEffect(() => {
    const prev = prevValuesRef.current;

    if (
      !prev ||
      prev.fullName !== formik.values.fullName ||
      prev.email !== formik.values.email ||
      prev.phone !== formik.values.phone
    ) {
      prevValuesRef.current = formik.values;
      onChange(formik.values);
    }
  }, [formik.values, onChange]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!isAuthenticated) return;

      try {
        const res = await api.get("/profile");
        const profile = res.data?.payload;

        if (profile) {
          formik.setValues({
            fullName: `${profile.firstName || ""} ${
              profile.lastName || ""
            }`.trim(),
            email: profile.email || "",
            phone: profile.phone || "",
          });
        }
      } catch (e) {
        console.log("Profile load failed", e);
      }
    };

    loadProfile();
  }, [isAuthenticated]);

  useEffect(() => {
    onValidChange?.(formik.isValid);
  }, [formik.isValid, onValidChange]);

  useEffect(() => {
    const persist = async () => {
      const parts = formik.values.fullName.trim().split(/\s+/);
      const firstName = parts[0] ?? "";
      const lastName = parts.slice(1).join(" ") || firstName;

      const checkoutDetails = {
        firstName,
        lastName,
        email: formik.values.email,
        phone: formik.values.phone,
        address: "N/A",
        city: "N/A",
        state: "N/A",
        zip: "00000",
        country: "PK",
        basketItems: [],
        status: true,
      };

      console.log("=== STEP 1: STORING DETAILS ===");
      console.log("Form values:", {
        fullName: formik.values.fullName,
        email: formik.values.email,
        phone: formik.values.phone,
      });
      console.log("Parsed details:", {
        firstName,
        lastName,
        email: checkoutDetails.email,
        phone: checkoutDetails.phone,
      });
      console.log("Full checkoutDetails object:", checkoutDetails);

      await AsyncStorage.setItem(
        "checkoutDetails",
        JSON.stringify(checkoutDetails)
      );

      // Verify it was stored
      const stored = await AsyncStorage.getItem("checkoutDetails");
      const parsed = stored ? JSON.parse(stored) : null;
      console.log("Verification - Retrieved from AsyncStorage:", parsed);
      console.log("=== END STEP 1 STORAGE ===");
    };

    persist();
  }, [formik.values.fullName, formik.values.email, formik.values.phone]);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Your Identity</Text>
      <Text style={styles.helperText}>
        Ensure your details are correct for receipts.
      </Text>

      {isAuthenticated && (
        <View style={styles.disclaimerContainer}>
          <Text style={styles.disclaimerText}>
            To update your name, email, or phone number, please visit your profile page.
          </Text>
        </View>
      )}

      <View style={styles.formContainer}>
        <Input
          label="Full Name"
          placeholder="Enter full name"
          value={formik.values.fullName}
          onChangeText={formik.handleChange("fullName")}
          error={formik.touched.fullName ? formik.errors.fullName : undefined}
          editable={!isAuthenticated}
        />

        <Input
          label="Email"
          placeholder="Enter email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={formik.values.email}
          onChangeText={formik.handleChange("email")}
          error={formik.touched.email ? formik.errors.email : undefined}
          editable={!isAuthenticated}
        />

        <Input
          label="Phone"
          placeholder="Enter phone number"
          keyboardType="phone-pad"
          value={formik.values.phone}
          onChangeText={formik.handleChange("phone")}
          error={formik.touched.phone ? formik.errors.phone : undefined}
          editable={!isAuthenticated}
        />
      </View>
    </View>
  );
};

export default DetailsStep;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#010D26",
    marginBottom: 4,
    fontFamily: "AlbertSans_800ExtraBold",
    textAlign: "center",
    width: "100%",
  },
  helperText: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 16,
    fontFamily: "AlbertSans_400Regular",
    textAlign: "center",
    width: "100%",
  },
  formContainer: {
    width: "100%",
    gap: 12,
  },
  disclaimerContainer: {
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    width: "100%",
  },
  disclaimerText: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "AlbertSans_400Regular",
    textAlign: "center",
    lineHeight: 16,
  },
});
