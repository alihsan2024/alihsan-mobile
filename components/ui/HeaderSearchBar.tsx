import React from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Variant = "filled" | "outlined";

type Props = {
  value?: string;
  onChangeText?: (text: string) => void;
  onPressNotification?: () => void;
  showNotificationDot?: boolean;
  placeholder?: string;

  /** Styling control */
  variant?: Variant;
  containerStyle?: StyleProp<ViewStyle>;
  searchContainerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
};

export default function HeaderSearchBar({
  value,
  onChangeText,
  onPressNotification,
  showNotificationDot = true,
  placeholder = "Search",
  variant = "filled",
  containerStyle,
  searchContainerStyle,
  inputStyle,
}: Props) {
  const isOutlined = variant === "outlined";
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.headerBar,
        { paddingTop: insets.top + 8 }, // 👈 SAFE AREA
        containerStyle,
      ]}
    >
      {/* Search */}
      <View
        style={[
          styles.searchContainer,
          isOutlined && styles.searchOutlined,
          searchContainerStyle,
        ]}
      >
        <Feather
          name="search"
          size={16}
          color={isOutlined ? "#010D26E5" : "#fff"}
        />

        <TextInput
          placeholder={placeholder}
          placeholderTextColor={
            isOutlined ? "#9AA4B2" : "rgba(255,255,255,0.6)"
          }
          style={[
            styles.searchInput,
            isOutlined && styles.inputOutlined,
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
        />
      </View>

      {/* Notification */}
      <TouchableOpacity
        style={[
          styles.notificationButton,
          isOutlined && styles.notificationOutlined,
        ]}
        onPress={onPressNotification}
        activeOpacity={0.8}
      >
        <Ionicons name="notifications" size={18} color={"#010D264D"} />
        {showNotificationDot && <View style={styles.notificationDot} />}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },

  /* SEARCH */
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    flex: 1,
    marginRight: 12,
  },

  searchOutlined: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#D0D5DD",
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: "#fff",
    fontSize: 14,
  },

  inputOutlined: {
    color: "#010D26",
  },

  /* NOTIFICATION */
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  notificationOutlined: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#D0D5DD",
  },

  notificationDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF3B30",
  },
});
