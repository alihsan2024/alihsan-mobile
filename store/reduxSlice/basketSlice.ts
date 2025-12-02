import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import api from "@/utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import { trackAddToCart as trackDataLayerAddToCart } from "@/utils/dataLayerTracking";

export interface BasketItem {
  campaignId: number;
  donationItem?: any;
  [key: string]: any;
}

export interface BasketState {
  basketItems: BasketItem[];
  interestedItems: any[];
  zakatItem: any;
  count: number;
  loading: boolean;
  isBasketOpen: boolean;
  isAnonymous: boolean;
  error: string;
  isBankTransfer: boolean;
  isUpsellOpen: boolean;
}

const initialState: BasketState = {
  basketItems: [],
  interestedItems: [],
  zakatItem: null,
  count: 0,
  loading: false,
  isBasketOpen: false,
  isAnonymous: false,
  error: "",
  isBankTransfer: true,
  isUpsellOpen: true,
};

export const getBasketItems = createAsyncThunk<
  BasketItem[],
  void,
  { rejectValue: string }
>("get/basketItems", async (_, thunkAPI) => {
  try {
    const response = await api.get("basket");
    const data = response?.data?.payload?.map((item: any) => ({
      ...item,
      coverImage: item?.Campaign?.coverImage,
      name: item?.Campaign?.name,
    }));
    if (response.status === 200) {
      await AsyncStorage.setItem("checkout", JSON.stringify(data));
      return data;
    } else {
      return thunkAPI.rejectWithValue("Failed to fetch basket items");
    }
  } catch (e: any) {
    if (e.response?.status === 401) {
      const checkout = await AsyncStorage.getItem("checkout");
      return checkout ? JSON.parse(checkout) : [];
    }
    return thunkAPI.rejectWithValue(e?.response?.message || "Unknown error");
  }
});

export const addBasketItem = createAsyncThunk<any, any>(
  "add/donation",
  async (data, thunkAPI) => {
    try {
      const response = await api.post("basket", data);
      let datas = response?.data?.payload;
      if (response.status === 200) {
        return datas;
      } else {
        return thunkAPI.rejectWithValue(datas);
      }
    } catch (e: any) {
      return thunkAPI.rejectWithValue(e?.response?.data || "Unknown error");
    }
  }
);

export const bulkAddDonation = createAsyncThunk<any, any>(
  "add/donations",
  async (data, thunkAPI) => {
    try {
      const response = await api.put("basket/all", data);
      let datas = response?.data?.payload;
      if (response.status === 200) {
        return datas;
      } else {
        return thunkAPI.rejectWithValue(datas);
      }
    } catch (e: any) {
      return thunkAPI.rejectWithValue(e?.response?.data || "Unknown error");
    }
  }
);

export const updateBasketItem = createAsyncThunk<any, any>(
  "add/donation",
  async (data, thunkAPI) => {
    try {
      const response = await api.put("basket", data);
      let datas = response?.data?.payload;
      if (response.status === 200) {
        return datas;
      } else {
        return thunkAPI.rejectWithValue(datas);
      }
    } catch (e: any) {
      return thunkAPI.rejectWithValue(e?.response?.data || "Unknown error");
    }
  }
);

export const removeBasketItem = createAsyncThunk<
  number,
  { campaignId: number; donationItem?: any }
>("remove/basketItem", async (payload, thunkAPI) => {
  try {
    const response = await api.delete("basket", {
      data: {
        campaignId: payload.campaignId,
        donationItem: payload.donationItem,
      },
    });
    if (response.status === 200) {
      return payload.campaignId;
    } else {
      return thunkAPI.rejectWithValue(payload.campaignId);
    }
  } catch (e: any) {
    if (e?.response?.status === 401) {
      return payload.campaignId;
    }
    return thunkAPI.rejectWithValue(e?.response?.data || "Unknown error");
  }
});

export const getInterestedItems = createAsyncThunk<any, any>(
  "get/interestedItem",
  async (payload, thunkAPI) => {
    try {
      const response = await api.post("project/interested", [230]);
      if (response.status === 200) {
        return response?.data?.payload;
      } else {
        return thunkAPI.rejectWithValue(response?.data?.payload);
      }
    } catch (e: any) {
      if (e?.response?.status === 401) {
        return payload;
      }
      return thunkAPI.rejectWithValue(e?.response?.data || "Unknown error");
    }
  }
);

