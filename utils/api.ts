// Register device token (guest or user)
export const registerDeviceToken = async ({
  token,
  user_id,
  guest_id,
  platform,
}: {
  token: string;
  user_id: number | null;
  guest_id: string;
  platform: string;
}) => {
  try {
    await api.post("/app-notifications/register-device-token", {
      token,
      user_id,
      guest_id,
      platform,
    });
  } catch (error: any) {
    console.error(
      "Error registering device token:",
      error.response?.data || error.message
    );
    throw error;
  }
};
import axios from "axios";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

// Configure API URLs for different environments
// Priority: __DEV__ -> dev env/config -> fallback, otherwise prod env/config -> fallback
const getApiUrl = (): string => {
  if (__DEV__) {
    return (
      process.env.EXPO_PUBLIC_API_URL_DEV ||
      (Constants.expoConfig?.extra?.apiUrlDev as string | undefined) ||
      "http://192.168.20.16:4001"
    );
  }

  return (
    process.env.EXPO_PUBLIC_API_URL ||
    (Constants.expoConfig?.extra?.apiUrl as string | undefined) ||
    "https://deenstream.live"
  );
};

const API_URL = getApiUrl();

console.log(`Using API URL: ${API_URL}`);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor for debugging
api.interceptors.request.use(
  (request) => {
    console.log("API Request:", request.method, request.url);
    return request;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Import network status setter
import { setGlobalNetworkStatus } from "@/context/NetworkContext";

// Response interceptor for debugging and network detection
api.interceptors.response.use(
  (response) => {
    console.log("API Response Status:", response.status);
    // Update network status on successful response
    setGlobalNetworkStatus(true);
    return response;
  },
  (error) => {
    console.error("API Response Error:", error.message);
    
    // Detect network errors
    const isNetworkError = 
      !error.response && (
        error.message?.includes("Network Error") ||
        error.message?.includes("network") ||
        error.message?.includes("timeout") ||
        error.message?.includes("ECONNREFUSED") ||
        error.message?.includes("ENOTFOUND") ||
        error.code === "ERR_NETWORK" ||
        error.code === "ECONNABORTED" ||
        error.message?.includes("Network request failed")
      );

    // Update network status
    if (isNetworkError) {
      setGlobalNetworkStatus(false);
    } else if (error.response) {
      // If we got a response (even an error), we're online
      setGlobalNetworkStatus(true);
    }

    if (error.response) {
      console.error("Error Status:", error.response.status);
      console.error("Error Data:", error.response.data);
    }
    return Promise.reject(error);
  }
);

// Set auth token in headers
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

// Initialize auth token from storage
export const initAuth = async () => {
  try {
    const authData = await AsyncStorage.getItem("authData");
    if (authData) {
      const parsed = JSON.parse(authData);
      setAuthToken(parsed.token);
      return parsed;
    }
  } catch (error) {
    console.error("Error initializing auth:", error);
  }
  return null;
};

// Campaign interface
export interface Campaign {
  id: number;
  name: string;
  description: string;
  descriptionText?: string;
  coverImage: string;
  slug: string;
  checkoutType: string;
  status?: string;
  // Mobile-specific fields (from campaigns table)
  mobileTitle?: string;
  mobileSubtitle?: string;
  mobileGoalAmount?: number;
  mobileDescription?: string;
  campaignBriefTitle?: string;
  impactFigure?: number;
  problemDesc?: string;
}

// Response structure from backend
interface CampaignsResponse {
  payload: {
    projects: {
      rows: Campaign[];
      count: number;
    };
  };
}

// Fetch all campaigns
export const fetchCampaigns = async (
  isMobileCampaign?: boolean
): Promise<Campaign[]> => {
  try {
    const params: any = {};
    if (isMobileCampaign === true) {
      params.isMobileCampaign = "true";
    }
    const response = await api.get<CampaignsResponse>("/project/all-projects", {
      params,
    });
    const data = response.data;

    // Return projects.rows which contains the list of campaigns
    return data?.payload?.projects?.rows || [];
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    throw error;
  }
};
// Fetch all featured campaigns
export const fetchFeaturedCampaigns = async (): Promise<Campaign[]> => {
  try {
    const response = await api.get("/project/featured-campaigns");
    const data = response.data;

    // Return campaigns array from payload
    return data?.payload?.campaigns || [];
  } catch (error) {
    console.error("Error fetching featured campaigns:", error);
    throw error;
  }
};

// Get campaign details by slug
export const getCampaignDetails = async (slug: string): Promise<any> => {
  try {
    const response = await api.get(`/project/details/${slug}`);
    return response.data?.payload || {};
  } catch (error) {
    console.error(`Error fetching campaign details for ${slug}:`, error);
    throw error;
  }
};

// Get campaign categories
export const getCampaignCategories = async (): Promise<any[]> => {
  try {
    const response = await api.get("/project/category");
    return response.data?.payload || [];
  } catch (error) {
    console.error("Error fetching campaign categories:", error);
    throw error;
  }
};

// Authentication interfaces
export interface LoginRequest {
  email: string;
  password: string;
  isAdmin?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  country?: string;
  state?: string;
  city?: string;
  zip?: string;
  company?: string;
  timezoneOffset?: number;
}

export interface AuthResponse {
  token: string;
  id: number;
  role: string;
  secondaryRole?: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  email: string;
  address?: string;
  city?: string;
  zip?: string;
  state?: string;
  country?: string;
  phone?: string;
  profileImage?: string;
  stripeCustomerId?: string;
}

// Login user
export const login = async (
  credentials: LoginRequest
): Promise<AuthResponse> => {
  try {
    const response = await api.post("/auth/login", {
      email: credentials.email.toLowerCase().trim(),
      password: credentials.password,
      isAdmin: credentials.isAdmin || false,
    });

    const payload = response.data.payload;
    const authData = {
      token: payload.token,
      role: payload.role,
      secondaryRole: payload.secondaryRole,
      authType: "email",
      firstName: payload.firstName,
      lastName: payload.lastName,
      id: payload.id,
      email: payload.email,
      isLoggedIn: true,
    };

    // Save to AsyncStorage
    await AsyncStorage.setItem("authData", JSON.stringify(authData));
    setAuthToken(payload.token);

    return payload;
  } catch (error: any) {
    const message =
      error.response?.data?.message || "Login failed. Please try again.";
    throw new Error(message);
  }
};

// Forgot password
export const forgotPassword = async (email: string): Promise<void> => {
  try {
    await api.post("/auth/forgotpassword", {
      email: email.toLowerCase().trim(),
    });
  } catch (error: any) {
    const message =
      error.response?.data?.message || "Failed to send reset email. Please try again.";
    throw new Error(message);
  }
};

// Register user
export const register = async (userData: RegisterRequest): Promise<void> => {
  try {
    await api.post("/auth/register", {
      email: userData.email.toLowerCase().trim(),
      password: userData.password,
      firstName: userData.firstName.trim(),
      lastName: userData.lastName.trim(),
      phone: userData.phone,
      address: userData.address,
      country: userData.country,
      state: userData.state,
      city: userData.city,
      zip: userData.zip,
      company: userData.company,
      timezoneOffset: userData.timezoneOffset || new Date().getTimezoneOffset(),
    });
  } catch (error: any) {
    const message =
      error.response?.data?.message || "Registration failed. Please try again.";
    throw new Error(message);
  }
};

// Logout user
export const logout = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem("authData");
    setAuthToken(null);
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
};

// Get user profile
export const getProfile = async (): Promise<any> => {
  try {
    const response = await api.get("/auth/profile");
    return response.data?.payload || {};
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
};

// Donation statistics interfaces
export interface DonationStatistics {
  total: number;
  zakat: number;
  sadaqah: number;
  orphan: number;
}

export interface RecentDonation {
  id: string | number;
  total: number;
  donatedAt: string;
  status: string;
  Campaign?: {
    id: number;
    name: string;
    coverImage?: string;
    slug: string;
    checkoutType?: string;
  };
}

// Get user donation statistics (total amounts by type)
export const getDonationStatistics = async (): Promise<DonationStatistics> => {
  try {
    // Fetch all donation types to calculate statistics
    // Using a reasonable limit to avoid performance issues
    const limit = 500; // Fetch up to 500 donations per type

    const [onetimeRes, activeRecurringRes, inactiveRecurringRes] =
      await Promise.all([
        api.get(
          `/donations/of-user/onetime?page=1&limit=${limit}&sort=date&order=desc`
        ),
        api.get(
          `/donations/of-user/recurring/active?page=1&limit=${limit}&sort=date&order=desc`
        ),
        api.get(
          `/donations/of-user/recurring/inactive?page=1&limit=${limit}&sort=date&order=desc`
        ),
      ]);

    const allDonations = [
      ...(onetimeRes.data?.payload?.rows || []),
      ...(activeRecurringRes.data?.payload?.rows || []),
      ...(inactiveRecurringRes.data?.payload?.rows || []),
    ];

    // Calculate statistics by checkout type
    const stats = allDonations.reduce(
      (acc, donation) => {
        const amount = parseFloat(donation.total) || 0;
        if (amount <= 0) return acc; // Skip invalid amounts

        const checkoutType =
          donation.Campaign?.checkoutType?.toUpperCase() || "";
        const campaignName = (donation.Campaign?.name || "").toLowerCase();

        acc.total += amount;

        // Categorize by checkout type or campaign name
        if (
          checkoutType === "ZAQAT" ||
          checkoutType === "ZAKAT" ||
          campaignName.includes("zakat")
        ) {
          acc.zakat += amount;
        } else if (
          checkoutType === "ORPHAN" ||
          campaignName.includes("orphan") ||
          campaignName.includes("sponsorship")
        ) {
          acc.orphan += amount;
        } else {
          acc.sadaqah += amount;
        }

        return acc;
      },
      { total: 0, zakat: 0, sadaqah: 0, orphan: 0 }
    );

    return stats;
  } catch (error) {
    console.error("Error fetching donation statistics:", error);
    // Return default values on error
    return { total: 0, zakat: 0, sadaqah: 0, orphan: 0 };
  }
};

// Get recent donations
export const getRecentDonations = async (
  limit: number = 5
): Promise<RecentDonation[]> => {
  try {
    const response = await api.get(
      `/donations/of-user/onetime?page=1&limit=${limit}&sort=date&order=desc`
    );
    return response.data?.payload?.rows || [];
  } catch (error) {
    console.error("Error fetching recent donations:", error);
    return [];
  }
};

// Basket interfaces
export interface BasketItem {
  id?: number;
  campaignId: number;
  amount: number;
  quantity?: number;
  total: number;
  isRecurring?: boolean;
  periodDays?: number;
  notes?: string;
  behalfOf?: string;
  donationItem?: string;
  donationItemPrice?: number;
  riceQuantity?: number;
  ricePrice?: number;
  Campaign?: Campaign;
  name?: string;
  coverImage?: string;
  checkoutType?: string;
}

export interface AddToBasketRequest {
  campaignId: number;
  amount: number;
  quantity?: number;
  isRecurring?: boolean;
  periodDays?: number;
  notes?: string;
  behalfOf?: string;
  donationItem?: string;
  donationItemPrice?: number;
  riceQuantity?: number;
  ricePrice?: number;
}

// Get basket items
export const getBasketItems = async (): Promise<BasketItem[]> => {
  try {
    const response = await api.get("/basket");
    return response.data?.payload || [];
  } catch (error: any) {
    if (error.response?.status === 401) {
      // Not authenticated, return empty array
      return [];
    }
    console.error("Error fetching basket items:", error);
    throw error;
  }
};

// Add item to basket
export const addToBasket = async (
  item: AddToBasketRequest
): Promise<{ basketItemId: number }> => {
  try {
    // Remove undefined/null fields to avoid sending them to the backend
    const cleanItem: any = {};
    Object.keys(item).forEach((key) => {
      const value = (item as any)[key];
      if (value !== undefined && value !== null && value !== "") {
        cleanItem[key] = value;
      }
    });

    const response = await api.post("/basket", cleanItem);
    return response.data?.payload || {};
  } catch (error: any) {
    const message =
      error.response?.data?.message || "Failed to add item to basket.";
    throw new Error(message);
  }
};

// Update basket item
export const updateBasketItem = async (
  item: AddToBasketRequest
): Promise<void> => {
  try {
    await api.put("/basket", item);
  } catch (error: any) {
    const message =
      error.response?.data?.message || "Failed to update basket item.";
    throw new Error(message);
  }
};

// Remove item from basket
export const removeFromBasket = async (
  campaignId: number,
  donationItem?: string
): Promise<void> => {
  try {
    await api.delete("/basket", {
      data: {
        campaignId,
        donationItem,
      },
    });
  } catch (error: any) {
    const message =
      error.response?.data?.message || "Failed to remove item from basket.";
    throw new Error(message);
  }
};

// Bulk add items to basket
export const bulkAddToBasket = async (
  items: AddToBasketRequest[]
): Promise<void> => {
  try {
    await api.put("/basket/all", items);
  } catch (error: any) {
    const message =
      error.response?.data?.message || "Failed to add items to basket.";
    throw new Error(message);
  }
};

// Metal prices interface
export interface MetalPrices {
  goldPriceInUsd: number;
  goldPriceInAud: number;
  silverFinePriceInUsd: number;
  silverFinePriceInAud: number;
  silverSterlingPriceInUsd: number;
  silverSterlingPriceInAud: number;
  updatedAt: string;
}

export interface MetalPricesResponse {
  payload: {
    price?: {
      goldPriceInUsd?: number;
      goldPriceInAud?: number;
      silverPriceInUsd?: number;
      silverPriceInAud?: number;
      updatedAt?: string;
    };
    goldPriceInUsd?: number;
    goldPriceInAud?: number;
    silverFinePriceInUsd?: number;
    silverFinePriceInAud?: number;
    silverSterlingPriceInUsd?: number;
    silverSterlingPriceInAud?: number;
  };
}

// Get metal prices for zakat calculation
export const getMetalPrices = async (): Promise<MetalPrices> => {
  try {
    const response = await api.get<MetalPricesResponse>("/metal-price");
    const payload = response.data?.payload;

    if (!payload) {
      console.warn("No payload in metal prices response");
      return {
        goldPriceInUsd: 0,
        goldPriceInAud: 0,
        silverFinePriceInUsd: 0,
        silverFinePriceInAud: 0,
        silverSterlingPriceInUsd: 0,
        silverSterlingPriceInAud: 0,
        updatedAt: new Date().toISOString(),
      };
    }

    // Extract prices from payload (they're at the top level of payload)
    const prices: MetalPrices = {
      goldPriceInUsd:
        payload.goldPriceInUsd || payload.price?.goldPriceInUsd || 0,
      goldPriceInAud:
        payload.goldPriceInAud || payload.price?.goldPriceInAud || 0,
      silverFinePriceInUsd:
        payload.silverFinePriceInUsd || payload.price?.silverPriceInUsd || 0,
      silverFinePriceInAud:
        payload.silverFinePriceInAud || payload.price?.silverPriceInAud || 0,
      silverSterlingPriceInUsd: payload.silverSterlingPriceInUsd || 0,
      silverSterlingPriceInAud: payload.silverSterlingPriceInAud || 0,
      updatedAt: payload.price?.updatedAt || new Date().toISOString(),
    };

    console.log("Metal prices fetched:", prices);
    return prices;
  } catch (error: any) {
    console.error("Error fetching metal prices:", error);
    console.error("Error details:", error.response?.data || error.message);
    // Return default values instead of throwing to prevent app crash
    return {
      goldPriceInUsd: 0,
      goldPriceInAud: 0,
      silverFinePriceInUsd: 0,
      silverFinePriceInAud: 0,
      silverSterlingPriceInUsd: 0,
      silverSterlingPriceInAud: 0,
      updatedAt: new Date().toISOString(),
    };
  }
};

// Get any zakat campaign
export const getAnyZakatCampaign = async (): Promise<Campaign | null> => {
  try {
    const campaigns = await fetchCampaigns();
    const zakatCampaign = campaigns.find(
      (c) =>
        c.checkoutType === "ZAQAT" || c.name.toLowerCase().includes("zakat")
    );
    return zakatCampaign || null;
  } catch (error) {
    console.error("Error fetching zakat campaign:", error);
    return null;
  }
};

export default api;
