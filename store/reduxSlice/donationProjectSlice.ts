export interface DonationProjectsState {
  donationProjectsByCampaign: Record<string, any>;
  projectDetails: ProjectDetailsType | null;
  userDonationProjects: any[];
  loading: boolean;
  error: string;
  uploadingMedia: boolean;
  addingStatusLog: boolean;
  deletingMedia: boolean;
  updatingStatusLog: boolean;
  deletingStatusLog: boolean;
}
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/utils/api";

export interface MediaType {
  id: number;
  type: string;
  url: string;
  caption: string;
}

export interface StatusLogType {
  id: number;
  status: string;
  note: string;
  createdAt: string;
}

export interface CampaignType {
  id: number;
  name: string;
  slug: string;
  coverImage: string;
  description: string;
}

export interface DonationType {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  amount: number | null;
  donationItem: string;
  donationItemPrice: number;
  orderId: string;
  status: string;
  createdAt: string;
  donatedAt: string;
  notes?: string;
  specialRequest?: string;
  [key: string]: any;
}

export interface ProjectDetailsType {
  id: string;
  type: string;
  projectStatus: string;
  country: string;
  orderId: string;
  createdAt: string;
  updatedAt: string;
  donationItem: string;
  donationStatus: string;
  donationId: number;
  campaignId: number;
  campaign: CampaignType;
  donation: DonationType;
  latitude: number | null;
  longitude: number | null;
  media: MediaType[];
  latestStatusLog: StatusLogType[];
  pageViews: number;
  behalfOf?: string;
  namePlaque?: string;
  notes?: string;
  specialRequest?: string;
}

const initialState: DonationProjectsState = {
  donationProjectsByCampaign: {},
  projectDetails: null,
  userDonationProjects: [],
  loading: false,
  error: "",
  uploadingMedia: false,
  addingStatusLog: false,
  deletingMedia: false,
  updatingStatusLog: false,
  deletingStatusLog: false,
};

export const updateVisitCount = createAsyncThunk(
  "donationProjects/updateVisitCount",
  async (projectId, thunkAPI) => {
    try {
      const response = await api.post("/donation-project/update-visit-count", {
        projectId,
      });

      if (response.status === 201) {
        return response.data;
      } else {
        return thunkAPI.rejectWithValue(response.data);
      }
    } catch (error) {
      const err = error as any;
      return thunkAPI.rejectWithValue(
        err.response?.data || "Failed to update visit count"
      );
    }
  }
);

export const fetchDonationProjectsByCampaign = createAsyncThunk(
  "donationProjects/fetchByCampaign",
  async (campaignId, thunkAPI) => {
    try {
      const response = await api.get(`/donation-project/${campaignId}`);
      if (response.status === 200) {
        return response.data;
      } else {
        return thunkAPI.rejectWithValue(response.data);
      }
    } catch (error) {
      const err = error as any;
      return thunkAPI.rejectWithValue(
        err.response?.data || "Something went wrong"
      );
    }
  }
);

export const fetchDonationProjectById = createAsyncThunk(
  "donationProjects/fetchById",
  async (projectId: string, thunkAPI) => {
    try {
      const response = await api.get(
        `/donation-project/project-updates/${projectId}`
      );
      if (response.status === 200) {
        console.log({ test: response.data.payload });
        return response.data.payload;
      } else {
        return thunkAPI.rejectWithValue(response.data);
      }
    } catch (error) {
      const err = error as any;
      return thunkAPI.rejectWithValue(
        err.response?.data || "Something went wrong"
      );
    }
  }
);

