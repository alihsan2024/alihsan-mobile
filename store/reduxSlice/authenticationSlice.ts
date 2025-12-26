import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface AuthUser {
  token: string;
  role: string;
  secondaryRole?: string;
  authType: string;
  firstName: string;
  lastName: string;
  id: string;
  isloggedIn: boolean;
}

export interface AuthState {
  keepSession: boolean;
  isReady: boolean;
  user: AuthUser | null;
  auth: AuthUser | null;
  loading: boolean;
  error: string | null;
  isFetching: boolean;
  isSuccess: boolean;
  isError: boolean;
  errorMessage: string;
}

const initialState: AuthState = {
  keepSession: false,
  isReady: false,
  user: null,
  auth: null,
  loading: false,
  error: null,
  isFetching: false,
  isSuccess: false,
  isError: false,
  errorMessage: "",
};

export const initAuth = createAsyncThunk("init/auth", async () => {
  const data = await AsyncStorage.getItem("loggedIn");
  if (!data) return null;
  const authData = JSON.parse(data);
  api.defaults.headers.common.Authorization = `Bearer ${authData.token}`;
  return authData;
});

export const socialMediaLogin = createAsyncThunk(
  "authenticate/social-media",
  async ({
    body,
    provider,
    keepSession,
  }: {
    body: any;
    provider: string;
    keepSession: boolean;
  }) => {
    try {
      const response = await api.post(
        provider === "google" ? "auth/googlelogin" : "auth/facebooklogin",
        {
          ...body,
          timezoneOffset: new Date().getTimezoneOffset(),
        }
      );
      const { payload } = response.data;
      await AsyncStorage.setItem(
        "loggedIn",
        JSON.stringify({
          token: payload.token,
          role: payload.role,
          authType: provider,
          firstName: payload.firstName,
          lastName: payload.lastName,
          id: payload.id,
          isloggedIn: true,
        })
      );
      api.defaults.headers.common.Authorization = `Bearer ${response.data.payload?.token}`;
      return response.data;
    } catch (e: any) {
      throw new Error(e?.response?.data?.message || "Something went wrong");
    }
  }
);

export const loginUser = createAsyncThunk(
  "authenticate/email",
  async (
    { body, keepSession }: { body: any; keepSession: boolean },
    thunkAPI
  ) => {
    try {
      const response = await api.post("auth/login", body);
      const payload = response.data.payload;
      await AsyncStorage.setItem(
        "loggedIn",
        JSON.stringify({
          token: payload.token,
          role: payload.role,
          secondaryRole: payload?.secondaryRole,
          authType: "email",
          firstName: payload.firstName,
          lastName: payload.lastName,
          id: payload.id,
          isloggedIn: true,
        })
      );
      api.defaults.headers.common["Authorization"] = `Bearer ${payload.token}`;

      // Device registration logic (copied from api.ts login)
      try {
        const { requestUserPermission } = await import("@/utils/notifications");
        const { getOrCreateGuestId, setLastRegisteredDeviceInfo } =
          await import("@/utils/deviceRegistration");
        const { Platform } = await import("react-native");
        console.log(
          "[DeviceReg] Starting device registration after login (redux)"
        );
        const token = await requestUserPermission();
        console.log("[DeviceReg] FCM token from requestUserPermission:", token);
        if (token) {
          const guest_id = await getOrCreateGuestId();
          console.log("[DeviceReg] guest_id:", guest_id);
          const user_id = payload.id;
          const platform = Platform.OS;
          const { registerDeviceToken } = await import("@/utils/api");
          console.log("[DeviceReg] About to call registerDeviceToken with:", {
            token,
            user_id,
            guest_id,
            platform,
          });
          await registerDeviceToken({ token, user_id, guest_id, platform });
          console.log("[DeviceReg] registerDeviceToken call finished");
          await setLastRegisteredDeviceInfo({
            token,
            user_id,
            guest_id,
            platform,
          });
          console.log("[DeviceReg] setLastRegisteredDeviceInfo call finished");
        } else {
          console.log("[DeviceReg] No FCM token, skipping device registration");
        }
      } catch (e) {
        console.log(
          "[DeviceReg] Device registration after login (redux) failed",
          e
        );
      }

      return response.data;
    } catch (e: any) {
      throw new Error(e?.response?.data?.message || "Something went wrong");
    }
  }
);

export const getProfile = createAsyncThunk(
  "get/user",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("profile");
      let data = response?.data?.payload;
      return data;
    } catch (e: any) {
      if (e.response?.status == 401) {
        await AsyncStorage.removeItem("loggedIn");
        // Optionally, you can trigger a navigation to login screen here
        // e.g., using React Navigation
      }
      throw new Error(e?.response?.data?.message || "Something went wrong");
    }
  }
);

