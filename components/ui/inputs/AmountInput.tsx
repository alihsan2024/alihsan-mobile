import React from "react";
import { TextInput, StyleSheet, TextInputProps } from "react-native";

interface AmountInputProps extends TextInputProps {
  name: string;
  onChangeValue: (name: string, value: number) => void;
  onValidationError: (name: string, error: string) => void;
  required?: boolean;
}

export default function AmountInput({
  name,
  onChangeValue,
  onValidationError,
  required = false,
  ...props
}: AmountInputProps) {
  const _onChange = (text: string) => {
    // If empty
    if (!text && required) {
      onValidationError(name, "Field is required");
      return;
    } else if (!text) {
      onValidationError(name, "");
      onChangeValue(name, 0);
      return;
    }

    // Convert to number
    const num = Number(text);

    if (isNaN(num) || num < 0) {
      onValidationError(name, "Invalid value");
      return;
    }

    // Valid
    onValidationError(name, "");
    onChangeValue(name, num);
  };

  return (
    <TextInput
      {...props}
      keyboardType="numeric"
      onChangeText={_onChange}
      style={[styles.input, props.style]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
});
