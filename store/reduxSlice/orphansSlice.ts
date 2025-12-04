// orphansSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/utils/api";

export const fetchOrphans = createAsyncThunk(
  "orphans/fetchAll",
  async (_, thunkAPI) => {
    try {
      const response = await api.get("/orphans");
      return response.data.orphans;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error?.response?.data || error?.message);
    }
  }
);

export const fetchAllOrphansDashboard = createAsyncThunk(
  "orphans/fetchAllDashboard",
  async (_, thunkAPI) => {
    try {
      const response = await api.get("/orphans/all");
      return response.data.orphans;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error?.response?.data || error?.message);
    }
  }
);

export const fetchAllOrphanages = createAsyncThunk(
  "orphanage/fetchAllOrphanages",
  async (_, thunkAPI) => {
    try {
      const response = await api.get("/orphanage");
      return response.data.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error?.response?.data || error?.message);
    }
  }
);

export const fetchOrphanById = createAsyncThunk<any, string>(
  "orphans/fetchById",
  async (id, thunkAPI) => {
    try {
      const response = await api.get(`/orphans/${id}`);
      return response.data.orphan;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error?.response?.data || error?.message);
    }
  }
);

export const fetchSponsorships = createAsyncThunk(
  "orphans/fetchSponsorships",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/orphan-sponsorship/all/sponsorships");
      return res.data.orphanSponsorship;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error?.response?.data || error?.message);
    }
  }
);

export const fetchGraceSponsorships = createAsyncThunk(
  "orphans/fetchGraceStartedSponsorships",
  async (_, thunkAPI) => {
    try {
      const response = await api.get("/orphan-sponsorship/grace-sponsorships");
      return response.data.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error?.response?.data || error?.message);
    }
  }
);

export const sendGraceReminder = createAsyncThunk(
  "orphans/sendGraceReminder",
  async ({ sponsorship }: { sponsorship: any }, thunkAPI) => {
    try {
      const response = await api.post("/orphan-sponsorship/send-reminder", {
        sponsorship,
      });
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error?.response?.data || error?.message);
    }
  }
);

export const manageGraceSponsorship = createAsyncThunk(
  "orphans/manageGraceSponsorship",
  async (
    {
      orphanSponsorshipId,
      newGraceExpiresAt,
      mode,
    }: { orphanSponsorshipId: string; newGraceExpiresAt: string; mode: string },
    thunkAPI
  ) => {
    try {
      await api.patch("/orphan-sponsorship/manage-grace", {
        orphanSponsorshipId,
        newGraceExpiresAt,
        mode,
      });
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error?.response?.data || error?.message);
    }
  }
);

export const fetchAllocations = createAsyncThunk(
  "orphans/fetchAllocations",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/orphan-user-allocations");
      console.log("API Response:", res.data);
      // The API returns { count, sponsorships, success }
      // We want the sponsorships array which contains the allocation data
      const allocations = res.data.sponsorships || [];
      return allocations;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error?.response?.data || error?.message);
    }
  }
);

export const cancelSponsorship = createAsyncThunk(
  "orphans/cancelSponsorship",
  async (
    {
      orphanId,
      orphanSponsorshipId,
    }: { orphanId: string; orphanSponsorshipId: string },
    thunkAPI
  ) => {
    try {
      await api.post("/orphan-sponsorship/cancel", {
        orphanId,
        orphanSponsorshipId,
      });
      return orphanSponsorshipId;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error?.response?.data || error?.message);
    }
  }
);

export const updateSponsorship = createAsyncThunk(
  "orphans/updateSponsorship",
  async (
    {
      id,
      nextDueDate,
      sponsorshipType,
      sponsorId,
    }: {
      id: string;
      nextDueDate: string;
      sponsorshipType?: string;
      sponsorId?: string;
    },
    thunkAPI
  ) => {
    try {
      const updateData: any = { nextDueDate };
      if (sponsorshipType) updateData.sponsorshipType = sponsorshipType;
      if (sponsorId) updateData.sponsorId = sponsorId;

      await api.patch(`/orphan-sponsorship/${id}/update`, updateData);
      return { id, nextDueDate, sponsorshipType, sponsorId };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error?.response?.data || error?.message);
    }
  }
);

