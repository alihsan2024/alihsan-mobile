import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ViewStyle,
} from "react-native";
import { Image as ExpoImage } from "expo-image";

type HeaderSearchBarProps = {
  value?: string;
  placeholder?: string;
  showNotificationDot?: boolean;
  variant?: "filled" | "outlined";

  onChangeText?: (text: string) => void;
  onNotificationPress?: () => void;

  containerStyle?: ViewStyle;
};

export default function HeaderSearchBar({
  value,
  placeholder = "Search",
  showNotificationDot = true,
  variant = "filled",
  onChangeText,
  onNotificationPress,
  containerStyle,
}: HeaderSearchBarProps) {
  const isOutlined = variant === "outlined";

  return (
    <View style={[styles.headerBar, containerStyle]}>
      {/* Search */}
      <View
        style={[
          styles.searchContainer,
          isOutlined && styles.searchContainerOutlined,
        ]}
      >
        <ExpoImage
          source={
            isOutlined
              ? require("@/assets/search-gray.png")
              : require("@/assets/search.png")
          }
          style={{ width: 16, height: 16 }}
          contentFit="contain"
        />

        <TextInput
          value={value}
          placeholder={placeholder}
          placeholderTextColor={isOutlined ? "#9CA3AF" : "rgba(255,255,255)"}
          style={[styles.searchInput, isOutlined && styles.searchInputOutlined]}
          onChangeText={onChangeText}
        />
      </View>

      {/* Notification */}
      <TouchableOpacity
        style={[
          styles.notificationButton,
          isOutlined && styles.notificationButtonOutlined,
        ]}
        activeOpacity={0.8}
        onPress={onNotificationPress}
      >
        <ExpoImage
          source={require("@/assets/bell.png")}
          style={{ width: 18, height: 18, opacity: isOutlined ? 0.6 : 1 }}
          contentFit="contain"
        />

        {showNotificationDot && <View style={styles.notificationDot} />}
      </TouchableOpacity>
    </View>
  );
}

const HEADER_HEIGHT = 64;

const styles = StyleSheet.create({
  headerBar: {
    height: HEADER_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  /* ================= SEARCH ================= */

  searchContainer: {
    flex: 1,
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.50)",
  },

  searchContainerOutlined: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },

  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },

  searchInputOutlined: {
    color: "#111827",
    fontWeight: "400",
  },

  /* ================= NOTIFICATION ================= */

  notificationButton: {
    width: 44,
    height: 44,
    marginLeft: 12,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderWidth: 2,
    borderColor: "#010D261A",
  },

  notificationButtonOutlined: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },

  notificationDot: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
  },
});