export const fetchUserDonationProjects = createAsyncThunk(
  "donationProjects/fetchUserProjects",
  async (_: void, thunkAPI) => {
    try {
      // Get user ID from auth state
      const state = thunkAPI.getState() as any;
      const userId =
        state?.profile?.auth?.id ||
        state?.auth?.user?.id ||
        state?.auth?.auth?.id ||
        state?.user?.id;

      if (typeof userId !== "string" && typeof userId !== "number") {
        return thunkAPI.rejectWithValue("User not authenticated");
      }

      // Fetch all donation projects for the user directly from the backend
      const response = await api.get(`/donation-project/user/${userId}`);

      if (response.status === 200) {
        const payload = response.data?.payload || response.data;
        const donationProjects = Array.isArray(payload) ? payload : [];

        // Transform the projects to include all necessary data
        const projectsWithDetails = donationProjects.map((project: any) => {
          // Handle Sequelize model instances
          const projectData = project.toJSON ? project.toJSON() : project;

          // Get donation data - check both lowercase and uppercase
          const donation =
            projectData?.donation ||
            projectData?.Donation ||
            project?.donation ||
            project?.Donation;

          // Get campaign data - check both lowercase and uppercase
          const campaign =
            projectData?.campaign ||
            projectData?.Campaign ||
            project?.campaign ||
            project?.Campaign;

          // Get campaignId from various possible locations
          const campaignId =
            projectData?.campaignId ||
            donation?.campaignId ||
            campaign?.id ||
            project?.campaignId ||
            donation?.Campaign?.id;

          return {
            ...projectData,
            id: projectData?.id || project?.id,
            Donation: donation,
            Campaign: campaign,
            donationId:
              donation?.id || projectData?.donationId || project?.donationId,
            amount: donation?.total || donation?.amount || projectData?.amount,
            orderId:
              donation?.orderId || projectData?.orderId || project?.orderId,
            date:
              donation?.createdAt ||
              donation?.donatedAt ||
              projectData?.createdAt ||
              projectData?.date,
            campaignId: campaignId,
            projectStatus:
              projectData?.projectStatus || project?.projectStatus || "PENDING",
          };
        });
        return projectsWithDetails;
      } else {
        return thunkAPI.rejectWithValue(response.data);
      }
    } catch (error) {
      const err = error as any;
      return thunkAPI.rejectWithValue(
        typeof err.response?.data === "string"
          ? err.response?.data
          : err.response?.data?.message || err.message || "Something went wrong"
      );
    }
  }
);

export const updateProjectStatus = createAsyncThunk(
  "donationProjects/updateStatus",
  async (
    { projectId, projectStatus }: { projectId: string; projectStatus: string },
    thunkAPI
  ) => {
    try {
      const response = await api.patch(
        `/donation-project/${projectId}/project-status`,
        {
          projectStatus,
        }
      );
      return response.data.payload;
    } catch (error) {
      const err = error as any;
      return thunkAPI.rejectWithValue(
        err.response?.data || "Failed to update status"
      );
    }
  }
);

export const addProjectStatusLog = createAsyncThunk(
  "donationProjects/addStatusLog",
  async (
    {
      projectId,
      status,
      note,
    }: { projectId: string; status: string; note?: string },
    thunkAPI
  ) => {
    try {
      const response = await api.post(
        `/donation-project/${projectId}/status-log`,
        {
          status,
          note,
        }
      );
      return response.data.payload;
    } catch (error) {
      const err = error as any;
      return thunkAPI.rejectWithValue(
        err.response?.data || "Failed to add status log"
      );
    }
  }
);

export const uploadProjectMedia = createAsyncThunk(
  "donationProjects/uploadMedia",
  async (
    {
      projectId,
      files,
      captions,
    }: { projectId: string; files: File[]; captions?: string[] },
    thunkAPI
  ) => {
    try {
      const formData = new FormData();

      // Append files
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }

      // Append captions if provided
      if (captions && captions.length > 0) {
        formData.append("captions", JSON.stringify(captions));
      }

      const response = await api.post(
        `/donation-project/${projectId}/media`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data.payload;
    } catch (error) {
      const err = error as any;
      return thunkAPI.rejectWithValue(
        err.response?.data || "Failed to upload media"
      );
    }
  }
);

