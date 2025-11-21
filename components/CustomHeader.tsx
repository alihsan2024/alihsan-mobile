import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface Props {
  title?: string;
  transparent?: boolean; // place over image
  absolute?: boolean; // header absolute positioned
  onBack?: () => void;
}

export default function CustomHeader({
  title = "",
  transparent = false,
  absolute = false,
  onBack,
}: Props) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 10,
          backgroundColor: transparent ? "transparent" : "#fff",
        },
        absolute && {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
        },
      ]}
    >
      <TouchableOpacity
        onPress={onBack || (() => router.back())}
        style={[styles.backButton, transparent && styles.backButtonTransparent]}
      >
        <Ionicons
          name="chevron-back"
          size={24}
          color={transparent ? "#fff" : "#000"}
        />
      </TouchableOpacity>

      {title ? (
        <Text style={[styles.title, transparent && styles.titleTransparent]}>
          {title}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    zIndex: 999,
  },
  backButton: {
    width: 38,
    height: 38,
    backgroundColor: "#f0f0f0",
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonTransparent: {
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 12,
    color: "#000",
  },
  titleTransparent: {
    color: "#fff",
  },
});
