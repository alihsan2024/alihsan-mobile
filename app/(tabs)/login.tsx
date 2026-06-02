import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image as ExpoImage } from "expo-image";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { loginUser, socialMediaLogin } from "@/store/reduxSlice/authenticationSlice";
import LoadingScreen from "@/components/LoadingScreen";
import { useToast } from "@/context/ToastContext";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { fetchGoogleUserInfo, getGoogleWebClientId, getGoogleIosClientId, getGoogleAndroidClientId } from "@/utils/googleAuth";

WebBrowser.maybeCompleteAuthSession();

const COVER_IMAGE_URL =
  "https://alihsan.s3.ap-southeast-2.amazonaws.com/gaza/1766468664003-alihsan-IMG_3894%20-%20Blog%201.JPG";

const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 88 : 68;

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const authState = useSelector((state: any) => state.authentication);
  const { showToast } = useToast();
  const user = authState?.user;
  const isAuthenticated = !!user;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [appleAvailable, setAppleAvailable] = useState(false);
  const showGoogleLogin = Platform.OS !== "android";
  const hasSocialLogin = appleAvailable || showGoogleLogin;
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  const [_request, googleResponse, promptGoogleAsync] = Google.useAuthRequest({
    webClientId: getGoogleWebClientId(),
    iosClientId: getGoogleIosClientId() ?? getGoogleWebClientId(),
    androidClientId: getGoogleAndroidClientId() ?? getGoogleWebClientId(),
  });

  // Check Apple Sign In availability (not available on Simulator)
  useEffect(() => {
    if (Platform.OS === "ios") {
      AppleAuthentication.isAvailableAsync().then(setAppleAvailable);
    }
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(tabs)/profile");
    }
  }, [isAuthenticated, router]);

  // Handle Google OAuth response
  useEffect(() => {
    if (googleResponse?.type === "success" && googleResponse.authentication?.accessToken) {
      handleGoogleAuth(googleResponse.authentication.accessToken);
    }
  }, [googleResponse]);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      showToast({
        message: "Please fill in all fields",
        type: "error",
        duration: 3000,
      });
      return;
    }

    setError("");
    setLoading(true);

    try {
      const resultAction = await dispatch(
        loginUser({ body: { email, password }, keepSession: true })
      );

      if (loginUser.fulfilled.match(resultAction)) {
        router.replace("/(tabs)/profile");
      } else {
        const errMsg =
          typeof resultAction.error === "string"
            ? resultAction.error
            : resultAction.error?.message || "Login failed. Please try again.";

        setError(errMsg);
        
        // Show toast notification for errors
        const errorMessage = errMsg.toLowerCase().includes("invalid email") || 
                           errMsg.toLowerCase().includes("invalid password") ||
                           errMsg.toLowerCase().includes("email or password")
          ? "Invalid email or password"
          : errMsg;
        
        showToast({
          message: errorMessage,
          type: "error",
          duration: 4000,
        });
      }
    } catch (err: any) {
      const errorMessage = err.message || "Login failed. Please try again.";
      setError(errorMessage);
      
      const toastMessage = errorMessage.toLowerCase().includes("invalid email") || 
                           errorMessage.toLowerCase().includes("invalid password") ||
                           errorMessage.toLowerCase().includes("email or password")
        ? "Invalid email or password"
        : errorMessage;
      
      showToast({
        message: toastMessage,
        type: "error",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    try {
      setLoading(true);
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      console.log("[Apple] credential:", JSON.stringify({
        user: credential.user,
        email: credential.email,
        fullName: credential.fullName,
        hasIdentityToken: !!credential.identityToken,
      }));

      if (!credential.identityToken) {
        showToast({
          message: "Apple did not return a sign-in token. Please try again.",
          type: "error",
          duration: 6000,
        });
        return;
      }

      const result = await dispatch(
        socialMediaLogin({
          body: {
            identityToken: credential.identityToken,
            email: credential.email || "",
            appleUserId: credential.user,
            firstName: credential.fullName?.givenName || "",
            lastName: credential.fullName?.familyName || "",
          },
          provider: "apple",
          keepSession: true,
        })
      );

      console.log("[Apple] dispatch result:", JSON.stringify(result));

      if (socialMediaLogin.fulfilled.match(result)) {
        router.replace("/(tabs)/profile");
      } else {
        const msg = result.error?.message || "Apple Sign In failed. Please try again.";
        console.log("[Apple] error:", msg);
        showToast({ message: msg, type: "error", duration: 6000 });
      }
    } catch (err: any) {
      console.log("[Apple] catch error:", err?.code, err?.message);
      if (err.code !== "ERR_REQUEST_CANCELED") {
        showToast({
          message: err?.message || "Apple Sign In failed. Please try again.",
          type: "error",
          duration: 6000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async (accessToken: string) => {
    try {
      setLoading(true);
      const { email: gEmail, firstName, lastName } = await fetchGoogleUserInfo(accessToken);

      const result = await dispatch(
        socialMediaLogin({
          body: { email: gEmail, firstName, lastName, accessToken },
          provider: "google",
          keepSession: true,
        })
      );

      if (socialMediaLogin.fulfilled.match(result)) {
        router.replace("/(tabs)/profile");
      } else {
        showToast({
          message: result.error?.message || "Google Sign In failed. Please try again.",
          type: "error",
          duration: 4000,
        });
      }
    } catch (err: any) {
      showToast({
        message: "Google Sign In failed. Please try again.",
        type: "error",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Logging in..." />;
  }

  // Show a nice message if already logged in (before redirect)
  if (isAuthenticated) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loggedInContainer}>
          <View style={styles.loggedInCard}>
            <View style={styles.loggedInIconContainer}>
              <Ionicons name="checkmark-circle" size={64} color="#16A34A" />
            </View>
            <Text style={styles.loggedInTitle}>Already Logged In</Text>
            <Text style={styles.loggedInSubtitle}>
              You're already signed in. Redirecting to your profile...
            </Text>
            {user?.firstName && (
              <Text style={styles.loggedInName}>
                Welcome back, {user.firstName}!
              </Text>
            )}
          </View>
        </View>
      </View>
    );
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
          <Text style={styles.headerTitle}>Welcome Back</Text>
          <Text style={styles.headerSubtitle}>
            Enter details to continue your kindness journey.
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
              {/* Email Input */}
              <Text style={styles.label}>Email</Text>
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
                  autoComplete="email"
                />
              </TouchableOpacity>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

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
                  autoCapitalize="none"
                  autoComplete="password"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </TouchableOpacity>

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
              <TouchableOpacity
                style={styles.forgotButton}
                onPress={() => router.push("/reset-password")}
              >
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>

              {hasSocialLogin && (
                <>
                  {/* Divider */}
                  <View style={styles.dividerRow}>
                    <View style={styles.divider} />
                    <Text style={styles.dividerText}>or continue with</Text>
                    <View style={styles.divider} />
                  </View>

                  {/* Social Login Buttons */}
                  <View style={styles.socialButtons}>
                    {appleAvailable && (
                      <TouchableOpacity
                        style={styles.socialButton}
                        onPress={handleAppleLogin}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="logo-apple" size={20} color="#010D26" />
                        <Text style={styles.socialButtonText}>Apple</Text>
                      </TouchableOpacity>
                    )}
                    {showGoogleLogin && (
                      <TouchableOpacity
                        style={styles.socialButton}
                        onPress={() => promptGoogleAsync()}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="logo-google" size={20} color="#EA4335" />
                        <Text style={styles.socialButtonText}>Google</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </>
              )}

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
    fontWeight: "700",
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
    fontWeight: "600",
    fontFamily: "AlbertSans_600SemiBold",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    fontSize: 12,
    color: "#9CA3AF",
    fontFamily: "AlbertSans_400Regular",
  },
  socialButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  socialButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#010D26",
    fontFamily: "AlbertSans_600SemiBold",
  },
  loggedInContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loggedInCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    width: "100%",
    maxWidth: 400,
  },
  loggedInIconContainer: {
    marginBottom: 20,
  },
  loggedInTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#010D26",
    fontFamily: "AlbertSans_800ExtraBold",
    marginBottom: 12,
    textAlign: "center",
  },
  loggedInSubtitle: {
    fontSize: 15,
    color: "#6B7280",
    fontFamily: "AlbertSans_400Regular",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 8,
  },
  loggedInName: {
    fontSize: 16,
    color: "#2161CD",
    fontFamily: "AlbertSans_600SemiBold",
    textAlign: "center",
    marginTop: 8,
  },
});
