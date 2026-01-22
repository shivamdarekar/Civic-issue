import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosInstance";
import { handleAxiosError } from "../api/axiosError";

interface ZoneDetail {
  zoneName: string;
  zoneOfficer: string;
  totalWards: number;
  totalIssues: number;
  slaCompliance: number;
}

interface ZoneWard {
  wardId: string;
  wardNumber: number;
  name: string;
  open: number;
  inProgress: number;
  slaBreached: number;
  totalIssues: number;
  engineer: string;
}

interface ZoneState {
  zoneDetail: ZoneDetail | null;
  zoneWards: ZoneWard[];
  loading: boolean;
  error: string | null;
}

const initialState: ZoneState = {
  zoneDetail: null,
  zoneWards: [],
  loading: false,
  error: null,
};

// Fetch zone detail for zone officer
export const fetchZoneOfficerDetail = createAsyncThunk(
  "zone/fetchZoneOfficerDetail",
  async (zoneId: string, { rejectWithValue }) => {
    try {
      console.log('Fetching zone detail for:', zoneId);
      const response = await axiosInstance.get(`/admin/zones/${zoneId}`);
      console.log('Zone detail response:', response.data);
      return response.data.data;
    } catch (error: unknown) {
      console.error('Zone detail fetch error:', error);
      return rejectWithValue(handleAxiosError(error, "Failed to fetch zone detail"));
    }
  }
);

// Fetch zone wards for zone officer
export const fetchZoneOfficerWards = createAsyncThunk(
  "zone/fetchZoneOfficerWards",
  async (zoneId: string, { rejectWithValue }) => {
    try {
      console.log('Fetching zone wards for:', zoneId);
      const response = await axiosInstance.get(`/admin/zones/${zoneId}/wards`);
      console.log('Zone wards response:', response.data);
      return response.data.data;
    } catch (error: unknown) {
      console.error('Zone wards fetch error:', error);
      return rejectWithValue(handleAxiosError(error, "Failed to fetch zone wards"));
    }
  }
);

const zoneSlice = createSlice({
  name: "zone",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearZoneData: (state) => {
      state.zoneDetail = null;
      state.zoneWards = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchZoneOfficerDetail.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchZoneOfficerDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.zoneDetail = action.payload;
        state.error = null;
      })
      .addCase(fetchZoneOfficerDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchZoneOfficerWards.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchZoneOfficerWards.fulfilled, (state, action) => {
        state.loading = false;
        state.zoneWards = action.payload;
        state.error = null;
      })
      .addCase(fetchZoneOfficerWards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearError, clearZoneData } = zoneSlice.actions;
export default zoneSlice.reducer;