export const deleteProjectMedia = createAsyncThunk(
  "donationProjects/deleteMedia",
  async (
    { projectId, mediaId }: { projectId: string; mediaId: string },
    thunkAPI
  ) => {
    try {
      const response = await api.delete(
        `/donation-project/${projectId}/media/${mediaId}`
      );
      return { mediaId, ...response.data.payload };
    } catch (error) {
      const err = error as any;
      return thunkAPI.rejectWithValue(
        err.response?.data || "Failed to delete media"
      );
    }
  }
);

export const updateProjectStatusLog = createAsyncThunk(
  "donationProjects/updateStatusLog",
  async (
    {
      projectId,
      logId,
      status,
      note,
    }: { projectId: string; logId: string; status: string; note?: string },
    thunkAPI
  ) => {
    try {
      const response = await api.put(
        `/donation-project/${projectId}/status-log/${logId}`,
        {
          status,
          note,
        }
      );
      return response.data.payload;
    } catch (error) {
      const err = error as any;
      return thunkAPI.rejectWithValue(
        err.response?.data || "Failed to update status log"
      );
    }
  }
);

export const deleteProjectStatusLog = createAsyncThunk(
  "donationProjects/deleteStatusLog",
  async (
    { projectId, logId }: { projectId: string; logId: string },
    thunkAPI
  ) => {
    try {
      const response = await api.delete(
        `/donation-project/${projectId}/status-log/${logId}`
      );
      return { logId, ...response.data.payload };
    } catch (error) {
      const err = error as any;
      return thunkAPI.rejectWithValue(
        err.response?.data || "Failed to delete status log"
      );
    }
  }
);

