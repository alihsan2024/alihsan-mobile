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
import HeroBackground from "@/components/ui/GradientImage";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { loginUser } from "@/store/reduxSlice/authenticationSlice";
import LoadingScreen from "@/components/LoadingScreen";
import Google from "@/assets/google.svg";
import Button from "@/components/ui/Button";

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
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
        loginUser({ body: { email, password }, keepSession: true })
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
        err.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Logging in..." />;
  }

  return (
    <View style={styles.container}>
      {/* ===== TOP IMAGE ===== */}
      <HeroBackground
        source={require("@/assets/header-image.png")}
        containerStyle={{ height: 220 }}
        gradientLocations={[0.6, 1]}
      />

      {/* ===== CONTENT ===== */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Enter details to continue your kindness journey.
          </Text>

          {/* ===== GOOGLE BUTTON (UI ONLY) ===== */}
          <TouchableOpacity style={styles.googleBtn} activeOpacity={0.85}>
            <Google width={20} height={20} />
            <Text style={styles.googleText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* ===== DIVIDER ===== */}
          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>Or Log in with your email</Text>
            <View style={styles.line} />
          </View>

          {/* ===== ERROR MESSAGE ===== */}

          {/* ===== EMAIL ===== */}
          <Text style={styles.label}>Email</Text>
          <View
            style={[
              styles.inputWrapper,
              error ? styles.inputErrorBorder : styles.inputNormalBorder,
            ]}
          >
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
          {/* ===== PASSWORD ===== */}
          <Text style={styles.label}>Password</Text>
          <View style={[styles.inputWrapper, styles.inputNormalBorder]}>
            <TextInput
              placeholder="Enter Password"
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
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>

          {/* ===== LOGIN BUTTON ===== */}
          <Button
            label="Log In"
            variant="secondary"
            disabled={loading}
            onPress={handleLogin}
            textStyle={{ fontSize: 14, fontWeight: "500" }}
          />

          {/* ===== FORGOT PASSWORD ===== */}
          <TouchableOpacity>
            <Text style={styles.forgot}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/signup")}>
            <Text style={styles.forgot}>Don't have an account? Sign Up</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

/* ================= STYLES (UNCHANGED) ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "600",
    color: "#010D26",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#010D26",
    opacity: 0.6,
    marginBottom: 24,
  },
  googleBtn: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  googleText: {
    fontSize: 14,
    color: "#010D26",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#010D261A",
  },
  dividerText: {
    fontSize: 12,
    color: "#010D26",
    marginHorizontal: 10,
  },
  label: {
    fontSize: 12,
    color: "#010D26",
    marginBottom: 6,
  },
  inputErrorBorder: {
    borderColor: "#FF5582",
  },
  inputNormalBorder: {
    borderColor: "#E5E7EB",
  },
  inputWrapper: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#010D26",
  },
  loginBtn: {
    height: 48,
    borderRadius: 10,
    backgroundColor: "#FACC15",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  loginText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#010D26",
  },
  forgot: {
    marginTop: 16,
    fontSize: 14,
    color: "#010D26",
    textAlign: "center",
    textDecorationLine: "underline",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 12,
    marginBottom: 12,
  },
});
