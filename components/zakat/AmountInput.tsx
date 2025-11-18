import React, { useState } from "react";
import { View, TextInput, Text, StyleSheet, TextInputProps } from "react-native";

interface AmountInputProps extends TextInputProps {
  label?: string;
  value: string | number;
  onChangeValue: (value: number) => void;
  error?: string;
  currency?: string;
}

export default function AmountInput({
  label,
  value,
  onChangeValue,
  error,
  currency,
  ...props
}: AmountInputProps) {
  const [localValue, setLocalValue] = useState(
    value?.toString() || ""
  );

  const handleChange = (text: string) => {
    // Remove non-numeric characters except decimal point
    const cleaned = text.replace(/[^0-9.]/g, "");
    
    // Ensure only one decimal point
    const parts = cleaned.split(".");
    if (parts.length > 2) {
      return;
    }

    setLocalValue(cleaned);
    const numValue = parseFloat(cleaned) || 0;
    onChangeValue(numValue);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputContainer}>
        {currency && (
          <Text style={styles.currency}>{currency}</Text>
        )}
        <TextInput
          style={[styles.input, error && styles.inputError]}
          value={localValue}
          onChangeText={handleChange}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor="#999"
          {...props}
        />
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    minHeight: 52,
  },
  currency: {
    fontSize: 16,
    fontWeight: "600",
    color: "#264B8B",
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingVertical: 12,
  },
  inputError: {
    borderColor: "#d32f2f",
  },
  error: {
    fontSize: 12,
    color: "#d32f2f",
    marginTop: 4,
    marginLeft: 4,
  },
});

