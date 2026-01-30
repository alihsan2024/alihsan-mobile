// import React from "react";
// import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
// import { CardField, CardFieldInput } from "@stripe/stripe-react-native";

// type PaymentState = {
//   paymentType: "card" | "paypal";
//   cardDetails: any;
//   cardComplete: boolean;
// };

// type Props = {
//   paymentState: PaymentState;
//   setPaymentState: React.Dispatch<React.SetStateAction<PaymentState>>;
// };

// const PaymentStep = ({ paymentState, setPaymentState }: Props) => {
//   return (
//     <View>
//       <Text style={styles.sectionTitle}>Select Payment Method</Text>

//       {/* CARD */}
//       <View style={styles.card}>
//         <Text style={styles.cardTitle}>Credit Card</Text>

//         <CardField
//           postalCodeEnabled={false}
//           placeholders={{ number: "4242 4242 4242 4242" }}
//           cardStyle={{
//             backgroundColor: "#FFFFFF",
//             textColor: "#000000",
//           }}
//           style={styles.cardField}
//           onCardChange={(details) => {
//             console.log("PAYMENT STEP details", details);
//             console.log("SET cardComplete", details.complete);

//             setPaymentState((prev) => ({
//               ...prev,
//               paymentType: "card",
//               cardDetails: details,
//               cardComplete: !!details.complete, // 👈 THIS MUST EXIST
//             }));
//           }}
//         />

//         <Text style={styles.helperText}>
//           Card details will be charged on the next step
//         </Text>
//       </View>

//       {/* PAYPAL (future-ready) */}
//       <View style={styles.card}>
//         <Text style={styles.cardTitle}>PayPal</Text>
//         <TouchableOpacity
//           onPress={() =>
//             setPaymentState((s) => ({
//               ...s,
//               paymentType: "paypal",
//             }))
//           }
//         >
//           <Text style={styles.link}>Use PayPal instead</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// export default PaymentStep;

// const styles = StyleSheet.create({
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     marginBottom: 12,
//   },
//   card: {
//     borderWidth: 1,
//     borderColor: "#E5E5E5",
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//   },
//   cardTitle: {
//     fontWeight: "600",
//     marginBottom: 12,
//   },
//   cardField: {
//     width: "100%",
//     height: 50,
//     marginVertical: 12,
//   },
//   helperText: {
//     fontSize: 12,
//     color: "#777",
//     marginTop: 8,
//   },
//   link: {
//     color: "#264B8B",
//     marginTop: 8,
//   },
// });
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { CardField } from "@stripe/stripe-react-native";
import { Ionicons } from "@expo/vector-icons";
export type PaymentState = {
  paymentType: "card" | "paypal" | "applepay";
  cardDetails: any;
  cardComplete: boolean;
};

type Props = {
  paymentState: PaymentState;
  setPaymentState: React.Dispatch<React.SetStateAction<PaymentState>>;
  isApplePaySupported?: boolean;
};

export default function PaymentStep({ paymentState, setPaymentState, isApplePaySupported = false }: Props) {

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Select Payment Method</Text>

      {/* APPLE PAY - iOS only */}
      {Platform.OS === "ios" && isApplePaySupported && (
        <TouchableOpacity
          style={[
            styles.card,
            paymentState.paymentType === "applepay" && styles.cardSelected,
          ]}
          onPress={() =>
            setPaymentState((s) => ({
              ...s,
              paymentType: "applepay",
            }))
          }
        >
          <View style={styles.cardHeader}>
            <Ionicons name="logo-apple" size={18} color="#010D26" />
            <Text style={styles.cardTitle}>Apple Pay</Text>
            {paymentState.paymentType === "applepay" && (
              <View style={styles.selectedIndicator}>
                <Ionicons name="checkmark-circle" size={20} color="#264B8B" />
              </View>
            )}
          </View>

          <Text style={styles.checkboxText}>
            Pay securely with Touch ID or Face ID
          </Text>
        </TouchableOpacity>
      )}

      {/* CREDIT CARD */}
      <TouchableOpacity
        style={[
          styles.card,
          paymentState.paymentType === "card" && styles.cardSelected,
        ]}
        onPress={() =>
          setPaymentState((s) => ({
            ...s,
            paymentType: "card",
          }))
        }
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <Ionicons name="card-outline" size={18} color="#264B8B" />
          <Text style={styles.cardTitle}>Credit Card</Text>
          {paymentState.paymentType === "card" && (
            <View style={styles.selectedIndicator}>
              <Ionicons name="checkmark-circle" size={20} color="#264B8B" />
            </View>
          )}
        </View>

        {/* Stripe CardField styled to match Figma */}
        <View style={styles.cardInputWrapper}>
          <CardField
            postalCodeEnabled={false}
            cardStyle={{
              backgroundColor: "#FFFFFF",
              textColor: "#000000",
            }}
            style={styles.cardField}
            onCardChange={(details) => {
              setPaymentState((s) => ({
                ...s,
                paymentType: "card",
                cardDetails: details,
                cardComplete: !!details.complete,
              }));
            }}
          />
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.checkboxRow}>
            <View style={styles.checkbox} />
            <Text style={styles.checkboxText}>Save this card for later</Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              setPaymentState((s) => ({
                ...s,
                cardDetails: null,
                cardComplete: false,
              }));
            }}
          >
            <Text style={styles.link}>Clear form</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* PAYPAL */}
      <TouchableOpacity
        style={[
          styles.card,
          paymentState.paymentType === "paypal" && styles.cardSelected,
        ]}
        onPress={() =>
          setPaymentState((s) => ({
            ...s,
            paymentType: "paypal",
          }))
        }
      >
        <View style={styles.cardHeader}>
          <Ionicons name="logo-paypal" size={18} color="#264B8B" />
          <Text style={styles.cardTitle}>Paypal</Text>
          {paymentState.paymentType === "paypal" && (
            <View style={styles.selectedIndicator}>
              <Ionicons name="checkmark-circle" size={20} color="#264B8B" />
            </View>
          )}
        </View>

        <Text style={styles.checkboxText}>
          Complete payment securely with PayPal
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#010D26",
    marginBottom: 12,
    fontFamily: "AlbertSans_800ExtraBold",
    textAlign: "center",
    width: "100%",
  },

  card: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
    width: "100%",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#010D26",
    fontFamily: "AlbertSans_700Bold",
  },

  cardInputWrapper: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  cardField: {
    height: 44,
  },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },

  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#9CA3AF",
  },

  checkboxText: {
    fontSize: 11,
    color: "#6B7280",
    fontFamily: "AlbertSans_400Regular",
  },

  link: {
    fontSize: 12,
    color: "#264B8B",
    fontWeight: "600",
    fontFamily: "AlbertSans_600SemiBold",
  },
  cardSelected: {
    borderColor: "#264B8B",
    borderWidth: 2,
    backgroundColor: "#F0F4FF",
  },
  selectedIndicator: {
    marginLeft: "auto",
  },
});
