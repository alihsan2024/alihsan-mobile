// import React, { useEffect } from "react";
// import { StyleSheet, Text, View } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useSelector } from "react-redux";
// import { useFormik } from "formik";
// import * as yup from "yup";
// import api from "@/utils/api";
// import Input from "../ui/inputs/input";

// type Props = {
//   onValidChange?: (isValid: boolean) => void;
// };

// type FormValues = {
//   fullName: string;
//   email: string;
//   phone: string;
// };

// const validationSchema = yup.object({
//   fullName: yup.string().trim().required("Full name is required"),
//   email: yup.string().email("Invalid email").required("Email is required"),
//   phone: yup.string().required("Phone number is required"),
// });

// const DetailsStep = ({ onValidChange }: Props) => {
//   const user = useSelector((state: any) => state.authentication.user);
//   const isAuthenticated = !!user;

//   const formik = useFormik<FormValues>({
//     initialValues: {
//       fullName: "",
//       email: "",
//       phone: "",
//     },
//     validationSchema,
//     validateOnMount: true,
//     onSubmit: () => {},
//   });

//   /**
//    * Load profile for logged-in user (same as old code)
//    */
//   useEffect(() => {
//     const loadProfile = async () => {
//       if (!isAuthenticated) return;

//       try {
//         const res = await api.get("/profile");
//         const profile = res.data?.payload;

//         if (profile) {
//           formik.setValues({
//             fullName: `${profile.firstName || ""} ${
//               profile.lastName || ""
//             }`.trim(),
//             email: profile.email || "",
//             phone: profile.phone || "",
//           });
//         }
//       } catch (e) {
//         console.log("Profile load failed", e);
//       }
//     };

//     loadProfile();
//   }, [isAuthenticated]);

//   /**
//    * Persist FULL checkout payload (backend-safe)
//    */
//   useEffect(() => {
//     const persist = async () => {
//       const [firstName, ...rest] = formik.values.fullName.split(" ");
//       const lastName = rest.join(" ");

//       const checkoutPayload = {
//         // REQUIRED identity
//         firstName: firstName || "",
//         lastName: lastName || "",
//         email: formik.values.email,
//         phone: formik.values.phone,

//         // REQUIRED by backend (even if UI not shown yet)
//         address: "",
//         city: "",
//         state: "",
//         zip: "",
//         country: "",

//         // will be filled later
//         basketItems: [],
//         status: true,
//       };

//       await AsyncStorage.setItem(
//         "checkoutDetails",
//         JSON.stringify(checkoutPayload)
//       );

//       onValidChange?.(formik.isValid);
//     };

//     persist();
//   }, [formik.values, formik.isValid]);

//   return (
//     <View>
//       <Text style={styles.sectionTitle}>Your Identity</Text>
//       <Text style={styles.helperText}>
//         Ensure your details are correct for receipts.
//       </Text>

//       <Input
//         label="Full Name"
//         placeholder="Enter full name"
//         value={formik.values.fullName}
//         onChangeText={formik.handleChange("fullName")}
//         error={formik.touched.fullName ? formik.errors.fullName : undefined}
//       />

//       <Input
//         label="Email"
//         placeholder="Enter email"
//         keyboardType="email-address"
//         autoCapitalize="none"
//         value={formik.values.email}
//         onChangeText={formik.handleChange("email")}
//         error={formik.touched.email ? formik.errors.email : undefined}
//       />

//       <Input
//         label="Phone"
//         placeholder="Enter phone number"
//         keyboardType="phone-pad"
//         value={formik.values.phone}
//         onChangeText={formik.handleChange("phone")}
//         error={formik.touched.phone ? formik.errors.phone : undefined}
//       />
//     </View>
//   );
// };

// export default DetailsStep;

// const styles = StyleSheet.create({
//   sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
//   helperText: { color: "#777", marginBottom: 16 },
// });

import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSelector } from "react-redux";
import { useFormik } from "formik";
import * as yup from "yup";
import api from "@/utils/api";
import Input from "../ui/inputs/input";

type Props = {
  onValidChange?: (isValid: boolean) => void;
};

type FormValues = {
  fullName: string;
  email: string;
  phone: string;
};

const validationSchema = yup.object({
  fullName: yup.string().trim().required("Full name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup.string().required("Phone number is required"),
});

const DetailsStep = ({ onValidChange }: Props) => {
  const user = useSelector((state: any) => state.authentication.user);
  const isAuthenticated = !!user;

  const formik = useFormik<FormValues>({
    initialValues: {
      fullName: "",
      email: "",
      phone: "",
    },
    validationSchema,
    validateOnMount: true,
    onSubmit: () => {},
  });

  /**
   * Load profile for logged-in user
   */
  useEffect(() => {
    const loadProfile = async () => {
      if (!isAuthenticated) return;

      try {
        const res = await api.get("/profile");
        const profile = res.data?.payload;

        if (profile) {
          formik.setValues({
            fullName: `${profile.firstName || ""} ${
              profile.lastName || ""
            }`.trim(),
            email: profile.email || "",
            phone: profile.phone || "",
          });
        }
      } catch (e) {
        console.log("Profile load failed", e);
      }
    };

    loadProfile();
  }, [isAuthenticated]);

  /**
   * Persist BACKEND-SAFE checkout details
   */
  useEffect(() => {
    const persist = async () => {
      const nameParts = formik.values.fullName.trim().split(/\s+/);

      const firstName = nameParts[0] ?? "";
      const lastName =
        nameParts.length > 1 ? nameParts.slice(1).join(" ") : nameParts[0]; // ✅ fallback for single-name users

      const checkoutPayload = {
        // REQUIRED identity
        firstName,
        lastName,
        email: formik.values.email,
        phone: formik.values.phone,

        // REQUIRED by backend for guest checkout
        address: "N/A",
        city: "N/A",
        state: "N/A",
        zip: "00000",
        country: "PK",

        // Filled later
        basketItems: [],
        status: true,
      };

      console.log("DETAILS STEP → checkoutPayload", checkoutPayload);

      await AsyncStorage.setItem(
        "checkoutDetails",
        JSON.stringify(checkoutPayload)
      );

      onValidChange?.(formik.isValid);
    };

    persist();
  }, [formik.values, formik.isValid]);

  return (
    <View>
      <Text style={styles.sectionTitle}>Your Identity</Text>
      <Text style={styles.helperText}>
        Ensure your details are correct for receipts.
      </Text>

      <Input
        label="Full Name"
        placeholder="Enter full name"
        value={formik.values.fullName}
        onChangeText={formik.handleChange("fullName")}
        error={formik.touched.fullName ? formik.errors.fullName : undefined}
      />

      <Input
        label="Email"
        placeholder="Enter email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={formik.values.email}
        onChangeText={formik.handleChange("email")}
        error={formik.touched.email ? formik.errors.email : undefined}
      />

      <Input
        label="Phone"
        placeholder="Enter phone number"
        keyboardType="phone-pad"
        value={formik.values.phone}
        onChangeText={formik.handleChange("phone")}
        error={formik.touched.phone ? formik.errors.phone : undefined}
      />
    </View>
  );
};

export default DetailsStep;

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  helperText: { color: "#777", marginBottom: 16 },
});
