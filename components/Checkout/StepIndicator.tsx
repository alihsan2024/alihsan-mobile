import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const STEPS = ["Details", "Payment", "Confirm"];

type Props = {
  step: number; // 1-based
  onStepPress: (step: number) => void;
};

export default function StepIndicator({ step, onStepPress }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {STEPS.map((label, index) => {
          const stepNumber = index + 1;
          const isCompleted = step > stepNumber;
          const isActive = step === stepNumber;
          const isDoneOrActive = step >= stepNumber;

          return (
            <React.Fragment key={label}>
              {/* STEP */}
              <View style={{ alignItems: "center", position: "relative" }}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => onStepPress(stepNumber)}
                  style={styles.step}
                >
                  <View
                    style={[
                      styles.dot,
                      isCompleted && styles.dotCompleted,
                      isActive && styles.dotActive,
                    ]}
                  />
                </TouchableOpacity>
                {index === 0 && (
                  <Text
                    style={[
                      styles.labelLeft,
                      isDoneOrActive && styles.labelActive,
                    ]}
                  >
                    {label}
                  </Text>
                )}
                {index === 1 && (
                  <Text
                    style={[
                      styles.labelAbsolute,
                      isDoneOrActive && styles.labelActive,
                    ]}
                  >
                    {label}
                  </Text>
                )}
                {index === 2 && (
                  <Text
                    style={[
                      styles.labelRight,
                      isDoneOrActive && styles.labelActive,
                    ]}
                  >
                    {label}
                  </Text>
                )}
              </View>

              {/* LINE (except after last step) */}
              {index < STEPS.length - 1 && (
                <View
                  style={[
                    styles.line,
                    step > stepNumber && styles.lineCompleted,
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 10,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  /* STEP */
  step: {
    alignItems: "center",
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#CFCFCF",
  },

  dotCompleted: {
    backgroundColor: "#246BE1",
  },

  dotActive: {
    backgroundColor: "#246BE1",
    transform: [{ scale: 1.2 }],
  },

  labelAbsolute: {
    position: "absolute",
    top: 18,
    left: "50%",
    transform: [{ translateX: -25 }],
    width: 50,
    textAlign: "center",
    fontSize: 12,
    color: "#888",
    zIndex: 1,
  },
  labelLeft: {
    position: "absolute",
    top: 18,
    left: 0,
    minWidth: 50,
    textAlign: "left",
    fontSize: 12,
    color: "#888",
    zIndex: 1,
  },
  labelRight: {
    position: "absolute",
    top: 18,
    right: 0,
    minWidth: 50,
    textAlign: "right",
    fontSize: 12,
    color: "#888",
    zIndex: 1,
  },
  labelActive: {
    color: "#246BE1",
    fontWeight: "bold",
  },

  /* LINE BETWEEN STEPS */
  line: {
    flex: 1,
    height: 2,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 6,
  },

  lineCompleted: {
    backgroundColor: "#246BE1",
  },
});
