import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/utils/api";

const initialState = {
  project: null,
  loading: false,
  error: "",
  checkout: [] as any[],
  qurbanGroup: [] as any[],
};

export const getProject = createAsyncThunk(
  "get/project",
  async (id, thunkAPI) => {
    try {
      const response = await api.get("/project/details/" + id);
      let data = response?.data?.payload;
      if (response.status === 200) {
        return data;
      } else {
        return thunkAPI.rejectWithValue(data);
      }
    } catch (e: any) {
      return thunkAPI.rejectWithValue(e?.response?.data || "Unknown error");
    }
  }
);

export const addDonation = createAsyncThunk(
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
      return thunkAPI.rejectWithValue(e.response.data);
    }
  }
);
export const removeBasketItem = createAsyncThunk(
  "remove/basketItem",
  async (payload: { campaignId: string }, thunkAPI) => {
    try {
      const response = await api.delete("basket", {
        data: { campaignId: parseInt(payload.campaignId) },
      });
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

export const getQurbanGroups = createAsyncThunk(
  "get/qurban-groups",
  async (_, thunkAPI) => {
    try {
      const response = await api.get("/settings/qurban-groups");
      let data = response?.data?.payload;
      if (response.status === 200) {
        return data;
      } else {
        return thunkAPI.rejectWithValue(data);
      }
    } catch (e: any) {
      return thunkAPI.rejectWithValue(e?.response?.data || "Unknown error");
    }
  }
);

export const projectDetailSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    updateBasket: (state, action: { payload: any }) => {
      state.checkout = [...state.checkout, action.payload];
    },
    addBasket: (state, action: { payload: any[] }) => {
      state.checkout = action.payload;
    },
    emptyBasket: (state) => {
      state.checkout = [];
    },
    resetProject: (state) => {
      state.project = null;
    },
    // removeBasketItem: (state, action) => {
    //   const remainingItems = state.checkout.filter(
    //     (item, index) => index !== action?.payload
    //   );
    //   localStorage.setItem("checkout", JSON.stringify(remainingItems));
    //   state.checkout = remainingItems;
    // },
  },
  extraReducers: (builder) => {
    builder.addCase(getProject.pending, (state) => {
      state.loading = true;
      state.error = "";
    });
    builder.addCase(getProject.fulfilled, (state, action) => {
      state.loading = false;
      state.project = action?.payload;
      state.error = "";
    });
    builder.addCase(getProject.rejected, (state, action) => {
      state.loading = false;
      state.project = null;
      state.error = action?.error?.message || "";
    });
    builder.addCase(getQurbanGroups.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getQurbanGroups.fulfilled, (state, action) => {
      state.loading = false;
      state.qurbanGroup = action?.payload;
    });
    builder.addCase(getQurbanGroups.rejected, (state, action) => {
      state.loading = false;
      state.qurbanGroup = [];
    });
  },
});

export const selectCount = (state: typeof initialState) => state.project;

export const { updateBasket, addBasket, emptyBasket, resetProject } =
  projectDetailSlice.actions;

export default projectDetailSlice.reducer;