// Helper to safely stringify error payloads
function getErrorMessage(payload: unknown): string {
  if (!payload) return "Something went wrong";
  if (typeof payload === "string") return payload;
  if (typeof payload === "object" && payload !== null && "message" in payload) {
    return (payload as any).message || "Something went wrong";
  }
  return JSON.stringify(payload);
}

const orphansSlice = createSlice({
  name: "orphans",
  initialState: {
    data: [] as any[],
    orphan: null as any,
    sponsorships: [] as any[],
    graceSponsorships: [] as any[],
    allocations: [] as any[],
    orphanages: [] as any[],
    loading: false,
    error: null as string | null,
    reminderStatus: undefined as "loading" | "succeeded" | "failed" | undefined,
    lastReminderSentId: undefined as string | undefined,
    reminderError: undefined as string | undefined,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrphans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrphans.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchOrphans.rejected, (state, action) => {
        state.loading = false;
        state.error = getErrorMessage(action.payload);
      })

      .addCase(fetchAllOrphansDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllOrphansDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchAllOrphansDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = getErrorMessage(action.payload);
      })

      .addCase(fetchOrphanById.pending, (state) => {
        state.loading = true;
        state.orphan = null;
        state.error = null;
      })
      .addCase(fetchOrphanById.fulfilled, (state, action) => {
        state.loading = false;
        state.orphan = action.payload;
      })
      .addCase(fetchOrphanById.rejected, (state, action) => {
        state.loading = false;
        state.error = getErrorMessage(action.payload);
      })

      .addCase(fetchSponsorships.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSponsorships.fulfilled, (state, action) => {
        state.loading = false;
        state.sponsorships = action.payload;
      })
      .addCase(fetchSponsorships.rejected, (state, action) => {
        state.loading = false;
        state.error = getErrorMessage(action.payload);
      })

      .addCase(cancelSponsorship.fulfilled, (state, action) => {
        const id = action.payload;
        state.sponsorships = state.sponsorships.map((s) =>
          s.id === id
            ? {
                ...s,
                status: "cancelled",
                paymentStatus: null,
                userId: null,
              }
            : s
        );
      })

      .addCase(updateSponsorship.fulfilled, (state, action) => {
        const { id, nextDueDate, sponsorshipType, sponsorId } = action.payload;
        state.sponsorships = state.sponsorships.map((s) =>
          s.id === id
            ? {
                ...s,
                nextDueDate,
                ...(sponsorshipType && { sponsorshipType }),
                ...(sponsorId && { sponsorId }),
              }
            : s
        );
      })

      .addCase(fetchAllocations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllocations.fulfilled, (state, action) => {
        state.loading = false;
        state.allocations = action.payload;
      })
      .addCase(fetchAllocations.rejected, (state, action) => {
        state.loading = false;
        state.error = getErrorMessage(action.payload);
      })
      .addCase(fetchGraceSponsorships.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGraceSponsorships.fulfilled, (state, action) => {
        state.loading = false;
        state.graceSponsorships = action.payload;
      })
      .addCase(fetchGraceSponsorships.rejected, (state, action) => {
        state.loading = false;
        state.error = getErrorMessage(action.payload);
      })
      .addCase(manageGraceSponsorship.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(fetchAllOrphanages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllOrphanages.fulfilled, (state, action) => {
        state.loading = false;
        state.orphanages = action.payload;
      })
      .addCase(fetchAllOrphanages.rejected, (state, action) => {
        state.loading = false;
        state.error = getErrorMessage(action.payload);
      })
      .addCase(sendGraceReminder.pending, (state) => {
        state.reminderStatus = "loading";
      })
      .addCase(sendGraceReminder.fulfilled, (state, action) => {
        state.reminderStatus = "succeeded";
        state.lastReminderSentId = action.payload.sponsorshipId;
      })
      .addCase(sendGraceReminder.rejected, (state, action) => {
        state.reminderStatus = "failed";
        state.reminderError = getErrorMessage(action.payload);
      });
  },
});

export default orphansSlice.reducer;
