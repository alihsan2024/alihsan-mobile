import React from "react";
import { ScrollView, Text, View } from "react-native";
import { useDispatch } from "react-redux";
import { zakatStep } from "@/store/reduxSlice/zakatSlice";
import Button from "@/components/ui/Button";

export default function Step1() {
  const dispatch = useDispatch();

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 12 }}>
        Let's calculate your Zakat-Al-Maal.
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 24, lineHeight: 22 }}>
        In Sharia, Zakat al-Maal is an Islamic financial obligation requiring
        Muslims to donate 2.5% of their wealth annually to the needy.
      </Text>
      <Button
        label="Bismillah, calculate."
        onPress={() => dispatch(zakatStep(1))}
      />
    </View>
  );
}
