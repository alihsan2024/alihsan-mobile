import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  getDonationStatistics,
  getRecentDonations,
  DonationStatistics,
  RecentDonation,
} from "@/utils/api";

export interface ProfileStatisticsState {
  statistics: DonationStatistics;
  recentDonations: RecentDonation[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null; // Timestamp of last successful fetch
  profileDetails: any | null;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

const initialState: ProfileStatisticsState = {
  statistics: {
    total: 0,
    zakat: 0,
    sadaqah: 0,
    orphan: 0,
  },
  recentDonations: [],
  loading: false,
  error: null,
  lastFetched: null,
  profileDetails: null,
};

// Check if cached data is still valid
const isCacheValid = (lastFetched: number | null): boolean => {
  if (!lastFetched) return false;
  return Date.now() - lastFetched < CACHE_DURATION;
};

// Fetch profile statistics
export const fetchProfileStatistics = createAsyncThunk<
  DonationStatistics,
  void,
  { state: any }
>("profileStatistics/fetchStatistics", async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState();
    const lastFetched = state.profileStatistics?.lastFetched;

    // Return cached data if still valid
    if (isCacheValid(lastFetched) && state.profileStatistics?.statistics) {
      return state.profileStatistics.statistics;
    }

    const statistics = await getDonationStatistics();
    return statistics;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "Failed to fetch donation statistics"
    );
  }
});

// Fetch recent donations
export const fetchRecentDonations = createAsyncThunk<
  RecentDonation[],
  number | undefined,
  { state: any }
>("profileStatistics/fetchRecentDonations", async (limit = 5, { getState, rejectWithValue }) => {
  try {
    const state = getState();
    const lastFetched = state.profileStatistics?.lastFetched;

    // Return cached data if still valid
    if (
      isCacheValid(lastFetched) &&
      state.profileStatistics?.recentDonations?.length > 0
    ) {
      return state.profileStatistics.recentDonations.slice(0, limit);
    }

    const donations = await getRecentDonations(limit);
    return donations;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "Failed to fetch recent donations"
    );
  }
});

// Fetch all profile data (statistics + recent donations)
export const fetchProfileData = createAsyncThunk<
  { statistics: DonationStatistics; recentDonations: RecentDonation[] },
  number | undefined,
  { state: any }
>("profileStatistics/fetchAll", async (limit = 5, { getState, rejectWithValue }) => {
  try {
    const state = getState();
    const lastFetched = state.profileStatistics?.lastFetched;

    // Return cached data if still valid
    if (isCacheValid(lastFetched)) {
      return {
        statistics: state.profileStatistics.statistics,
        recentDonations: state.profileStatistics.recentDonations.slice(0, limit),
      };
    }

    // Fetch both in parallel
    const [statistics, recentDonations] = await Promise.all([
      getDonationStatistics(),
      getRecentDonations(limit),
    ]);

    return { statistics, recentDonations };
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "Failed to fetch profile data"
    );
  }
});

export const profileStatisticsSlice = createSlice({
  name: "profileStatistics",
  initialState,
  reducers: {
    clearCache: (state) => {
      state.lastFetched = null;
    },
    setProfileDetails: (state, action: PayloadAction<any>) => {
      state.profileDetails = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch statistics
    builder
      .addCase(fetchProfileStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfileStatistics.fulfilled, (state, action) => {
        state.statistics = action.payload;
        state.loading = false;
        state.error = null;
        state.lastFetched = Date.now();
      })
      .addCase(fetchProfileStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch recent donations
    builder
      .addCase(fetchRecentDonations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecentDonations.fulfilled, (state, action) => {
        state.recentDonations = action.payload;
        state.loading = false;
        state.error = null;
        state.lastFetched = Date.now();
      })
      .addCase(fetchRecentDonations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch all profile data
    builder
      .addCase(fetchProfileData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfileData.fulfilled, (state, action) => {
        state.statistics = action.payload.statistics;
        state.recentDonations = action.payload.recentDonations;
        state.loading = false;
        state.error = null;
        state.lastFetched = Date.now();
      })
      .addCase(fetchProfileData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCache, setProfileDetails } = profileStatisticsSlice.actions;
export default profileStatisticsSlice.reducer;
