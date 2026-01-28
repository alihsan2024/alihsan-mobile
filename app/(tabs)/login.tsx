import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { loginUser } from "@/store/reduxSlice/authenticationSlice";
import LoadingScreen from "@/components/LoadingScreen";
import Google from "@/assets/google.svg";

const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 88 : 68;

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const authState = useSelector((state: any) => state.authentication);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const resultAction = await dispatch(
        loginUser({ body: { email, password }, keepSession: true }),
      );

      if (loginUser.fulfilled.match(resultAction)) {
        router.replace("/");
      } else {
        const errMsg =
          typeof resultAction.error === "string"
            ? resultAction.error
            : resultAction.error?.message || "Login failed. Please try again.";

        setError(errMsg);
        Alert.alert("Login Failed", errMsg);
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
      Alert.alert(
        "Login Failed",
        err.message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Logging in..." />;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={20} color="#010D26" />
            </TouchableOpacity>
          </View>

          {/* Main Card */}
          <View style={styles.card}>
            {/* Top Gradient Section */}
            <LinearGradient
              colors={["#EEF4FF", "#FFFFFF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardTopSection}
            >
              <Text style={styles.guthenText}>Welcome</Text>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>
                Enter details to continue your kindness journey.
              </Text>
            </LinearGradient>

            <View style={styles.cardContent}>
              {/* Google Button */}
              <TouchableOpacity style={styles.googleBtn} activeOpacity={0.8}>
                <Google width={18} height={18} />
                <Text style={styles.googleText}>Continue with Google</Text>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>Or</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Email Input */}
              <Text style={styles.label}>Email</Text>
              <View
                style={[
                  styles.inputWrapper,
                  error ? styles.inputError : styles.inputNormal,
                ]}
              >
                <Ionicons name="mail-outline" size={18} color="#6B7280" />
                <TextInput
                  placeholder="Enter email"
                  placeholderTextColor="#9CA3AF"
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              {/* Password Input */}
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputWrapper, styles.inputNormal]}>
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color="#6B7280"
                />
                <TextInput
                  placeholder="Enter password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                  autoComplete="password"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.loginButtonText}>Log In</Text>
                <Ionicons name="chevron-forward" size={18} color="#010D26" />
              </TouchableOpacity>

              {/* Forgot Password */}
              <TouchableOpacity style={styles.forgotButton}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>

              {/* Sign Up Link */}
              <View style={styles.signupLink}>
                <Text style={styles.signupText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => router.push("/signup")}>
                  <Text style={styles.signupLinkText}>Sign Up</Text>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: TAB_BAR_HEIGHT + 20,
  },
  headerSection: {
    position: "absolute",
    top: 12,
    left: 16,
    zIndex: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
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
  cardTopSection: {
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  guthenText: {
    fontSize: 22,
    fontFamily: "Guthen Bloots",
    color: "#FFD602",
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    color: "#010D26",
    fontFamily: "AlbertSans_800ExtraBold",
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    fontFamily: "AlbertSans_400Regular",
    textAlign: "center",
    lineHeight: 18,
  },
  cardContent: {
    padding: 20,
  },
  googleBtn: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  googleText: {
    fontSize: 14,
    color: "#010D26",
    fontFamily: "AlbertSans_600SemiBold",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    fontSize: 12,
    color: "#9CA3AF",
    fontFamily: "AlbertSans_500Medium",
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
  loginButton: {
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
  loginButtonText: {
    fontSize: 15,
    color: "#010D26",
    fontFamily: "AlbertSans_700Bold",
  },
  forgotButton: {
    alignItems: "center",
    marginBottom: 16,
  },
  forgotText: {
    fontSize: 13,
    color: "#264B8B",
    fontFamily: "AlbertSans_500Medium",
  },
  signupLink: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupText: {
    fontSize: 13,
    color: "#6B7280",
    fontFamily: "AlbertSans_400Regular",
  },
  signupLinkText: {
    fontSize: 13,
    color: "#264B8B",
    fontFamily: "AlbertSans_600SemiBold",
  },
});
