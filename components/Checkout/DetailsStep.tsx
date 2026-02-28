import React, { useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";
import { secureSetItem } from "@/utils/secureStorage";
import { useFormik } from "formik";
import * as yup from "yup";
import api from "@/utils/api";
import Input from "../ui/inputs/input";
import PhoneInput from "../ui/inputs/PhoneInput";

type Props = {
  values: {
    fullName: string;
    email: string;
    phone: string;
    countryCode: string;
  };
  onChange: (values: Props["values"]) => void;
  onValidChange?: (isValid: boolean) => void;
};

type FormValues = {
  fullName: string;
  email: string;
  phone: string;
  countryCode: string;
};

const validationSchema = yup.object({
  fullName: yup
    .string()
    .trim()
    .required("Full name is required")
    .matches(/^[a-zA-Z\s'-]+$/, "Full name cannot contain numbers or special characters"),
  email: yup
    .string()
    .email("Invalid email address")
    .required("Email is required")
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address"),
  phone: yup
    .string()
    .required("Phone number is required")
    .matches(/^[0-9]+$/, "Phone number must contain only digits")
    .min(6, "Phone number is too short")
    .max(15, "Phone number is too long"),
  countryCode: yup.string().required("Country code is required"),
});

const DetailsStep = ({ values, onChange, onValidChange }: Props) => {
  const prevValuesRef = useRef<FormValues | null>(null);
  const user = useSelector((state: any) => state.authentication.user);
  const isAuthenticated = !!user;

  const formik = useFormik<FormValues>({
    initialValues: {
      fullName: values.fullName || "",
      email: values.email || "",
      phone: values.phone || "",
      countryCode: values.countryCode || "AU",
    },
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
      prev.phone !== formik.values.phone ||
      prev.countryCode !== formik.values.countryCode
    ) {
      prevValuesRef.current = formik.values;
      onChange({
        fullName: formik.values.fullName,
        email: formik.values.email,
        phone: formik.values.phone,
        countryCode: formik.values.countryCode,
      });
    }
  }, [formik.values, onChange]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!isAuthenticated) return;

      try {
        const res = await api.get("/profile");
        const profile = res.data?.payload;

        if (profile) {
          // Extract country code from phone if it exists (format: +61XXXXXXXXX)
          let phone = profile.phone || "";
          let countryCode = "AU";
          
          if (phone.startsWith("+")) {
            // Try to match country code
            const dialCodes = ["+61", "+1", "+44", "+92", "+971", "+966"];
            for (const dialCode of dialCodes) {
              if (phone.startsWith(dialCode)) {
                phone = phone.substring(dialCode.length);
                // Map dial code to country code
                if (dialCode === "+61") countryCode = "AU";
                else if (dialCode === "+1") countryCode = "US";
                else if (dialCode === "+44") countryCode = "GB";
                else if (dialCode === "+92") countryCode = "PK";
                else if (dialCode === "+971") countryCode = "AE";
                else if (dialCode === "+966") countryCode = "SA";
                break;
              }
            }
          }

          formik.setValues({
            fullName: `${profile.firstName || ""} ${
              profile.lastName || ""
            }`.trim(),
            email: profile.email || "",
            phone: phone,
            countryCode: countryCode,
          });
        }
      } catch (e) {
        // Profile load failed - silently continue
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

      // Get dial code for the selected country
      const { getCountryByCode } = require("@/utils/countries");
      const country = getCountryByCode(formik.values.countryCode);
      const dialCode = country?.dialCode || "+61";
      
      // Combine dial code with phone number
      const fullPhone = dialCode + formik.values.phone;

      const checkoutDetails = {
        firstName,
        lastName,
        email: formik.values.email,
        phone: fullPhone,
        address: "N/A",
        city: "N/A",
        state: "N/A",
        zip: "00000",
        country: formik.values.countryCode,
        basketItems: [],
        status: true,
      };

      await secureSetItem(
        "checkoutDetails",
        JSON.stringify(checkoutDetails)
      );
    };

    persist();
  }, [formik.values.fullName, formik.values.email, formik.values.phone, formik.values.countryCode]);

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

        <PhoneInput
          label="Phone"
          value={formik.values.phone}
          countryCode={formik.values.countryCode}
          onChangeText={formik.handleChange("phone")}
          onCountryChange={(code) => formik.setFieldValue("countryCode", code)}
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
