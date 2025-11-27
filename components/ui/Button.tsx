import React, { JSX } from "react";
import { TouchableOpacity, Text, ViewStyle, StyleProp } from "react-native";

type Props = {
  variant?: string;
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
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        {
          backgroundColor: variant === "primary" ? "#264B8B" : "#E0E0E0",
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
          color: variant === "primary" ? "#fff" : "#000",
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
