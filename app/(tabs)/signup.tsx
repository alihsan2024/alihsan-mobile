import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image as ExpoImage } from "expo-image";
import LoadingScreen from "@/components/LoadingScreen";
import { register } from "@/utils/api";

const COVER_IMAGE_URL =
  "https://alihsan.s3.ap-southeast-2.amazonaws.com/gaza/1766535509636-alihsan-2025_11_17_10_40_IMG_4900%20Large.jpeg";

const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 88 : 68;

export default function SignupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fullNameInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  const validateForm = () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError("All fields are required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const nameParts = fullName.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || firstName;

      await register({
        email,
        password,
        firstName,
        lastName,
        timezoneOffset: new Date().getTimezoneOffset(),
      });

      Alert.alert(
        "Registration Successful",
        "Please check your email for verification.",
        [{ text: "OK", onPress: () => router.replace("/login") }]
      );
    } catch (err: any) {
      const msg = err.message || "Registration failed. Please try again.";
      setError(msg);
      Alert.alert("Registration Failed", msg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Creating account..." />;
  }

  return (
    <View style={styles.container}>
      {/* HEADER BANNER */}
      <View style={[styles.headerWrapper, { paddingTop: insets.top }]}>
        <ExpoImage
          source={{ uri: COVER_IMAGE_URL }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />

        <LinearGradient
          colors={["transparent", "rgba(38,75,139,0.6)", "rgba(38,75,139,0.9)"]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.guthenText}>Welcome</Text>
          <Text style={styles.headerTitle}>Join Our Community</Text>
          <Text style={styles.headerSubtitle}>
            Start making a documented difference today.
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Main Card */}
          <View style={styles.card}>

            <View style={styles.cardContent}>
              {/* Full Name Input */}
              <Text style={styles.label}>Full Name</Text>
              <TouchableOpacity
                activeOpacity={1}
                style={[styles.inputWrapper, styles.inputNormal]}
                onPress={() => fullNameInputRef.current?.focus()}
              >
                <Ionicons name="person-outline" size={18} color="#6B7280" />
                <TextInput
                  ref={fullNameInputRef}
                  placeholder="Enter full name"
                  placeholderTextColor="#9CA3AF"
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              </TouchableOpacity>

              {/* Email Input */}
              <Text style={styles.label}>Email Address</Text>
              <TouchableOpacity
                activeOpacity={1}
                style={[
                  styles.inputWrapper,
                  error ? styles.inputError : styles.inputNormal,
                ]}
                onPress={() => emailInputRef.current?.focus()}
              >
                <Ionicons name="mail-outline" size={18} color="#6B7280" />
                <TextInput
                  ref={emailInputRef}
                  placeholder="Enter email"
                  placeholderTextColor="#9CA3AF"
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </TouchableOpacity>

              {/* Password Input */}
              <Text style={styles.label}>Password</Text>
              <TouchableOpacity
                activeOpacity={1}
                style={[styles.inputWrapper, styles.inputNormal]}
                onPress={() => passwordInputRef.current?.focus()}
              >
                <Ionicons name="lock-closed-outline" size={18} color="#6B7280" />
                <TextInput
                  ref={passwordInputRef}
                  placeholder="Enter password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </TouchableOpacity>

              {/* Confirm Password Input */}
              <Text style={styles.label}>Confirm Password</Text>
              <TouchableOpacity
                activeOpacity={1}
                style={[styles.inputWrapper, styles.inputNormal]}
                onPress={() => confirmPasswordInputRef.current?.focus()}
              >
                <Ionicons name="lock-closed-outline" size={18} color="#6B7280" />
                <TextInput
                  ref={confirmPasswordInputRef}
                  placeholder="Confirm password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showConfirmPassword}
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </TouchableOpacity>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              {/* Create Account Button */}
              <TouchableOpacity
                style={styles.signupButton}
                onPress={handleSignup}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.signupButtonText}>Create Account</Text>
                <Ionicons name="chevron-forward" size={18} color="#010D26" />
              </TouchableOpacity>

              {/* Terms Text */}
              <Text style={styles.terms}>
                By signing up, you agree to our{" "}
                <Text style={styles.link}>Terms of Service</Text> and{" "}
                <Text style={styles.link}>Privacy Policy</Text>.
              </Text>

              {/* Login Link */}
              <View style={styles.loginLink}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push("/login")}>
                  <Text style={styles.loginLinkText}>Log In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  // Header Banner (same style as Zakat Calculator)
  headerWrapper: {
    height: 240,
    width: "100%",
    position: "relative",
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  headerContent: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
    zIndex: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  guthenText: {
    fontSize: 24,
    fontFamily: "Guthen Bloots",
    color: "#FFD602",
    marginBottom: 4,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    fontFamily: "AlbertSans_800ExtraBold",
    marginBottom: 8,
  },
  headerSubtitle: {
    color: "#E6ECFF",
    fontSize: 15,
    lineHeight: 22,
    fontFamily: "AlbertSans_400Regular",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: TAB_BAR_HEIGHT + 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  cardContent: {
    padding: 20,
  },
  label: {
    fontSize: 13,
    color: "#010D26",
    marginBottom: 8,
    fontFamily: "AlbertSans_600SemiBold",
  },
  inputWrapper: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  inputNormal: {
    borderColor: "#E5E7EB",
  },
  inputError: {
    borderColor: "#DC2626",
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#010D26",
    fontFamily: "AlbertSans_400Regular",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 12,
    marginBottom: 12,
    fontFamily: "AlbertSans_400Regular",
  },
  signupButton: {
    backgroundColor: "#FFD602",
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 8,
    marginBottom: 12,
  },
  signupButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#010D26",
    fontFamily: "AlbertSans_700Bold",
  },
  terms: {
    fontSize: 11,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 16,
    fontFamily: "AlbertSans_400Regular",
  },
  link: {
    color: "#264B8B",
    fontFamily: "AlbertSans_500Medium",
  },
  loginLink: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    fontSize: 13,
    color: "#6B7280",
    fontFamily: "AlbertSans_400Regular",
  },
  loginLinkText: {
    fontSize: 13,
    color: "#264B8B",
    fontWeight: "600",
    fontFamily: "AlbertSans_600SemiBold",
  },
});
