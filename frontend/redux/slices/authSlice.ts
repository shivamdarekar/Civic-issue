import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosInstance";
import { handleAxiosError } from "../api/axiosError";
import { setUser as setUserState, clearUser as clearUserState } from "../UserState";

interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: 'FIELD_WORKER' | 'WARD_ENGINEER' | 'ZONE_OFFICER' | 'SUPER_ADMIN';
  department?: string;
  wardId?: string;
  zoneId?: string;
  isActive: boolean;
}

interface AuthState {
  loading: boolean;
  authLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface ForgotPasswordData {
  email: string;
}

interface VerifyOtpData {
  email: string;
  otp: string;
}

interface ResetPasswordData {
  email: string;
  otp: string;
  newPassword: string;
}

// Initial state
const initialState: AuthState = {
  loading: false,
  authLoading: true,
  error: null,
  isAuthenticated: false,
};

// Fetch current user profile
export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await axiosInstance.get("/auth/profile");
      const userData = response.data.data;
      dispatch(setUserState(userData));
      return userData;
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Failed to fetch user"));
    }
  }
);

// Login user
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials: LoginCredentials, { rejectWithValue, dispatch }) => {
    try {
      const response = await axiosInstance.post("/auth/login", credentials);
      
      const { token, user } = response.data.data;
      
      // Store token in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', token);
      }
      
      dispatch(setUserState(user));
      return user;
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Login failed"));
    }
  }
);

// Logout user
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch (error: unknown) {
      console.error('Logout API error:', error);
      // Continue with cleanup even if API call fails
    } finally {
      // Always clear local state regardless of API response
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
      }
      dispatch(clearUserState());
      return true;
    }
  }
);

// Forgot password
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (data: ForgotPasswordData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/auth/forgot-password", data);
      return response.data.message;
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Failed to send OTP"));
    }
  }
);

// Verify OTP
export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async (data: VerifyOtpData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/auth/verify-otp", data);
      return response.data.message;
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "OTP verification failed"));
    }
  }
);

// Reset password
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (data: ResetPasswordData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/auth/reset-password", data);
      return response.data.message;
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Password reset failed"));
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearAuth: (state) => {
      state.isAuthenticated = false;
      state.error = null;
      state.loading = false;
      state.authLoading = false;
    },
    initializeAuth: (state) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('authToken');
        state.isAuthenticated = !!token;
      } else {
        state.isAuthenticated = false;
      }
      state.authLoading = false;
    }
  },
  extraReducers: (builder) => {
    // Fetch current user
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.authLoading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.authLoading = false;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.authLoading = false;
        state.isAuthenticated = false;
      });

    // Login user
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.authLoading = false;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Logout user
    builder
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = null; // Don't show error for logout failures
      });

    // Forgot password
    builder
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Verify OTP
    builder
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Reset password
    builder
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearAuthError, clearError, clearAuth, initializeAuth } = authSlice.actions;
export default authSlice.reducer;