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
                    numberOfLines={1}
                    ellipsizeMode="clip"
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
                    numberOfLines={1}
                    ellipsizeMode="clip"
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
                    numberOfLines={1}
                    ellipsizeMode="clip"
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
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
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },

  dotCompleted: {
    backgroundColor: "#264B8B",
  },

  dotActive: {
    backgroundColor: "#264B8B",
    transform: [{ scale: 1.3 }],
  },

  /* LABELS — FIXED WIDTH & NO WRAP */
  labelAbsolute: {
    position: "absolute",
    top: 14,
    left: "50%",
    transform: [{ translateX: -35 }],
    width: 70,
    textAlign: "center",
    fontSize: 11,
    color: "#9CA3AF",
    zIndex: 1,
    fontFamily: "AlbertSans_500Medium",
  },

  labelLeft: {
    position: "absolute",
    top: 14,
    left: 0,
    width: 70,
    textAlign: "left",
    fontSize: 11,
    color: "#9CA3AF",
    zIndex: 1,
    fontFamily: "AlbertSans_500Medium",
  },

  labelRight: {
    position: "absolute",
    top: 14,
    right: 0,
    width: 70,
    textAlign: "right",
    fontSize: 11,
    color: "#9CA3AF",
    zIndex: 1,
    fontFamily: "AlbertSans_500Medium",
  },

  labelActive: {
    color: "#264B8B",
    fontFamily: "AlbertSans_700Bold",
  },

  /* LINE BETWEEN STEPS */
  line: {
    flex: 1,
    height: 2,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 4,
  },

  lineCompleted: {
    backgroundColor: "#264B8B",
  },
});
