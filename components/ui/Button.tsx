import React, { JSX } from "react";
import { TouchableOpacity, Text, ViewStyle, StyleProp } from "react-native";

type Props = {
  variant?: "primary" | "secondary" | "warning"; // ⬅️ include the new variant
  label: string;
  onPress?: () => void;
  leftIcon?: JSX.Element;
  rightIcon?: JSX.Element;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

const Button: React.FC<Props> = ({
  variant = "primary",
  label,
  onPress,
  leftIcon,
  rightIcon,
  disabled,
  style,
}) => {
  // Define background and text colors based on variant
  const backgroundColor =
    variant === "primary"
      ? "#264B8B"
      : variant === "secondary"
      ? "#FFD602"
      : "#E0E0E0";

  const textColor =
    variant === "primary"
      ? "#fff"
      : variant === "secondary"
      ? "#010D26"
      : "#000";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        {
          backgroundColor,
          padding: 12,
          borderRadius: 10,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      {leftIcon}
      <Text
        style={{
          color: textColor,
          marginHorizontal: 4,
        }}
      >
        {label}
      </Text>
      {rightIcon}
    </TouchableOpacity>
  );
};

export default Button;
