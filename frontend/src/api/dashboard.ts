import { apiClient } from './client';
import { DashboardStats } from '../types';

export const dashboardApi = {
  getStats: async () => {
    const response = await apiClient.get<DashboardStats>('/api/dashboard/stats');
    return response.data;
  },
};

