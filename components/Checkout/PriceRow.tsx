import { StyleSheet, Text, View } from "react-native";

const PriceRow = ({ label, value, bold }: any) => (
  <View style={styles.priceRow}>
    <Text style={[styles.priceText, bold && styles.bold]}>{label}</Text>
    <Text style={[styles.priceText, bold && styles.bold]}>{value}</Text>
  </View>
);
export default PriceRow;

const styles = StyleSheet.create({
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  priceText: { fontSize: 14 },
  bold: { fontWeight: "700" },
});
