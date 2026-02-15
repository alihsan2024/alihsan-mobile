import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSelector } from "react-redux";
import { useGetBasketQuery } from "@/store/reduxSlice/api/basketApi";
import { useFormik } from "formik";
import * as yup from "yup";
import api from "@/utils/api";

const validationSchema = yup.object({
  firstName: yup.string().required(),
  lastName: yup.string().required(),
  email: yup.string().email().required(),
  phone: yup.string().required(),
  address: yup.string().required(),
  city: yup.string().required(),
  state: yup.string().required(),
  zip: yup.string().required(),
  country: yup.string().length(2).required(),
});

const initialValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  company: "",
  country: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  status: true,
};

export function useCheckout(onSuccess: () => void) {
  const user = useSelector((s: any) => s.authentication.user);
  const isAuthenticated = !!user;

  const { data } = useGetBasketQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [guestBasket, setGuestBasket] = useState<any[]>([]);
  const basketItems = isAuthenticated ? data?.payload ?? [] : guestBasket;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      AsyncStorage.getItem("guestBasket").then((d) =>
        setGuestBasket(d ? JSON.parse(d) : [])
      );
    }
  }, [isAuthenticated]);

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);

        const payload = {
          ...values,
          basketItems,
        };

        const ROLES = { ADMIN: "ADMIN", SUPERADMIN: "SUPERADMIN" };
        let response;

        if (
          !user?.email ||
          user?.role === ROLES.ADMIN ||
          user?.role === ROLES.SUPERADMIN ||
          !isAuthenticated
        ) {
          response = await api.post("/basket/checkout-unknown", {
            ...payload,
            paymentGateway: "stripe",
            isAnonymous: true,
          });
        } else {
          response = await api.patch("/profile", payload);
        }

        const resPayload = response.data?.payload;

        // Use secure storage for sensitive payment data (clientSecret, paymentIntentId)
        const { secureSetItem } = await import("@/utils/secureStorage");
        await secureSetItem(
          "checkoutDetails",
          JSON.stringify({
            ...payload,
            clientSecret: resPayload?.clientSecret,
            paymentIntentId: resPayload?.paymentIntentId,
            donationIds: resPayload?.donationIds,
          })
        );

        onSuccess();
      } finally {
        setLoading(false);
      }
    },
  });

  // Load profile
  useEffect(() => {
    if (!isAuthenticated) return;

    api.get("/profile").then((res) => {
      const p = res.data?.payload;
      if (!p) return;
      formik.setValues({
        ...formik.values,
        firstName: p.firstName ?? "",
        lastName: p.lastName ?? "",
        email: p.email ?? "",
        phone: p.phone ?? "",
        company: p.company ?? "",
        address: p.address ?? "",
        city: p.city ?? "",
        state: p.state ?? "",
        zip: p.zip ?? "",
        country: p.country ?? "",
        status: true,
      });
    });
  }, [isAuthenticated]);

  return { formik, loading };
}
