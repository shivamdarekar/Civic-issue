import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosInstance";
import { handleAxiosError } from "../api/axiosError";

interface Issue {
  id: string;
  ticketNumber: string;
  description: string;
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'VERIFIED' | 'REOPENED' | 'REJECTED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  categoryId: string;
  reporterId: string;
  assigneeId?: string;
  wardId: string;
  zoneId: string;
  latitude: number;
  longitude: number;
  address?: string;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    slug: string;
    department: string;
    slaHours: number;
  };
  ward?: {
    id: string;
    wardNumber: number;
    name: string;
    zone: {
      id: string;
      name: string;
      code: string;
    };
  };
  reporter?: {
    id: string;
    fullName: string;
    role: string;
    phoneNumber?: string;
  };
  assignee?: {
    id: string;
    fullName: string;
    role: string;
    department?: string;
    phoneNumber?: string;
  };
  media?: Array<{
    id: string;
    type: 'BEFORE' | 'AFTER';
    url: string;
    mimeType: string;
    createdAt: string;
  }>;
  comments?: Array<{
    id: string;
    text: string;
    createdAt: string;
    user: {
      id: string;
      fullName: string;
      role: string;
    };
  }>;
  history?: Array<{
    id: string;
    changeType: string;
    oldValue: any;
    newValue: any;
    createdAt: string;
  }>;
  slaTargetAt?: string;
  assignedAt?: string;
  resolvedAt?: string;
  verifiedAt?: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  department: string;
}

interface IssueStats {
  totalIssues: number;
  issuesByStatus: Record<string, number>;
  issuesByPriority: Record<string, number>;
}

interface IssuesState {
  issues: Issue[];
  currentIssue: Issue | null;
  categories: Category[];
  stats: IssueStats | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

interface CreateIssueData {
  categoryId: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  latitude: number;
  longitude: number;
  address?: string;
  media?: Array<{ url: string; mimeType: string; fileSize: number }>;
}

interface ListIssuesParams {
  page?: number;
  pageSize?: number;
  status?: string;
  priority?: string;
  wardId?: string;
  zoneId?: string;
  categoryId?: string;
  assigneeId?: string;
}

interface UpdateStatusData {
  issueId: string;
  status: string;
  comment?: string;
}

interface AddCommentData {
  issueId: string;
  comment: string;
}

// Initial state
const initialState: IssuesState = {
  issues: [],
  currentIssue: null,
  categories: [],
  stats: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  },
};

// Fetch issue categories
export const fetchCategories = createAsyncThunk(
  "issues/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/issues/categories");
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Failed to fetch categories"));
    }
  }
);

// Fetch issue statistics
export const fetchIssueStats = createAsyncThunk(
  "issues/fetchStats",
  async (params: { wardId?: string; zoneId?: string; assigneeId?: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/issues/stats", { params });
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Failed to fetch statistics"));
    }
  }
);

// Create new issue
export const createIssue = createAsyncThunk(
  "issues/create",
  async (issueData: CreateIssueData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/issues", issueData);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Failed to create issue"));
    }
  }
);

// Fetch issues list
export const fetchIssues = createAsyncThunk(
  "issues/fetchList",
  async (params: ListIssuesParams, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/issues", { params });
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Failed to fetch issues"));
    }
  }
);

// Fetch single issue by ID
export const fetchIssueById = createAsyncThunk(
  "issues/fetchById",
  async (issueId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/issues/${issueId}`);
      console.log('Raw issue detail response:', response.data);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Failed to fetch issue"));
    }
  }
);

// Update issue status
export const updateIssueStatus = createAsyncThunk(
  "issues/updateStatus",
  async (data: UpdateStatusData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/issues/${data.issueId}/status`, {
        status: data.status,
        comment: data.comment,
      });
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Failed to update status"));
    }
  }
);

// Add comment to issue
export const addComment = createAsyncThunk(
  "issues/addComment",
  async (data: AddCommentData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/issues/${data.issueId}/comments`, {
        comment: data.comment,
      });
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Failed to add comment"));
    }
  }
);

// Upload before images
export const uploadBeforeImages = createAsyncThunk(
  "issues/uploadBeforeImages",
  async (files: File[], { rejectWithValue }) => {
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('images', file));
      
      const response = await axiosInstance.post("/issues/upload/before", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Failed to upload images"));
    }
  }
);

// Upload after images
export const uploadAfterImages = createAsyncThunk(
  "issues/uploadAfterImages",
  async (files: File[], { rejectWithValue }) => {
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('images', file));
      
      const response = await axiosInstance.post("/issues/upload/after", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Failed to upload after images"));
    }
  }
);

// Issues slice
const issuesSlice = createSlice({
  name: "issues",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentIssue: (state, action: PayloadAction<Issue>) => {
      state.currentIssue = action.payload;
    },
    clearCurrentIssue: (state) => {
      state.currentIssue = null;
    },
    updateIssueInList: (state, action: PayloadAction<Issue>) => {
      const index = state.issues.findIndex(issue => issue.id === action.payload.id);
      if (index !== -1) {
        state.issues[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch categories
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
        state.error = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch stats
    builder
      .addCase(fetchIssueStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(fetchIssueStats.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Create issue
    builder
      .addCase(createIssue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createIssue.fulfilled, (state, action) => {
        state.loading = false;
        state.issues.unshift(action.payload);
        state.error = null;
      })
      .addCase(createIssue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch issues
    builder
      .addCase(fetchIssues.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchIssues.fulfilled, (state, action) => {
        state.loading = false;
        state.issues = action.payload.issues;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchIssues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch issue by ID
    builder
      .addCase(fetchIssueById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchIssueById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentIssue = action.payload;
        state.error = null;
      })
      .addCase(fetchIssueById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update status
    builder
      .addCase(updateIssueStatus.fulfilled, (state, action) => {
        const updatedIssue = action.payload;
        const index = state.issues.findIndex(issue => issue.id === updatedIssue.id);
        if (index !== -1) {
          state.issues[index] = updatedIssue;
        }
        if (state.currentIssue?.id === updatedIssue.id) {
          state.currentIssue = updatedIssue;
        }
      })
      .addCase(updateIssueStatus.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Add comment
    builder
      .addCase(addComment.fulfilled, (state, action) => {
        if (state.currentIssue) {
          state.currentIssue = action.payload;
        }
      })
      .addCase(addComment.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  }
});

export const { clearError, setCurrentIssue, clearCurrentIssue, updateIssueInList } = issuesSlice.actions;
export default issuesSlice.reducer;