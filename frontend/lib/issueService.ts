import apiClient from './apiClient';

export interface IssueData {
  latitude: number;
  longitude: number;
  categoryId: string;
  description: string;
}

export interface IssueResult {
  success: boolean;
  data?: any;
  message?: string;
}

export const issueService = {
  // Create issue with photo upload
  createIssue: async (issueData: IssueData, photoFile?: File): Promise<IssueResult> => {
    try {
      const formData = new FormData();
      formData.append('latitude', issueData.latitude.toString());
      formData.append('longitude', issueData.longitude.toString());
      formData.append('categoryId', issueData.categoryId);
      formData.append('description', issueData.description);
      
      if (photoFile) {
        formData.append('photo', photoFile);
      }

      const response = await apiClient.post('/issues', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return { success: true, data: response.data.data };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create issue',
      };
    }
  },

  // Get issue categories
  getCategories: async () => {
    try {
      const response = await apiClient.get('/issues/categories');
      return { success: true, data: response.data.data };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to load categories',
      };
    }
  },

  // Get user's issues
  getUserIssues: async () => {
    try {
      const response = await apiClient.get('/issues/my-issues');
      return { success: true, data: response.data.data };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to load issues',
      };
    }
  },

  // Update issue status (for engineers/officers)
  updateIssueStatus: async (issueId: string, status: string, notes?: string) => {
    try {
      const response = await apiClient.put(`/issues/${issueId}/status`, {
        status,
        notes
      });
      return { success: true, data: response.data.data };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update issue',
      };
    }
  }
};