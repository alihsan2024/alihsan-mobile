import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as yup from "yup";
import Input from "@/components/ui/inputs/input";
import PhoneInput from "@/components/ui/inputs/PhoneInput";
import {
  changePassword,
  getProfile,
  updateProfile,
} from "@/store/reduxSlice/authenticationSlice";
import { setProfileDetails } from "@/store/reduxSlice/profileStatisticsSlice";
import { useToast } from "@/context/ToastContext";
import { countriesList, getCountryByCode } from "@/utils/countries";

const DEFAULT_COUNTRY_CODE = "AU";

const NAME_REGEX = /^[a-zA-Z\xC0-￿]+([ \-'_]?[a-zA-Z\xC0-￿]+)*[.]?\s*$/;

const splitDialCode = (stored: string) => {
  if (!stored || !stored.startsWith("+")) {
    return { phone: stored || "", countryCode: DEFAULT_COUNTRY_CODE };
  }
  const matches = countriesList
    .filter((country) => stored.startsWith(country.dialCode))
    .sort((a, b) => b.dialCode.length - a.dialCode.length);

  const match = matches[0];
  if (!match) return { phone: stored, countryCode: DEFAULT_COUNTRY_CODE };

  return {
    phone: stored.substring(match.dialCode.length),
    countryCode: match.code,
  };
};

const detailsSchema = yup.object().shape({
  firstName: yup
    .string()
    .trim()
    .required("First name is required")
    .matches(NAME_REGEX, "Enter a valid first name"),
  lastName: yup
    .string()
    .trim()
    .required("Last name is required")
    .matches(NAME_REGEX, "Enter a valid last name"),
  displayName: yup.string().trim(),
  phone: yup
    .string()
    .trim()
    .matches(/^[0-9]*$/, "Digits only")
    .max(15, "Phone number is too long"),
  countryCode: yup.string().required(),
  address: yup.string().trim(),
  city: yup.string().trim(),
  state: yup.string().trim(),
  zip: yup.string().trim(),
  country: yup.string().trim(),
});

const passwordSchema = yup.object().shape({
  oldPassword: yup.string().required("Current password is required"),
  newPassword: yup
    .string()
    .required("New password is required")
    .min(8, "Must be at least 8 characters")
    .matches(/[a-z]/, "Must include a lowercase letter")
    .matches(/[A-Z]/, "Must include an uppercase letter")
    .matches(/[0-9]/, "Must include a number")
    .matches(/[^\w]/, "Must include a special character"),
  confirmPassword: yup
    .string()
    .required("Please confirm your new password")
    .oneOf([yup.ref("newPassword")], "Passwords do not match"),
});

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<any>();
  const { showToast } = useToast();

  const profileDetails = useSelector(
    (state: any) => state.profileStatistics.profileDetails,
  );
  const authUser = useSelector((state: any) => state.authentication.user);

  const [loading, setLoading] = useState(!profileDetails);
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const source = profileDetails || authUser;
  const canChangePassword = source?.authType === "email";

  const initialValues = useMemo(() => {
    const { phone, countryCode } = splitDialCode(source?.phone || "");
    return {
      firstName: source?.firstName || "",
      lastName: source?.lastName || "",
      displayName: source?.displayName || "",
      phone,
      countryCode,
      address: source?.address || "",
      city: source?.city || "",
      state: source?.state || "",
      zip: source?.zip || "",
      country: source?.country || "",
    };
  }, [source]);

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: detailsSchema,
    onSubmit: async (values) => {
      setSaving(true);
      try {
        const dialCode =
          getCountryByCode(values.countryCode)?.dialCode || "+61";

        const payload: Record<string, string> = {
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
        };

        const optional: Record<string, string> = {
          displayName: values.displayName.trim(),
          address: values.address.trim(),
          city: values.city.trim(),
          state: values.state.trim(),
          zip: values.zip.trim(),
          country: values.country.trim(),
        };
        Object.keys(optional).forEach((key) => {
          if (optional[key]) payload[key] = optional[key];
        });

        if (values.phone.trim()) {
          payload.phone = dialCode + values.phone.trim();
        }

        await dispatch(updateProfile(payload)).unwrap();

        const refreshed = await dispatch(getProfile());
        if (refreshed?.payload) {
          dispatch(setProfileDetails(refreshed.payload));
        }

        showToast({ message: "Profile updated", type: "success" });
        router.back();
      } catch (e: any) {
        showToast({
          message:
            e?.message || "Could not update your profile. Please try again.",
          type: "error",
        });
      } finally {
        setSaving(false);
      }
    },
  });

  const passwordFormik = useFormik({
    initialValues: { oldPassword: "", newPassword: "", confirmPassword: "" },
    validationSchema: passwordSchema,
    onSubmit: async (values, { resetForm }) => {
      setSavingPassword(true);
      try {
        await dispatch(
          changePassword({
            oldPassword: values.oldPassword,
            newPassword: values.newPassword,
          }),
        ).unwrap();

        resetForm();
        showToast({ message: "Password updated", type: "success" });
      } catch (e: any) {
        showToast({
          message:
            e?.message || "Could not update your password. Please try again.",
          type: "error",
        });
      } finally {
        setSavingPassword(false);
      }
    },
  });

  useEffect(() => {
    if (profileDetails) {
      setLoading(false);
      return;
    }
    let active = true;
    dispatch(getProfile())
      .then((action: any) => {
        if (active && action?.payload) {
          dispatch(setProfileDetails(action.payload));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [dispatch, profileDetails]);

  const fieldError = (form: any, key: string) =>
    form.touched[key] && form.errors[key] ? form.errors[key] : undefined;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={22} color="#010D26" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit profile</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2161CD" />
        </View>
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
        >
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: Math.max(insets.bottom, 16) + 24 },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Personal details</Text>

              <Input
                label="First name"
                placeholder="Enter first name"
                placeholderTextColor="#9CA3AF"
                value={formik.values.firstName}
                onChangeText={formik.handleChange("firstName")}
                onBlur={formik.handleBlur("firstName")}
                error={fieldError(formik, "firstName")}
                autoCapitalize="words"
              />
              <Input
                label="Last name"
                placeholder="Enter last name"
                placeholderTextColor="#9CA3AF"
                value={formik.values.lastName}
                onChangeText={formik.handleChange("lastName")}
                onBlur={formik.handleBlur("lastName")}
                error={fieldError(formik, "lastName")}
                autoCapitalize="words"
              />
              <Input
                label="Display name"
                placeholder="Shown on public donations"
                placeholderTextColor="#9CA3AF"
                value={formik.values.displayName}
                onChangeText={formik.handleChange("displayName")}
                onBlur={formik.handleBlur("displayName")}
                error={fieldError(formik, "displayName")}
              />

              <Input
                label="Email address"
                value={source?.email || ""}
                editable={false}
              />
              <Text style={styles.hint}>Email cannot be changed</Text>

              <PhoneInput
                label="Phone"
                value={formik.values.phone}
                countryCode={formik.values.countryCode}
                onChangeText={formik.handleChange("phone")}
                onCountryChange={(code) =>
                  formik.setFieldValue("countryCode", code)
                }
                error={fieldError(formik, "phone")}
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Address</Text>

              <Input
                label="Street address"
                placeholder="Enter street address"
                placeholderTextColor="#9CA3AF"
                value={formik.values.address}
                onChangeText={formik.handleChange("address")}
                onBlur={formik.handleBlur("address")}
                error={fieldError(formik, "address")}
              />
              <View style={styles.row}>
                <Input
                  small
                  label="City"
                  placeholder="City"
                  placeholderTextColor="#9CA3AF"
                  value={formik.values.city}
                  onChangeText={formik.handleChange("city")}
                  onBlur={formik.handleBlur("city")}
                  error={fieldError(formik, "city")}
                />
                <View style={{ width: 12 }} />
                <Input
                  small
                  label="State"
                  placeholder="State"
                  placeholderTextColor="#9CA3AF"
                  value={formik.values.state}
                  onChangeText={formik.handleChange("state")}
                  onBlur={formik.handleBlur("state")}
                  error={fieldError(formik, "state")}
                />
              </View>
              <View style={styles.row}>
                <Input
                  small
                  label="Postcode"
                  placeholder="Postcode"
                  placeholderTextColor="#9CA3AF"
                  value={formik.values.zip}
                  onChangeText={formik.handleChange("zip")}
                  onBlur={formik.handleBlur("zip")}
                  error={fieldError(formik, "zip")}
                />
                <View style={{ width: 12 }} />
                <Input
                  small
                  label="Country"
                  placeholder="Country"
                  placeholderTextColor="#9CA3AF"
                  value={formik.values.country}
                  onChangeText={formik.handleChange("country")}
                  onBlur={formik.handleBlur("country")}
                  error={fieldError(formik, "country")}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, saving && styles.buttonDisabled]}
              onPress={() => formik.handleSubmit()}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#010D26" />
              ) : (
                <Text style={styles.primaryButtonText}>Save changes</Text>
              )}
            </TouchableOpacity>

            {canChangePassword ? (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Change password</Text>

                <View style={styles.passwordField}>
                  <Input
                    label="Current password"
                    placeholder="Enter current password"
                    placeholderTextColor="#9CA3AF"
                    value={passwordFormik.values.oldPassword}
                    onChangeText={passwordFormik.handleChange("oldPassword")}
                    onBlur={passwordFormik.handleBlur("oldPassword")}
                    error={fieldError(passwordFormik, "oldPassword")}
                    secureTextEntry={!showOldPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowOldPassword(!showOldPassword)}
                    accessibilityRole="button"
                    accessibilityLabel={
                      showOldPassword ? "Hide password" : "Show password"
                    }
                  >
                    <Ionicons
                      name={showOldPassword ? "eye-off-outline" : "eye-outline"}
                      size={18}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.passwordField}>
                  <Input
                    label="New password"
                    placeholder="Enter new password"
                    placeholderTextColor="#9CA3AF"
                    value={passwordFormik.values.newPassword}
                    onChangeText={passwordFormik.handleChange("newPassword")}
                    onBlur={passwordFormik.handleBlur("newPassword")}
                    error={fieldError(passwordFormik, "newPassword")}
                    secureTextEntry={!showNewPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    accessibilityRole="button"
                    accessibilityLabel={
                      showNewPassword ? "Hide password" : "Show password"
                    }
                  >
                    <Ionicons
                      name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                      size={18}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                </View>

                <Input
                  label="Confirm new password"
                  placeholder="Re-enter new password"
                  placeholderTextColor="#9CA3AF"
                  value={passwordFormik.values.confirmPassword}
                  onChangeText={passwordFormik.handleChange("confirmPassword")}
                  onBlur={passwordFormik.handleBlur("confirmPassword")}
                  error={fieldError(passwordFormik, "confirmPassword")}
                  secureTextEntry
                  autoCapitalize="none"
                />

                <Text style={styles.hint}>
                  At least 8 characters, with an uppercase and lowercase letter,
                  a number and a special character.
                </Text>

                <TouchableOpacity
                  style={[
                    styles.secondaryButton,
                    savingPassword && styles.buttonDisabled,
                  ]}
                  onPress={() => passwordFormik.handleSubmit()}
                  disabled={savingPassword}
                  activeOpacity={0.85}
                >
                  {savingPassword ? (
                    <ActivityIndicator size="small" color="#2161CD" />
                  ) : (
                    <Text style={styles.secondaryButtonText}>
                      Update password
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Change password</Text>
                <Text style={styles.hint}>
                  You signed in with a social account, so your password is
                  managed by that provider.
                </Text>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "800",
    color: "#010D26",
    fontFamily: "AlbertSans_800ExtraBold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#010D26",
    marginBottom: 12,
    fontFamily: "AlbertSans_700Bold",
  },
  row: {
    flexDirection: "row",
  },
  hint: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 12,
    marginTop: -6,
  },
  passwordField: {
    position: "relative",
  },
  eyeButton: {
    position: "absolute",
    right: 12,
    top: 32,
    padding: 4,
  },
  primaryButton: {
    backgroundColor: "#FFD602",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#010D26",
    fontFamily: "AlbertSans_700Bold",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#2161CD",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2161CD",
    fontFamily: "AlbertSans_700Bold",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
