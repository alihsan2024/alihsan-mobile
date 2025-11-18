import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface StepperProps {
  currentStep: number;
}

export default function Stepper({ currentStep }: StepperProps) {
  const steps = [
    { number: 1, label: "Welcome" },
    { number: 2, label: "Cash & Metals" },
    { number: 3, label: "Investments" },
    { number: 4, label: "Other" },
    { number: 5, label: "Summary" },
  ];

  return (
    <View style={styles.container}>
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          <View style={styles.stepContainer}>
            <View
              style={[
                styles.circle,
                currentStep >= step.number && styles.circleActive,
              ]}
            >
              <Text
                style={[
                  styles.circleText,
                  currentStep >= step.number && styles.circleTextActive,
                ]}
              >
                {step.number}
              </Text>
            </View>
            <Text
              style={[
                styles.label,
                currentStep >= step.number && styles.labelActive,
              ]}
            >
              {step.label}
            </Text>
          </View>
          {index < steps.length - 1 && (
            <View
              style={[
                styles.line,
                currentStep > step.number && styles.lineActive,
              ]}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  stepContainer: {
    alignItems: "center",
    flex: 1,
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  circleActive: {
    backgroundColor: "#264B8B",
  },
  circleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#999",
  },
  circleTextActive: {
    color: "#fff",
  },
  label: {
    fontSize: 10,
    color: "#999",
    textAlign: "center",
  },
  labelActive: {
    color: "#264B8B",
    fontWeight: "600",
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 4,
    marginBottom: 26,
  },
  lineActive: {
    backgroundColor: "#264B8B",
  },
});