export const donationProjectsSlice = createSlice({
  name: "donationProjects",
  initialState,
  reducers: {
    clearDonationProjects: (state) => {
      state.donationProjectsByCampaign = {};
      state.error = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDonationProjectsByCampaign.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchDonationProjectsByCampaign.fulfilled, (state, action) => {
        state.loading = false;
        const campaignId = action.meta.arg;
        if (typeof campaignId === "string" || typeof campaignId === "number") {
          state.donationProjectsByCampaign[campaignId] = action.payload;
        }
        state.error = "";
      })
      .addCase(fetchDonationProjectsByCampaign.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : action.payload &&
              typeof action.payload === "object" &&
              "message" in action.payload
            ? (action.payload as any).message
            : "Failed to load donation projects";
      })
      .addCase(fetchUserDonationProjects.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchUserDonationProjects.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        if (Array.isArray(payload)) {
          state.userDonationProjects = payload;
        } else if (payload && typeof payload === "object") {
          if (Array.isArray((payload as any).rows)) {
            state.userDonationProjects = (payload as any).rows;
          } else if (Array.isArray((payload as any).data)) {
            state.userDonationProjects = (payload as any).data;
          } else {
            state.userDonationProjects = [];
          }
        } else {
          state.userDonationProjects = [];
        }
        state.error = "";
      })
      .addCase(fetchUserDonationProjects.rejected, (state, action) => {
        state.loading = false;
        state.userDonationProjects = [];
        const errorMessage =
          typeof action.payload === "string"
            ? action.payload
            : action.payload &&
              typeof action.payload === "object" &&
              "message" in action.payload
            ? (action.payload as any).message
            : "Failed to load user donation projects";
        state.error = errorMessage;
      })
      .addCase(fetchDonationProjectById.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchDonationProjectById.fulfilled, (state, action) => {
        state.loading = false;
        state.projectDetails = action.payload as ProjectDetailsType;
      })
      .addCase(fetchDonationProjectById.rejected, (state, action) => {
        state.loading = false;
        state.projectDetails = null;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : action.payload &&
              typeof action.payload === "object" &&
              "message" in action.payload
            ? (action.payload as any).message
            : "Failed to load project details";
      })
      .addCase(updateProjectStatus.fulfilled, (state, action) => {
        state.projectDetails = action.payload as ProjectDetailsType;
      })
      .addCase(addProjectStatusLog.pending, (state) => {
        state.addingStatusLog = true;
        state.error = "";
      })
      .addCase(addProjectStatusLog.fulfilled, (state, action) => {
        state.addingStatusLog = false;
        // Refresh project details if they exist
        if (state.projectDetails) {
          if (!Array.isArray(state.projectDetails.latestStatusLog)) {
            state.projectDetails.latestStatusLog = [];
          }
          state.projectDetails.latestStatusLog!.unshift(action.payload);
          state.projectDetails.projectStatus = action.payload.status;
        }
      })
      .addCase(addProjectStatusLog.rejected, (state, action) => {
        state.addingStatusLog = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : action.payload &&
              typeof action.payload === "object" &&
              "message" in action.payload
            ? (action.payload as any).message
            : "Failed to add status log";
      })
      .addCase(uploadProjectMedia.pending, (state) => {
        state.uploadingMedia = true;
        state.error = "";
      })
      .addCase(uploadProjectMedia.fulfilled, (state, action) => {
        state.uploadingMedia = false;
        // Add uploaded media to project details if they exist
        if (state.projectDetails) {
          if (!Array.isArray(state.projectDetails.media)) {
            state.projectDetails.media = [];
          }
          state.projectDetails.media = [
            ...action.payload,
            ...(state.projectDetails.media ?? []),
          ];
        }
      })
      .addCase(uploadProjectMedia.rejected, (state, action) => {
        state.uploadingMedia = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : action.payload &&
              typeof action.payload === "object" &&
              "message" in action.payload
            ? (action.payload as any).message
            : "Failed to upload media";
      })
      .addCase(deleteProjectMedia.pending, (state) => {
        state.deletingMedia = true;
        state.error = "";
      })
      .addCase(deleteProjectMedia.fulfilled, (state, action) => {
        state.deletingMedia = false;
        // Remove deleted media from project details if they exist
        if (state.projectDetails && Array.isArray(state.projectDetails.media)) {
          state.projectDetails.media = state.projectDetails.media.filter(
            (media: MediaType) => media.id !== action.payload.mediaId
          );
        }
      })
      .addCase(deleteProjectMedia.rejected, (state, action) => {
        state.deletingMedia = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : action.payload &&
              typeof action.payload === "object" &&
              "message" in action.payload
            ? (action.payload as any).message
            : "Failed to delete media";
      })
      .addCase(updateProjectStatusLog.pending, (state) => {
        state.updatingStatusLog = true;
        state.error = "";
      })
      .addCase(updateProjectStatusLog.fulfilled, (state, action) => {
        state.updatingStatusLog = false;
        // Update the status log in project details if they exist
        if (
          state.projectDetails &&
          Array.isArray(state.projectDetails.latestStatusLog)
        ) {
          const index = state.projectDetails.latestStatusLog.findIndex(
            (log: StatusLogType) => log.id === action.payload.id
          );
          if (index !== -1) {
            state.projectDetails.latestStatusLog[index] = action.payload;
          }
        }
      })
      .addCase(updateProjectStatusLog.rejected, (state, action) => {
        state.updatingStatusLog = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : action.payload &&
              typeof action.payload === "object" &&
              "message" in action.payload
            ? (action.payload as any).message
            : "Failed to update status log";
      })
      .addCase(deleteProjectStatusLog.pending, (state) => {
        state.deletingStatusLog = true;
        state.error = "";
      })
      .addCase(deleteProjectStatusLog.fulfilled, (state, action) => {
        state.deletingStatusLog = false;
        // Remove deleted status log from project details if they exist
        if (
          state.projectDetails &&
          Array.isArray(state.projectDetails.latestStatusLog)
        ) {
          state.projectDetails.latestStatusLog =
            state.projectDetails.latestStatusLog.filter(
              (log: StatusLogType) => log.id !== action.payload.logId
            );
        }
      })
      .addCase(deleteProjectStatusLog.rejected, (state, action) => {
        state.deletingStatusLog = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : action.payload &&
              typeof action.payload === "object" &&
              "message" in action.payload
            ? (action.payload as any).message
            : "Failed to delete status log";
      });
  },
});

export const { clearDonationProjects } = donationProjectsSlice.actions;

export default donationProjectsSlice.reducer;
