import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import HeroBackground from "@/components/ui/GradientImage";
import Button from "@/components/ui/Button";

export default function CreateNewPasswordScreen() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const handleUpdatePassword = async () => {
    if (!password.trim() || !confirmPassword.trim()) {
      setError("Both fields are required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");

    // 🔌 Hook API here later
    // await updatePassword(password);

    Alert.alert(
      "Password Updated",
      "Your password has been updated successfully.",
      [{ text: "OK", onPress: () => router.replace("/login") }]
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
        <Text style={styles.title}>Create New Password</Text>
        <Text style={styles.subtitle}>
          Your new password must be different from previous passwords.
        </Text>

        {/* ===== PASSWORD ===== */}
        <Text style={styles.label}>Password</Text>
        <View
          style={[
            styles.inputWrapper,
            error ? styles.inputErrorBorder : styles.inputNormalBorder,
          ]}
        >
          <TextInput
            placeholder="New password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!showPassword}
            style={styles.input}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (error) setError("");
            }}
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
        <View
          style={[
            styles.inputWrapper,
            error ? styles.inputErrorBorder : styles.inputNormalBorder,
          ]}
        >
          <TextInput
            placeholder="Confirm new password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!showConfirmPassword}
            style={styles.input}
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (error) setError("");
            }}
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
      </View>

      {/* ===== CTA ===== */}
      <View style={styles.footer}>
        <Button
          label="Update Password"
          variant="secondary"
          onPress={handleUpdatePassword}
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
    justifyContent: "space-between",
    marginBottom: 12,
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
    marginTop: 4,
  },

  footer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    marginTop: "auto",
  },
});
