import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import { useRouter } from "expo-router";
import HeroBackground from "@/components/ui/GradientImage";
import Button from "@/components/ui/Button";

const OTP_LENGTH = 6;

export default function VerifyEmailScreen() {
  const router = useRouter();

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");

  const inputsRef = useRef<Array<TextInput | null>>([]);

  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);

    if (value && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }

    if (updatedOtp.every((d) => d !== "")) {
      Keyboard.dismiss();
    }
  };

  const handleBackspace = (index: number) => {
    if (otp[index] === "" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");

    if (code.length !== OTP_LENGTH) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setError("");

    // 🔌 Hook verify API here
    // await verifyEmail(code);

    router.replace("/account-verified");
  };

  const handleResend = async () => {
    // 🔌 Hook resend API here
    // await resendVerificationCode();
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
        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.subtitle}>
          We've sent a 6-digit code to{" "}
          <Text style={styles.email}>jho@gmail.com</Text>. Please enter it below
          to secure your account.
        </Text>

        {/* ===== OTP INPUTS ===== */}
        <View style={styles.otpRow}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputsRef.current[index] = ref;
              }}
              value={digit}
              onChangeText={(value) => handleChange(value, index)}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === "Backspace") {
                  handleBackspace(index);
                }
              }}
              keyboardType="number-pad"
              maxLength={1}
              style={[
                styles.otpInput,
                error ? styles.inputErrorBorder : styles.inputNormalBorder,
              ]}
              textAlign="center"
            />
          ))}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* ===== RESEND ===== */}
        <Text style={styles.resendText}>
          Didn't get it?{" "}
          <Text style={styles.resendLink} onPress={handleResend}>
            Resend code
          </Text>
        </Text>
      </View>

      {/* ===== CTA ===== */}
      <View style={styles.footer}>
        <Button label="Verify" variant="secondary" onPress={handleVerify} />
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

  email: {
    fontWeight: "500",
    color: "#010D26",
  },

  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  otpInput: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 16,
    color: "#010D26",
  },

  inputNormalBorder: {
    borderColor: "#E5E7EB",
  },

  inputErrorBorder: {
    borderColor: "#FF5582",
  },

  resendText: {
    fontSize: 13,
    color: "#010D26",
    marginTop: 8,
  },

  resendLink: {
    textDecorationLine: "underline",
    color: "#010D26",
  },

  errorText: {
    color: "#DC2626",
    fontSize: 12,
    marginBottom: 4,
  },

  footer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    marginTop: "auto",
  },
});
