import { formatPrice } from "@/utils/helper";
import { StyleSheet, Text, View } from "react-native";

const Row = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.row}>
    <Text style={[styles.rowLabel]}>{label}</Text>
    <Text style={[styles.rowValue, styles.boldText]}>{value}</Text>
  </View>
);

const Divider = () => <View style={styles.divider} />;

interface BasketTotalProps {
  subTotal: number;
  processingAmount: number | string;
  total: number;
}

const BasketTotal = ({
  subTotal,
  processingAmount,
  total,
}: BasketTotalProps) => {
  return (
    <View>
      <Text style={styles.sectionTitle}>Price details</Text>

      <View style={styles.priceBox}>
        <Row label="Subtotal" value={`$${formatPrice(subTotal)}`} />
        <Row
          label="Admin Fee"
          value={`$${formatPrice(parseFloat(processingAmount.toString()))}`}
        />
        <Divider />
        <View style={styles.infoRow}>
          <Text style={styles.infoText}>
            So 100% of my donation goes directly to the field.
          </Text>
          <View
            style={{
              width: 36,
              height: 20,
              borderRadius: 12,
              backgroundColor: "#22C55E",
              justifyContent: "center",
              alignItems: "flex-end",
              padding: 2,
            }}
          >
            <View
              style={{
                width: 16,
                height: 16,
                borderRadius: 8,
                backgroundColor: "#fff",
              }}
            />
          </View>
        </View>
        <Divider />
        <Row label="Total" value={`$${formatPrice(total)}`} />
      </View>
    </View>
  );
};

export default BasketTotal;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },

  card: {
    borderRadius: 12,
  },

  donationItem: {
    fontSize: 12,
    color: "#666",
  },

  itemRow: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    borderColor: "#010D261A",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
    marginHorizontal: 16,
  },

  itemImage: {
    width: 64,
    height: 68,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
  },

  itemContent: {
    flex: 1,
  },

  itemTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },

  itemSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },

  itemPrice: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "600",
  },

  itemPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  itemUnitPrice: {
    fontSize: 12,
    color: "#999",
    marginLeft: 8,
  },

  recurringBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },

  recurringIcon: {
    fontSize: 10,
    marginRight: 4,
  },

  recurringText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#264B8B",
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },

  sectionTitle: {
    marginTop: 20,
    marginBottom: 8,
    fontSize: 18,
    fontWeight: "600",
    color: "#010D26",
  },

  priceBox: {
    borderRadius: 12,
    paddingVertical: 12,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  rowLabel: {
    fontSize: 14,
    color: "#010D26",
  },

  rowValue: {
    fontSize: 14,
    color: "#111827",
  },

  boldText: {
    fontWeight: "700",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  infoText: {
    flex: 1,
    fontSize: 12,
    color: "#010D26",
    marginRight: 8,
  },

  footer: {
    padding: 16,
    backgroundColor: "#FFFFFF",
  },

  checkoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FACC15",
    borderRadius: 10,
    paddingVertical: 10,
    gap: 6,
  },

  checkoutText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
  },

  termsText: {
    marginTop: 8,
    fontSize: 12,
    textAlign: "center",
    color: "#010D26",
  },
});
