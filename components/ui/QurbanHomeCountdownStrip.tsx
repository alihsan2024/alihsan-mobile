import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { QURBAN_FINALISE_DEADLINE } from "@/config/qurbanFinalisationCountdown";

function useCountdown(deadline: Date) {
  const [ms, setMs] = useState(() => Math.max(0, deadline.getTime() - Date.now()));
  useEffect(() => {
    const id = setInterval(() => setMs(Math.max(0, deadline.getTime() - Date.now())), 1000);
    return () => clearInterval(id);
  }, [deadline]);
  return ms;
}

function decompose(ms: number) {
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const totalSec = Math.floor(ms / 1000);
  const seconds = totalSec % 60;
  const totalMin = Math.floor(totalSec / 60);
  const minutes = totalMin % 60;
  const totalHr = Math.floor(totalMin / 60);
  const hours = totalHr % 24;
  const days = Math.floor(totalHr / 24);
  return { days, hours, minutes, seconds };
}

const deadlineLabel = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  day: "numeric",
  month: "short",
}).format(QURBAN_FINALISE_DEADLINE);

function ClockUnit({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.clockUnit}>
      <Text style={styles.clockValue} maxFontSizeMultiplier={1.2}>
        {String(value).padStart(2, "0")}
      </Text>
      <Text style={styles.clockLabel}>{label}</Text>
    </View>
  );
}

/**
 * Compact Qurban finalisation countdown for the home banner (AU parity with QurbanAppealCountdownBanner).
 */
export default function QurbanHomeCountdownStrip() {
  const ms = useCountdown(QURBAN_FINALISE_DEADLINE);
  const [blink, setBlink] = useState(true);
  const { days, hours, minutes, seconds } = decompose(ms);
  const passed = ms === 0;

  useEffect(() => {
    const id = setInterval(() => setBlink((b) => !b), 1000);
    return () => clearInterval(id);
  }, []);

  if (passed) {
    return (
      <View style={styles.passedBox}>
        <Text style={styles.passedText} numberOfLines={3}>
          Online finalisation closed.{" "}
          <Text style={styles.passedLink} onPress={() => Linking.openURL("tel:1300998444")}>
            Call 1300 998 444
          </Text>{" "}
          for help.
        </Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => router.push("/(tabs)/qurban-2026")}
      accessibilityRole="button"
      accessibilityLabel="Qurban finalisation countdown, opens Qurban 2026"
    >
      <LinearGradient
        colors={["#244180", "#1a3060", "#1e3a5c"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.row}>
          <View style={styles.titleCol}>
            <Text style={styles.guthen} numberOfLines={1}>
              Finalise your Qurban
            </Text>
            <Text style={styles.sub} numberOfLines={1}>
              Closes {deadlineLabel}
            </Text>
          </View>
          <View style={styles.clocks}>
            <ClockUnit value={days} label="d" />
            <Text style={[styles.colon, { opacity: blink ? 1 : 0.35 }]}>:</Text>
            <ClockUnit value={hours} label="h" />
            <Text style={[styles.colon, { opacity: blink ? 1 : 0.35 }]}>:</Text>
            <ClockUnit value={minutes} label="m" />
            <Text style={[styles.colon, { opacity: blink ? 1 : 0.35 }]}>:</Text>
            <ClockUnit value={seconds} label="s" />
          </View>
        </View>
        <Text style={styles.ctaHint}>Tap to order →</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gradient: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 0,
    marginBottom: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  titleCol: {
    flex: 1,
    minWidth: 0,
  },
  guthen: {
    fontFamily: "Guthen Bloots",
    fontSize: 17,
    color: "#FFD602",
    lineHeight: 20,
  },
  sub: {
    fontSize: 9,
    color: "rgba(255,255,255,0.5)",
    marginTop: 1,
  },
  clocks: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
    gap: 1,
  },
  clockUnit: {
    alignItems: "baseline",
    flexDirection: "row",
    gap: 1,
  },
  clockValue: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
    fontVariant: ["tabular-nums"],
    fontFamily: "AlbertSans_700Bold",
  },
  clockLabel: {
    fontSize: 8,
    fontWeight: "600",
    color: "rgba(255,255,255,0.45)",
    textTransform: "uppercase",
  },
  colon: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFD602",
    paddingHorizontal: 0,
    marginTop: -2,
  },
  ctaHint: {
    fontSize: 10,
    fontWeight: "600",
    color: "rgba(255,255,255,0.65)",
    marginTop: 4,
    textAlign: "right",
    fontFamily: "AlbertSans_600SemiBold",
  },
  passedBox: {
    marginTop: 0,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255, 251, 235, 0.95)",
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.45)",
  },
  passedText: {
    fontSize: 11,
    color: "#010D26",
    lineHeight: 15,
  },
  passedLink: {
    fontWeight: "700",
    color: "#244180",
    textDecorationLine: "underline",
  },
});