export const getAnyZakatCampaign = createAsyncThunk<any, any>(
  "get/any-zakat-campaign",
  async (payload, thunkAPI) => {
    try {
      const response = await api.get("project/get-any-zakat-campaign");
      if (response.status === 200) {
        return response?.data?.payload;
      } else {
        return thunkAPI.rejectWithValue(response?.data?.payload);
      }
    } catch (e: any) {
      if (e?.response?.status === 401) {
        return payload;
      }
      return thunkAPI.rejectWithValue(e?.response?.data || "Unknown error");
    }
  }
);

export const handleBasketCheckout = createAsyncThunk<any, any>(
  "handle/basketCheckout",
  async (payload, thunkAPI) => {
    try {
      const response = await api.post("/basket/checkout", payload);
      if (response.status === 200) {
        return response?.data;
      } else {
        return thunkAPI.rejectWithValue(response?.data?.payload);
      }
    } catch (e: any) {
      if (e?.response?.status === 401) {
        return payload;
      }
      return thunkAPI.rejectWithValue(e?.response?.data || "Unknown error");
    }
  }
);
export const handlePaypalCheckout = createAsyncThunk<any, any>(
  "handle/paypalCheckout",
  async (payload, thunkAPI) => {
    try {
      const response = await api.post("/basket/paypal-checkout", payload);
      if (response.status === 200) {
        return response?.data;
      } else {
        return thunkAPI.rejectWithValue(response?.data?.payload);
      }
    } catch (e: any) {
      if (e?.response?.status === 401) {
        return e?.response?.data;
      }
      return thunkAPI.rejectWithValue(
        e?.response?.payload?.payload?.error || "Unknown error"
      );
    }
  }
);

export const basketSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    emptyBasket: (state, action) => {
      state.basketItems = [];
    },
    updateBasket: (state, action) => {
      state.basketItems = [...state.basketItems, action?.payload];
    },
    editBasket: (
      state,
      action: PayloadAction<{ index: number; newValue: BasketItem }>
    ) => {
      const { index, newValue } = action.payload;
      const newBasketItems = [...state.basketItems];
      newBasketItems[index] = newValue;
      // Save to AsyncStorage instead of localStorage
      AsyncStorage.setItem("checkout", JSON.stringify(newBasketItems));
      state.basketItems = newBasketItems;
    },
    addBasket: (state, action) => {
      state.basketItems = action?.payload;
    },
    toggleBasket: (state) => {
      state.isBasketOpen = !state.isBasketOpen;
    },
    setIsAnonymous: (state, action) => {
      state.isAnonymous = action.payload;
    },
    toggleBankTransfer: (state, action) => {
      state.isBankTransfer = action.payload;
    },
    toggleUpsellBasket: (state, action) => {
      state.isUpsellOpen = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getBasketItems.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getBasketItems.fulfilled, (state, action) => {
      state.loading = false;
      state.basketItems = action?.payload;
      state.error = "";
    });
    builder.addCase(getBasketItems.rejected, (state, action) => {
      state.loading = false;
      state.basketItems = [];
      state.error = "";
    });
    builder.addCase(removeBasketItem.fulfilled, (state, action) => {
      state.loading = false;
      state.basketItems = state?.basketItems.filter(
        (item) => item.campaignId !== action.payload
      );
      state.error = "";
    });
    builder.addCase(removeBasketItem.rejected, (state, action) => {
      state.loading = false;
      state.basketItems = [];
      state.error = "";
    });
    builder.addCase(addBasketItem.fulfilled, (state, action) => {
      // Always refresh basket from API after add/update/remove
      // Do not update basketItems here, let getBasketItems handle it
      state.loading = false;
      state.error = "";
    });
    builder.addCase(getInterestedItems.fulfilled, (state, action) => {
      state.interestedItems = action?.payload;
    });
    builder.addCase(getAnyZakatCampaign.fulfilled, (state, action) => {
      state.loading = false;
      state.zakatItem = action?.payload;
    });
    builder.addCase(getAnyZakatCampaign.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(getAnyZakatCampaign.rejected, (state, action) => {
      state.loading = false;
      state.zakatItem = [];
    });
  },
});

export const {
  emptyBasket,
  updateBasket,
  addBasket,
  toggleBasket,
  setIsAnonymous,
  editBasket,
  toggleBankTransfer,
  toggleUpsellBasket,
} = basketSlice.actions;

export default basketSlice.reducer;
