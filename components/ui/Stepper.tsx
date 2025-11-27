import React from "react";
import { View, TouchableOpacity } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { zakatStep } from "@/store/reduxSlice/zakatSlice";

export default function Stepper() {
  const step = useSelector((state: any) => state.zakatCalculator.step);
  const dispatch = useDispatch();

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 16,
      }}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <TouchableOpacity
          key={i}
          style={{
            flex: 1,
            height: 8,
            marginHorizontal: 4,
            borderRadius: 4,
            backgroundColor:
              i === step ? "#FF6B35" : i < step ? "#264B8B" : "#E0E0E0",
          }}
          onPress={() => i < step && dispatch(zakatStep(-1 * (step - i)))}
        />
      ))}
    </View>
  );
}
