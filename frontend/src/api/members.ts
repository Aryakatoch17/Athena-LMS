import { apiClient } from './client';
import { Member, MemberRequest, MembershipStatus, PageResponse } from '../types';

export const memberApi = {
  getAll: async (params?: { query?: string; page?: number; size?: number; sort?: string }) => {
    const response = await apiClient.get<PageResponse<Member>>('/api/members', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get<Member>(`/api/members/${id}`);
    return response.data;
  },

  create: async (data: MemberRequest) => {
    const response = await apiClient.post<Member>('/api/members', data);
    return response.data;
  },

  update: async (id: number, data: MemberRequest) => {
    const response = await apiClient.put<Member>(`/api/members/${id}`, data);
    return response.data;
  },

  updateStatus: async (id: number, status: MembershipStatus) => {
    const response = await apiClient.patch<Member>(`/api/members/${id}/status`, null, {
      params: { status },
    });
    return response.data;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete(`/api/members/${id}`);
    return response.data;
  },
};

