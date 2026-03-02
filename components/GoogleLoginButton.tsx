import React, { useEffect } from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useAuthRequest } from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import Google from "@/assets/google.svg";
import { fetchGoogleUserInfo } from "@/utils/googleAuth";

WebBrowser.maybeCompleteAuthSession();

export interface GoogleLoginButtonProps {
  clientId: string;
  onPressStart: () => void;
  onSuccess: (userInfo: {
    email: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
  onError: (message: string) => void;
  style?: object;
  textStyle?: object;
}

export function GoogleLoginButton({
  clientId,
  onPressStart,
  onSuccess,
  onError,
  style,
  textStyle,
}: GoogleLoginButtonProps) {
  const [request, fullResult, promptAsync] = useAuthRequest({
    webClientId: clientId,
    // Native (iOS/Android) falls back to clientId when iosClientId/androidClientId are not set
    clientId,
  });

  useEffect(() => {
    if (!fullResult || fullResult.type !== "success") return;
    const accessToken =
      (fullResult as any).authentication?.accessToken ??
      (fullResult as any).params?.access_token;
    if (!accessToken) {
      onError("Could not get access token from Google");
      return;
    }
    fetchGoogleUserInfo(accessToken)
      .then(onSuccess)
      .catch(() => onError("Failed to get your Google profile"));
  }, [fullResult]);

  const handlePress = async () => {
    onPressStart();
    const result = await promptAsync();
    if (!result) return;
    if (result.type !== "success") {
      const message =
        result.type === "dismiss"
          ? "Sign-in was cancelled"
          : (result as any).error?.message ?? "Google sign-in failed";
      onError(message);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.googleBtn, style]}
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={!request}
    >
      <Google width={18} height={18} />
      <Text style={[styles.googleText, textStyle]}>Continue with Google</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
  },
  googleText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
});
