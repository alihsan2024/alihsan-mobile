import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import api from "@/utils/api";
import { MyDonationTypes } from "@/utils/constants";
import * as XLSX from "xlsx";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

// Types
export interface DonationRow {
  id: string | number;
  total: number;
  Campaign: { name: string };
  updatedAt: string;
  [key: string]: any;
}

export interface DonationListState {
  count: number;
  page: number;
  rows: DonationRow[];
  loading: boolean;
  error: string;
}

export interface MyDonationState {
  activeRecurring: DonationListState;
  inactiveRecurring: DonationListState;
  onetime: DonationListState;
  exportData: any[];
}

export interface GetMyDonationsParams {
  page: number;
  type: string;
  search: string;
  sort: string;
  order: string;
}

export interface InvoiceCertificateParams {
  donationId: string | number;
  type?: string;
}

const initialState: MyDonationState = {
  activeRecurring: {
    count: 0,
    page: 1,
    rows: [],
    loading: false,
    error: "",
  },
  inactiveRecurring: {
    count: 0,
    page: 1,
    rows: [],
    loading: false,
    error: "",
  },
  onetime: {
    count: 0,
    page: 1,
    rows: [],
    loading: false,
    error: "",
  },
  exportData: [],
};

const handleDownload = async (doc: string) => {
  try {
    // Download file to device
    const downloadResumable = FileSystem.createDownloadResumable(
      doc,
      "document.pdf"
    );
    const { uri } = await downloadResumable.downloadAsync();
    // Share the file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri);
    }
  } catch (error) {
    console.error("Error downloading file:", error);
  }
};

const handleDownloadInvoiceAutoDownload = async (url: string) => {
  // Open in browser (fallback for invoices)
  import("react-native").then(({ Linking }) => Linking.openURL(url));
};

export const generateInvoice = createAsyncThunk<
  string,
  InvoiceCertificateParams
>("myDonation/invoice", async ({ donationId, type }) => {
  try {
    const res = await api.get("donations/generate-invoice/" + donationId);
    await handleDownloadInvoiceAutoDownload(res.data.payload);
    return res.data.payload;
  } catch (e) {
    if (e instanceof Error && (e as any).response?.data)
      throw new Error((e as any).response.data.message);
    throw e;
  }
});

export const generateCertificate = createAsyncThunk<
  string,
  InvoiceCertificateParams
>("myDonation/certificate", async ({ donationId, type }) => {
  try {
    const res = await api.get("donations/generate-certificate/" + donationId);
    await handleDownload(res.data.payload);
    return res.data.payload;
  } catch (e) {
    if (e instanceof Error && (e as any).response?.data)
      throw new Error((e as any).response.data.message);
    throw e;
  }
});

export const cancelMyDonation = createAsyncThunk<void, string | number>(
  "myDonation/cancel",
  async (donationId) => {
    try {
      await api.get("donations/cancel-donation/" + donationId);
    } catch (e) {
      if (e instanceof Error && (e as any).response?.data)
        throw new Error((e as any).response.data.message);
      throw e;
    }
  }
);

export const exportInvoice = createAsyncThunk<any[], Record<string, any>>(
  "export/invoice",
  async (params) => {
    try {
      const res = await api.get("payment/for-user-export-data", {
        params: params,
      });
      const data = sanitizeExportData(res.data.payload);
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet 1");
      // Write file to device
      const filePath = "export.xlsx";
      const xlsxData = XLSX.write(wb, { type: "base64", bookType: "xlsx" });
      await FileSystem.writeAsStringAsync(filePath, xlsxData, {
        encoding: "base64",
      });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath);
      }
      return data;
    } catch (e) {
      if (e instanceof Error && (e as any).response?.data)
        throw new Error((e as any).response.data.message);
      throw e;
    }
  }
);

function sanitizeExportData(data: DonationRow[]): { [key: string]: any }[] {
  return data.map((item: DonationRow) => ({
    "Project Name": item.Campaign.name,
    Date: new Date(item.updatedAt).toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    }),
    Amount: item.total,
  }));
}

export const getMyDonations = createAsyncThunk<
  { rows: DonationRow[]; count: number },
  GetMyDonationsParams
>(
  "get/mydonation",
  async ({ page, type, search, sort, order }: GetMyDonationsParams) => {
    try {
      let endpoint = "";
      switch (type) {
        case MyDonationTypes.ACTIVE_RECURRING:
          endpoint = "recurring/active";
          break;
        case MyDonationTypes.INACTIVE_RECURRING:
          endpoint = "recurring/inactive";
          break;
        case MyDonationTypes.ONETIME:
          endpoint = "onetime";
          break;
        default:
          throw new Error("Unknown mydonation type " + JSON.stringify(type));
      }
      const response = await api.get(
        "donations/of-user/" +
          endpoint +
          "?page=" +
          page +
          "&limit=" +
          process.env.NEXT_PUBLIC_PAGINATION_PER_PAGE +
          "&search=" +
          encodeURI(search) +
          "&sort=" +
          sort +
          "&order=" +
          order
      );
      let data = response?.data?.payload;
      return data;
    } catch (e) {
      if (e instanceof Error && (e as any).response?.data?.payload?.message) {
        throw new Error((e as any).response.data.payload.message);
      }
      throw e;
    }
  }
);

export const myDonationSlice = createSlice({
  name: "myDonation",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getMyDonations.pending, (state, action) => {
      const key = action.meta.arg.type as keyof MyDonationState;
      if (
        key !== "activeRecurring" &&
        key !== "inactiveRecurring" &&
        key !== "onetime"
      )
        return;
      (state[key] as DonationListState).error = "";
      (state[key] as DonationListState).loading = true;
    });
    builder.addCase(getMyDonations.fulfilled, (state, action) => {
      const key = action.meta.arg.type as keyof MyDonationState;
      if (
        key !== "activeRecurring" &&
        key !== "inactiveRecurring" &&
        key !== "onetime"
      )
        return;
      (state[key] as DonationListState).rows = action.payload.rows;
      (state[key] as DonationListState).count = Math.ceil(
        action.payload.count /
          Number(process.env.NEXT_PUBLIC_PAGINATION_PER_PAGE)
      );
      (state[key] as DonationListState).page = action.meta.arg.page;
      (state[key] as DonationListState).error = "";
      (state[key] as DonationListState).loading = false;
    });
    builder.addCase(getMyDonations.rejected, (state, action) => {
      const key = action.meta.arg.type as keyof MyDonationState;
      if (
        key !== "activeRecurring" &&
        key !== "inactiveRecurring" &&
        key !== "onetime"
      )
        return;
      (state[key] as DonationListState).error = action.error.message || "";
      (state[key] as DonationListState).loading = false;
    });
    // builder.addCase(exportInvoice.fulfilled, (state, action: PayloadAction<any[]>) => {
    //   state.exportData = action.payload;
    // });
  },
});
export default myDonationSlice.reducer;
