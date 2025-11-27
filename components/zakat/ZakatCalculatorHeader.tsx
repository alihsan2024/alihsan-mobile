import React from "react";
import { View, Text } from "react-native";

export default function ZakatCalculatorHeader() {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 16,
        backgroundColor: "#264B8B",
        borderRadius: 16,
        marginBottom: 16,
      }}
    >
      <Text style={{ color: "white", fontSize: 22, fontWeight: "bold" }}>
        Zakat Calculator
      </Text>
    </View>
  );
}
