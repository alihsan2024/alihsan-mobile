import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ZakatProvider, useZakat } from "../context/ZakatContext";
import Step1 from "../components/zakat/Step1";
import Step2 from "../components/zakat/Step2";
import Step3 from "../components/zakat/Step3";
import Step4 from "../components/zakat/Step4";
import Step5 from "../components/zakat/Step5";
import Summary from "../components/zakat/Summary";
import Stepper from "../components/zakat/Stepper";
import LoadingScreen from "../components/LoadingScreen";

function ZakatCalculatorContent() {
  const { step, pricesLoading } = useZakat();
  const insets = useSafeAreaInsets();

  if (pricesLoading) {
    return <LoadingScreen message="Loading metal prices..." />;
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1 />;
      case 2:
        return <Step2 />;
      case 3:
        return <Step3 />;
      case 4:
        return <Step4 />;
      case 5:
        return <Step5 />;
      default:
        return <Step1 />;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Zakat Calculator</Text>
          <Text style={styles.subtitle}>Calculate your Zakat Al-Maal</Text>
        </View>

        <Stepper currentStep={step} />

        <View style={styles.content}>
          <View style={styles.stepContainer}>{renderStep()}</View>
          {step < 5 && <Summary />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function ZakatCalculatorScreen() {
  return (
    <ZakatProvider>
      <ZakatCalculatorContent />
    </ZakatProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#264B8B",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  content: {
    marginTop: 24,
  },
  stepContainer: {
    marginBottom: 24,
  },
});

