import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosInstance";
import { handleAxiosError } from "../api/axiosError";

interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  department?: string;
  wardId?: string;
  zoneId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Department {
  id: string;
  name: string;
  description?: string;
}

interface AdminDashboard {
  totalUsers: number;
  totalIssues: number;
  issuesByStatus: Record<string, number>;
  issuesByPriority: Record<string, number>;
  recentActivity: any[];
}

interface ZoneOverview {
  id: string;
  name: string;
  totalWards: number;
  totalIssues: number;
  issuesByStatus: Record<string, number>;
}

interface WardDetail {
  id: string;
  name: string;
  zoneId: string;
  totalIssues: number;
  issuesByStatus: Record<string, number>;
  issuesByPriority: Record<string, number>;
}

interface UserStatistics {
  userId: string;
  totalIssuesCreated: number;
  totalIssuesAssigned: number;
  totalIssuesResolved: number;
  averageResolutionTime: number | null;
  performanceScore: number;
}

interface AdminState {
  users: User[];
  departments: Department[];
  dashboard: AdminDashboard | null;
  zonesOverview: ZoneOverview[];
  wardsByZone: Record<string, Array<{wardId: string, wardNumber: number, name: string}>>; // NEW: Cache wards by zoneId
  currentZoneDetail: any | null;
  currentWardDetail: WardDetail | null;
  userStatistics: UserStatistics | null;
  loading: boolean;
  loadingWards: boolean; // NEW: Loading state for wards
  error: string | null;
}

interface RegisterUserData {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: string;
  department?: string;
  wardId?: string;
  zoneId?: string;
}

interface UpdateUserData {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  role?: string;
  department?: string;
  wardId?: string;
  zoneId?: string;
  isActive?: boolean;
}

interface UserFilter {
  role?: string;
  wardId?: string;
  zoneId?: string;
  isActive?: boolean;
  department?: string;
}

// Initial state
const initialState: AdminState = {
  users: [],
  departments: [],
  dashboard: null,
  zonesOverview: [],
  wardsByZone: {},
  currentZoneDetail: null,
  currentWardDetail: null,
  userStatistics: null,
  loading: false,
  loadingWards: false,
  error: null,
};

// Register new user
export const registerUser = createAsyncThunk(
  "admin/registerUser",
  async (userData: RegisterUserData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/admin/register", userData);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Failed to register user"));
    }
  }
);

// Fetch all users
export const fetchAllUsers = createAsyncThunk(
  "admin/fetchAllUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/admin/users");
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Failed to fetch users"));
    }
  }
);

// Fetch user by ID
export const fetchUserById = createAsyncThunk(
  "admin/fetchUserById",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/admin/users/${userId}`);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Failed to fetch user"));
    }
  }
);

// Update user
export const updateUser = createAsyncThunk(
  "admin/updateUser",
  async ({ userId, updateData }: { userId: string; updateData: UpdateUserData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/admin/users/${userId}`, updateData);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Failed to update user"));
    }
  }
);

// Deactivate user
export const deactivateUser = createAsyncThunk(
  "admin/deactivateUser",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/admin/users/${userId}/deactivate`);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Failed to deactivate user"));
    }
  }
);

// Reactivate user
export const reactivateUser = createAsyncThunk(
  "admin/reactivateUser",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/admin/users/${userId}/reactivate`);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Failed to reactivate user"));
    }
  }
);

// Fetch users by filter
export const fetchUsersByFilter = createAsyncThunk(
  "admin/fetchUsersByFilter",
  async (filters: UserFilter, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/admin/users/filter", { params: filters });
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Failed to fetch filtered users"));
    }
  }
);

// Fetch departments
export const fetchDepartments = createAsyncThunk(
  "admin/fetchDepartments",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/admin/departments");
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Failed to fetch departments"));
    }
  }
);

// Fetch admin dashboard
export const fetchAdminDashboard = createAsyncThunk(
  "admin/fetchDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/admin/dashboard");
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Failed to fetch dashboard"));
    }
  }
);

