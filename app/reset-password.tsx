import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, Alert } from "react-native";
import { useRouter } from "expo-router";
import HeroBackground from "@/components/ui/GradientImage";
import Button from "@/components/ui/Button";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleReset = async () => {
    if (!email.trim()) {
      setError("Email address is required");
      return;
    }

    setError("");

    // 🔌 Hook your API here later
    // await sendResetLink(email);

    Alert.alert(
      "Reset Link Sent",
      "Please check your email for password reset instructions.",
      [{ text: "OK", onPress: () => router.push("/create-new-password") }]
    );
  };

  return (
    <View style={styles.container}>
      {/* ===== HEADER IMAGE ===== */}
      <HeroBackground
        source={require("@/assets/header-image.png")}
        containerStyle={{ height: 220 }}
        gradientLocations={[0.6, 1]}
      />

      {/* ===== CONTENT ===== */}
      <View style={styles.content}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Enter your registered email and we'll send you instructions to reset
          your password.
        </Text>

        {/* ===== EMAIL ===== */}
        <Text style={styles.label}>Email Address</Text>
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
            onChangeText={(text) => {
              setEmail(text);
              if (error) setError("");
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      {/* ===== CTA ===== */}
      <View style={styles.footer}>
        <Button
          label="Send Reset Link"
          variant="secondary"
          onPress={handleReset}
          textStyle={{ fontSize: 14, fontWeight: "500" }}
        />
      </View>
    </View>
  );
}

/* ================= STYLES ================= */

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
    lineHeight: 20,
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
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  input: {
    flex: 1,
    fontSize: 14,
    color: "#010D26",
  },

  inputNormalBorder: {
    borderColor: "#E5E7EB",
  },

  inputErrorBorder: {
    borderColor: "#FF5582",
  },

  errorText: {
    color: "#DC2626",
    fontSize: 12,
    marginTop: 8,
  },

  footer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    marginTop: "auto",
  },
});
