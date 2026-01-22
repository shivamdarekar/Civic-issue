import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosInstance";
import { handleAxiosError } from "../api/axiosError";

interface DashboardIssue {
  id: string;
  ticketNumber: string;
  status: string;
  priority: string;
  createdAt: string;
  category?: {
    name: string;
    department: string;
  };
  ward?: {
    wardNumber: number;
    name: string;
  };
  assignee?: {
    fullName: string;
  };
}

interface FieldWorkerDashboard {
  totalIssuesCreated: number;
  issuesByStatus: Record<string, number>;
  recentIssues: DashboardIssue[];
}

interface WardEngineerDashboard {
  wardId: string;
  department: string;
  totalIssues: number;
  issuesByStatus: Record<string, number>;
  issuesByPriority: Record<string, number>;
  sla: {
    withinSla: number;
    breachedSla: number;
  };
  averageResolutionTimeHours: number | null;
}

interface AssignedIssuesDashboard {
  totalAssigned: number;
  issuesByStatus: Record<string, number>;
  issuesByPriority: Record<string, number>;
  assignedIssues: DashboardIssue[];
}

interface ActivityLogItem {
  id: string;
  action: string;
  resource: string;
  resourceId: string | null;
  metadata: any;
  createdAt: string;
}

interface UserState {
  fieldWorkerDashboard: FieldWorkerDashboard | null;
  wardEngineerDashboard: WardEngineerDashboard | null;
  assignedIssuesDashboard: AssignedIssuesDashboard | null;
  activityLog: ActivityLogItem[];
  loading: boolean;
  error: string | null;
}

interface UpdateProfileData {
  fullName?: string;
  phoneNumber?: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

// Initial state
const initialState: UserState = {
  fieldWorkerDashboard: null,
  wardEngineerDashboard: null,
  assignedIssuesDashboard: null,
  activityLog: [],
  loading: false,
  error: null,
};

// Fetch field worker dashboard
export const fetchFieldWorkerDashboard = createAsyncThunk(
  "user/fetchFieldWorkerDashboard",
  async (limit: number = 10, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/users/dashboard/field-worker?limit=${limit}`);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Failed to fetch field worker dashboard"));
    }
  }
);

// Fetch ward engineer dashboard
export const fetchWardEngineerDashboard = createAsyncThunk(
  "user/fetchWardEngineerDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/users/dashboard/ward-engineer");
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Failed to fetch ward engineer dashboard"));
    }
  }
);

// Fetch assigned issues dashboard
export const fetchAssignedIssuesDashboard = createAsyncThunk(
  "user/fetchAssignedIssuesDashboard",
  async (limit: number = 10, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/users/dashboard/assigned?limit=${limit}`);
      console.log('Raw assigned issues response:', response.data);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Failed to fetch assigned issues dashboard"));
    }
  }
);

// Update user profile
export const updateProfile = createAsyncThunk(
  "user/updateProfile",
  async (profileData: UpdateProfileData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch("/users/profile", profileData);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Failed to update profile"));
    }
  }
);

// Change password
export const changePassword = createAsyncThunk(
  "user/changePassword",
  async (passwordData: ChangePasswordData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch("/users/change-password", passwordData);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Failed to change password"));
    }
  }
);

// Fetch activity log
export const fetchActivityLog = createAsyncThunk(
  "user/fetchActivityLog",
  async (limit: number = 20, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/users/activity-log?limit=${limit}`);
      return response.data.data.activities;
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Failed to fetch activity log"));
    }
  }
);

// User slice
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearDashboards: (state) => {
      state.fieldWorkerDashboard = null;
      state.wardEngineerDashboard = null;
      state.assignedIssuesDashboard = null;
      state.activityLog = [];
    },
  },
  extraReducers: (builder) => {
    // Field worker dashboard
    builder
      .addCase(fetchFieldWorkerDashboard.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFieldWorkerDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.fieldWorkerDashboard = action.payload;
        state.error = null;
      })
      .addCase(fetchFieldWorkerDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Ward engineer dashboard
    builder
      .addCase(fetchWardEngineerDashboard.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWardEngineerDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.wardEngineerDashboard = action.payload;
        state.error = null;
      })
      .addCase(fetchWardEngineerDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Assigned issues dashboard
    builder
      .addCase(fetchAssignedIssuesDashboard.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAssignedIssuesDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.assignedIssuesDashboard = action.payload;
        state.error = null;
      })
      .addCase(fetchAssignedIssuesDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update profile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Change password
    builder
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Activity log
    builder
      .addCase(fetchActivityLog.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchActivityLog.fulfilled, (state, action) => {
        state.loading = false;
        state.activityLog = action.payload;
        state.error = null;
      })
      .addCase(fetchActivityLog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearError, clearDashboards } = userSlice.actions;
export default userSlice.reducer;