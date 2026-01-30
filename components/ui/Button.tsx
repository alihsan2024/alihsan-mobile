import React, { JSX } from "react";
import {
  TouchableOpacity,
  Text,
  TextStyle,
  ViewStyle,
  StyleProp,
} from "react-native";

type Props = {
  variant?: "primary" | "secondary" | "warning";
  label: string;
  onPress?: () => void;
  leftIcon?: JSX.Element;
  rightIcon?: JSX.Element;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

const Button: React.FC<Props> = ({
  variant = "primary",
  label,
  onPress,
  leftIcon,
  rightIcon,
  disabled,
  style,
  textStyle,
}) => {
  const backgroundColor =
    variant === "primary"
      ? "#2161CD"
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
        style={[
          {
            color: textColor,
            marginHorizontal: 4,
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
      {rightIcon}
    </TouchableOpacity>
  );
};

export default Button;