// Fetch zones overview
export const fetchZonesOverview = createAsyncThunk(
  "admin/fetchZonesOverview",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/admin/zones");
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Failed to fetch zones overview"));
    }
  }
);

// Fetch wards for a specific zone (lazy-loading)
export const fetchWardsForZone = createAsyncThunk(
  "admin/fetchWardsForZone",
  async (zoneId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/admin/zones/${zoneId}/wards`);
      return { zoneId, wards: response.data.data };
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Failed to fetch wards for zone"));
    }
  }
);

// Fetch zone detail
export const fetchZoneDetail = createAsyncThunk(
  "admin/fetchZoneDetail",
  async (zoneId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/admin/zones/${zoneId}`);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Failed to fetch zone detail"));
    }
  }
);

// Fetch ward detail
export const fetchWardDetail = createAsyncThunk(
  "admin/fetchWardDetail",
  async (wardId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/admin/wards/${wardId}`);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Failed to fetch ward detail"));
    }
  }
);

// Fetch user statistics
export const fetchUserStatistics = createAsyncThunk(
  "admin/fetchUserStatistics",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/admin/users/${userId}/statistics`);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Failed to fetch user statistics"));
    }
  }
);

// Admin slice
const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentDetails: (state) => {
      state.currentZoneDetail = null;
      state.currentWardDetail = null;
      state.userStatistics = null;
    },
    updateUserInList: (state, action: PayloadAction<User>) => {
      const index = state.users.findIndex(user => user.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // Register user
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.unshift(action.payload);
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch all users
    builder
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
        state.error = null;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update user
    builder
      .addCase(updateUser.fulfilled, (state, action) => {
        const updatedUser = action.payload;
        const index = state.users.findIndex(user => user.id === updatedUser.id);
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Deactivate user
    builder
      .addCase(deactivateUser.fulfilled, (state, action) => {
        const updatedUser = action.payload;
        const index = state.users.findIndex(user => user.id === updatedUser.id);
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
      })
      .addCase(deactivateUser.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Reactivate user
    builder
      .addCase(reactivateUser.fulfilled, (state, action) => {
        const updatedUser = action.payload;
        const index = state.users.findIndex(user => user.id === updatedUser.id);
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
      })
      .addCase(reactivateUser.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Fetch departments
    builder
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.departments = action.payload;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Fetch dashboard
    builder
      .addCase(fetchAdminDashboard.fulfilled, (state, action) => {
        state.dashboard = action.payload;
      })
      .addCase(fetchAdminDashboard.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Fetch zones overview
    builder
      .addCase(fetchZonesOverview.fulfilled, (state, action) => {
        state.zonesOverview = action.payload;
      })
      .addCase(fetchZonesOverview.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(fetchWardsForZone.pending, (state) => {
        state.loadingWards = true;
      })
      .addCase(fetchWardsForZone.fulfilled, (state, action) => {
        state.loadingWards = false;
        const { zoneId, wards } = action.payload;
        state.wardsByZone[zoneId] = wards;
      })
      .addCase(fetchWardsForZone.rejected, (state, action) => {
        state.loadingWards = false;
        state.error = action.payload as string;
      });

    // Fetch zone detail
    builder
      .addCase(fetchZoneDetail.fulfilled, (state, action) => {
        state.currentZoneDetail = action.payload;
      })
      .addCase(fetchZoneDetail.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Fetch ward detail
    builder
      .addCase(fetchWardDetail.fulfilled, (state, action) => {
        state.currentWardDetail = action.payload;
      })
      .addCase(fetchWardDetail.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Fetch user statistics
    builder
      .addCase(fetchUserStatistics.fulfilled, (state, action) => {
        state.userStatistics = action.payload;
      })
      .addCase(fetchUserStatistics.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  }
});

export const { clearError, clearCurrentDetails, updateUserInList } = adminSlice.actions;
export default adminSlice.reducer;