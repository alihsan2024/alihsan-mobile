import React, { useState, useEffect } from "react";
import { View, StyleSheet, Platform } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";

export interface AppleLoginButtonProps {
  onPressStart: () => void;
  onSuccess: (userInfo: {
    identityToken: string;
    appleId: string;
    email: string | null;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
  onError: (message: string) => void;
  style?: object;
  textStyle?: object;
}

/**
 * Sign in with Apple button. Only available on iOS 13+.
 * On Android or unsupported iOS, render nothing.
 */
export function AppleLoginButton({
  onPressStart,
  onSuccess,
  onError,
  style,
}: AppleLoginButtonProps) {
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "ios") {
      setIsAvailable(false);
      return;
    }
    AppleAuthentication.isAvailableAsync().then(setIsAvailable);
  }, []);

  const handlePress = async () => {
    if (!isAvailable) {
      onError("Sign in with Apple is not available");
      return;
    }
    onPressStart();
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      const firstName =
        credential.fullName?.givenName?.trim() || "Apple";
      const lastName =
        credential.fullName?.familyName?.trim() || "User";
      const email =
        credential.email && credential.email.trim()
          ? credential.email.trim()
          : null;
      if (!credential.identityToken) {
        onError("Apple did not return a sign-in token. Please try again.");
        return;
      }
      await onSuccess({
        identityToken: credential.identityToken,
        appleId: credential.user,
        email,
        firstName,
        lastName,
      });
    } catch (e: any) {
      if (e?.code === "ERR_REQUEST_CANCELED") {
        onError("Sign-in was cancelled");
      } else {
        onError(e?.message ?? "Apple sign-in failed");
      }
    }
  };

  if (!isAvailable) return null;

  return (
    <View style={[styles.wrapper, style]}>
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
        cornerRadius={12}
        style={styles.appleButton}
        onPress={handlePress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },
  appleButton: {
    width: "100%",
    height: 48,
  },
});
