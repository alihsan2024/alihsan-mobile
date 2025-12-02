import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import api from "@/utils/api";

// Types
interface Campaign {
  id: number | string;
  slug: string;
  [key: string]: any;
}

interface QuickDonationState {
  quickdonations: Campaign[];
  fetchedDonations: Record<string, any>;
  topDonations: any[];
  latestDonations: any[];
  quickDonationProject: any | null;
  quickDonationCount: number;
  topDonationCount: number;
  count: number;
  loading: boolean;
  error: string;
}

const initialState: QuickDonationState = {
  quickdonations: [],
  fetchedDonations: {},
  topDonations: [],
  latestDonations: [],
  quickDonationProject: null,
  quickDonationCount: 0,
  topDonationCount: 0,
  count: 0,
  loading: false,
  error: "",
};

export const getQuickDonation = createAsyncThunk<
  Campaign[],
  string[] | undefined,
  { rejectValue: any }
>("get/quickDonation", async (allowedCampaigns, thunkAPI) => {
  try {
    const response = await api.get("quickdonation");
    let data: Campaign[] = response?.data?.payload?.campaigns;
    if (
      allowedCampaigns &&
      Array.isArray(allowedCampaigns) &&
      allowedCampaigns.length > 0
    ) {
      data = data.filter(
        (campaign: Campaign) =>
          allowedCampaigns.includes(campaign.slug) ||
          allowedCampaigns.includes(campaign.id.toString())
      );
    }
    if (response.status === 200) {
      return data;
    } else {
      return thunkAPI.rejectWithValue(data);
    }
  } catch (e) {
    let errorMsg = "Unknown error";
    if (
      typeof e === "object" &&
      e !== null &&
      "response" in e &&
      (e as any).response?.data
    ) {
      errorMsg = (e as any).response.data;
    }
    return thunkAPI.rejectWithValue(errorMsg);
  }
});

export const getTopDonation = createAsyncThunk<
  any[],
  Record<string, any> | undefined,
  { rejectValue: any }
>("get/topDonation", async (filters, thunkAPI) => {
  try {
    const response = await api.get("donations/campaign-donations", {
      params: filters,
    });
    let data = response?.data?.payload;
    if (response.status === 200) {
      return data;
    } else {
      return thunkAPI.rejectWithValue(data);
    }
  } catch (e) {
    let errorMsg = "Unknown error";
    if (
      typeof e === "object" &&
      e !== null &&
      "response" in e &&
      (e as any).response?.data
    ) {
      errorMsg = (e as any).response.data;
    }
    return thunkAPI.rejectWithValue(errorMsg);
  }
});

export const getQuickDonationProject = createAsyncThunk<
  any,
  string | number,
  { rejectValue: any }
>("get/quick-donation-project", async (id, thunkAPI) => {
  try {
    const response = await api.get("/project/details/" + id);
    let data = response?.data?.payload;
    if (response.status === 200) {
      return data;
    } else {
      return thunkAPI.rejectWithValue(data);
    }
  } catch (e) {
    let errorMsg = "Unknown error";
    if (
      typeof e === "object" &&
      e !== null &&
      "response" in e &&
      (e as any).response?.data
    ) {
      errorMsg = (e as any).response.data;
    }
    return thunkAPI.rejectWithValue(errorMsg);
  }
});

export const quickDonationSlice = createSlice({
  name: "quickDonation",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getQuickDonation.fulfilled, (state, action) => {
      state.quickdonations = action?.payload;
    });

    builder.addCase(getTopDonation.fulfilled, (state, action) => {
      state.topDonations = action?.payload;
    });

    builder.addCase(getQuickDonationProject.fulfilled, (state, action) => {
      state.loading = false;
      state.quickDonationProject = action?.payload;
      state.fetchedDonations = {
        ...state.fetchedDonations,
        [action?.payload?.campaign.slug]: action?.payload,
      };
      state.error = "";
    });
    builder.addCase(getQuickDonationProject.pending, (state, action) => {
      state.loading = true;
      state.quickDonationProject = null;
    });

    builder.addCase(getQuickDonationProject.rejected, (state, action) => {
      state.loading = false;
      state.quickDonationProject = null;
    });
  },
});
export default quickDonationSlice.reducer;
