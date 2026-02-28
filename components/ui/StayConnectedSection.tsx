import React, { useState, useRef, useImperativeHandle, forwardRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
} from "react-native";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { addSubscriber } from "@/utils/api";
import { useToast } from "@/context/ToastContext";

const CTA_IMAGE_URI = "https://www.alihsan.org.au/CTA.png";

export interface StayConnectedSectionRef {
  blur: () => void;
}

function StayConnectedSectionInner(
  _: unknown,
  ref: React.Ref<StayConnectedSectionRef>
) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const emailInputRef = useRef<TextInput>(null);
  const { showToast } = useToast();

  useImperativeHandle(ref, () => ({
    blur: () => {
      emailInputRef.current?.blur();
      Keyboard.dismiss();
    },
  }));

  const validateEmail = (value: string) => {
    const re = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    return re.test(value?.trim() ?? "");
  };

  const handleSubmit = async () => {
    const trimmed = email.trim();
    setError(null);
    if (!trimmed) {
      setError("Email is required");
      return;
    }
    if (!validateEmail(trimmed)) {
      setError("Enter a valid email");
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await addSubscriber(trimmed);
      if (result?.success) {
        showToast({
          message: result.message ?? "Subscribed successfully!",
          type: "success",
        });
        setIsSuccess(true);
        setEmail("");
        setTimeout(() => setIsSuccess(false), 3000);
      } else {
        showToast({
          message: result?.message ?? "Failed to subscribe. Please try again.",
          type: "error",
        });
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "An error occurred. Please try again.";
      showToast({ message, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageWrapper}>
        <ExpoImage
          source={{ uri: CTA_IMAGE_URI }}
          style={styles.backgroundImage}
          contentFit="cover"
        />
        <LinearGradient
          colors={[
            "rgba(30, 58, 138, 0.2)",
            "rgba(30, 58, 138, 0.05)",
            "transparent",
          ]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.content}
      >
        <Text style={styles.stayInformed}>Stay Informed</Text>
        <Text style={styles.headline}>
          Stay Connected and Inspire Change with Al-Ihsan
        </Text>
        <Text style={styles.subheadline}>
          Stay connected, inspire meaningful change, and support compassionate
          community efforts through Al-Ihsan.
        </Text>

        <View style={styles.formRow}>
          <TextInput
            ref={emailInputRef}
            style={styles.input}
            placeholder="Your Email Address"
            placeholderTextColor="#374151"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError(null);
            }}
            onBlur={() => Keyboard.dismiss()}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isSubmitting && !isSuccess}
          />
          <TouchableOpacity
            style={[styles.button, (isSubmitting || isSuccess) && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting || isSuccess}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#2161CD" />
            ) : (
              <Text style={styles.buttonText}>
                {isSuccess ? "Subscribed!" : "Subscribe"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </KeyboardAvoidingView>
    </View>
  );
}

const StayConnectedSection = forwardRef<StayConnectedSectionRef, unknown>(
  StayConnectedSectionInner
);
export default StayConnectedSection;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    minHeight: 380,
    marginTop: 24,
    marginBottom: 0,
    overflow: "hidden",
    borderRadius: 0,
  },
  imageWrapper: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
  },
  content: {
    flex: 1,
    minHeight: 380,
    paddingHorizontal: 20,
    paddingVertical: 28,
    paddingBottom: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  stayInformed: {
    fontSize: 20,
    fontFamily: "Guthen Bloots",
    color: "#FDE047",
    marginBottom: 8,
  },
  headline: {
    fontSize: 22,
    fontWeight: "800",
    fontFamily: "AlbertSans_800ExtraBold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 28,
    paddingHorizontal: 8,
  },
  subheadline: {
    fontSize: 16,
    fontFamily: "AlbertSans_400Regular",
    color: "#fff",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 12,
    maxWidth: 360,
  },
  formRow: {
    flexDirection: "row",
    width: "100%",
    maxWidth: 400,
    gap: 12,
    alignItems: "stretch",
  },
  input: {
    flex: 1,
    minHeight: 48,
    backgroundColor: "rgba(239, 246, 255, 0.9)",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#000",
    borderWidth: 2,
    borderColor: "rgb(191, 219, 254)",
  },
  button: {
    minWidth: 120,
    minHeight: 48,
    backgroundColor: "#FDE047",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
  errorText: {
    marginTop: 8,
    fontSize: 12,
    color: "#ef4444",
  },
});