export const updateProfile = createAsyncThunk(
  "post/addNewPost",
  async (payload: any, thunkAPI) => {
    try {
      const response = await api.patch("profile", payload);
      return response.data;
    } catch (e: any) {
      return thunkAPI.rejectWithValue(e?.response?.data || "Unknown error");
    }
  }
);

export const deleteProfile = createAsyncThunk(
  "delete/profile",
  async (payload: any, thunkAPI) => {
    try {
      const response = await api.delete("profile", payload);
      let data = response?.data?.payload;
      if (response.status === 200) {
        await AsyncStorage.removeItem("loggedIn");
        // Optionally, trigger navigation to login screen here
      } else {
        return thunkAPI.rejectWithValue(data);
      }
    } catch (e: any) {
      return thunkAPI.rejectWithValue(e?.response?.data || "Unknown error");
    }
  }
);
export const changePassword = createAsyncThunk(
  "post/changePassword",
  async (payload: any, thunkAPI) => {
    try {
      const response = await api.patch("profile/password", payload);
      return response.data;
    } catch (e: any) {
      return thunkAPI.rejectWithValue(e?.response?.data || "Unknown error");
    }
  }
);

export const captchaValidation = createAsyncThunk(
  "auth/verify-captcha",
  async (payload: any, thunkAPI) => {
    try {
      const response = await api.post("auth/verify-captcha", payload);
      return response.data;
    } catch (e: any) {
      return thunkAPI.rejectWithValue(e?.response?.data || "Unknown error");
    }
  }
);
// profile/password

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, thunkAPI) => {
    try {
      // 1️⃣ Clear auth storage
      await AsyncStorage.removeItem("loggedIn");
      api.defaults.headers.common.Authorization = "";

      // 2️⃣ Device re-registration as guest
      try {
        const { requestUserPermission } = await import("@/utils/notifications");
        const { getOrCreateGuestId, setLastRegisteredDeviceInfo } =
          await import("@/utils/deviceRegistration");
        const { Platform } = await import("react-native");
        const { registerDeviceToken } = await import("@/utils/api");

        const token = await requestUserPermission();

        if (token) {
          const guest_id = await getOrCreateGuestId();
          const platform = Platform.OS;

          // 🚨 IMPORTANT: user_id is NOT passed
          await registerDeviceToken({
            token,
            user_id: null,
            guest_id,
            platform,
          });

          await setLastRegisteredDeviceInfo({
            token,
            guest_id,
            platform,
          });
        }
      } catch (e) {
        console.log("[DeviceReg] Guest registration after logout failed", e);
      }

      return true;
    } catch (e) {
      return thunkAPI.rejectWithValue("Logout failed");
    }
  }
);

export const authenticationSlice = createSlice({
  name: "authentication",
  initialState,
  reducers: {
    logout(state) {
      return {
        ...initialState,
        isReady: true,
      };
    },
  },
  extraReducers(builder) {
    builder
      .addCase(getProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isFetching = false;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.isError = true;
        state.isFetching = false;
        state.errorMessage = action.error?.message || "";
      })
      .addCase(getProfile.pending, (state) => {
        state.isFetching = true;
        state.isError = false;
      });

    builder.addCase(initAuth.fulfilled, (state, action) => {
      state.auth = action.payload;
      state.isReady = true;
    });

    builder
      .addCase(socialMediaLogin.fulfilled, (state, action) => {
        const payload = action.payload.payload;
        state.user = payload;
        state.auth = {
          token: payload.token,
          role: payload.role,
          authType: action.meta.arg.provider,
          firstName: payload.firstName,
          lastName: payload.lastName,
          id: payload.id,
          isloggedIn: true,
        };
        state.loading = false;
      })
      .addCase(socialMediaLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || "";
      })
      .addCase(socialMediaLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      });

    builder
      .addCase(updateProfile.fulfilled, (state, action) => {
        // Only update allowed fields
        if (action.payload && typeof action.payload === "object") {
          if ("user" in action.payload) state.user = action.payload.user;
          if ("auth" in action.payload) state.auth = action.payload.auth;
        }
        state.isFetching = false;
        state.isError = false;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isError = true;
        state.isFetching = false;
        state.errorMessage = action.error?.message || "";
      })
      .addCase(updateProfile.pending, (state) => {
        state.isFetching = true;
        state.isError = false;
      });

    builder.addCase(logoutUser.fulfilled, (state) => {
      return {
        ...initialState,
        isReady: true,
      };
    });

    builder
      .addCase(loginUser.fulfilled, (state, action) => {
        const payload = action.payload.payload;
        state.user = payload;
        state.auth = {
          token: payload.token,
          role: payload.role,
          authType: "email",
          firstName: payload.firstName,
          lastName: payload.lastName,
          id: payload.id,
          isloggedIn: true,
        };
        state.loading = false;
      })
      .addCase(loginUser.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.user = null;
        state.loading = false;
        state.error = action.error?.message || "";
      });
  },
});

export default authenticationSlice.reducer;
export const logout = authenticationSlice.actions.logout;
