import { useState, useEffect } from 'react';
import apiClient from './apiClient';

interface DashboardData {
  totalIssues: number;
  pendingIssues: number;
  resolvedIssues: number;
  inProgressIssues: number;
  resolutionRate: number;
  recentIssues: any[];
  statistics: any;
}

export const useDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await apiClient.get('/dashboard');
        setData(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const refetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/dashboard');
      setData(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
};

// Admin dashboard hook
export const useAdminDashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminDashboard = async () => {
      try {
        const response = await apiClient.get('/admin/dashboard');
        setData(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load admin dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminDashboard();
  }, []);

  return { data, loading, error };
};