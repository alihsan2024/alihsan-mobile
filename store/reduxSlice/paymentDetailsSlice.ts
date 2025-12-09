import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/utils/api";

const initialState = {
  paymentMethods: {
    list: [],
    loading: false,
    error: "",
  },
  paymentList: {
    rows: [],
    count: 0,
    loading: false,
    error: "",
  },
};

export const getPaymentMethods = createAsyncThunk(
  "payment-details/get-payment-methods",
  async () => {
    try {
      const response = await api.get("payment/methods");
      const data = response.data.payload;
      return data;
    } catch (e: any) {
      throw new Error(e.response?.data?.message || e.message);
    }
  }
);
export interface PaymentsListParams {
  page: string;
  fromdate: string;
  limit: number;
}
export const getPaymentsList = createAsyncThunk<any, PaymentsListParams>(
  "payment-details/get-payment-list",
  async (params) => {
    try {
      const response = await api.get("payment/for-user", {
        params: params,
      });
      const data = response.data.payload;
      return data;
    } catch (e: any) {
      throw new Error(e.response?.data?.message || e.message);
    }
  }
);

export const deletePaymentMethod = createAsyncThunk(
  "delete/paymentMethod",
  async (param) => {
    try {
      const response = await api.delete("payment/method/" + param);
      const data = response.data;
      return data;
    } catch (e: any) {
      throw new Error(e.response?.data?.message || e.message);
    }
  }
);

export const updateCheckoutProfile = createAsyncThunk(
  "post/checkoutProfile",
  async (payload, thunkAPI) => {
    try {
      const response = await api.post("basket/checkout-unknown", payload);
      return response.data;
    } catch (e: any) {
      return thunkAPI.rejectWithValue(e.response.data);
    }
  }
);

export const updatePaypalToken = createAsyncThunk(
  "post/paypalToken",
  async (payload, thunkAPI) => {
    try {
      const response = await api.post("basket/paypal-capture", payload);
      return response.data;
    } catch (e: any) {
      return thunkAPI.rejectWithValue(e.response.data);
    }
  }
);

export const paymentDetailsSlice = createSlice({
  name: "payment-details",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getPaymentMethods.fulfilled, (state, action) => {
        state.paymentMethods = {
          list: action.payload,
          loading: false,
          error: "",
        };
      })
      .addCase(getPaymentMethods.pending, (state, action) => {
        state.paymentMethods.loading = true;
        state.paymentMethods.error = "";
      })
      .addCase(getPaymentMethods.rejected, (state, action) => {
        state.paymentMethods.loading = false;
        state.paymentMethods.list = [];
        state.paymentMethods.error = action.error.message || "";
      });

    builder
      .addCase(getPaymentsList.fulfilled, (state, action) => {
        state.paymentList = {
          ...action.payload,
          loading: false,
          error: "",
        };
      })
      .addCase(getPaymentsList.pending, (state, action) => {
        state.paymentList.loading = true;
        state.paymentList.error = "";
      })
      .addCase(getPaymentsList.rejected, (state, action) => {
        state.paymentList.loading = false;
        state.paymentList.error = action.error.message || "";
      });
  },
});
export default paymentDetailsSlice.reducer;
