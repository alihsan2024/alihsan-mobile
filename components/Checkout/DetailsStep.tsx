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

      await AsyncStorage.setItem(
        "checkoutDetails",
        JSON.stringify({
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
        })
      );
    };

    persist();
  }, [formik.values.fullName, formik.values.email, formik.values.phone]);

  return (
    <View>
      <Text style={styles.sectionTitle}>Your Identity</Text>
      <Text style={styles.helperText}>
        Ensure your details are correct for receipts.
      </Text>

      <Input
        label="Full Name"
        placeholder="Enter full name"
        value={formik.values.fullName}
        onChangeText={formik.handleChange("fullName")}
        error={formik.touched.fullName ? formik.errors.fullName : undefined}
      />

      <Input
        label="Email"
        placeholder="Enter email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={formik.values.email}
        onChangeText={formik.handleChange("email")}
        error={formik.touched.email ? formik.errors.email : undefined}
      />

      <Input
        label="Phone"
        placeholder="Enter phone number"
        keyboardType="phone-pad"
        value={formik.values.phone}
        onChangeText={formik.handleChange("phone")}
        error={formik.touched.phone ? formik.errors.phone : undefined}
      />
    </View>
  );
};

export default DetailsStep;

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  helperText: { color: "#777", marginBottom: 16 },
});
