import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/utils/api";

export interface Orphan {
  id: number;
  name: string;
  cover_image?: string;
}
export interface OrphanUserAllocation {
  orphanId: number;
  orphan?: Orphan;
}
export interface Sponsorship {
  id: number;
  subscriptionId: string;
  amountInCents: number;
  sponsorshipType: string;
  startDate: string;
  nextDueDate?: string;
  status: string;
  orphanUserAllocations?: OrphanUserAllocation[];
  Orphan?: Orphan;
}

export interface OrphanSponsorshipsState {
  sponsorships: Sponsorship[];
  loading: boolean;
  error: string | null;
  cancelling: number | null;
  paymentCache: Record<string, any[]>;
  loadingPayments: boolean;
}

const initialState: OrphanSponsorshipsState = {
  sponsorships: [],
  loading: true,
  error: null,
  cancelling: null,
  paymentCache: {},
  loadingPayments: false,
};

export const fetchSponsorships = createAsyncThunk(
  "orphanSponsorships/fetchSponsorships",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/orphan-sponsorship/list/user");
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to load sponsorships"
      );
    }
  }
);

export const cancelSponsorship = createAsyncThunk(
  "orphanSponsorships/cancelSponsorship",
  async (
    { id, orphanId }: { id: number; orphanId?: number },
    { dispatch, rejectWithValue }
  ) => {
    try {
      await api.post("/orphan-sponsorship/cancel", {
        orphanId,
        orphanSponsorshipId: id,
      });
      await dispatch(fetchSponsorships());
      return id;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Cancellation failed"
      );
    }
  }
);

export const fetchPaymentsForSponsorship = createAsyncThunk(
  "orphanSponsorships/fetchPaymentsForSponsorship",
  async (subscriptionId: string, { rejectWithValue }) => {
    try {
      const res = await api.get("/orphan-sponsorship/user/payments", {
        params: { subscriptionId },
      });
      return { subscriptionId, payments: res.data.data };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to load payments"
      );
    }
  }
);

const orphanSponsorshipSlice = createSlice({
  name: "orphanSponsorships",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSponsorships.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSponsorships.fulfilled, (state, action) => {
        state.sponsorships = action.payload;
        state.loading = false;
      })
      .addCase(fetchSponsorships.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      })
      .addCase(cancelSponsorship.pending, (state, action) => {
        state.cancelling = action.meta.arg.id;
      })
      .addCase(cancelSponsorship.fulfilled, (state) => {
        state.cancelling = null;
      })
      .addCase(cancelSponsorship.rejected, (state) => {
        state.cancelling = null;
      })
      .addCase(fetchPaymentsForSponsorship.pending, (state) => {
        state.loadingPayments = true;
      })
      .addCase(fetchPaymentsForSponsorship.fulfilled, (state, action) => {
        const { subscriptionId, payments } = action.payload;
        state.paymentCache[subscriptionId] = payments;
        state.loadingPayments = false;
      })
      .addCase(fetchPaymentsForSponsorship.rejected, (state) => {
        state.loadingPayments = false;
      });
  },
});

export default orphanSponsorshipSlice.reducer;
