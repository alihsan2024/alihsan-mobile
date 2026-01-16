import React, { useState } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import HeroBackground from "@/components/ui/GradientImage";
import LoadingScreen from "@/components/LoadingScreen";
import Button from "@/components/ui/Button";
import { register } from "@/utils/api";

export default function SignupScreen() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      {/* ===== HEADER IMAGE ===== */}
      <HeroBackground
        source={require("@/assets/header-image.png")}
        containerStyle={{ height: 220 }}
        gradientLocations={[0.6, 1]}
      />

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
          <Text style={styles.title}>Join Al-Ihsan Foundation</Text>
          <Text style={styles.subtitle}>
            Start making a documented difference today.
          </Text>

          {/* ===== FULL NAME ===== */}
          <Text style={styles.label}>Full Name</Text>
          <View style={[styles.inputWrapper]}>
            <TextInput
              placeholder="Enter full name"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
          </View>

          {/* ===== EMAIL ===== */}
          <Text style={styles.label}>Email Address</Text>
          <View style={[styles.inputWrapper]}>
            <TextInput
              placeholder="Enter email"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* ===== PASSWORD ===== */}
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <TextInput
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
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>

          {/* ===== CONFIRM PASSWORD ===== */}
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Enter password"
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
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* ===== CTA ===== */}
          <Button
            label="Create Account"
            variant="secondary"
            onPress={handleSignup}
            textStyle={{ fontSize: 14, fontWeight: "500" }}
          />

          <Text style={styles.terms}>
            By signing up, you agree to our{" "}
            <Text style={styles.link}>Terms of Service</Text> and{" "}
            <Text style={styles.link}>Privacy Policy</Text>.
          </Text>

          <TouchableOpacity onPress={() => router.push("/login")}>
            <Text
              style={{
                marginTop: 16,
                fontSize: 14,
                color: "#010D26",
                textAlign: "center",
                textDecorationLine: "underline",
              }}
            >
              Already have an account? Log In
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { paddingHorizontal: 20, paddingTop: 24 },
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
  label: {
    fontSize: 12,
    color: "#010D26",
    marginBottom: 6,
  },
  inputWrapper: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#010D26",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 12,
    marginBottom: 12,
  },
  terms: {
    fontSize: 12,
    color: "#010D26",
    textAlign: "center",
    marginTop: 16,
    opacity: 0.5,
  },
  link: {
    textDecorationLine: "underline",
    color: "#010D26",
  },
});
