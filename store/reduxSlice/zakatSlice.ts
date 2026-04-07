// Types for getMetalPrices API response
export interface MetalPriceItem {
  key: number;
  label: string;
  value: number;
}

export interface MetalPrice {
  id: number;
  createdAt: string;
  updatedAt: string;
  goldPriceInAud: string;
  goldPriceInUsd: string;
  silverPriceInAud: string;
  silverPriceInUsd: string;
  todayAud: string;
}

export interface MetalPricesState {
  goldPriceInAud: MetalPriceItem[];
  goldPriceInUsd: MetalPriceItem[];
  price: MetalPrice;
  silverFinePriceInAud: number;
  silverFinePriceInUsd: number;
  silverSterlingPriceInAud: number;
  silverSterlingPriceInUsd: number;
}
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/utils/api";

export type ZakatAmountKeys =
  | "cash"
  | "unit"
  | "bank"
  | "silver"
  | "gold"
  | "investmentProfit"
  | "shareResale"
  | "merchandise"
  | "loan"
  | "other";

const initialState = {
  step: 1,
  prices: {
    goldPriceInAud: [],
    goldPriceInUsd: [],
    price: {
      id: 0,
      createdAt: "",
      updatedAt: "",
      goldPriceInAud: "",
      goldPriceInUsd: "",
      silverPriceInAud: "",
      silverPriceInUsd: "",
      todayAud: "",
    },
    silverFinePriceInAud: 0,
    silverFinePriceInUsd: 0,
    silverSterlingPriceInAud: 0,
    silverSterlingPriceInUsd: 0,
    loading: false,
  },
  amounts: {
    cash: 0,
    unit: "AUD",
    bank: 0,
    silver: [{ karat: "1", unit: "gram", weight: 0, value: 0, key: 0 }],
    gold: [{ karat: "1", unit: "gram", weight: 0, value: 0, key: 0 }],
    investmentProfit: 0,
    shareResale: 0,
    merchandise: 0,
    loan: 0,
    other: 0,
  },
};

export const getMetalPrices = createAsyncThunk(
  "zakat-caculator/get-metal-prices",
  async () => {
    const response = await api.get("/metal-price");
    console.log("test", response.data.payload);
    return response.data.payload;
  }
);

const slice = createSlice({
  name: "zakat-calculator",
  initialState,
  reducers: {
    zakatStep: (state, action: { payload: number }) => {
      state.step += action.payload;
    },
    zakatInput: (
      state,
      action: {
        payload: { name: keyof typeof initialState.amounts; value: any };
      }
    ) => {
      (state.amounts as any)[action.payload.name] = action.payload.value;
    },
    zakatMetalInput: (
      state,
      action: {
        payload: {
          name: keyof typeof initialState.amounts;
          key: number;
        } & Record<string, any>;
      }
    ) => {
      const arrayToUpdate = (state.amounts as any)[
        action.payload.name
      ] as Array<any>;
      const existingIndex = arrayToUpdate.findIndex(
        (item: any) => item.key === action.payload.key
      );
      if (existingIndex !== -1) arrayToUpdate[existingIndex] = action.payload;
      else arrayToUpdate.push(action.payload);
    },
    /** Removes one gold or silver line by key; keeps at least one empty row. */
    zakatMetalRemove: (
      state,
      action: {
        payload: { name: "gold" | "silver"; key: number };
      }
    ) => {
      const name = action.payload.name;
      const arr = (state.amounts as any)[name] as Array<any>;
      const filtered = arr.filter((item: any) => item.key !== action.payload.key);
      if (filtered.length === 0) {
        (state.amounts as any)[name] = [
          { karat: "1", unit: "gram", weight: 0, value: 0, key: 0 },
        ];
      } else {
        (state.amounts as any)[name] = filtered;
      }
    },
    zakatResetInput: (state) => {
      state.amounts = initialState.amounts;
    },
    resetZakatInput: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(getMetalPrices.fulfilled, (state, action) => {
      state.prices.goldPriceInAud = action.payload.goldPriceInAud;
      state.prices.goldPriceInUsd = action.payload.goldPriceInUsd;
      state.prices.price = {
        ...action.payload.price,
        goldPriceInAud: Number(action.payload.price.goldPriceInAud) || 0,
        goldPriceInUsd: Number(action.payload.price.goldPriceInUsd) || 0,
        silverPriceInAud: Number(action.payload.price.silverPriceInAud) || 0,
        silverPriceInUsd: Number(action.payload.price.silverPriceInUsd) || 0,
        todayAud: Number(action.payload.price.todayAud) || 0,
      };
      state.prices.silverFinePriceInAud =
        Number(action.payload.silverFinePriceInAud) || 0;
      state.prices.silverFinePriceInUsd =
        Number(action.payload.silverFinePriceInUsd) || 0;
      state.prices.silverSterlingPriceInAud =
        typeof action.payload.silverSterlingPriceInAud === "number"
          ? action.payload.silverSterlingPriceInAud
          : Number(action.payload.silverSterlingPriceInAud) || 0;
      state.prices.silverSterlingPriceInUsd =
        typeof action.payload.silverSterlingPriceInUsd === "number"
          ? action.payload.silverSterlingPriceInUsd
          : Number(action.payload.silverSterlingPriceInUsd) || 0;
      state.prices.loading = false;
    });
  },
});

export const {
  zakatStep,
  zakatInput,
  zakatMetalInput,
  zakatMetalRemove,
  zakatResetInput,
  resetZakatInput,
} = slice.actions;

export default slice.reducer;
