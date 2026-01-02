import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const STEPS = ["Details", "Payment", "Confirm"];

type Props = {
  step: number;
  onStepPress: (step: number) => void;
};

export default function StepIndicator({ step, onStepPress }: Props) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.line} />

      <View style={styles.row}>
        {STEPS.map((label, index) => {
          const stepNumber = index + 1;
          const active = step >= stepNumber;

          return (
            <TouchableOpacity
              key={label}
              style={styles.step}
              activeOpacity={0.7}
              onPress={() => onStepPress(stepNumber)}
            >
              <View style={[styles.dot, active && styles.activeDot]} />
              <Text style={[styles.label, active && styles.activeLabel]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  line: {
    position: "absolute",
    top: 26,
    left: 30,
    right: 30,
    height: 2,
    backgroundColor: "#E0E0E0",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  step: {
    alignItems: "center",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#CFCFCF",
    marginBottom: 6,
  },
  activeDot: {
    backgroundColor: "#264B8B",
  },
  label: {
    fontSize: 12,
    color: "#999",
  },
  activeLabel: {
    color: "#264B8B",
    fontWeight: "500",
  },
});
