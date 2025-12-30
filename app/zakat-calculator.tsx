import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import Step1 from "@/components/Zakat/Step1";
import Step2 from "@/components/Zakat/Step2";
import Step3 from "@/components/Zakat/Step3";
import Step4 from "@/components/Zakat/Step4";
import Step5 from "@/components/Zakat/Step5";
import Summary from "@/components/Zakat/Summary";
import Header from "@/components/Zakat/ZakatCalculatorHeader";
import Stepper from "@/components/ui/Stepper";
import Button from "@/components/ui/Button";

import {
  getMetalPrices,
  resetZakatInput,
  zakatStep,
} from "@/store/reduxSlice/zakatSlice";

export default function ZakatCalculatorPage() {
  const dispatch: AppDispatch = useDispatch();
  const step = useSelector((state: RootState) => state.zakatCalculator.step);
  const prices = useSelector(
    (state: RootState) => state.zakatCalculator.prices
  );

  const scrollRef = useRef<ScrollView>(null);

  // Query param
  const params = useLocalSearchParams();
  const cartAmount = params?.nyp ? parseInt(params.nyp as string) : 0;

  const steps = [Step1, Step2, Step3, Step4];
  const CurrentStep = step === 5 ? Step5 : steps[step - 1];

  useEffect(() => {
    dispatch(getMetalPrices());
    return () => {
      dispatch(resetZakatInput());
    };
  }, []);

  // Jump to step 5 if cartAmount exists
  useEffect(() => {
    if (cartAmount && cartAmount > 0) dispatch(zakatStep(4));
  }, [cartAmount]);

  // Scroll to top when step changes
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [step]);

  // Responsive: two-column layout for tablets/large screens
  const windowWidth = Dimensions.get("window").width;
  const isTablet = windowWidth >= 768;

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={{ paddingBottom: 40 }}
      ref={scrollRef}
    >
      {/* HEADER */}
      <Header />

      {/* MAIN CARD: Stepper + Current Step */}
      <View
        style={[
          styles.mainRow,
          {
            flexDirection: isTablet ? "row" : "column",
            gap: isTablet ? 20 : 0,
          },
        ]}
      >
        <View style={styles.leftColumn}>
          <Stepper />
          <View style={{ marginTop: 10 }}>
            <CurrentStep zakatTotal={cartAmount} />
          </View>
        </View>

        <View style={styles.rightColumn}>
          <Summary zakatTotal={cartAmount} />
        </View>
      </View>

      {/* ---------- TEXT SECTIONS ---------- */}
      <Section title="Zakat Calculator: Calculate Your 2.5% Zakat" />

      <Section
        title="What is Zakat Al-Maal"
        body={`Zakat Al-Maal is the fifth pillar of Islam, an act of worship that purifies your wealth and uplifts those most in need. If you've held qualifying assets above the nisab threshold for one full Hijri (lunar) year, it's time to calculate and fulfil your obligation.\n\nThis easy-to-use Zakat Calculator helps you determine your 2.5% Zakat amount accurately, based on up-to-date gold and silver prices in Australia.`}
      />

      <ListSection
        title="Who Must Pay Zakat?"
        list={[
          "A Muslim",
          "An adult of sound mind",
          "Holding zakatable wealth above the nisab threshold for a full lunar year, then Zakat becomes obligatory on your qualifying assets.",
        ]}
      />

      <ListSection
        title="What Assets Are Zakatable?"
        list={[
          "Cash on hand & in bank",
          "Gold and silver (including jewellery)",
          "Shares, crypto, and investments",
          "Business goods & stock",
          "Receivable debts (that can be recovered)",
          "Rental or investment income",
          "Agricultural produce (as applicable)",
        ]}
      />

      <ListSection
        title="How It Works – Step by Step"
        numbered
        list={[
          "Enter Your Assets: Input your values for cash, savings, gold, silver, investments, receivables, and more.",
          "Live Nisab Check: The calculator automatically checks against the silver nisab value, updated daily in AUD.",
          "Instant Zakat Calculation: It calculates 2.5% of your zakatable wealth, instantly showing you the total due.",
          "Donate Securely: Once calculated, you can fulfil your obligation securely online through Al-Ihsan Foundation, in full accordance with Shariah principles.",
        ]}
      />

      <ListSection
        title="Why Use Al-Ihsan's Zakat Calculator?"
        list={[
          "Auto-updated gold & silver nisab rates",
          "Guided entry for all zakatable asset types",
          "Shariah-compliant and scholar-reviewed",
          "Secure Zakat payment portal at the end",
        ]}
      />

      <ListSection
        title="Where Your Zakat Goes"
        list={[
          "Food & emergency relief",
          "Orphan support",
          "Clean water projects",
          "Medical care",
          "Education & self-sufficiency",
          "Refugees & displaced families",
        ]}
      />

      <Section
        title="Ready to Give?"
        body={`Once you've calculated your Zakat, complete your obligation in just a few clicks.\n\nDonate confidently. Give with trust. Delivered with Ihsan.`}
      />

      {/* Hadith Box */}
      <View style={styles.hadithBox}>
        <Text style={styles.hadithText}>
          "Whoever pays the Zakat on his wealth will have its evil removed from
          him." – Ibn Majah
        </Text>
      </View>

      {/* CTA Button */}
      <View style={{ marginVertical: 30, alignItems: "center" }}>
        <Button
          label="Calculate Zakat al-Maal"
          onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
          leftIcon={<Ionicons name="calculator" size={20} color="#fff" />}
          variant="primary"
          style={{ width: "80%" }}
        />
      </View>
    </ScrollView>
  );
}

/* --------------------------- */
/*        Reusable Components  */
/* --------------------------- */

interface SectionProps {
  title: string;
  body?: string;
}
function Section({ title, body }: SectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.heading}>{title}</Text>
      {body && <Text style={styles.paragraph}>{body}</Text>}
    </View>
  );
}

interface ListSectionProps {
  title: string;
  list?: string[];
  numbered?: boolean;
}
function ListSection({ title, list = [], numbered = false }: ListSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.heading}>{title}</Text>
      {list.map((item, index) => (
        <Text key={index} style={styles.listItem}>
          {numbered ? `${index + 1}. ` : "• "}
          {item}
        </Text>
      ))}
    </View>
  );
}

/* --------------------------- */
/*             Styles          */
/* --------------------------- */

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  mainRow: {
    marginTop: 16,
    paddingHorizontal: 16,
  },

  leftColumn: {
    flex: 1,
  },
  rightColumn: {
    flex: 1,
    marginTop: Platform.OS === "android" ? 20 : 0,
  },

  section: {
    paddingHorizontal: 16,
    marginTop: 28,
  },

  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: "#264B8B",
    marginBottom: 10,
  },

  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: "#444",
  },

  listItem: {
    fontSize: 16,
    color: "#444",
    marginBottom: 6,
  },

  hadithBox: {
    backgroundColor: "#f0f0f0",
    padding: 16,
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 12,
  },
  hadithText: {
    fontStyle: "italic",
    fontSize: 16,
    color: "#333",
  },

  calcInfo: {
    backgroundColor: "#fff3cd",
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 20,
  },
  calcText: {
    fontSize: 16,
    color: "#856404",
    marginBottom: 4,
  },
});
