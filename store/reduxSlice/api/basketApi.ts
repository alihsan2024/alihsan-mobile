import { createApi } from "@reduxjs/toolkit/query/react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/utils/api";

// -----------------------------
// Axios Base Query Wrapper
// -----------------------------
const axiosBaseQuery =
  () =>
  async ({ url, method, data, params }: any) => {
    try {
      const result = await api({ url, method, data, params });
      return { data: result.data };
    } catch (axiosError: any) {
      const err = axiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };

// -----------------------------
// RTK Query API Slice
// -----------------------------
export const basketApi = createApi({
  reducerPath: "basketApi",
  tagTypes: ["Basket"],

  // Intercept each request and ensure latest token is applied
  baseQuery: async (...baseQueryArgs) => {
    // RTK Query expects baseQuery to be synchronous, but we need async for AsyncStorage
    // So we use a workaround: return a Promise and resolve after token is set
    const [args, apiObj, extraOptions] = baseQueryArgs;
    let token = null;
    try {
      const { secureGetItem } = await import("@/utils/secureStorage");
      const userString = await secureGetItem("loggedIn");
      token = userString ? JSON.parse(userString).token : null;
    } catch (e) {
      token = null;
    }
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
    return axiosBaseQuery()(args);
  },

  endpoints: (builder) => ({
    // -----------------------------
    // 1. Fetch basket
    // -----------------------------
    getBasket: builder.query<any, void>({
      query: () => ({ url: "basket", method: "GET" }),
      providesTags: ["Basket"],
    }),

    // -----------------------------
    // 2. Add item to basket
    // -----------------------------
    addToBasket: builder.mutation<any, { body: any }>({
      query: ({ body }) => ({
        url: "basket",
        method: "POST",
        data: body,
      }),

      async onQueryStarted({ body }, { dispatch, queryFulfilled }) {
        // 🔥 Optimistically update basket cache
        const patchResult = dispatch(
          basketApi.util.updateQueryData(
            "getBasket",
            undefined,
            (draft: any) => {
              if (!draft?.payload) return;

              draft.payload.push({
                ...body,
                total: body.amount,
                quantity: body.quantity ?? 1,
              });
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },

      invalidatesTags: ["Basket"],
    }),

    // -----------------------------
    // 3. Update basket item quantity/details
    // -----------------------------
    updateBasketItem: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({
        url: `basket/update/${id}`,
        method: "PUT",
        data: body,
      }),
      invalidatesTags: ["Basket"],
    }),

    // -----------------------------
    // 4. Remove item
    // -----------------------------
    removeFromBasket: builder.mutation<
      any,
      { campaignId?: number; orphanId?: number; donationItem?: any }
    >({
      query: ({ campaignId, orphanId, donationItem }) => ({
        url: "basket",
        method: "DELETE",
        data: { campaignId, orphanId, donationItem },
      }),
      invalidatesTags: ["Basket"],
    }),

    // -----------------------------
    // 5. Clear entire basket
    // -----------------------------
    clearBasket: builder.mutation<any, void>({
      query: () => ({ url: "basket/clear", method: "DELETE" }),
      invalidatesTags: ["Basket"],
    }),
  }),
});

// Export hooks
export const {
  useGetBasketQuery,
  useAddToBasketMutation,
  useUpdateBasketItemMutation,
  useRemoveFromBasketMutation,
  useClearBasketMutation,
} = basketApi;
