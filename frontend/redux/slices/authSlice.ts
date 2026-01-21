import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosInstance";
import { handleAxiosError } from "../api/axiosError";

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
  user: User | null;
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
  user: null,
  loading: false,
  authLoading: true,
  error: null,
  isAuthenticated: false,
};

// Fetch current user profile
export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/auth/profile");
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Failed to fetch user"));
    }
  }
);

// Login user
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      console.log('Attempting login with:', { email: credentials.email, apiUrl: process.env.NEXT_PUBLIC_API_URL });
      const response = await axiosInstance.post("/auth/login", credentials);
      
      const { token, user } = response.data.data;
      
      // Store token in localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return user;
    } catch (error: unknown) {
      console.error('Login API error:', error);
      return rejectWithValue(handleAxiosError(error, "Login failed"));
    }
  }
);

// Logout user
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.post("/auth/logout");
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      return true;
    } catch (error: unknown) {
      // Even if API call fails, clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      return rejectWithValue(handleAxiosError(error, "Logout failed"));
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
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.loading = false;
      state.authLoading = false;
    },
    initializeAuth: (state) => {
      const token = localStorage.getItem('authToken');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        try {
          state.user = JSON.parse(userStr);
          state.isAuthenticated = true;
        } catch {
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          state.user = null;
          state.isAuthenticated = false;
        }
      } else {
        state.user = null;
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
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.authLoading = false;
        state.user = null;
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
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Logout user
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        // Still clear user data even if API call failed
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
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

export const { clearError, setUser, clearUser, initializeAuth } = authSlice.actions;
export default authSlice.reducer;